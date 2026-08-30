import initializeEmailController from '../email.controller';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

jest.mock('../../../data/config', () => ({
  config: {
    SVC_NAME: 'test-svc',
    SVC_PWD: 'test-password',
    TRIGGER_EMAIL:"true"
  },
}));

describe('EmailController', () => {
  let mockSendMail: jest.Mock;
  let mockTransporter: any;

  beforeEach(() => {
    mockSendMail = jest.fn();
    mockTransporter = { sendMail: mockSendMail };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeEmailController', () => {
    it('should create and return an EmailController instance', async () => {
      const controller = await initializeEmailController();

      expect(controller).toBeDefined();
      expect(typeof controller.send).toBe('function');
    });

    it('should call nodemailer.createTransport with SMTP options', async () => {
      await initializeEmailController();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'SMTP.KENVUE.COM',
          port: 25,
          secure: false,
        })
      );
    });

    it('should configure TLS with rejectUnauthorized false', async () => {
      await initializeEmailController();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          tls: { rejectUnauthorized: false },
        })
      );
    });
  });

  describe('send', () => {
    it('should send email to a single recipient successfully', async () => {
      const mockInfo = { messageId: 'msg-123', accepted: ['to@test.com'] };
      mockSendMail.mockResolvedValue(mockInfo);

      const controller = await initializeEmailController();
      const result = await controller.send('to@test.com', 'from@test.com', 'Test Subject', 'Test Body');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test-svc@kenvue.com',
          replyTo: 'from@test.com',
          to: 'to@test.com',
          subject: 'Test Subject',
          text: 'Test Body',
          html: 'Test Body',
        })
      );
      expect(result).toEqual(mockInfo);
    });
it('should skip sending email when TRIGGER_EMAIL is false', async () => {
  const { config } = require('../../../data/config');

  config.TRIGGER_EMAIL = "false";

  const controller = await initializeEmailController();

  const result = await controller.send(
    'to@test.com',
    'from@test.com',
    'Subject',
    'Body'
  );

  expect(mockSendMail).not.toHaveBeenCalled();

  expect(result).toEqual({
    skipped: true,
    message: 'Email sending disabled by configuration.',
  });

  config.TRIGGER_EMAIL = "true";
});
    it('should join array of recipients with comma separator', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-456' });

      const controller = await initializeEmailController();
      await controller.send(
        ['alice@test.com', 'bob@test.com', 'carol@test.com'],
        'from@test.com',
        'Group Subject',
        'Group Body'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'alice@test.com, bob@test.com, carol@test.com' })
      );
    });

    it('should handle a single-element array recipient', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-789' });

      const controller = await initializeEmailController();
      await controller.send(['single@test.com'], 'from@test.com', 'Subject', 'Body');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'single@test.com' })
      );
    });

    it('should resolve with the error object when sendMail throws (no rejection)', async () => {
      const smtpError = new Error('SMTP connection refused');
      mockSendMail.mockRejectedValue(smtpError);

      const controller = await initializeEmailController();
      const result = await controller.send('to@test.com', 'from@test.com', 'Subject', 'Body');

      expect(result).toEqual(smtpError);
    });

    it('should include both text and html body in the message', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-html' });
      const htmlBody = '<h1>Hello World</h1><p>This is HTML</p>';

      const controller = await initializeEmailController();
      await controller.send('to@test.com', 'from@test.com', 'HTML Subject', htmlBody);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: htmlBody,
          html: htmlBody,
        })
      );
    });

    it('should use service name from config for SMTP auth', async () => {
      await initializeEmailController();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            user: 'test-svc@kenvue.com',
            pass: 'test-password',
          }),
        })
      );
    });
  });
});
