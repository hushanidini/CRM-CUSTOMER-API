import dotenv from 'dotenv';
import { createApp } from './app';
import { createDatabasePool } from './infrastructure/database/config';
import { Container } from './infrastructure/container/container';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize database pool
    const dbPool = createDatabasePool();

    // Test database connection
    await dbPool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Initialize dependency injection container
    Container.initialize(dbPool);

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await dbPool.end();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      await dbPool.end();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();