import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import type { CreateSubmissionInput } from '../schemas/submissions.schema.js';

/**
 * Cree une soumission pour un formulaire publie.
 * Valide que le formulaire existe et est publie.
 * Valide les donnees soumises contre le schema du formulaire (champs requis).
 */
export async function createSubmission(
  formId: string,
  input: CreateSubmissionInput,
): Promise<unknown> {
  const form = await prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    select: {
      id: true,
      status: true,
      steps: {
        select: {
          fields: {
            select: {
              id: true,
              type: true,
              label: true,
              required: true,
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
    throw new ValidationError('Ce formulaire n\'accepte pas de soumissions');
  }

  // Validate required fields
  const allFields = form.steps.flatMap((step) => step.fields);
  const missingFields: string[] = [];

  for (const field of allFields) {
    if (field.required) {
      const value = input.data[field.id];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field.label);
      }
      if (Array.isArray(value) && value.length === 0) {
        missingFields.push(field.label);
      }
    }
  }

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Champs requis manquants : ${missingFields.join(', ')}`,
    );
  }

  const submission = await prisma.submission.create({
    data: {
      formId,
      data: input.data,
      metadata: { sessionId: input.sessionId },
      completedAt: new Date(),
    },
    select: {
      id: true,
      formId: true,
      data: true,
      completedAt: true,
      createdAt: true,
    },
  });

  return submission;
}

/**
 * Liste paginee des soumissions d'un formulaire.
 * Triees par date de creation decroissante.
 */
export async function listSubmissions(
  formId: string,
  page: number,
  limit: number,
): Promise<{ submissions: unknown[]; total: number }> {
  const skip = (page - 1) * limit;

  const [submissions, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where: { formId },
      select: {
        id: true,
        data: true,
        metadata: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.submission.count({ where: { formId } }),
  ]);

  return { submissions, total };
}

/**
 * Retourne une soumission par son ID.
 */
export async function getSubmissionById(submissionId: string): Promise<unknown> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      formId: true,
      data: true,
      metadata: true,
      completedAt: true,
      createdAt: true,
    },
  });

  if (!submission) {
    throw new NotFoundError('Soumission introuvable');
  }

  return submission;
}
