import nodemailer from 'nodemailer';
import config from '../../../config';
import { errorLogger } from '../../../shared/logger';
import ApiError from '../../../errors/ApiError';

export async function sendResetEmail(to: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: config.smtp.smtp_service,
    host: config.smtp.smtp_host,
    port: parseInt(config.smtp.smtp_port as string),
    secure: true,
    auth: {
      user: config.smtp.smtp_mail,
      pass: config.smtp.smtp_password,
    },
  });

  console.log("=======", config.smtp.smtp_port)

  try {

    const info = await transporter.sendMail({
      from: config.smtp.smtp_mail,
      to,
      subject: 'Reset Password Link',
      html,
    });

    console.log('✅ Email sent:', info.response);

  } catch (err: any) {
    errorLogger.error('❌ SMTP Error:', err.message);
    // if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
    //   errorLogger.error('SMTP timeout. Restarting server...');
    //   process.exit(0);
    // }
    throw new ApiError(400, `${err.message}`)

  }
}
