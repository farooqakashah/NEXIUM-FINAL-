import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import axios from 'axios';

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

export async function POST(request: Request) {
  try {
    const { resumeInput, jobDescription, userId } = await request.json();

    if (!resumeInput || !jobDescription || !userId) {
      console.error('Missing fields:', { resumeInput, jobDescription, userId });
      return NextResponse.json({ error: 'Missing required fields: resumeInput, jobDescription, userId' }, { status: 400 });
    }

    const n8nUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;

    if (!n8nUrl || !n8nApiKey) {
      console.error('Missing environment variables:', { n8nUrl, n8nApiKey });
      return NextResponse.json({ error: 'Server configuration error: Missing N8N_API_URL or N8N_API_KEY' }, { status: 500 });
    }

    console.log('Sending request to n8n:', { 
      n8nUrl, 
      resumeInput: resumeInput.substring(0, 50) + '...', 
      jobDescription: jobDescription.substring(0, 50) + '...' 
    });

    const response = await axios.post(
      n8nUrl,
      { resumeInput, jobDescription },
      { headers: { 'X-API-Key': n8nApiKey }, timeout: 15000 }
    );

    console.log('n8n response:', response.data);

    let tailoredResume: string;

    // Handle various n8n response formats
    if (response.status === 200) {
     if (response.data.content) {
  tailoredResume = response.data.content;
} else if (response.data.tailoredResume) {
  tailoredResume = response.data.tailoredResume;
} else if (Array.isArray(response.data) && response.data[0]?.tailoredResume) {
  tailoredResume = response.data[0].tailoredResume;
} else if (Array.isArray(response.data) && response.data[0]?.content) {
  tailoredResume = response.data[0].content;
} else if (response.data.result) {
  tailoredResume = response.data.result;
} else if (response.data.resume) {
  tailoredResume = response.data.resume;
} else if (response.data.output) {
  tailoredResume = response.data.output;
} else {
  console.error('Invalid n8n response format:', response.data);
  tailoredResume = `Fallback tailored resume for: ${resumeInput.substring(0, 100)}...`;
}

    } else {
      console.error('n8n response error:', { status: response.status, data: response.data });
      throw new Error(`n8n returned invalid status: ${response.status}`);
    }

    console.log('tailoredResume length:', tailoredResume.length);

    const client = await connectToMongo();
    const db = client.db('resume_tailor');
    const collection = db.collection('resumes');

    const result = await collection.insertOne({
      userId,
      resumeInput,
      jobDescription,
      tailoredResume,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Resume stored for userId:', userId, 'with _id:', result.insertedId, 'tailoredResume length:', tailoredResume.length);
    return NextResponse.json({ tailoredResume });
  } catch (error: any) {
    console.error('Error in tailor-resume:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? { status: error.response.status, data: error.response.data } : null,
    });
    return NextResponse.json(
      { error: `Failed to tailor resume: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}