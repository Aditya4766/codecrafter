
/**
 * @fileOverview API route to submit code to Judge0 securely.
 * This route prevents the RapidAPI key from being exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

export async function POST(request: NextRequest) {
  try {
    const { source_code, language_id } = await request.json();
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing API Key' },
        { status: 500 }
      );
    }

    const response = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code,
        language_id,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Judge0 submission failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
