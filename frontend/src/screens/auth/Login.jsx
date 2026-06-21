import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { actionTypes } from '@/shared/base';

const LoginComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(
    (state) => state?.site?.auth?.isAuthenticated,
  );
  const loginError = useSelector((state) => state?.site?.auth?.loginError);
  const loginLoading = useSelector((state) => state?.site?.auth?.loginLoading);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: actionTypes.LOGIN, username, password });
  };

  return (
    <div className="container mt-5 pt-4">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h4 className="card-title text-center mb-4 fw-bold">
                ACME Hotels
              </h4>
              <form onSubmit={handleSubmit} data-testid="login-form">
                <div className="mb-3">
                  <label htmlFor="login-username" className="form-label">
                    Username
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                {loginError && (
                  <div className="alert alert-danger py-2" role="alert">
                    {loginError}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={!!loginLoading}
                >
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <p
                className="text-muted text-center mt-3 mb-0"
                style={{ fontSize: '0.8rem' }}
              >
                Demo: <code>example-user</code> / <code>example-user</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
