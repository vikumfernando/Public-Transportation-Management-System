import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Form, Button, Alert, Card, Row, Col, Spinner, ProgressBar } from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strength, setStrength] = useState({ score: 0, percent: 0, color: '#e5e7eb', label: 'Too weak' });

  const { register, loading, error, clearErrors, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const { firstName, lastName, email, password, confirmPassword } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || redirectTo;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, redirectTo]);

  useEffect(() => {
    clearErrors();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'password') {
      setStrength(calculateStrength(value));
    }
  };

  // Simple password strength estimator
  const calculateStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, percent: 0, color: '#ef4444', label: 'Too weak' };
    const length = pwd.length;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;

    // Clamp score 0..5
    const percent = Math.min(100, Math.max(0, (score / 5) * 100));
    let color = '#ef4444';
    let label = 'Too weak';
    if (percent >= 80) { color = '#10b981'; label = 'Strong'; }
    else if (percent >= 60) { color = '#84cc16'; label = 'Good'; }
    else if (percent >= 40) { color = '#f59e0b'; label = 'Fair'; }
    else { color = '#ef4444'; label = 'Weak'; }

    return { score, percent, color, label };
  };

  // Generate a strong password and populate both fields
  const generateStrongPassword = () => {
    const getRand = (chars, len) => Array.from(crypto.getRandomValues(new Uint32Array(len))).map(n => chars[n % chars.length]).join('');
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{};:,.<>/?';
    // Ensure at least one of each, then fill the rest
    const base = [
      lower[Math.floor(Math.random()*lower.length)],
      upper[Math.floor(Math.random()*upper.length)],
      numbers[Math.floor(Math.random()*numbers.length)],
      symbols[Math.floor(Math.random()*symbols.length)],
    ].join('');
    const pool = lower + upper + numbers + symbols;
    const rest = getRand(pool, 12);
    let pwd = (base + rest).split('').sort(() => 0.5 - Math.random()).join('');
    pwd = pwd.slice(0, 16); // length 16

    setFormData(prev => ({ ...prev, password: pwd, confirmPassword: pwd }));
    setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setStrength(calculateStrength(pwd));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) newErrors.password = 'Password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const payload = { name: `${firstName.trim()} ${lastName.trim()}`.trim(), email, password };
      const result = await register(payload);
      if (result?.success) {
        const from = location.state?.from?.pathname || redirectTo;
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card overflow-hidden">
        <Row className="g-0">
          {/* Illustration / Branding */}
          <Col lg={6} className="auth-illustration d-none d-lg-block p-5">
            <div className="brand mb-4">
              <div className="logo">TM</div>
              <div>
                <div className="fw-bold fs-4">Transport Manager</div>
                <div className="opacity-75">Create your account</div>
              </div>
            </div>
            <div className="headline mb-3">Get started with a powerful transport management experience</div>
            <p className="mb-5" style={{maxWidth:'32rem'}}>
              Track buses in real time, manage your favorite routes and schedules,
              and enjoy a smoother commute.
            </p>
            <div className="small opacity-75">© {new Date().getFullYear()} Transport Manager</div>
          </Col>

          {/* Form */}
          <Col xs={12} lg={6} className="bg-white p-4 p-md-5">
            <div className="mb-4">
              <h2 className="fw-bold mb-1">Create your account</h2>
              <div className="auth-muted">Join Transport Manager in a few clicks</div>
            </div>

            {error && (
              <Alert 
                variant="danger" 
                className="text-center"
                onClose={clearErrors}
                dismissible
              >
                {error.message || 'An error occurred during sign up'}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>First name</Form.Label>
                    <div className="position-relative input-with-icon">
                      <FiUser className="icon" />
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={firstName}
                        onChange={handleChange}
                        isInvalid={!!errors.firstName}
                        placeholder="Jane"
                        autoComplete="given-name"
                        disabled={isSubmitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Last name</Form.Label>
                    <div className="position-relative input-with-icon">
                      <FiUser className="icon" />
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={lastName}
                        onChange={handleChange}
                        isInvalid={!!errors.lastName}
                        placeholder="Doe"
                        autoComplete="family-name"
                        disabled={isSubmitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email address</Form.Label>
                <div className="position-relative input-with-icon">
                  <FiMail className="icon" />
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <div className="position-relative input-with-icon">
                  <FiLock className="icon" />
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="light"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    disabled={isSubmitting}
                    className="position-absolute end-0 top-0 h-100 border-0"
                    style={{ color: '#64748b' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </div>
                {/* Strength meter */}
                <div className="mt-2">
                  <ProgressBar now={strength.percent} style={{ height: 6, backgroundColor: '#e5e7eb' }} variant="" />
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted">Strength: <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span></small>
                    <div className="password-tools">
                      <Button size="sm" variant="outline-secondary" type="button" onClick={generateStrongPassword} disabled={isSubmitting}>
                        <FiRefreshCw className="me-1" /> Generate strong password
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="form-hint mt-2">Use 8+ characters with a mix of letters, numbers & symbols.</div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="confirmPassword">
                <Form.Label>Confirm password</Form.Label>
                <div className="position-relative input-with-icon">
                  <FiLock className="icon" />
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="light"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                    disabled={isSubmitting}
                    className="position-absolute end-0 top-0 h-100 border-0"
                    style={{ color: '#64748b' }}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              <Button 
                type="submit" 
                className="auth-btn-primary btn w-100 py-2 mb-3" 
                size="lg"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Creating account...
                  </>
                ) : 'Create account'}
              </Button>

              <div className="text-center mt-3">
                <span className="auth-muted">Already have an account? </span>
                <Link 
                  to={
                    redirectTo === '/' 
                      ? '/login' 
                      : `/login?redirect=${encodeURIComponent(redirectTo)}`
                  }
                  className="fw-semibold text-decoration-none"
                >
                  Sign in
                </Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SignUp;
