import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';

import InvalidRoute from '@/shared/components/InvalidRoute';
import { default as Components } from '@/screens';

const App = () => {
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
          </div>
        </div>
      </nav>
      <Routes>
        <Route
          path="/home"
          element={
            <Components.HomeComponent
              cancelReservation={() => {}}
              handleCloseAlert={() => {}}
              handleConfirmAction={() => {}}
              handleRejectAction={() => {}}
            />
          }
        />
        <Route
          path="/"
          element={
            <Components.HomeComponent
              cancelReservation={() => {}}
              handleCloseAlert={() => {}}
              handleConfirmAction={() => {}}
              handleRejectAction={() => {}}
            />
          }
        />
        <Route
          path="/reservations/:id/edit"
          element={<Components.EditReservationComponent />}
        />
        <Route
          path="/reservations/:id"
          element={<Components.ShowReservationComponent />}
        />
        <Route
          path="/reservations/new"
          element={<Components.NewReservationComponent />}
        />
        <Route
          path="/dashboard"
          element={<Components.DashboardComponent />}
        />
        <Route path="*" element={<InvalidRoute />} />
      </Routes>
    </>
  );
};

export default App;
