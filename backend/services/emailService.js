const { sendEmail } = require('../utils/mailer');

// Professional email templates for account events
const emailTemplates = {
  // Account Creation Welcome Email
  accountCreated: (user) => ({
    subject: '🎉 Welcome to Transportation Hub - Your Account is Ready!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Transportation Hub</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .welcome-text { font-size: 18px; margin-bottom: 20px; color: #555; }
          .features { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; }
          .features h3 { color: #667eea; margin-top: 0; }
          .features ul { list-style: none; padding: 0; }
          .features li { padding: 8px 0; padding-left: 25px; position: relative; }
          .features li:before { content: "✓"; color: #28a745; font-weight: bold; position: absolute; left: 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .highlight { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 Transportation Hub</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Journey Starts Here</p>
          </div>
          
          <div class="content">
            <div class="welcome-text">
              <strong>Welcome aboard, ${user.firstName}!</strong>
            </div>
            
            <p>We're thrilled to have you join our transportation community! Your account has been successfully created and you're now ready to explore seamless travel experiences.</p>
            
            <div class="features">
              <h3>🚀 What you can do now:</h3>
              <ul>
                <li>Search and book bus routes across the city</li>
                <li>Manage your smart card and payments</li>
                <li>Track your journey in real-time</li>
                <li>Access exclusive passenger benefits</li>
                <li>Receive important travel notifications</li>
              </ul>
            </div>
            
            <div class="highlight">
              <strong>📧 Important:</strong> Please verify your email address to unlock all features and ensure you receive important updates about your travels.
            </div>
            
            <p>If you have any questions or need assistance, our support team is here to help you every step of the way.</p>
            
            <div style="text-align: center;">
              <a href="#" class="cta-button">Start Your Journey</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Account Details:</strong><br>
              Name: ${user.firstName} ${user.lastName}<br>
              Email: ${user.email}<br>
              Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}<br>
              Account Created: ${new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Transportation Hub. All rights reserved.</p>
            <p>This email was sent to ${user.email}. If you didn't create this account, please contact our support team immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Account Deletion Notification
  accountDeleted: (user) => ({
    subject: '⚠️ Account Deletion Confirmation - Transportation Hub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deletion Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .alert-box { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-box { background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 Transportation Hub</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Account Deletion Confirmation</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <strong>⚠️ Important Notice:</strong> Your Transportation Hub account has been permanently deleted.
            </div>
            
            <p>Dear ${user.firstName},</p>
            
            <p>We're writing to confirm that your Transportation Hub account has been successfully deleted from our system as of <strong>${new Date().toLocaleString()}</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">📋 What this means:</h3>
              <ul>
                <li>All your personal data has been permanently removed</li>
                <li>Your booking history and preferences are no longer accessible</li>
                <li>Any active smart cards or payment methods have been deactivated</li>
                <li>You will no longer receive travel notifications or updates</li>
                <li>Your login credentials are no longer valid</li>
              </ul>
            </div>
            
            <p><strong>Account Details:</strong></p>
            <ul>
              <li>Name: ${user.firstName} ${user.lastName}</li>
              <li>Email: ${user.email}</li>
              <li>Account Type: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</li>
              <li>Deletion Date: ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <p>If this deletion was made in error or if you change your mind, please contact our support team immediately. We may be able to assist with account recovery within 30 days of deletion.</p>
            
            <div style="text-align: center;">
              <a href="mailto:support@transportationhub.com" class="cta-button">Contact Support</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              We're sorry to see you go! If you decide to return in the future, you're always welcome to create a new account with us.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Transportation Hub. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password Change Notification
  passwordChanged: (user, changeType = 'user') => ({
    subject: '🔒 Password Changed Successfully - Transportation Hub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Notification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .success-box { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .security-box { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 Transportation Hub</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Security Notification</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <strong>✅ Password Successfully Updated!</strong><br>
              Your account password has been changed on ${new Date().toLocaleString()}.
            </div>
            
            <p>Dear ${user.firstName},</p>
            
            <p>This is to confirm that your Transportation Hub account password has been successfully updated. Your account security is our top priority.</p>
            
            <div class="security-box">
              <h3 style="margin-top: 0;">🔐 Security Details:</h3>
              <ul>
                <li><strong>Change Type:</strong> ${changeType === 'admin' ? 'Administrator Update' : 'Self-Initiated Change'}</li>
                <li><strong>Account:</strong> ${user.firstName} ${user.lastName}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Change Time:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>IP Address:</strong> {{IP_ADDRESS}}</li>
              </ul>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Your new password is now active across all devices</li>
              <li>You'll need to log in again with your new password</li>
              <li>All existing sessions have been terminated for security</li>
              <li>Your account remains fully functional</li>
            </ul>
            
            <div class="security-box">
              <h3 style="margin-top: 0;">🛡️ Security Tips:</h3>
              <ul>
                <li>Never share your password with anyone</li>
                <li>Use a unique password for Transportation Hub</li>
                <li>Enable two-factor authentication if available</li>
                <li>Log out from shared or public computers</li>
              </ul>
            </div>
            
            <p><strong>Didn't make this change?</strong></p>
            <p>If you didn't initiate this password change, please contact our support team immediately. Your account may have been compromised.</p>
            
            <div style="text-align: center;">
              <a href="mailto:security@transportationhub.com" class="cta-button">Report Security Issue</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              This is an automated security notification. For your safety, please keep this information confidential.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Transportation Hub. All rights reserved.</p>
            <p>This email was sent to ${user.email}. If you didn't make this change, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Email Verification Template
  emailVerification: (user, token) => ({
    subject: '📧 Verify Your Email - Transportation Hub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .verification-box { background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 Transportation Hub</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification Required</p>
          </div>
          
          <div class="content">
            <p>Hi ${user.firstName},</p>
            
            <p>Welcome to Transportation Hub! To complete your account setup and access all features, please verify your email address.</p>
            
            <div class="verification-box">
              <h3 style="margin-top: 0;">📧 Verify Your Email Address</h3>
              <p>Click the button below to verify your email and activate your account:</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}" class="cta-button">Verify Email Address</a>
            </div>
            
            <p><strong>Why verify your email?</strong></p>
            <ul>
              <li>Access all Transportation Hub features</li>
              <li>Receive important travel notifications</li>
              <li>Secure your account</li>
              <li>Enable password recovery</li>
            </ul>
            
            <p style="font-size: 14px; color: #666;">
              <strong>Note:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification email.
            </p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Transportation Hub. All rights reserved.</p>
            <p>This email was sent to ${user.email}. If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password Reset Template
  passwordReset: (user, token) => ({
    subject: '🔑 Reset Your Password - Transportation Hub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); color: #212529; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .reset-box { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 Transportation Hub</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Password Reset Request</p>
          </div>
          
          <div class="content">
            <p>Hi ${user.firstName},</p>
            
            <p>We received a request to reset your Transportation Hub account password. If you made this request, click the button below to create a new password.</p>
            
            <div class="reset-box">
              <h3 style="margin-top: 0;">🔑 Reset Your Password</h3>
              <p>Click the button below to reset your password:</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}" class="cta-button">Reset Password</a>
            </div>
            
            <p><strong>Important Security Information:</strong></p>
            <ul>
              <li>This link will expire in 10 minutes for security</li>
              <li>You can only use this link once</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your current password remains unchanged until you complete the reset</li>
            </ul>
            
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}
            </p>
            
            <p><strong>Didn't request this reset?</strong></p>
            <p>If you didn't request a password reset, please contact our support team immediately. Your account may be at risk.</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Transportation Hub. All rights reserved.</p>
            <p>This email was sent to ${user.email}. If you didn't request this reset, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Email service functions
const emailService = {
  // Send account creation welcome email
  sendAccountCreatedEmail: async (user) => {
    try {
      const template = emailTemplates.accountCreated(user);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send account created email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send account deletion notification
  sendAccountDeletedEmail: async (user) => {
    try {
      const template = emailTemplates.accountDeleted(user);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send account deleted email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send password change notification
  sendPasswordChangedEmail: async (user, changeType = 'user', req = null) => {
    try {
      const template = emailTemplates.passwordChanged(user, changeType);
      // Add request context for IP address if available
      if (req) {
        template.html = template.html.replace('{{IP_ADDRESS}}', req.ip || 'Not Available');
      } else {
        template.html = template.html.replace('{{IP_ADDRESS}}', 'Not Available');
      }
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send password changed email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send email verification
  sendVerificationEmail: async (user, token) => {
    try {
      const template = emailTemplates.emailVerification(user, token);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (user, token) => {
    try {
      const template = emailTemplates.passwordReset(user, token);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send account lock notification
  sendAccountLockNotification: async (user) => {
    try {
      await sendEmail({
        to: user.email,
        subject: '🔒 Account Temporarily Locked - Transportation Hub',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Locked</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
              .content { padding: 40px 30px; }
              .alert-box { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚌 Transportation Hub</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Security Alert</p>
              </div>
              
              <div class="content">
                <div class="alert-box">
                  <strong>⚠️ Account Temporarily Locked</strong><br>
                  Your account has been locked due to multiple failed login attempts.
                </div>
                
                <p>Dear ${user.firstName},</p>
                
                <p>For your security, we've temporarily locked your Transportation Hub account after detecting multiple failed login attempts.</p>
                
                <p><strong>What you can do:</strong></p>
                <ul>
                  <li>Wait 2 hours for the lock to automatically expire</li>
                  <li>Use the "Forgot Password" feature to reset your password</li>
                  <li>Contact our support team if you need immediate assistance</li>
                </ul>
                
                <p>If you didn't attempt to log in, please contact our security team immediately as your account may be compromised.</p>
              </div>
              
              <div class="footer">
                <p>© 2024 Transportation Hub. All rights reserved.</p>
                <p>This is an automated security notification.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send account lock notification:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
