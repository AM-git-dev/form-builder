import { z } from 'zod';

// === FORMS ===

export const createFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().max(1000).optional(),
  settings: z.record(z.unknown()).optional(),
});

export const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const formIdParamSchema = z.object({
  id: z.string().uuid('ID de formulaire invalide'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// === STEPS ===

export const createStepSchema = z.object({
  title: z.string().min(1, "Le titre de l'etape est requis").max(200),
  description: z.string().max(500).optional(),
});

export const updateStepSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
});

export const reorderStepsSchema = z.object({
  stepIds: z.array(z.string().uuid()).min(1, 'Au moins une etape requise'),
});

export const stepParamsSchema = z.object({
  id: z.string().uuid(),
  stepId: z.string().uuid(),
});

// === FIELDS ===

export const fieldTypeEnum = z.enum([
  'TEXT',
  'EMAIL',
  'PHONE',
  'NUMBER',
  'TEXTAREA',
  'SELECT',
  'RADIO',
  'CHECKBOX',
  'DATE',
]);

export const createFieldSchema = z.object({
  type: fieldTypeEnum,
  label: z.string().min(1, 'Le label est requis').max(200),
  placeholder: z.string().max(200).optional(),
  required: z.boolean().optional().default(false),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .optional(),
  validation: z
    .object({
      minLength: z.number().int().optional(),
      maxLength: z.number().int().optional(),
      pattern: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  config: z.record(z.unknown()).optional(),
});

export const updateFieldSchema = z.object({
  type: fieldTypeEnum.optional(),
  label: z.string().min(1).max(200).optional(),
  placeholder: z.string().max(200).nullable().optional(),
  required: z.boolean().optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .nullable()
    .optional(),
  validation: z
    .object({
      minLength: z.number().int().optional(),
      maxLength: z.number().int().optional(),
      pattern: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .nullable()
    .optional(),
  config: z.record(z.unknown()).nullable().optional(),
});

export const reorderFieldsSchema = z.object({
  fieldIds: z.array(z.string().uuid()).min(1),
});

export const fieldParamsSchema = z.object({
  id: z.string().uuid(),
  stepId: z.string().uuid(),
  fieldId: z.string().uuid(),
});

// === TYPES DERIVES ===

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type CreateStepInput = z.infer<typeof createStepSchema>;
export type UpdateStepInput = z.infer<typeof updateStepSchema>;
export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
