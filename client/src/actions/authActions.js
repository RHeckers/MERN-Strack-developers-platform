import { GET_ERRORS, SET_CURRENT_USER } from './types';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';

//Register User
export const registeruser = (userData, history) => dispatch => {
    axios.post('/api/users/register', userData)
      .then(res => history.push('/login'))
      .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      }));
};

//Login - Get user token
export const loginUser = userData => dispatch => {
  axios.post('/api/users/login', userData)
       .then(res => {
         console.log(res);
         //Save token to local storage
         const { token } = res.data;

         //Set token to localStorage
         localStorage.setItem('jwtToken', token);

         //Set token to Auth header
         setAuthToken(token);

         //Decode token to get userData
         const decoded = jwt_decode(token);

         //Set current user
         dispatch(setCurrentUser(decoded));

       })
       .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      }));
};

//Set logedin user
export const setCurrentUser = (decoded) => {
  console.log(decoded)
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
}