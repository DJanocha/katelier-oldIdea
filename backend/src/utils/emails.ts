import nodemailer, { SendMailOptions } from 'nodemailer';

type OptionsType = {
  to: string;
  text: string;
  from: string;
  subject: string;
};
const textHtmlWrapper = ({ text }: { text: string }) => `<div>${text}</div>`;
export const sendEmail = async ({ to, text, from, subject }: OptionsType) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || ''),
    auth: {
      user: process.env.EMAIL_LOGIN,
      pass: process.env.EMAIL_PASS
    }
  });
  const mailOptions: SendMailOptions = {
    to,
    text,
    from,
    subject,
    html: textHtmlWrapper({ text })
  };

  await transporter.sendMail(mailOptions);
};
