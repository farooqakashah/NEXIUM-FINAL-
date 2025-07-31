import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI!;
let cachedClient: MongoClient | null = null;

async function connectToMongo() {
  if (cachedClient) {
    try {
      await cachedClient.db().command({ ping: 1 });
      return cachedClient;
    } catch {
      cachedClient = null; // Reset cached client if ping fails
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
    const { userId, resumeData } = await request.json();

    // Save resume data to MongoDB
    await db.collection('resumes').insertOne({
      userId,
      resumeData,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Resume saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in tailor-resume API:', error);
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
  }
}
