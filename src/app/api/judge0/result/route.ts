
/**
 * @fileOverview API route to fetch execution results using the Piston API.
 * Maps Piston's response to the Judge0 format expected by the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

// Mapping Judge0 Language IDs to Piston Language Names and Versions
const LANGUAGE_MAP: Record<number, { language: string; version: string; filename: string }> = {
  71: { language: 'python', version: '3.10.0', filename: 'main.py' },
  62: { language: 'java', version: '15.0.2', filename: 'Solution.java' },
  54: { language: 'cpp', version: '10.2.0', filename: 'main.cpp' },
  63: { language: 'javascript', version: '18.15.0', filename: 'main.js' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing submission token' }, { status: 400 });
  }

  try {
    // 1. Decode the stateless token
    const submissionData = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { source_code, language_id } = submissionData;

    const config = LANGUAGE_MAP[language_id] || LANGUAGE_MAP[71]; // Default to Python

    // 2. Call the free Piston API
    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ name: config.filename, content: source_code }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Code execution service error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    // 3. Map Piston response to Judge0 format
    // Judge0 Status IDs: 3: Accepted, 6: Compilation Error, 11: Runtime Error
    let statusId = 3;
    let statusDescription = 'Accepted';

    // Check for compilation errors (for compiled languages like C++, Java)
    if (data.compile && data.compile.code !== 0) {
      statusId = 6;
      statusDescription = 'Compilation Error';
    } else if (data.run.code !== 0) {
      statusId = 11;
      statusDescription = 'Runtime Error';
    }

    const judge0Result = {
      stdout: data.run.stdout || null,
      stderr: data.run.stderr || null,
      compile_output: data.compile?.output || null,
      message: data.run.signal ? `Terminated by signal ${data.run.signal}` : null,
      exit_code: data.run.code,
      time: "0.1", // Piston doesn't always provide precise timing in standard output
      memory: 1024, // Dummy value as Piston doesn't provide memory usage
      status: {
        id: statusId,
        description: statusDescription,
      },
    };

    return NextResponse.json(judge0Result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
