/**
 * Dump rendered prompts for Steps 3–7 (generation + grading).
 * Usage: npm run dump-prompts
 *
 * Output:
 *   prompt-dumps/generate/step{N}-declarative.md | step{N}-interrogative.md
 *   prompt-dumps/check/step{N}.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STEPS } from '../src/constants/steps.js';
import { buildGeneratePrompt, buildCheckPrompt } from '../src/prompts/index.js';
import {
  DECLARATIVE_SET_SIZE,
  INTERROGATIVE_DRILL_SIZE,
  STEP_MODES,
} from '../src/constants/essences.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'prompt-dumps');
const GENERATE_DIR = path.join(ROOT, 'generate');
const CHECK_DIR = path.join(ROOT, 'check');
const SPEC_LABEL = 'work-request-mode-split 改修5（平叙/疑問モード分離・mixed廃止）';

/** Per-step check sample: seed exercise + intentionally flawed attempt (jp/en/attempt aligned). */
function pickSamplePair(stepInfo, step) {
  if (step === 3) {
    const ex = stepInfo.exercises.find((e) => e.en?.endsWith('?')) ?? stepInfo.exercises[0];
    return { ...ex, attempt: 'Did you buyed the book yesterday?' };
  }
  if (step === 4) {
    const ex = stepInfo.exercises[0];
    return { ...ex, attempt: 'What you want to do?' };
  }
  if (step === 5) {
    const ex = stepInfo.exercises[0];
    return { ...ex, attempt: 'The book that I buy yesterday is interesting.' };
  }
  if (step === 6) {
    const ex = stepInfo.exercises[0];
    return { ...ex, attempt: 'I want to know what did he said.' };
  }
  if (step === 7) {
    const ex = stepInfo.exercises.find((e) => e.operationTag === '倒置/強調') ?? stepInfo.exercises[0];
    return { ...ex, attempt: 'When she did join the meeting?' };
  }
  const ex = stepInfo.exercises[0];
  return { ...ex, attempt: ex.en };
}

function formatMdBlock(title, text) {
  return `## ${title}\n\n\`\`\`\n${text}\n\`\`\``;
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('wrote', filePath);
}

fs.mkdirSync(GENERATE_DIR, { recursive: true });
fs.mkdirSync(CHECK_DIR, { recursive: true });

for (let step = 3; step <= 7; step++) {
  const stepInfo = STEPS[step];
  const modes = STEP_MODES[step] ?? ['declarative'];

  for (const generationMode of modes) {
    const n = generationMode === 'interrogative' ? INTERROGATIVE_DRILL_SIZE : DECLARATIVE_SET_SIZE;
    const { system, user } = buildGeneratePrompt(stepInfo, n, { step, generationMode });

    const content = `# Step ${step} — ${generationMode}（問題生成）

- 仕様: ${SPEC_LABEL}
- 生成元: \`buildGeneratePrompt()\` in \`src/prompts/index.js\`
- generationMode: ${generationMode}
- 問数 n: ${n}

${formatMdBlock('System', system)}

${formatMdBlock('User', user)}
`;
    writeFile(path.join(GENERATE_DIR, `step${step}-${generationMode}.md`), content);
  }

  const sample = pickSamplePair(stepInfo, step);
  const { system: checkSystem, user: checkUser } = buildCheckPrompt([sample], { step });
  const checkContent = `# Step ${step} — 答え合わせ（採点）

- 生成元: \`buildCheckPrompt()\` in \`src/prompts/index.js\`
- 採点単位: 1問バッチ（\`CHECK_BATCH_SIZE = 1\`）
- サンプル入力: STEPS[${step}] のシード例 + 意図的に不正解な解答

### サンプル問

- 日本語: ${sample.jp}
- 模範解答: ${sample.en}
- 解答（サンプル）: ${sample.attempt}
${sample.operationTag ? `- operationTag: ${sample.operationTag}` : ''}
${sample.thread ? `- thread: ${sample.thread}` : ''}

${formatMdBlock('System', checkSystem)}

${formatMdBlock('User', checkUser)}
`;
  writeFile(path.join(CHECK_DIR, `step${step}.md`), checkContent);
}

// Remove legacy mixed-mode dumps
for (let step = 3; step <= 7; step++) {
  for (const label of ['default', 'max']) {
    const legacy = path.join(GENERATE_DIR, `step${step}-${label}.md`);
    if (fs.existsSync(legacy)) {
      fs.unlinkSync(legacy);
      console.log('removed legacy', legacy);
    }
  }
}

console.log(`\nDone. ${ROOT}`);
