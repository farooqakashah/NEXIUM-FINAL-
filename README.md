Resume Tailor
Overview
Resume Tailor is a prototype web application designed to help job seekers tailor their resumes to specific job descriptions using AI. This tool allows users to input their resume in paragraph form and a job description, generating a professionally tailored resume optimized for the target role. The application leverages modern web technologies and AI integrations to streamline the resume customization process.
Note: This is a prototype intended for testing and feedback. Users must paste their resume as a single paragraph. For best results, we recommend using an AI tool like ChatGPT or similar to convert your existing resume into a concise paragraph before pasting it into the application.
Features

Magic Link Authentication: Secure login via email-based magic links powered by Supabase.
Resume Input: Paste your resume as a paragraph and a job description to receive a tailored resume.
AI-Powered Tailoring: Integrates with an AI workflow (via n8n) to align your resume with the job description, emphasizing relevant skills and experiences.
Dashboard: Displays the latest tailored resume with full details, including original resume, job description, and tailored output.
Professional UI: Clean, modern interface with a consistent background image and frosted card design for a polished user experience.

Tech Stack

Frontend: Next.js (React) with TypeScript and Tailwind CSS for responsive, professional styling.
Backend: Next.js API routes with MongoDB for storing resume data.
Authentication: Supabase for secure, magic link-based authentication.
AI Integration: n8n workflow with OpenAI’s GPT-3.5-turbo for resume tailoring.
Database: MongoDB for persistent storage of user resumes.

Getting Started
Prerequisites

Node.js (v16 or higher)
MongoDB instance (local or cloud, e.g., MongoDB Atlas)
Supabase account for authentication
n8n instance for AI workflow
OpenAI API key for GPT-3.5-turbo

Installation

Clone the Repository:
git clone https://github.com/your-username/resume-tailor.git
cd resume-tailor


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env.local file in the root directory and add:
MONGODB_URI=your_mongodb_connection_string
N8N_API_URL=http://localhost:5678/webhook/resume-tailor
N8N_API_KEY=your_n8n_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


Configure Supabase:

Set up a Supabase project and enable Email Auth with Magic Links.
Update the Magic Link email template in Supabase with the provided supabase-magic-link-template.html.
Set the redirect URL to http://localhost:3000/auth/callback.


Set Up n8n Workflow:

Start n8n: n8n start
Import or create the “resume-tailor” workflow with the provided configuration (Webhook → HTTP Request to OpenAI → Code Node → Respond to Webhook).
Ensure the workflow returns { "content": "..." }.


Run the Application:
npm run dev

Open http://localhost:3000 in your browser.


Usage

Prepare Your Resume:

Convert your resume into a single paragraph using an AI tool like ChatGPT. For example, input your resume into ChatGPT with the prompt: “Convert my resume into a concise paragraph summarizing my skills, experience, and education.”
Example output: “Software Engineer with 5 years of experience in JavaScript, React, and Node.js, skilled in building scalable web applications, RESTful APIs, and MongoDB databases. Led a team of 3 developers to deliver a real-time dashboard used by 10,000+ users. Holds a BS in Computer Science from XYZ University.”


Log In:

On the login page (/), enter your email and click “Send Magic Link.”
Click the link in your email to authenticate and redirect to the home page (/home).


Tailor Your Resume:

On the home page, paste your resume paragraph and the job description.
Click “Tailor Resume” to generate a tailored resume.
You’ll be redirected to the dashboard (/dashboard) to view the latest tailored resume.


View Results:

The dashboard displays the latest tailored resume, original resume, and job description with a toggle for full details.
Character counts are shown for debugging purposes.



Project Structure

app/page.tsx: Login page with magic link authentication.
app/home/page.tsx: Form to input resume and job description.
app/dashboard/page.tsx: Displays the latest tailored resume.
app/auth/callback/page.tsx: Handles Supabase auth callback.
app/api/tailor-resume/route.ts: Processes resume tailoring via n8n.
app/api/get-resumes/route.ts: Fetches resumes from MongoDB.
app/layout.tsx: Applies consistent background image and styling.
supabase-magic-link-template.html: Custom email template for Supabase.

Notes

Prototype Limitations: This is a prototype, so resume input must be a single paragraph. Use ChatGPT or another AI to convert structured resumes into paragraphs for best results.
Background Image: A tranquil landscape is used across all pages for a professional look.
Authentication: Magic links ensure secure, passwordless login. Ensure your email client opens links in the same tab for seamless redirection.

Troubleshooting

Magic Link Issues: Ensure the Supabase redirect URL matches http://localhost:3000/auth/callback. Check browser console logs for errors.
Resume Not Displaying: Verify n8n returns { "content": "..." } and check MongoDB (resume_tailor database) for stored resumes:mongosh "your-mongodb-uri"
use resume_tailor
db.resumes.find({ userId: "your-user-id" }).sort({ createdAt: -1 }).limit(1)


Clear Cache: Run rm -rf .next && npm run dev if changes don’t reflect.

Contributing
This is a prototype, but feedback and contributions are welcome! Please submit issues or pull requests to the repository.
License
MIT License











