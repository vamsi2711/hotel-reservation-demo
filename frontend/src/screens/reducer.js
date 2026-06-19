import { combineReducers } from 'redux';

import { homeReducer } from './home/reducers';
import { newReducer, showReducer, editReducer } from './reservations/reducers';
import { dashboardReducer } from './dashboard/reducers';

const siteReducer = combineReducers({
  home: homeReducer,
  newReservations: newReducer,
  showReservations: showReducer,
  editReservations: editReducer,
  dashboard: dashboardReducer,
});

export default siteReducer;
