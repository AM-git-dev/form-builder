import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service.js';
import * as formsService from '../services/forms.service.js';
import { formatResponse } from '../types/api.types.js';

/** GET /api/analytics/forms/:id/overview */
export async function getFormOverview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const overview = await analyticsService.getFormOverview(formId);
    res.json(formatResponse(overview));
  } catch (error) {
    next(error);
  }
}

/** GET /api/analytics/forms/:id/funnel */
export async function getFormFunnel(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const funnel = await analyticsService.getFormFunnel(formId);
    res.json(formatResponse(funnel));
  } catch (error) {
    next(error);
  }
}

/** GET /api/analytics/forms/:id/timeline */
export async function getFormTimeline(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const formId = req.params.id as string;
    await formsService.verifyFormOwnership(formId, userId);

    const timeline = await analyticsService.getFormTimeline(formId);
    res.json(formatResponse(timeline));
  } catch (error) {
    next(error);
  }
}

/** GET /api/analytics/dashboard */
export async function getDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const stats = await analyticsService.getDashboardStats(userId);
    res.json(formatResponse(stats));
  } catch (error) {
    next(error);
  }
}
