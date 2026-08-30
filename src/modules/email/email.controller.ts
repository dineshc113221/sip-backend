import * as nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { config } from '../../data/config.js';

class EmailController {
  private readonly transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor() {
    const smtpOptions: SMTPTransport.Options = {
      host: "SMTP.KENVUE.COM",
      port: 25,
      secure: false,
      auth: {
        user: `${config.SVC_NAME}@kenvue.com`,
        pass: `${config.SVC_PWD}`,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    console.log("SMTP Transporter Options:", smtpOptions);
    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  public async send(
    to: string | string[],
    from: string,
    subject: string,
    body: string
  ): Promise<SentMessageInfo> {
     // Skip sending email if disabled
  if (config.TRIGGER_EMAIL==="false") {
    console.log(
      `Email sending is disabled`
    );

    return Promise.resolve({
      skipped: true,
      message: "Email sending disabled by configuration.",
    });
  }
    const authorizedFrom = `${config.SVC_NAME}@kenvue.com`;
    const message = {
      from: authorizedFrom,
      replyTo: from || authorizedFrom,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text: body,
      html: body,
    };

    console.log("Email Message Details:");
    console.log("From:", authorizedFrom);
    console.log("ReplyTo:", from);
    console.log("To:", to);       

    try {
      const info: SentMessageInfo = await this.transporter.sendMail(message);
      console.log("Email Sent Successfully:", info); // Log success response
      return Promise.resolve(info);
    } catch (e) {
      console.log("Email Sending Error:", e); // Log error response
      return Promise.resolve(e);
      // return Promise.reject(e as Error);
    }
  }
}

export const initializeEmailController = async () => {
  return new EmailController();
};

export default initializeEmailController;
