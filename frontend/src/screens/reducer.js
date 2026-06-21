import { combineReducers } from 'redux';

import { authReducer } from './auth/reducer';
import { homeReducer } from './home/reducers';
import { newReducer, showReducer, editReducer } from './reservations/reducers';
import { dashboardReducer } from './dashboard/reducers';

const siteReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  newReservations: newReducer,
  showReservations: showReducer,
  editReservations: editReducer,
  dashboard: dashboardReducer,
});

export default siteReducer;
