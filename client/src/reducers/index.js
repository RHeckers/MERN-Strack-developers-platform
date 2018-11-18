import { combineReducers } from 'redux';
import authReducer from './authReducer';
import errorReducer from './errorsReducer';

export default combineReducers({
    auth: authReducer,
    errors: errorReducer
    
});