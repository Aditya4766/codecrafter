
/**
 * @fileOverview API route to fetch execution results from Judge0 securely.
 */

import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!token) {
    return NextResponse.json({ error: 'Missing submission token' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing API Key' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch result: ${errorText}` },
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
