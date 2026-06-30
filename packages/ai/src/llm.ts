import type { AiContext, AiResponse } from './concierge.js';
import { groundedConciergeReply } from './concierge.js';
import { getAiProviderStatus, phraseWithAvailableAi } from './providers.js';

export type { AiEngine, AiProviderStatus } from './providers.js';
export { getAiEngineLabel, getAiProviderStatus } from './providers.js';

export async function conciergeWithOptionalLlm(
  question: string,
  context: AiContext,
  focusRecordId?: string,
): Promise<AiResponse> {
  const grounded = groundedConciergeReply(question, context, focusRecordId);
  const enhanced = await phraseWithAvailableAi(question, grounded, context);

  if (!enhanced) {
    return grounded;
  }

  return {
    ...grounded,
    answer: enhanced.answer,
    provider: enhanced.provider,
    model: enhanced.model,
    assumptions: enhanced.assumption
      ? [...grounded.assumptions, enhanced.assumption]
      : grounded.assumptions,
  };
}
