
/**
 * API route to initiate code execution.
 * Replaced RapidAPI dependency with a stateless token generation approach.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { source_code, language_id, stdin } = await request.json();

    if (!source_code) {
      return NextResponse.json({ error: 'Source code is required' }, { status: 400 });
    }

    // Instead of calling a 3rd party API here and storing a token,
    // we generate a stateless token by encoding the submission data.
    // This allows the "result" route to handle the actual execution.
    const submissionData = JSON.stringify({ 
      source_code, 
      language_id, 
      stdin: stdin || "",
      timestamp: Date.now() 
    });
    const token = Buffer.from(submissionData).toString('base64');

    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
