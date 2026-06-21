import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import LoginComponent from '@/screens/auth/Login';
import PrivateRoute from '@/shared/components/PrivateRoute';

import { mockStore, render } from '../../reactTestHelpers';

const makeState = (authOverrides = {}) => ({
  shared: { ...defaultShared },
  router: { location: { pathname: '/login' } },
  site: {
    auth: {
      isAuthenticated: false,
      loginError: null,
      loginLoading: false,
      token: null,
      ...authOverrides,
    },
  },
});

describe('LoginComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the login form with username, password fields and submit button', () => {
    render(<LoginComponent />, {
      initialState: makeState(),
      initialEntries: ['/login'],
    });

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Sign In/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Demo:/i)).toBeInTheDocument();
  });

  it('dispatches LOGIN action with credentials on form submit (successful login flow)', async () => {
    const user = userEvent.setup();
    const store = mockStore(makeState());

    rtlRender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <LoginComponent />
        </MemoryRouter>
      </Provider>,
    );

    await user.type(screen.getByLabelText('Username'), 'example-user');
    await user.type(screen.getByLabelText('Password'), 'example-user');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(store.getActions()).toContainEqual({
      type: 'site/auth/LOGIN',
      username: 'example-user',
      password: 'example-user',
    });
  });

  it('shows error message on failed login', () => {
    render(<LoginComponent />, {
      initialState: makeState({ loginError: 'Invalid username or password' }),
      initialEntries: ['/login'],
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Invalid username or password',
    );
  });

  it('does not show an error alert when there is no login error', () => {
    render(<LoginComponent />, {
      initialState: makeState(),
      initialEntries: ['/login'],
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('PrivateRoute — route protection', () => {
  const protectedContent = 'Protected Content';

  it('redirects unauthenticated users away from protected routes', () => {
    const store = mockStore(makeState({ isAuthenticated: false }));

    rtlRender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <div>{protectedContent}</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    const store = mockStore(makeState({ isAuthenticated: true }));

    rtlRender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <div>{protectedContent}</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(protectedContent)).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
