import { Request, Response, NextFunction, RequestHandler } from 'express';

/** Wraps an async Express handler so errors are forwarded to the global error handler */
export function w(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => fn(req, res, next).catch(next);
}
