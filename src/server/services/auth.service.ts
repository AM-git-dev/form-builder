import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

/**
 * Enregistre un nouvel utilisateur et retourne ses tokens d'authentification.
 * Verifie l'unicite de l'email avant creation.
 */
export async function register(input: RegisterInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError('Un compte avec cet email existe deja');
  }

  const hashedPassword = await bcrypt.hash(input.password, config.BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  const tokens = await generateTokens(user.id, user.email, user.role);

  return { user, tokens };
}

/**
 * Authentifie un utilisateur par email et mot de passe.
 * Retourne l'utilisateur et ses tokens si les credentials sont valides.
 */
export async function login(input: LoginInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email, deletedAt: null },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Email ou mot de passe incorrect');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Email ou mot de passe incorrect');
  }

  const tokens = await generateTokens(user.id, user.email, user.role);

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, tokens };
}

/**
 * Rafraichit les tokens en utilisant un refresh token valide.
 * Implemente la rotation des refresh tokens : l'ancien est revoque, un nouveau est cree.
 */
export async function refreshTokens(currentRefreshToken: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(currentRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: currentRefreshToken },
  });

  if (!storedToken || storedToken.revokedAt) {
    throw new UnauthorizedError('Token de rafraichissement invalide');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Token de rafraichissement expire');
  }

  // Rotation : revoquer l'ancien token avant d'en creer un nouveau
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId, deletedAt: null },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new UnauthorizedError('Utilisateur introuvable');
  }

  return generateTokens(user.id, user.email, user.role);
}

/**
 * Deconnecte l'utilisateur en revoquant son refresh token.
 */
export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Retourne les informations de l'utilisateur courant.
 */
export async function getCurrentUser(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Utilisateur introuvable');
  }

  return user;
}

/**
 * Genere une paire access token + refresh token et stocke le refresh token en DB.
 */
async function generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
  const tokenPayload = { userId, email, role };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}
