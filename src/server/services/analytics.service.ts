import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { NotFoundError } from '../utils/errors.js';

const CACHE_TTL = 300; // 5 minutes

async function getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Redis indisponible — on continue sans cache
  }

  const data = await fetchFn();

  try {
    await redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL);
  } catch {
    // Redis indisponible — on continue sans cache
  }

  return data;
}

/**
 * Overview d'un formulaire : vues, starts, soumissions, taux de conversion.
 */
export async function getFormOverview(formId: string): Promise<{
  totalViews: number;
  totalStarts: number;
  totalSubmissions: number;
  conversionRate: number;
  startRate: number;
  completionRate: number;
}> {
  return getCachedOrFetch(`analytics:overview:${formId}`, async () => {
    const [totalViews, totalStarts, totalSubmissions] = await prisma.$transaction([
      prisma.event.count({ where: { formId, type: 'FORM_VIEW' } }),
      prisma.event.count({ where: { formId, type: 'FORM_START' } }),
      prisma.event.count({ where: { formId, type: 'FORM_SUBMIT' } }),
    ]);

    const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;
    const startRate = totalViews > 0 ? (totalStarts / totalViews) * 100 : 0;
    const completionRate = totalStarts > 0 ? (totalSubmissions / totalStarts) * 100 : 0;

    return {
      totalViews,
      totalStarts,
      totalSubmissions,
      conversionRate: Math.round(conversionRate * 10) / 10,
      startRate: Math.round(startRate * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
    };
  });
}

/**
 * Funnel : drop-off par etape.
 * Pour chaque etape, compte les STEP_COMPLETE et calcule le taux de drop-off
 * par rapport a l'etape precedente (ou aux FORM_START pour la premiere etape).
 */
export async function getFormFunnel(formId: string): Promise<Array<{
  stepOrder: number;
  stepTitle: string;
  completions: number;
  dropOffRate: number;
}>> {
  return getCachedOrFetch(`analytics:funnel:${formId}`, async () => {
    const form = await prisma.form.findFirst({
      where: { id: formId, deletedAt: null },
      select: {
        steps: {
          orderBy: { order: 'asc' },
          select: { order: true, title: true },
        },
      },
    });

    if (!form) {
      throw new NotFoundError('Formulaire introuvable');
    }

    const totalStarts = await prisma.event.count({
      where: { formId, type: 'FORM_START' },
    });

    const stepCompletions = await prisma.event.groupBy({
      by: ['stepOrder'],
      where: { formId, type: 'STEP_COMPLETE', stepOrder: { not: null } },
      _count: { id: true },
    });

    const completionMap = new Map<number, number>();
    for (const sc of stepCompletions) {
      if (sc.stepOrder !== null) {
        completionMap.set(sc.stepOrder, sc._count.id);
      }
    }

    const funnel = form.steps.map((step, index) => {
      const completions = completionMap.get(step.order) ?? 0;
      const previousCount = index === 0 ? totalStarts : (completionMap.get(form.steps[index - 1].order) ?? 0);
      const dropOffRate = previousCount > 0
        ? ((previousCount - completions) / previousCount) * 100
        : 0;

      return {
        stepOrder: step.order,
        stepTitle: step.title,
        completions,
        dropOffRate: Math.round(dropOffRate * 10) / 10,
      };
    });

    return funnel;
  });
}

/**
 * Timeline : soumissions et vues par jour sur les 30 derniers jours.
 */
export async function getFormTimeline(formId: string): Promise<Array<{
  date: string;
  submissions: number;
  views: number;
}>> {
  return getCachedOrFetch(`analytics:timeline:${formId}`, async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [viewEvents, submitEvents] = await prisma.$transaction([
      prisma.event.findMany({
        where: {
          formId,
          type: 'FORM_VIEW',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
      }),
      prisma.event.findMany({
        where: {
          formId,
          type: 'FORM_SUBMIT',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
      }),
    ]);

    const dateMap = new Map<string, { views: number; submissions: number }>();

    // Initialize all 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split('T')[0];
      dateMap.set(key, { views: 0, submissions: 0 });
    }

    for (const event of viewEvents) {
      const key = event.createdAt.toISOString().split('T')[0];
      const entry = dateMap.get(key);
      if (entry) entry.views++;
    }

    for (const event of submitEvents) {
      const key = event.createdAt.toISOString().split('T')[0];
      const entry = dateMap.get(key);
      if (entry) entry.submissions++;
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        submissions: data.submissions,
        views: data.views,
      }));
  });
}

/**
 * Dashboard global : stats agreges de tous les formulaires d'un utilisateur.
 */
export async function getDashboardStats(userId: string): Promise<{
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  averageConversionRate: number;
}> {
  return getCachedOrFetch(`analytics:dashboard:${userId}`, async () => {
    const forms = await prisma.form.findMany({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    const formIds = forms.map((f) => f.id);

    if (formIds.length === 0) {
      return {
        totalForms: 0,
        totalSubmissions: 0,
        totalViews: 0,
        averageConversionRate: 0,
      };
    }

    const [totalSubmissions, totalViews, totalFormSubmits] = await prisma.$transaction([
      prisma.submission.count({ where: { formId: { in: formIds } } }),
      prisma.event.count({ where: { formId: { in: formIds }, type: 'FORM_VIEW' } }),
      prisma.event.count({ where: { formId: { in: formIds }, type: 'FORM_SUBMIT' } }),
    ]);

    const averageConversionRate = totalViews > 0
      ? (totalFormSubmits / totalViews) * 100
      : 0;

    return {
      totalForms: formIds.length,
      totalSubmissions,
      totalViews,
      averageConversionRate: Math.round(averageConversionRate * 10) / 10,
    };
  });
}
