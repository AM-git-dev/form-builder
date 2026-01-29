import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import type { CreateEventInput } from '../schemas/submissions.schema.js';

/**
 * Enregistre un evenement de tracking pour un formulaire.
 * Resout le stepId en stepOrder pour faciliter l'analyse du funnel.
 */
export async function createEvent(
  formId: string,
  input: CreateEventInput,
): Promise<unknown> {
  const form = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    select: { id: true },
  });

  if (!form) {
    throw new NotFoundError('Formulaire introuvable');
  }

  let stepOrder: number | null = null;

  if (input.stepId) {
    const step = await prisma.formStep.findUnique({
      where: { id: input.stepId },
      select: { order: true },
    });
    if (step) {
      stepOrder = step.order;
    }
  }

  const event = await prisma.event.create({
    data: {
      formId,
      type: input.type,
      sessionId: input.sessionId,
      stepOrder,
      metadata: input.metadata ?? null,
    },
    select: {
      id: true,
      type: true,
      sessionId: true,
      stepOrder: true,
      createdAt: true,
    },
  });

  return event;
}
