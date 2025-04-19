import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { app } from './app';
import config from './config/index';
import { errorLogger, logger } from './shared/logger';
import socket from './socket/socket';

process.on('uncaughtException', error => {
  errorLogger.error(error);
  process.exit(1);
});

let server: any;

async function connectDBWithRetry(retries = 5, delay = 3000) {
  while (retries) {
    try {
      await mongoose.connect(config.database_url as string);
      logger.info('DB Connected on Successfully');
      return;
    } catch (err: any) {
      retries--;
      errorLogger.error(`DB Connection failed. Retrying in ${delay}ms...`, err.message);

      if (retries === 0) {
        errorLogger.error('Max retries reached. Exiting...');
        process.exit(1); // Exit if all retries fail
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function main() {
  try {
    await connectDBWithRetry();

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);
    server = app.listen(port, config.base_url as string, () => {
      logger.info(`App listening on http://${config.base_url}:${config.port}`);
    });

    const socketIO = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });

    socket(socketIO);

    // @ts-ignore
    global.io = socketIO;
  } catch (error: any) {
    errorLogger.error(error);

    if (error.message?.includes('timeout')) {
      logger.warn('Connection timeout detected. Restarting the server...');
      process.exit(1); // Will restart if using PM2 or Docker restart policy
    }

    throw error;
  }

  process.on('unhandledRejection', error => {
    errorLogger.error(error);
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
}

main().catch(err => errorLogger.error(err));

process.on('SIGTERM', () => {
  logger.info('SIGTERM is received');
  if (server) {
    server.close();
  }
});
