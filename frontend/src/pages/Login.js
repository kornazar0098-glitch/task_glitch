import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { authService } from '../services/serviceAPI';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    dispatch(loginStart());

    try {
      const response = await authService.login(formData.email, formData.password);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'خطای ورود';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>ورود به Task Glitch</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ایمیل</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>رمز عبور</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary">ورود</button>
        </form>
        <p className="auth-link">
          حساب ندارید? <Link to="/register">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
