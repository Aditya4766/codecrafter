import { config } from 'dotenv';
config();

import '@/ai/flows/code-explanation-and-improvement.ts';
import '@/ai/flows/generate-problem-description.ts';
import '@/ai/flows/test-cases-generation.ts';
import '@/ai/flows/run-code-with-tests.ts';
