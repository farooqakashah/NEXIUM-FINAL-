import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

let cachedClient: MongoClient | null = null;

async function connectToMongo() {
  if (cachedClient) {
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
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.error('Missing userId in query parameters');
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const client = await connectToMongo();
    const db = client.db('resume_tailor');
    const collection = db.collection('resumes');

    const resumes = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Fetched ${resumes.length} resumes for userId: ${userId}`);
    return NextResponse.json(resumes);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in get-resumes:', {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: `Failed to fetch resumes: ${err.message}` },
      { status: 500 }
    );
  }
}
