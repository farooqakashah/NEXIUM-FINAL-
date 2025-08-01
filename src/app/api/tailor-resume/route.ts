import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import axios from 'axios';

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
    console.log('Inserted resume with ID:', insertResult.insertedId);

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
      const tailoredResume = n8nResponse.data.tailoredResume || 'Tailored resume content';
      const tailoredResumeUrl = n8nResponse.data.tailoredResumeUrl || 'https://example.com/tailored-resume.pdf';
      console.log('Received n8n data:', { tailoredResume, tailoredResumeUrl });

      // Update MongoDB with tailored resume
      await db.collection('resumes').updateOne(
        { _id: insertResult.insertedId, userId },
        { $set: { tailoredResume, tailoredResumeUrl, updatedAt: new Date() } }
      );
      console.log('Updated resume in MongoDB:', insertResult.insertedId);

      return NextResponse.json({ message: 'Resume tailored successfully', tailoredResume, tailoredResumeUrl }, { status: 200 });
    } catch (n8nError: any) {
      console.error('n8n webhook error:', {
        message: n8nError.message,
        code: n8nError.code,
        response: n8nError.response ? { status: n8nError.response.status, data: n8nError.response.data } : null,
      });
      throw new Error(`Failed to call n8n webhook: ${n8nError.message}`);
    }
  } catch (error: any) {
    console.error('Error in tailor-resume API:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.cause ? { message: error.cause.message, code: error.cause.code } : null,
    });
    return NextResponse.json({ error: 'Failed to process resume', details: error.message }, { status: 500 });
  }
}
