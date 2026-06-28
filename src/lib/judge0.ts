
/**
 * Judge0 API Integration Utility
 */

const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || ''; // Users should set this in .env

export type Judge0Language = 'python' | 'java' | 'cpp' | 'javascript';

const LANGUAGE_MAP: Record<Judge0Language, number> = {
  python: 71, // Python (3.8.1)
  java: 62,   // OpenJDK 13.0.1
  cpp: 54,    // C++ (GCC 9.2.0)
  javascript: 63 // Node.js (12.14.0)
};

export type Judge0SubmissionResult = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code: number | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
};

export async function executeCode(code: string, language: Judge0Language): Promise<Judge0SubmissionResult> {
  const languageId = LANGUAGE_MAP[language];
  
  if (!RAPIDAPI_KEY) {
    throw new Error('RapidAPI Key is missing. Please set NEXT_PUBLIC_RAPIDAPI_KEY in your .env file.');
  }

  // 1. Create submission
  const createResponse = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
    })
  });

  if (!createResponse.ok) {
    const err = await createResponse.text();
    throw new Error(`Failed to create submission: ${err}`);
  }

  const { token } = await createResponse.json();

  // 2. Poll for results
  let result: Judge0SubmissionResult | null = null;
  const maxRetries = 20;
  let retries = 0;

  while (retries < maxRetries) {
    const pollResponse = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    if (!pollResponse.ok) {
      throw new Error('Failed to fetch submission status');
    }

    const data = await pollResponse.json();
    
    // Status ID 1: In Queue, 2: Processing
    if (data.status.id > 2) {
      result = data;
      break;
    }

    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!result) {
    throw new Error('Execution timed out');
  }

  return result;
}
