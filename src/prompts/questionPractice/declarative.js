import { getCoverageForStep } from '../../constants/essences.js';
import { buildDeclarativePriorityLadder, buildNaturalnessAbsoluteSection } from './shared.js';

export function buildDeclarativeSection(step, n) {
  if (step < 3 || step > 7) return '';

  return `
${buildDeclarativePriorityLadder(step, n)}

平叙セット（構造網羅）:
- 設計思想: 1セット${n}問すべて平叙文で、当STEPの MECE 網羅（STEP_COVERAGE）を担う
- 全問に \`"mood": "declarative"\` を付与（省略不可）
- 疑問文・間接疑問フレームは生成しない（否定文のみの平叙は可）
- 網羅責任は本セット全体に置く。Step5 の4カテゴリ・gap対比、Step6 の Y+Z キー型は平叙7問で必達

STEP_COVERAGE（必須）:
${getCoverageForStep(step)}

${buildNaturalnessAbsoluteSection(step, n)}`;
}
