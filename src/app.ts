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
      "http://192.168.10.26:3000",
      "http://192.168.10.26:3001",
      "http://192.168.10.26:3002", 
      "http://103.145.138.200:3002",
      "http://138.197.37.38:3002",
      "http://138.197.37.38:3001",
      "http://138.197.37.38:3006", 
      "https://swiftswapp.com",
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
