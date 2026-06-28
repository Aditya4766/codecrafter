
import { NextRequest, NextResponse } from 'next/server';
import { executeLocally } from '@/lib/local-executor';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing submission token' }, { status: 400 });
  }

  try {
    // 1. Decode the stateless token
    const submissionData = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { source_code, language_id, stdin } = submissionData;

    // 2. Perform local execution
    const result = await executeLocally(source_code, language_id, stdin || '');

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
