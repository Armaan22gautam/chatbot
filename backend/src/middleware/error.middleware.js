import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors[0].message;
  }

  console.error("Error Handler:", message);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
