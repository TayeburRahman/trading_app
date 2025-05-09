import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import { NotFoundHandler } from './errors/NotFoundHandler';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

export const app: Application = express();

app.use(
  cors({
    origin: [
      "https://swiftswapp.com",
      "http://localhost:3001",
      "http://10.0.60.43:3003",
      "http://192.168.12.90:3003",
      "http://localhost:3000",
      "http://10.0.60.43:3002",
      "https://www.swiftswapp.com",
      "https://dashboard.swiftswapp.com",
      "https://www.dashboard.swiftswapp.com",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('uploads'));

app.use('/', routes);

app.get('/', async (req: Request, res: Response) => {
  res.json('Welcome to Trading App');
});

app.use(globalErrorHandler);

app.use(NotFoundHandler.handle);
