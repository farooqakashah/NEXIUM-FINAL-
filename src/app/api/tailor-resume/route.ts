```typescript
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

    // Save original resume and job description
    const insertResult = await db.collection('resumes').insertOne({
      userId,
      resumeInput,
      jobDescription,
      createdAt: new Date(),
      tailoredResume: null,
      tailoredResumeUrl: null,
    });

    const resumeId = insertResult.insertedId.toString();

    // Send to n8n webhook for tailoring
    const n8nResponse = await axios.post(
      process.env.N8N_API_URL!,
      { userId, resumeId, resumeInput, jobDescription },
      { headers: { 'X-API-Key': process.env.N8N_API_KEY } }
    );

    if (n8nResponse.status !== 200) {
      throw new Error('Failed to trigger n8n workflow');
    }

    // Assume n8n returns tailored resume data
    const tailoredResume = n8nResponse.data.tailoredResume || 'Tailored resume content';
    const tailoredResumeUrl = n8nResponse.data.tailoredResumeUrl || 'https://example.com/tailored-resume.pdf';

    // Update MongoDB with tailored resume
    await db.collection('resumes').updateOne(
      { _id: insertResult.insertedId, userId },
      { $set: { tailoredResume, tailoredResumeUrl, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: 'Resume tailored successfully', tailoredResume, tailoredResumeUrl }, { status: 200 });
  } catch (error) {
    console.error('Error in tailor-resume API:', error);
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 });
  }
}
```
