import { z } from 'zod';

// === SUBMISSIONS ===

export const createSubmissionSchema = z.object({
  data: z.record(z.unknown()),
  sessionId: z.string().min(1).max(200),
});

// === EVENTS ===

export const eventTypeEnum = z.enum([
  'FORM_VIEW',
  'FORM_START',
  'STEP_COMPLETE',
  'FORM_SUBMIT',
  'FORM_ABANDON',
]);

export const createEventSchema = z.object({
  type: eventTypeEnum,
  sessionId: z.string().min(1).max(200),
  stepId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

// === TYPES DERIVES ===

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
