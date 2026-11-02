import type { Request } from 'express';
import type { Rol } from '../../generated/prisma/enums.js';

export interface JwtPayload {
  sub: number;
  correo: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
