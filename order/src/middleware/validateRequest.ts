import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // mapped() trả về Record<string, ValidationError|AlternativeValidationError>
    const errorMap = result.mapped();

    // Dùng Object.entries để lấy field (key) và msg (value.msg)
    const formattedErrors = Object.entries(errorMap).map(
      ([field, error]) => ({
        message: error.msg,
        field,            // field là chính key trong mapped()
      })
    );

    return res.status(400).json({ errors: formattedErrors });
  }

  next();
};
