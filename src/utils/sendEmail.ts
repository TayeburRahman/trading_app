/* eslint-disable @typescript-eslint/ban-ts-comment */
import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import { formattedDate } from './utils';
import { IEmailOptions } from '../app/modules/auth/auth.interface';
import { errorLogger } from '../shared/logger';
import ApiError from '../errors/ApiError';

const sendEmail = async (options: IEmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: config.smtp.smtp_host,
    port: parseInt(config.smtp.smtp_port as string),
    auth: {
      user: config.smtp.smtp_mail,
      pass: config.smtp.smtp_password,
    },
  });

  console.log('=========', config.smtp.smtp_port)

  const { email, subject, html } = options;

  const mailOptions = {
    from: `${config.smtp.NAME} <${config.smtp.smtp_mail}>`,
    to: email,
    date: formattedDate,
    signed_by: 'https://swiftswapp.com',
    subject,
    html,
  };

  try {

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);

  } catch (err: any) {
    errorLogger.error('❌ SMTP Error:', err.message);

    // if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
    //   errorLogger.error('SMTP timeout. Restarting server...');
    //   process.exit(0);
    // }
    throw new ApiError(400, `${err.message}`)
  }
};

export default sendEmail;
