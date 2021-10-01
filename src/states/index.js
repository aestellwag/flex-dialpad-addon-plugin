import { combineReducers } from 'redux';
import { reduce as DialStatusReducer } from './DialStatusState';

// Register your redux store under a unique namespace
export const namespace = 'dial-status';

// Combine the reducers
export default combineReducers({
  dialstatus: DialStatusReducer
});
