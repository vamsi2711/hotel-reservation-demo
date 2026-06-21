import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { actionTypes } from '@/shared/base';
import InvalidRoute from '@/shared/components/InvalidRoute';
import PrivateRoute from '@/shared/components/PrivateRoute';
import { default as Components } from '@/screens';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state) => state?.site?.auth?.isAuthenticated,
  );

  const handleLogout = () => {
    dispatch({ type: actionTypes.LOGOUT });
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-dark fixed-top bg-dark navbar-expand-md navbar-expand-lg navbar-expand-xl">
        <div className="container-fluid px-3">
          <NavLink className="navbar-brand site me-4" to="/">
            ACME Hotels
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#siteLinks"
            aria-controls="siteLinks"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="siteLinks">
            {isAuthenticated && (
              <>
                <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link${isActive ? ' active fw-semibold' : ''}`
                      }
                      to="/"
                      end
                    >
                      Reservations
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link${isActive ? ' active fw-semibold' : ''}`
                      }
                      to="/dashboard"
                    >
                      Analytics
                    </NavLink>
                  </li>
                </ul>
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Components.LoginComponent />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Components.HomeComponent
                cancelReservation={() => {}}
                handleCloseAlert={() => {}}
                handleConfirmAction={() => {}}
                handleRejectAction={() => {}}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Components.HomeComponent
                cancelReservation={() => {}}
                handleCloseAlert={() => {}}
                handleConfirmAction={() => {}}
                handleRejectAction={() => {}}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/:id/edit"
          element={
            <PrivateRoute>
              <Components.EditReservationComponent />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/:id"
          element={
            <PrivateRoute>
              <Components.ShowReservationComponent />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/new"
          element={
            <PrivateRoute>
              <Components.NewReservationComponent />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Components.DashboardComponent />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<InvalidRoute />} />
      </Routes>
    </>
  );
};

export default App;
