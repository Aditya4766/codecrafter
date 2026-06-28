
/**
 * Judge0 API Integration Utility (Frontend Bridge)
 * Now calls internal API routes to keep sensitive keys secure on the server.
 */

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

/**
 * Executes code by calling the internal Next.js API routes.
 */
export async function executeCode(code: string, language: Judge0Language): Promise<Judge0SubmissionResult> {
  const languageId = LANGUAGE_MAP[language];
  
  // 1. Create submission via internal API
  const createResponse = await fetch('/api/judge0/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
    })
  });

  if (!createResponse.ok) {
    const errData = await createResponse.json();
    throw new Error(errData.error || 'Failed to create submission');
  }

  const { token } = await createResponse.json();

  // 2. Poll for results via internal API
  let result: Judge0SubmissionResult | null = null;
  const maxRetries = 30; // Increased retries for slower executions
  let retries = 0;

  while (retries < maxRetries) {
    const pollResponse = await fetch(`/api/judge0/result?token=${token}`);

    if (!pollResponse.ok) {
      const errData = await pollResponse.json();
      throw new Error(errData.error || 'Failed to fetch submission status');
    }

    const data = await pollResponse.json();
    
    // Status ID 1: In Queue, 2: Processing
    if (data.status.id > 2) {
      result = data;
      break;
    }

    retries++;
    // Use exponential-ish backoff for polling
    await new Promise(resolve => setTimeout(resolve, 1000 + (retries * 100)));
  }

  if (!result) {
    throw new Error('Execution timed out');
  }

  return result;
}
