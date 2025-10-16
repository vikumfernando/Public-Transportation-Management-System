const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: 'dulmin55555@gmail.com',
            subject: 'Test Email - Forgot Password System',
            html: '<p>This is a test email to verify your SMTP configuration is working!</p>'
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
    }
}

testEmail();
