declare global {
  namespace Express {
    interface Request {
      authUserUuid?: string;
    }
  }
}

export {};
