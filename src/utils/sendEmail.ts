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

    if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
      errorLogger.error('SMTP timeout. Restarting server...');
      process.exit(1);
    }
    throw new ApiError(400, `${err.message}`)
  }
};

export default sendEmail;

// import Mailgun from 'mailgun.js';
// import formData from 'form-data';
// import config from '../config';
// import { IEmailOptions } from '../app/modules/auth/auth.interface';
// import { errorLogger } from '../shared/logger';
// import ApiError from '../errors/ApiError';

// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({
//   username: 'api',
//   key: config.mailgun.api_key as string,
// });

// const sendEmail = async (options: IEmailOptions): Promise<void> => {
//   const { email, subject, html } = options;

//   try {
//     const data = await mg.messages.create("sandbox113feaa647634dac9d135ef658eefcfc.mailgun.org", {
//       from: "Mailgun Sandbox <postmaster@sandbox113feaa647634dac9d135ef658eefcfc.mailgun.org>",
//       to: ["Jorge Dejesus <tayebrayhan101@gmail.com>"],
//       subject: "Hello Jorge Dejesus",
//       text: "Congratulations Jorge Dejesus, you just sent an email with Mailgun! You are truly awesome!",
//     })

//     console.log('✅ Email sent via Mailgun:', data.id);
//   } catch (err: any) {
//     errorLogger.error('❌ Mailgun API Error:', err.message);
//     throw new ApiError(400, `Mailgun error: ${err.message}`);
//   }
// };

// export default sendEmail;
