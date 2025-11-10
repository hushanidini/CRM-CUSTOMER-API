import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { createCustomerRoutes } from "./presentation/routes/customerRoutes";
import { errorHandler } from "./presentation/middleware/errorHandler";
import { Container } from "./infrastructure/container/container";
import { swaggerSpec } from "./presentation/docs/swagger";
import { compressionMiddleware } from "./presentation/middleware/compression";
import { createRateLimiter } from "./presentation/middleware/rateLimit";
import { devLogger, prodLogger } from "./presentation/middleware/requestLogger";

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    })
  );

  // Performance middleware
  app.use(compressionMiddleware);

  // Request parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Logging
  if (process.env.NODE_ENV === "production") {
    app.use(prodLogger);
  } else {
    app.use(devLogger);
  }

  // Rate limiting
  app.use("/api/", createRateLimiter());

  // API Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check (no rate limit)
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Get container instance
  const container = Container.getInstance();

  // Routes with write operation rate limiting
  const customerRoutes = createCustomerRoutes(container.customerController);

  app.use("/api/customers", customerRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
