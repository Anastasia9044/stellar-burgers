import { combineSlices } from '@reduxjs/toolkit';
import ingredientsSlice from './slices/ingredientsSlice';
import constructorSlice from './slices/constructorSlice';
import orderSlice from './slices/orderSlice';
import authSlice from './slices/authSlice';

const testRootReducer = combineSlices({
  ingredients: ingredientsSlice,
  constructorBurger: constructorSlice,
  orders: orderSlice,
  auth: authSlice
});

describe('rootReducer настройки', () => {
  test('Должен возвращать правильное начальное состояние для неопределенного состояния и неизвестного действия', () => {
    const resultState = testRootReducer(undefined, { type: 'UNKNOWN_ACTION' });

    const expectedState = {
      ingredients: ingredientsSlice(undefined, { type: 'UNKNOWN_ACTION' }),
      constructorBurger: constructorSlice(undefined, {
        type: 'UNKNOWN_ACTION'
      }),
      orders: orderSlice(undefined, { type: 'UNKNOWN_ACTION' }),
      auth: authSlice(undefined, { type: 'UNKNOWN_ACTION' })
    };

    expect(resultState).toEqual(expectedState);
  });
});
