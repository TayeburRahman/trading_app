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
      'http://56.168.30.250:3000',
      'http://192.168.10.102:3000',
      'http://143.198.3.51:3000',
      'http://192.168.10.103:3003',
      'http://localhost:3006',
      'http://103.161.9.133:3006',
      "http://192.168.10-+++++.103:3002",
      "http://localhost:3006",
      "http://192.168.10.14:5070",
      "http://192.168.10.26:3000",
      "http://192.168.10.26:3001",
      "http://192.168.10.26:3002",
      "http://192.168.10.26:3003",
      "http://192.168.10.26:3004",
      "http://103.145.138.200:3006",
      "http://103.145.138.200:3002"
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
