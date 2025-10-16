const axios = require('axios');

async function testForgotPassword() {
    try {
        console.log('🧪 Testing forgot password API...');
        
        const response = await axios.post('http://localhost:8070/auth/forgot-password', {
            email: 'dulmin55555@gmail.com'
        });
        
        console.log('✅ API Response:', response.data);
        console.log('📧 Check your Gmail inbox for OTP!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testForgotPassword();
