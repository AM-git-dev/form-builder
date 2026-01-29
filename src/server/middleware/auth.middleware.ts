import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { Role } from '@prisma/client';

/**
 * Middleware d'authentification.
 * Verifie la presence et la validite du access token dans les cookies.
 * Injecte les informations utilisateur dans req.user.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.access_token;

  if (!token) {
    res.status(401).json({
      data: null,
      error: { statusCode: 401, code: 'UNAUTHORIZED', message: 'Authentification requise' },
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role as Role,
    };
    next();
  } catch {
    res.status(401).json({
      data: null,
      error: { statusCode: 401, code: 'TOKEN_EXPIRED', message: 'Token expire ou invalide' },
    });
  }
}

/**
 * Middleware d'autorisation RBAC.
 * Verifie que l'utilisateur authentifie possede l'un des roles requis.
 * Doit etre utilise apres le middleware authenticate.
 */
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        data: null,
        error: { statusCode: 401, code: 'UNAUTHORIZED', message: 'Authentification requise' },
      });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({
        data: null,
        error: { statusCode: 403, code: 'FORBIDDEN', message: 'Acces interdit' },
      });
      return;
    }

    next();
  };
}
