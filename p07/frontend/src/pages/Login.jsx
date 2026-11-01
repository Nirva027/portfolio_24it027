import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';

function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isRegistering = mode === 'register';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegistering) await register(email, password);
      else await login(email, password);

      const returnTo = location.state?.from?.pathname || '/tasks';
      navigate(returnTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="route-page auth-page" aria-labelledby="auth-title">
      <div className="auth-intro">
        <p className="eyebrow">{isRegistering ? 'MAKE YOURSELF AT HOME' : 'WELCOME BACK'}</p>
        <h1 id="auth-title">
          {isRegistering ? <>A little space <span>to plan.</span></> : <>Your next step <span>starts here.</span></>}
        </h1>
        <p className="page-intro">
          {isRegistering
            ? 'Create an account to keep your tasks private and saved between visits.'
            : 'Sign in to pick up where you left off.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-heading">
          <h2>{isRegistering ? 'Create account' : 'Sign in'}</h2>
          <span>Secure task list</span>
        </div>
        <label className="task-field">
          <span>Email address</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            maxLength={254}
            required
          />
        </label>
        <label className="task-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isRegistering ? 'At least 8 characters' : 'Your password'}
            minLength={isRegistering ? 8 : undefined}
            maxLength={72}
            required
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="create-task-button auth-submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Please wait…'
            : isRegistering
              ? 'Create account'
              : 'Sign in'}
          <span aria-hidden="true">↗</span>
        </button>
        <p className="auth-switch">
          {isRegistering ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isRegistering ? 'login' : 'register');
              setError('');
            }}
          >
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </form>

      <Link className="auth-back-link" to="/">← Back to portfolio</Link>
    </section>
  );
}

export default Login;
