
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to initiate code execution locally.
 * Generates a stateless token to pass source code to the result fetcher.
 */
export async function POST(request: NextRequest) {
  try {
    const { source_code, language_id, stdin } = await request.json();

    if (!source_code) {
      return NextResponse.json({ error: 'Source code is required' }, { status: 400 });
    }

    // Stateless token containing the execution payload
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
