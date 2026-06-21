import React from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { actionTypes, connectComponent } from '@/shared/base';
import { AlertModal, ConfirmationModal } from '@/shared/components';

import HomeTabs from './tabs';

const HomeComponent = ({
  cancelReservation = () => {},
  checkoutNow = () => {},
  handleCloseAlert = () => {},
  handleConfirmAction = () => {},
  handleRejectAction = () => {},
}) => {
  const alert = {
    message: useSelector((state) => state?.shared?.alertMessage),
    type: useSelector((state) => state?.shared?.alertType),
  };
  const confirmation = {
    isOpen: useSelector((state) => state?.shared?.confirmationModalIsOpen),
    message: useSelector((state) => state?.shared?.confirmationModalMessage),
    cancellationText: useSelector(
      (state) => state?.shared?.confirmationModalCancellationText,
    ),
    confirmationText: useSelector(
      (state) => state?.shared?.confirmationModalText,
    ),
    confirmButtonStyle: useSelector(
      (state) => state?.shared?.confirmationModalButtonStyle,
    ),
    title: useSelector((state) => state?.shared?.confirmationModalTitle),
  };

  const reservations = useSelector((state) => state?.site?.home?.reservations);
  const tabActions = { cancelReservation, checkoutNow };

  return (
    <div data-name="home-component" className="col-lg-12">
      <div className="jumbotron p-3 p-md-12 text-white rounded bg-dark">
        <Tab.Container defaultActiveKey="reservations">
          <Nav
            className="home-tabs-nav"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Nav.Item>
              <Nav.Link eventKey="reservations">Reservations</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="about">About</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="reservations">
              <HomeTabs.DefaultTab
                reservations={reservations}
                actions={tabActions}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="about">
              <HomeTabs.AboutTab />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
      {alert.message && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={handleCloseAlert}
        />
      )}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmationText={confirmation.confirmationText}
        cancellationText={confirmation.cancellationText}
        confirmButtonStyle={confirmation.confirmButtonStyle}
        handleConfirm={handleConfirmAction}
        handleReject={handleRejectAction}
      />
    </div>
  );
};

const screen = connectComponent(HomeComponent, {
  componentName: actionTypes.HOME_COMPONENT,
  state: (state) => state?.site?.home?.reservations ?? [],
  load: {
    reservations: () => ({ type: actionTypes.GET_RESERVATIONS }),
  },
  mapDispatchToProps: (dispatch) => ({
    handleCloseAlert: () => dispatch({ type: actionTypes.CLEAR_ALERT }),
    handleConfirmAction: () =>
      dispatch({ type: actionTypes.CONFIRM_CONFIRMATION_MODAL }),
    handleRejectAction: () =>
      dispatch({ type: actionTypes.REJECT_CONFIRMATION_MODAL }),
    cancelReservation: (id) =>
      dispatch({
        type: actionTypes.DELETE_RESERVATION,
        reservationId: parseInt(id),
      }),
    checkoutNow: (reservationData) =>
      dispatch({ type: actionTypes.CHECKOUT_NOW, ...reservationData }),
    editReservation: (id) =>
      dispatch({
        type: actionTypes.EDIT_RESERVATION_COMPONENT,
        reservationId: parseInt(id),
      }),
    newReservation: () => {
      dispatch({ type: actionTypes.NEW_RESERVATION_COMPONENT });
    },
    showReservation: (id) =>
      dispatch({ type: actionTypes.SHOW_RESERVATION_COMPONENT, id }),
  }),
});

export default screen;
