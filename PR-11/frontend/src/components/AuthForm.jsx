import { useState } from 'react';
import { loginUser, registerUser } from '../api';

function AuthForm({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        await registerUser(email, password);
        setSuccess('Registration successful! Logging you in...');
        const res = await loginUser(email, password);
        onLoginSuccess(res.user);
      } else {
        const res = await loginUser(email, password);
        setSuccess('Login successful!');
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '450px', margin: '30px auto', padding: '24px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
        {isRegister ? 'Create an Account' : 'Welcome Back'}
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
        {isRegister ? 'Register to manage your tasks securely' : 'Sign in to access your protected tasks'}
      </p>

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '10px 14px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={loading}
          style={{ width: '100%', padding: '12px', marginTop: '10px', fontWeight: '600', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#555' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
            setSuccess('');
          }}
          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </div>
    </div>
  );
}

export default AuthForm;
