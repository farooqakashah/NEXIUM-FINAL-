import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

let cachedClient: MongoClient | null = null;

async function connectToMongo() {
  if (cachedClient && cachedClient.topology.isConnected()) {
    return cachedClient;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined');
    throw new Error('MONGODB_URI is not defined');
  }

  const client = new MongoClient(mongoUri, {
    maxPoolSize: 10,
    connectTimeoutMS: 10000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    console.error('Missing userId in query parameters');
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    const client = await connectToMongo();
    const db = client.db('resume_tailor');
    const collection = db.collection('resumes');

    const resumes = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Validate and log resume data
    const validatedResumes = resumes.map(resume => ({
      _id: resume._id.toString(),
      userId: resume.userId || 'unknown',
      resumeInput: resume.resumeInput || 'Not available',
      jobDescription: resume.jobDescription || 'Not available',
      tailoredResume: resume.tailoredResume || 'Not available',
      createdAt: resume.createdAt || new Date().toISOString(),
    }));

    console.log(`Fetched ${resumes.length} resumes for userId: ${userId}`, 
      resumes.map(r => ({
        _id: r._id.toString(),
        resumeInputLength: r.resumeInput?.length || 0,
        tailoredResumeLength: r.tailoredResume?.length || 0,
      }))
    );

    return NextResponse.json(validatedResumes);
  } catch (error) {
    console.error('Error fetching resumes:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return NextResponse.json(
      { error: `Failed to fetch resumes: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}