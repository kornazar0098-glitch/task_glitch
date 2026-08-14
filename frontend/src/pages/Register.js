import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { authService } from '../services/serviceAPI';
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
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

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    dispatch(loginStart());

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'خطای ثبت‌نام';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>ثبت‌نام در Task Glitch</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نام کامل</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
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
            <label>شماره تلفن</label>
            <input
              type="tel"
              name="phone"
              pattern="09[0-9]{9}"
              value={formData.phone}
              onChange={handleChange}
              placeholder="09xxxxxxxxx"
              required
            />
          </div>
          <div className="form-group">
            <label>نقش</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">مشتری</option>
              <option value="worker">کارگر</option>
            </select>
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
          <div className="form-group">
            <label>تکرار رمز عبور</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary">ثبت‌نام</button>
        </form>
        <p className="auth-link">
          قبلاً ثبت‌نام کرده‌اید? <Link to="/login">وارد شوید</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
