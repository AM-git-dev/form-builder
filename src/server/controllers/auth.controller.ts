import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { formatResponse } from '../types/api.types.js';
import { config } from '../config/index.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

/** POST /api/auth/register - Inscription d'un nouvel utilisateur */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await authService.register(req.body);

    res.cookie('access_token', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.status(201).json(formatResponse(user));
  } catch (error) {
    next(error);
  }
}

/** POST /api/auth/login - Connexion d'un utilisateur */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await authService.login(req.body);

    res.cookie('access_token', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(formatResponse(user));
  } catch (error) {
    next(error);
  }
}

/** POST /api/auth/refresh - Rafraichissement des tokens */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      res.status(401).json({
        data: null,
        error: { statusCode: 401, code: 'UNAUTHORIZED', message: 'Token de rafraichissement manquant' },
      });
      return;
    }

    const tokens = await authService.refreshTokens(refreshToken);

    res.cookie('access_token', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(formatResponse({ message: 'Tokens rafraichis' }));
  } catch (error) {
    next(error);
  }
}

/** POST /api/auth/logout - Deconnexion de l'utilisateur */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('access_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);

    res.json(formatResponse({ message: 'Deconnexion reussie' }));
  } catch (error) {
    next(error);
  }
}

/** GET /api/auth/me - Informations de l'utilisateur courant */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json(formatResponse(user));
  } catch (error) {
    next(error);
  }
}
