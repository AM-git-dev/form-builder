import { Request, Response, NextFunction } from 'express';
import * as submissionsService from '../services/submissions.service.js';
import * as eventsService from '../services/events.service.js';
import { formatResponse, formatPaginatedResponse } from '../types/api.types.js';

/** POST /api/forms/:id/submissions - Soumission publique (pas d'auth) */
export async function createSubmission(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const formId = req.params.id as string;
    const submission = await submissionsService.createSubmission(formId, req.body);
    res.status(201).json(formatResponse(submission));
  } catch (error) {
    next(error);
  }
}

/** GET /api/forms/:id/submissions - Liste des soumissions (auth requise, owner) */
export async function listSubmissions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const formId = req.params.id as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { submissions, total } = await submissionsService.listSubmissions(
      formId,
      page,
      limit,
    );

    res.json(formatPaginatedResponse(submissions, total, page, limit));
  } catch (error) {
    next(error);
  }
}

/** POST /api/forms/:id/events - Enregistrement d'un evenement tracking (pas d'auth) */
export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const formId = req.params.id as string;
    const event = await eventsService.createEvent(formId, req.body);
    res.status(201).json(formatResponse(event));
  } catch (error) {
    next(error);
  }
}
