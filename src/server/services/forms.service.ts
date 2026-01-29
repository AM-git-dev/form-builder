import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import type {
  CreateFormInput,
  UpdateFormInput,
  CreateStepInput,
  UpdateStepInput,
  CreateFieldInput,
  UpdateFieldInput,
} from '../schemas/forms.schema.js';

// ===========================
// FORM SELECT SHAPES
// ===========================

/** Champs selectionnes pour un formulaire dans les listes */
const FORM_LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  settings: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  _count: { select: { steps: true } },
} as const;

/** Champs selectionnes pour un formulaire complet avec ses steps et fields */
const FORM_DETAIL_SELECT = {
  id: true,
  userId: true,
  title: true,
  description: true,
  status: true,
  settings: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  steps: {
    orderBy: { order: 'asc' as const },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      fields: {
        orderBy: { order: 'asc' as const },
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          order: true,
          options: true,
          validation: true,
          config: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
} as const;

// ===========================
// FORMS
// ===========================

/**
 * Liste paginee des formulaires d'un utilisateur.
 * Exclut les formulaires soft-deleted.
 */
export async function listForms(
  userId: string,
  page: number,
  limit: number,
): Promise<{ forms: unknown[]; total: number }> {
  const skip = (page - 1) * limit;

  const [forms, total] = await prisma.$transaction([
    prisma.form.findMany({
      where: { userId, deletedAt: null },
      select: FORM_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.form.count({
      where: { userId, deletedAt: null },
    }),
  ]);

  return { forms, total };
}

/**
 * Retourne un formulaire complet avec ses steps et fields ordonnes.
 * Leve une NotFoundError si le formulaire n'existe pas ou est supprime.
 */
export async function getFormById(formId: string): Promise<unknown> {
  const form = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    select: FORM_DETAIL_SELECT,
  });

  if (!form) {
    throw new NotFoundError('Formulaire introuvable');
  }

  return form;
}

/**
 * Retourne le schema public d'un formulaire publie.
 * Uniquement accessible si le formulaire est au statut PUBLISHED.
 */
export async function getFormSchema(formId: string): Promise<unknown> {
  const form = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      settings: true,
      steps: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          fields: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              type: true,
              label: true,
              placeholder: true,
              required: true,
              order: true,
              options: true,
              validation: true,
              config: true,
            },
          },
        },
      },
    },
  });

  if (!form) {
    throw new NotFoundError('Formulaire introuvable');
  }

  if (form.status !== 'PUBLISHED') {
    throw new NotFoundError('Formulaire introuvable');
  }

  return form;
}

/**
 * Cree un nouveau formulaire avec une etape par defaut "Etape 1".
 */
export async function createForm(userId: string, input: CreateFormInput): Promise<unknown> {
  const form = await prisma.form.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      settings: input.settings ?? {},
      steps: {
        create: {
          title: 'Etape 1',
          order: 0,
        },
      },
    },
    select: FORM_DETAIL_SELECT,
  });

  return form;
}

/**
 * Met a jour un formulaire existant.
 */
export async function updateForm(formId: string, input: UpdateFormInput): Promise<unknown> {
  const form = await prisma.form.update({
    where: { id: formId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.settings !== undefined && { settings: input.settings }),
    },
    select: FORM_DETAIL_SELECT,
  });

  return form;
}

/**
 * Soft delete d'un formulaire (set deletedAt).
 */
export async function deleteForm(formId: string): Promise<void> {
  await prisma.form.update({
    where: { id: formId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Publie un formulaire : change le statut a PUBLISHED et set publishedAt.
 * Verifie que le formulaire a au moins une etape avec au moins un champ.
 */
export async function publishForm(formId: string): Promise<unknown> {
  const form = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    select: {
      id: true,
      status: true,
      steps: {
        select: {
          id: true,
          fields: { select: { id: true } },
        },
      },
    },
  });

  if (!form) {
    throw new NotFoundError('Formulaire introuvable');
  }

  if (form.status === 'PUBLISHED') {
    throw new ValidationError('Le formulaire est deja publie');
  }

  const hasFields = form.steps.some((step) => step.fields.length > 0);
  if (!hasFields) {
    throw new ValidationError(
      'Le formulaire doit avoir au moins une etape avec un champ pour etre publie',
    );
  }

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    select: FORM_DETAIL_SELECT,
  });

  return updated;
}

/**
 * Archive un formulaire : change le statut a ARCHIVED.
 */
export async function archiveForm(formId: string): Promise<unknown> {
  const form = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    select: { id: true, status: true },
  });

  if (!form) {
    throw new NotFoundError('Formulaire introuvable');
  }

  if (form.status === 'ARCHIVED') {
    throw new ValidationError('Le formulaire est deja archive');
  }

  const updated = await prisma.form.update({
    where: { id: formId },
    data: { status: 'ARCHIVED' },
    select: FORM_DETAIL_SELECT,
  });

  return updated;
}

/**
 * Verifie que l'utilisateur est proprietaire du formulaire.
 * Retourne le formulaire si l'utilisateur est proprietaire.
 * Leve une NotFoundError si le formulaire n'existe pas ou est supprime.
 * Leve une ForbiddenError si l'utilisateur n'est pas proprietaire.
 */
export async function verifyFormOwnership(
  formId: string,
  userId: string,
): Promise<{ id: string; userId: string }> {
  const form = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    select: { id: true, userId: true },
  });

  if (!form) {
    throw new NotFoundError('Formulaire introuvable');
  }

  if (form.userId !== userId) {
    throw new ForbiddenError('Acces interdit a ce formulaire');
  }

  return form;
}

// ===========================
// STEPS
// ===========================

/**
 * Cree une nouvelle etape dans un formulaire avec un order auto-incremente.
 */
export async function createStep(formId: string, input: CreateStepInput): Promise<unknown> {
  const lastStep = await prisma.formStep.findFirst({
    where: { formId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const nextOrder = lastStep ? lastStep.order + 1 : 0;

  const step = await prisma.formStep.create({
    data: {
      formId,
      title: input.title,
      description: input.description ?? null,
      order: nextOrder,
    },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          order: true,
          options: true,
          validation: true,
          config: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return step;
}

/**
 * Met a jour une etape existante.
 */
export async function updateStep(stepId: string, input: UpdateStepInput): Promise<unknown> {
  const step = await prisma.formStep.findUnique({
    where: { id: stepId },
    select: { id: true },
  });

  if (!step) {
    throw new NotFoundError('Etape introuvable');
  }

  const updated = await prisma.formStep.update({
    where: { id: stepId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          order: true,
          options: true,
          validation: true,
          config: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return updated;
}

/**
 * Supprime une etape et reordonne les etapes restantes du formulaire.
 */
export async function deleteStep(stepId: string): Promise<void> {
  const step = await prisma.formStep.findUnique({
    where: { id: stepId },
    select: { id: true, formId: true, order: true },
  });

  if (!step) {
    throw new NotFoundError('Etape introuvable');
  }

  await prisma.$transaction(async (tx) => {
    await tx.formStep.delete({ where: { id: stepId } });

    const remainingSteps = await tx.formStep.findMany({
      where: { formId: step.formId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    for (let i = 0; i < remainingSteps.length; i++) {
      await tx.formStep.update({
        where: { id: remainingSteps[i].id },
        data: { order: i },
      });
    }
  });
}

/**
 * Reordonne les etapes d'un formulaire selon l'array de stepIds fourni.
 * Verifie que tous les IDs correspondent a des etapes existantes du formulaire.
 */
export async function reorderSteps(formId: string, stepIds: string[]): Promise<unknown> {
  const existingSteps = await prisma.formStep.findMany({
    where: { formId },
    select: { id: true },
  });

  const existingIds = new Set(existingSteps.map((s) => s.id));
  const providedIds = new Set(stepIds);

  if (existingIds.size !== providedIds.size) {
    throw new ValidationError(
      'Le nombre d\'etapes fournies ne correspond pas au nombre d\'etapes existantes',
    );
  }

  for (const id of stepIds) {
    if (!existingIds.has(id)) {
      throw new ValidationError(`Etape avec l'ID ${id} introuvable dans ce formulaire`);
    }
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < stepIds.length; i++) {
      await tx.formStep.update({
        where: { id: stepIds[i] },
        data: { order: i },
      });
    }
  });

  const steps = await prisma.formStep.findMany({
    where: { formId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          order: true,
          options: true,
          validation: true,
          config: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return steps;
}

// ===========================
// FIELDS
// ===========================

/**
 * Cree un nouveau champ dans une etape avec un order auto-incremente.
 */
export async function createField(stepId: string, input: CreateFieldInput): Promise<unknown> {
  const step = await prisma.formStep.findUnique({
    where: { id: stepId },
    select: { id: true },
  });

  if (!step) {
    throw new NotFoundError('Etape introuvable');
  }

  const lastField = await prisma.formField.findFirst({
    where: { stepId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const nextOrder = lastField ? lastField.order + 1 : 0;

  const field = await prisma.formField.create({
    data: {
      stepId,
      type: input.type,
      label: input.label,
      placeholder: input.placeholder ?? null,
      required: input.required,
      order: nextOrder,
      options: input.options ?? null,
      validation: input.validation ?? null,
      config: input.config ?? null,
    },
    select: {
      id: true,
      type: true,
      label: true,
      placeholder: true,
      required: true,
      order: true,
      options: true,
      validation: true,
      config: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return field;
}

/**
 * Met a jour un champ existant.
 */
export async function updateField(fieldId: string, input: UpdateFieldInput): Promise<unknown> {
  const field = await prisma.formField.findUnique({
    where: { id: fieldId },
    select: { id: true },
  });

  if (!field) {
    throw new NotFoundError('Champ introuvable');
  }

  const updated = await prisma.formField.update({
    where: { id: fieldId },
    data: {
      ...(input.type !== undefined && { type: input.type }),
      ...(input.label !== undefined && { label: input.label }),
      ...(input.placeholder !== undefined && { placeholder: input.placeholder }),
      ...(input.required !== undefined && { required: input.required }),
      ...(input.options !== undefined && { options: input.options }),
      ...(input.validation !== undefined && { validation: input.validation }),
      ...(input.config !== undefined && { config: input.config }),
    },
    select: {
      id: true,
      type: true,
      label: true,
      placeholder: true,
      required: true,
      order: true,
      options: true,
      validation: true,
      config: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
}

/**
 * Supprime un champ et reordonne les champs restants de l'etape.
 */
export async function deleteField(fieldId: string): Promise<void> {
  const field = await prisma.formField.findUnique({
    where: { id: fieldId },
    select: { id: true, stepId: true, order: true },
  });

  if (!field) {
    throw new NotFoundError('Champ introuvable');
  }

  await prisma.$transaction(async (tx) => {
    await tx.formField.delete({ where: { id: fieldId } });

    const remainingFields = await tx.formField.findMany({
      where: { stepId: field.stepId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    for (let i = 0; i < remainingFields.length; i++) {
      await tx.formField.update({
        where: { id: remainingFields[i].id },
        data: { order: i },
      });
    }
  });
}

/**
 * Reordonne les champs d'une etape selon l'array de fieldIds fourni.
 * Verifie que tous les IDs correspondent a des champs existants de l'etape.
 */
export async function reorderFields(stepId: string, fieldIds: string[]): Promise<unknown> {
  const existingFields = await prisma.formField.findMany({
    where: { stepId },
    select: { id: true },
  });

  const existingIds = new Set(existingFields.map((f) => f.id));
  const providedIds = new Set(fieldIds);

  if (existingIds.size !== providedIds.size) {
    throw new ValidationError(
      'Le nombre de champs fournis ne correspond pas au nombre de champs existants',
    );
  }

  for (const id of fieldIds) {
    if (!existingIds.has(id)) {
      throw new ValidationError(`Champ avec l'ID ${id} introuvable dans cette etape`);
    }
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < fieldIds.length; i++) {
      await tx.formField.update({
        where: { id: fieldIds[i] },
        data: { order: i },
      });
    }
  });

  const fields = await prisma.formField.findMany({
    where: { stepId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      type: true,
      label: true,
      placeholder: true,
      required: true,
      order: true,
      options: true,
      validation: true,
      config: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return fields;
}
