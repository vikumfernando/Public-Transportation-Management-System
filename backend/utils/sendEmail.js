const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const ErrorResponse = require('./errorResponse');

/**
 * Email class for sending emails
 */
module.exports = class Email {
  /**
   * Create an email instance
   * @param {Object} user - User object
   * @param {string} url - URL for email actions (reset password, etc.)
   */
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName || 'User';
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  /**
   * Create a new transport instance
   * @returns {Object} Nodemailer transport
   */
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid in production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Use Mailtrap in development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send the actual email
   * @param {string} template - Template name (without extension)
   * @param {string} subject - Email subject
   * @returns {Promise} Promise that resolves when email is sent
   */
  async send(template, subject) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        `${__dirname}/../views/emails/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject
        }
      );

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html)
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('There was an error sending the email. Please try again later.');
    }
  }

  /**
   * Send welcome email
   * @returns {Promise} Promise that resolves when email is sent
   */
  async sendWelcome() {
    await this.send('welcome', 'Welcome to our platform!');
  }

  /**
   * Send password reset email
   * @returns {Promise} Promise that resolves when email is sent
   */
  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)');
  }

  /**
   * Send email verification
   * @returns {Promise} Promise that resolves when email is sent
   */
  async sendEmailVerification() {
    await this.send('emailVerification', 'Verify your email address');
  }
};

/**
 * Send email function (for direct use in routes)
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // 2) Define the email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
      // html: options.html
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('There was an error sending the email. Please try again later.');
  }
};

module.exports = sendEmail;
