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
      'http://192.168.10.16:3000',
      'http://192.168.30.250:3000',
      'http://192.168.10.102:3000',
      'http://143.198.3.51:3000',
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
