import { Request, Response, NextFunction } from 'express';
import * as formsService from '../services/forms.service.js';
import { formatResponse, formatPaginatedResponse } from '../types/api.types.js';

// ===========================
// FORMS
// ===========================

/** GET /api/forms - Liste paginee des formulaires de l'utilisateur */
export async function listForms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { forms, total } = await formsService.listForms(userId, page, limit);

    res.json(formatPaginatedResponse(forms, total, page, limit));
  } catch (error) {
    next(error);
  }
}

/** GET /api/forms/:id - Detail d'un formulaire */
export async function getFormById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const form = await formsService.getFormById(formId);

    res.json(formatResponse(form));
  } catch (error) {
    next(error);
  }
}

/** GET /api/forms/:id/schema - Schema public d'un formulaire publie (pas d'auth) */
export async function getFormSchema(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const formId = req.params.id as string;
    const schema = await formsService.getFormSchema(formId);

    res.json(formatResponse(schema));
  } catch (error) {
    next(error);
  }
}

/** POST /api/forms - Creation d'un formulaire */
export async function createForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const form = await formsService.createForm(userId, req.body);

    res.status(201).json(formatResponse(form));
  } catch (error) {
    next(error);
  }
}

/** PUT /api/forms/:id - Mise a jour d'un formulaire */
export async function updateForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const form = await formsService.updateForm(formId, req.body);

    res.json(formatResponse(form));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/forms/:id - Suppression d'un formulaire (soft delete) */
export async function deleteForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    await formsService.deleteForm(formId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/forms/:id/publish - Publication d'un formulaire */
export async function publishForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const form = await formsService.publishForm(formId);

    res.json(formatResponse(form));
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/forms/:id/archive - Archivage d'un formulaire */
export async function archiveForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const form = await formsService.archiveForm(formId);

    res.json(formatResponse(form));
  } catch (error) {
    next(error);
  }
}

// ===========================
// STEPS
// ===========================

/** POST /api/forms/:id/steps - Creation d'une etape */
export async function createStep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const step = await formsService.createStep(formId, req.body);

    res.status(201).json(formatResponse(step));
  } catch (error) {
    next(error);
  }
}

/** PUT /api/forms/:id/steps/:stepId - Mise a jour d'une etape */
export async function updateStep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    const stepId = req.params.stepId as string;
    await formsService.verifyFormOwnership(formId, userId);

    const step = await formsService.updateStep(stepId, req.body);

    res.json(formatResponse(step));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/forms/:id/steps/:stepId - Suppression d'une etape */
export async function deleteStep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    const stepId = req.params.stepId as string;
    await formsService.verifyFormOwnership(formId, userId);

    await formsService.deleteStep(stepId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/forms/:id/steps/reorder - Reordonnancement des etapes */
export async function reorderSteps(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const steps = await formsService.reorderSteps(formId, req.body.stepIds);

    res.json(formatResponse(steps));
  } catch (error) {
    next(error);
  }
}

// ===========================
// FIELDS
// ===========================

/** POST /api/forms/:id/steps/:stepId/fields - Creation d'un champ */
export async function createField(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    const stepId = req.params.stepId as string;
    await formsService.verifyFormOwnership(formId, userId);

    const field = await formsService.createField(stepId, req.body);

    res.status(201).json(formatResponse(field));
  } catch (error) {
    next(error);
  }
}

/** PUT /api/forms/:id/steps/:stepId/fields/:fieldId - Mise a jour d'un champ */
export async function updateField(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    const fieldId = req.params.fieldId as string;
    await formsService.verifyFormOwnership(formId, userId);

    const field = await formsService.updateField(fieldId, req.body);

    res.json(formatResponse(field));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/forms/:id/steps/:stepId/fields/:fieldId - Suppression d'un champ */
export async function deleteField(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    const fieldId = req.params.fieldId as string;
    await formsService.verifyFormOwnership(formId, userId);

    await formsService.deleteField(fieldId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/forms/:id/steps/:stepId/fields/reorder - Reordonnancement des champs */
export async function reorderFields(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    const stepId = req.params.stepId as string;
    await formsService.verifyFormOwnership(formId, userId);

    const fields = await formsService.reorderFields(stepId, req.body.fieldIds);

    res.json(formatResponse(fields));
  } catch (error) {
    next(error);
  }
}
