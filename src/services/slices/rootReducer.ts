import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './ingredientsSlice';
import constructorReducer from './constructorSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';
import feedReducer from './feedSlice';
import profileOrdersReducer from './profileOrdersSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  order: orderReducer,
  auth: authReducer,
  feed: feedReducer,
  profileOrders: profileOrdersReducer
});

export default rootReducer;
