import type { ClerkAuthObject } from '@clerk/express';

declare global {
  namespace Express {
    interface Request {
      clerk: ClerkAuthObject;
    }
  }
}

export {};
