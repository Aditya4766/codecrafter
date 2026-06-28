
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export type ExecutionResult = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code: number | null;
  time: string;
  memory: number;
  status: {
    id: number;
    description: string;
  };
};

const TIMEOUT_MS = 3000;
const MAX_OUTPUT_SIZE = 1024 * 1024;

export async function executeLocally(
  sourceCode: string,
  languageId: number,
  stdin: string = ''
): Promise<ExecutionResult> {
  const runId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `code-crafter-${runId}`);
  
  try {
    await fs.mkdir(tempDir, { recursive: true });

    let fileName = '';
    let compileCmd = '';
    let compileArgs: string[] = [];
    let runCmd = '';
    let runArgs: string[] = [];

    // Mapping based on Judge0 IDs
    switch (languageId) {
      case 71: // Python
        fileName = 'main.py';
        runCmd = 'python3';
        runArgs = [fileName];
        break;
      case 62: // Java
        fileName = 'Solution.java';
        compileCmd = 'javac';
        compileArgs = [fileName];
        runCmd = 'java';
        runArgs = ['Solution'];
        break;
      case 54: // C++
        fileName = 'main.cpp';
        compileCmd = 'g++';
        compileArgs = ['main.cpp', '-O2', '-std=c++17', '-o', 'program'];
        runCmd = './program';
        break;
      case 63: // JavaScript
        fileName = 'main.js';
        runCmd = 'node';
        runArgs = [fileName];
        break;
      default:
        throw new Error(`Unsupported language ID: ${languageId}`);
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, sourceCode);

    // Compilation Phase
    if (compileCmd) {
      const compileResult = await runProcess(
        compileCmd, 
        compileArgs, 
        tempDir, 
        '', 
        TIMEOUT_MS * 2
      );
      
      if (compileResult.exitCode !== 0) {
        return createResult(
          null, 
          compileResult.stderr, 
          compileResult.stdout || compileResult.stderr, 
          6, 
          'Compilation Error', 
          compileResult.exitCode
        );
      }
    }

    // Execution Phase
    const executionStart = Date.now();
    const runResult = await runProcess(
      runCmd,
      runArgs,
      tempDir,
      stdin,
      TIMEOUT_MS
    );
    const executionTime = (Date.now() - executionStart) / 1000;

    if (runResult.timedOut) {
      return createResult(null, null, 'Time Limit Exceeded', 5, 'Time Limit Exceeded', null, executionTime.toString());
    }

    if (runResult.exitCode !== 0) {
      return createResult(runResult.stdout, runResult.stderr, null, 11, 'Runtime Error', runResult.exitCode, executionTime.toString());
    }

    return createResult(runResult.stdout, runResult.stderr, null, 3, 'Accepted', 0, executionTime.toString());

  } catch (error: any) {
    return createResult(null, error.message, 'Internal Execution Error', 13, 'Internal Error', null);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to cleanup temp dir', e);
    }
  }
}

async function runProcess(
  cmd: string, 
  args: string[], 
  cwd: string, 
  input: string, 
  timeout: number
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    // Use shell: false to ensure we execute the command directly and capture clean stdout.
    const child = spawn(cmd, args, { cwd, shell: false });
    
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeout);

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      if (stdout.length < MAX_OUTPUT_SIZE) stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      if (stderr.length < MAX_OUTPUT_SIZE) stderr += data.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: err.message, exitCode: 1, timedOut: false });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut });
    });
  });
}

function createResult(
  stdout: string | null,
  stderr: string | null,
  compile_output: string | null,
  statusId: number,
  statusDesc: string,
  exitCode: number | null,
  time: string = '0.0'
): ExecutionResult {
  return {
    stdout,
    stderr,
    compile_output,
    message: null,
    exit_code: exitCode,
    time,
    memory: 1024, // Mock memory
    status: {
      id: statusId,
      description: statusDesc,
    },
  };
}
