import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiMail, FiLock } from 'react-icons/fi';
import '../../styles/auth.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading, error, clearErrors, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const { email, password } = formData;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || redirectTo;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, redirectTo]);

  // Clear errors on component mount
  useEffect(() => {
    clearErrors();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await login({ email, password });
      
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
                <div className="opacity-75">Smart Public Transportation</div>
              </div>
            </div>
            <div className="headline mb-3">Seamless travel management for commuters and admins</div>
            <p className="mb-5" style={{maxWidth:'32rem'}}>
              Real-time bus tracking, route planning, and schedule management,
              all in one place. Sign in to access your personalized dashboard.
            </p>
            <div className="small opacity-75">© {new Date().getFullYear()} Transport Manager</div>
          </Col>

          {/* Form */}
          <Col xs={12} lg={6} className="bg-white p-4 p-md-5">
            <div className="mb-4">
              <h2 className="fw-bold mb-1">Welcome back</h2>
              <div className="auth-muted">Sign in to continue to your account</div>
            </div>

            {error && (
              <Alert 
                variant="danger" 
                className="text-center"
                onClose={clearErrors}
                dismissible
              >
                {error.message || 'An error occurred during sign in'}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
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

              <Form.Group className="mb-4" controlId="password">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="mb-0">Password</Form.Label>
                  <Link to="/forgot-password" className="text-primary small text-decoration-none">
                    Forgot password?
                  </Link>
                </div>
                <div className="position-relative input-with-icon">
                  <FiLock className="icon" />
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="rememberMe">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  id="rememberMe"
                  disabled={isSubmitting}
                />
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
                    Signing In...
                  </>
                ) : 'Sign In'}
              </Button>

              <div className="text-center mt-3">
                <span className="auth-muted">Don't have an account? </span>
                <Link 
                  to={
                    redirectTo === '/' 
                      ? '/register' 
                      : `/register?redirect=${encodeURIComponent(redirectTo)}`
                  }
                  className="fw-semibold text-decoration-none"
                >
                  Create account
                </Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SignIn;
