/**
 * Dump rendered generate prompts for Steps 3–7 (for Cursor / Claude review).
 * Usage: npm run dump-prompts
 * Output: prompt-dumps/step{N}-default.md, step{N}-max.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STEPS } from '../src/constants/steps.js';
import { buildGeneratePrompt } from '../src/prompts/index.js';
import { DEFAULT_QUESTION_TARGETS, getEffectiveQuestionTarget } from '../src/constants/essences.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'prompt-dumps');
const N = 7;

fs.mkdirSync(OUT_DIR, { recursive: true });

for (let step = 3; step <= 7; step++) {
  const stepInfo = STEPS[step];
  const variants = [
    { label: 'default', questionTarget: DEFAULT_QUESTION_TARGETS[step] },
    { label: 'max', questionTarget: N },
  ];

  for (const { label, questionTarget } of variants) {
    const effectiveTarget = getEffectiveQuestionTarget(step, questionTarget);
    const { system, user } = buildGeneratePrompt(stepInfo, N, { step, questionTarget });
    const content = `# Step ${step} — ${label}

- questionTarget（スライダー）: ${questionTarget}
- effectiveTarget（必達）: ${effectiveTarget}
- maxNatural: ${DEFAULT_QUESTION_TARGETS[step] === questionTarget && label === 'default' ? '（既定値）' : `スライダー${questionTarget} → 必達${effectiveTarget}`}

生成元: \`buildGeneratePrompt()\` in \`src/prompts/index.js\`

## System

\`\`\`
${system}
\`\`\`

## User

\`\`\`
${user}
\`\`\`
`;
    const file = path.join(OUT_DIR, `step${step}-${label}.md`);
    fs.writeFileSync(file, content, 'utf8');
    console.log('wrote', file);
  }
}

console.log(`\nDone. ${OUT_DIR}`);
