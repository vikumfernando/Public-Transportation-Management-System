const emailService = require('./services/emailService');
const User = require('./models/User');

// Test email functionality
async function testEmailNotifications() {
    console.log('🧪 Testing Email Notifications...\n');

    // Create a test user object
    const testUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        role: 'passenger'
    };

    try {
        console.log('1. Testing Account Creation Email...');
        const accountCreatedResult = await emailService.sendAccountCreatedEmail(testUser);
        console.log('   ✅ Account creation email:', accountCreatedResult.success ? 'Sent successfully' : 'Failed');
        if (!accountCreatedResult.success) {
            console.log('   ❌ Error:', accountCreatedResult.error);
        }

        console.log('\n2. Testing Password Change Email...');
        const passwordChangedResult = await emailService.sendPasswordChangedEmail(testUser, 'user');
        console.log('   ✅ Password change email:', passwordChangedResult.success ? 'Sent successfully' : 'Failed');
        if (!passwordChangedResult.success) {
            console.log('   ❌ Error:', passwordChangedResult.error);
        }

        console.log('\n3. Testing Account Deletion Email...');
        const accountDeletedResult = await emailService.sendAccountDeletedEmail(testUser);
        console.log('   ✅ Account deletion email:', accountDeletedResult.success ? 'Sent successfully' : 'Failed');
        if (!accountDeletedResult.success) {
            console.log('   ❌ Error:', accountDeletedResult.error);
        }

        console.log('\n4. Testing Email Verification...');
        const verificationToken = 'test-verification-token-123';
        const verificationResult = await emailService.sendVerificationEmail(testUser, verificationToken);
        console.log('   ✅ Email verification:', verificationResult.success ? 'Sent successfully' : 'Failed');
        if (!verificationResult.success) {
            console.log('   ❌ Error:', verificationResult.error);
        }

        console.log('\n5. Testing Password Reset Email...');
        const resetToken = 'test-reset-token-456';
        const passwordResetResult = await emailService.sendPasswordResetEmail(testUser, resetToken);
        console.log('   ✅ Password reset email:', passwordResetResult.success ? 'Sent successfully' : 'Failed');
        if (!passwordResetResult.success) {
            console.log('   ❌ Error:', passwordResetResult.error);
        }

        console.log('\n6. Testing Account Lock Notification...');
        const accountLockResult = await emailService.sendAccountLockNotification(testUser);
        console.log('   ✅ Account lock notification:', accountLockResult.success ? 'Sent successfully' : 'Failed');
        if (!accountLockResult.success) {
            console.log('   ❌ Error:', accountLockResult.error);
        }

        console.log('\n🎉 Email notification testing completed!');
        console.log('\n📧 Note: If SMTP is not configured, emails will be skipped with a warning message.');
        console.log('   To enable email sending, configure SMTP settings in your .env file:');
        console.log('   - SMTP_HOST=your-smtp-host');
        console.log('   - SMTP_PORT=587');
        console.log('   - SMTP_USER=your-email@domain.com');
        console.log('   - SMTP_PASS=your-email-password');
        console.log('   - MAIL_FROM=your-email@domain.com');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testEmailNotifications();
}

module.exports = { testEmailNotifications };
