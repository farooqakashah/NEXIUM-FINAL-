import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

const uri = process.env.MONGODB_URI!;
let cachedClient: MongoClient | null = null;

async function connectToMongo() {
  if (cachedClient) {
    try {
      await cachedClient.db().command({ ping: 1 });
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function POST(request: Request) {
  try {
    const client = await connectToMongo();
    const db = client.db('resume_tailor');
    const { userId, resumeInput, jobDescription } = await request.json();
    console.log('Received request:', { userId, resumeInput, jobDescription });

    if (!userId || !resumeInput || !jobDescription) {
      console.error('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save original resume and job description
    const insertResult = await db.collection('resumes').insertOne({
      userId,
      resumeInput,
      jobDescription,
      createdAt: new Date(),
      tailoredResume: null,
      tailoredResumeUrl: null,
    });
    console.log('Inserted resume with ID:', insertResult.insertedId.toString());

    const resumeId = insertResult.insertedId.toString();

    // Send to n8n webhook
    console.log('Calling n8n webhook:', process.env.N8N_API_URL);
    try {
      const n8nResponse = await axios.post(
        process.env.N8N_API_URL!,
        { userId, resumeId, resumeInput, jobDescription },
        { headers: { 'X-API-Key': process.env.N8N_API_KEY }, timeout: 30000 }
      );
      console.log('n8n response:', { status: n8nResponse.status, data: n8nResponse.data });

      if (n8nResponse.status !== 200) {
        console.error('n8n webhook failed:', n8nResponse.statusText);
        throw new Error(`n8n webhook failed with status: ${n8nResponse.status}`);
      }

      // Extract tailored resume data
      let tailoredResume: string;
      let tailoredResumeUrl: string | null = null;
      if (Array.isArray(n8nResponse.data) && n8nResponse.data[0]?.content) {
        tailoredResume = n8nResponse.data[0].content;
        tailoredResumeUrl = n8nResponse.data[0].tailoredResumeUrl || 'https://example.com/tailored-resume.pdf';
      } else if (n8nResponse.data.tailoredResume) {
        tailoredResume = n8nResponse.data.tailoredResume;
        tailoredResumeUrl = n8nResponse.data.tailoredResumeUrl || 'https://example.com/tailored-resume.pdf';
      } else {
        console.warn('Unexpected n8n response format, using fallback');
        tailoredResume = 'Tailored resume content';
        tailoredResumeUrl = 'https://example.com/tailored-resume.pdf';
      }
      console.log('Extracted n8n data:', { tailoredResume, tailoredResumeUrl });

      // Debug: Check document before update
      const documentBeforeUpdate = await db.collection('resumes').findOne({ _id: insertResult.insertedId });
      console.log('Document before update:', documentBeforeUpdate);

      // Update MongoDB with tailored resume
      const updateResult = await db.collection('resumes').updateOne(
        { _id: insertResult.insertedId },
        { $set: { tailoredResume, tailoredResumeUrl, updatedAt: new Date() } }
      );
      console.log('MongoDB update result:', {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        resumeId: insertResult.insertedId.toString(),
        userId,
      });

      if (updateResult.matchedCount === 0) {
        console.error('No document matched for update:', { _id: insertResult.insertedId.toString(), userId });
        throw new Error('Failed to update resume in MongoDB');
      }
