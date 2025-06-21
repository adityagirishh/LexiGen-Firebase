import { config } from 'dotenv';
config();

import '@/ai/flows/generate-document-embedding.ts';
import '@/ai/flows/retrieve-similar-cases.ts';
import '@/ai/flows/refine-memo-generation.ts';
import '@/ai/flows/multi-document-memo-generation.ts';
import '@/ai/flows/generate-preliminary-memo.ts';