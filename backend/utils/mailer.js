const nodemailer = require('nodemailer');

function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // If SMTP is not configured, return null to allow no-op sending
    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
}

async function sendEmail({ to, subject, html }) {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn('Email skipped: SMTP not configured');
        return;
    }
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    await transporter.sendMail({ from, to, subject, html });
}

module.exports = { sendEmail };


