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
    await formsService.verifyFormOwnership(req.params.id, userId);

    const form = await formsService.getFormById(req.params.id);

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
    const schema = await formsService.getFormSchema(req.params.id);

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
    await formsService.verifyFormOwnership(req.params.id, userId);

    const form = await formsService.updateForm(req.params.id, req.body);

    res.json(formatResponse(form));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/forms/:id - Suppression d'un formulaire (soft delete) */
export async function deleteForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await formsService.verifyFormOwnership(req.params.id, userId);

    await formsService.deleteForm(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/forms/:id/publish - Publication d'un formulaire */
export async function publishForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await formsService.verifyFormOwnership(req.params.id, userId);

    const form = await formsService.publishForm(req.params.id);

    res.json(formatResponse(form));
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/forms/:id/archive - Archivage d'un formulaire */
export async function archiveForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await formsService.verifyFormOwnership(req.params.id, userId);

    const form = await formsService.archiveForm(req.params.id);

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
    await formsService.verifyFormOwnership(req.params.id, userId);

    const step = await formsService.createStep(req.params.id, req.body);

    res.status(201).json(formatResponse(step));
  } catch (error) {
    next(error);
  }
}

/** PUT /api/forms/:id/steps/:stepId - Mise a jour d'une etape */
export async function updateStep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await formsService.verifyFormOwnership(req.params.id, userId);

    const step = await formsService.updateStep(req.params.stepId, req.body);

    res.json(formatResponse(step));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/forms/:id/steps/:stepId - Suppression d'une etape */
export async function deleteStep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await formsService.verifyFormOwnership(req.params.id, userId);

    await formsService.deleteStep(req.params.stepId);

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
    await formsService.verifyFormOwnership(req.params.id, userId);

    const steps = await formsService.reorderSteps(req.params.id, req.body.stepIds);

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
    await formsService.verifyFormOwnership(req.params.id, userId);

    const field = await formsService.createField(req.params.stepId, req.body);

    res.status(201).json(formatResponse(field));
  } catch (error) {
    next(error);
  }
}

/** PUT /api/forms/:id/steps/:stepId/fields/:fieldId - Mise a jour d'un champ */
export async function updateField(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await formsService.verifyFormOwnership(req.params.id, userId);

    const field = await formsService.updateField(req.params.fieldId, req.body);

    res.json(formatResponse(field));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/forms/:id/steps/:stepId/fields/:fieldId - Suppression d'un champ */
export async function deleteField(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await formsService.verifyFormOwnership(req.params.id, userId);

    await formsService.deleteField(req.params.fieldId);

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
    await formsService.verifyFormOwnership(req.params.id, userId);

    const fields = await formsService.reorderFields(req.params.stepId, req.body.fieldIds);

    res.json(formatResponse(fields));
  } catch (error) {
    next(error);
  }
}
