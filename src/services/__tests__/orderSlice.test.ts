import reducer, { createOrder, clearOrder } from '../slices/orderSlice';
import { TOrder } from '@utils-types';

type TOrderState = {
  order: TOrder | null;
  loading: boolean;
  error: string | null;
};

describe('Тесты для orderSlice', () => {
  const initialState: TOrderState = {
    order: null,
    loading: false,
    error: null
  };

  const mockOrder: TOrder = {
    _id: 'order123',
    ingredients: ['ing1', 'ing2', 'ing3'],
    status: 'done',
    name: 'Космический бургер',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:30:00Z',
    number: 12345
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Начальное состояние', () => {
    it('Вернет начальное состояние', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('Редюсеры (reducers)', () => {
    describe('clearOrder', () => {
      it('Должен очистить заказ и ошибку', () => {
        const stateWithOrder = {
          order: mockOrder,
          loading: false,
          error: 'Какая-то ошибка'
        };

        const newState = reducer(stateWithOrder, clearOrder());

        expect(newState.order).toBeNull();
        expect(newState.error).toBeNull();
        expect(newState.loading).toBe(false);
      });

      it('Должен корректно работать с пустым состоянием', () => {
        const newState = reducer(initialState, clearOrder());

        expect(newState).toEqual(initialState);
      });
    });
  });

  describe('createOrder (асинхронный thunk)', () => {
    const ingredientIds = ['ing1', 'ing2', 'ing3'];

    describe('pending', () => {
      it('Должен установить loading в true и очистить ошибку', () => {
        const pendingAction = { type: createOrder.pending.type };
        const state = reducer(initialState, pendingAction);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.order).toBeNull();
      });

      it('Должен сохранить существующий заказ при повторной отправке', () => {
        const stateWithOrder = {
          order: mockOrder,
          loading: false,
          error: null
        };

        const pendingAction = { type: createOrder.pending.type };
        const newState = reducer(stateWithOrder, pendingAction);

        expect(newState.loading).toBe(true);
        expect(newState.order).toEqual(mockOrder);
        expect(newState.error).toBeNull();
      });
    });

    describe('fulfilled', () => {
      it('Должен сохранить заказ и установить loading в false', () => {
        const fulfilledAction = {
          type: createOrder.fulfilled.type,
          payload: mockOrder
        };

        const state = reducer(initialState, fulfilledAction);

        expect(state.loading).toBe(false);
        expect(state.order).toEqual(mockOrder);
        expect(state.error).toBeNull();
      });

      it('Должен заменить старый заказ новым', () => {
        const oldOrder: TOrder = {
          ...mockOrder,
          _id: 'oldOrder',
          number: 99999
        };

        const stateWithOldOrder = {
          order: oldOrder,
          loading: false,
          error: null
        };

        const newOrder: TOrder = {
          ...mockOrder,
          _id: 'newOrder',
          number: 12345
        };

        const fulfilledAction = {
          type: createOrder.fulfilled.type,
          payload: newOrder
        };

        const newState = reducer(stateWithOldOrder, fulfilledAction);

        expect(newState.order).toEqual(newOrder);
        expect(newState.order?._id).toBe('newOrder');
        expect(newState.order?.number).toBe(12345);
      });

      it('Должен корректно обрабатывать заказ без некоторых полей', () => {
        const minimalOrder: TOrder = {
          _id: 'minimal',
          ingredients: ['ing1'],
          status: 'pending',
          name: 'Минимальный заказ',
          createdAt: '2024-01-15T12:00:00Z',
          updatedAt: '2024-01-15T12:30:00Z',
          number: 11111
        };

        const fulfilledAction = {
          type: createOrder.fulfilled.type,
          payload: minimalOrder
        };

        const state = reducer(initialState, fulfilledAction);

        expect(state.order).toEqual(minimalOrder);
        expect(state.order?.ingredients).toHaveLength(1);
      });
    });

    describe('rejected', () => {
      it('Должен обработать ошибку и установить loading в false', () => {
        const errorMessage = 'Недостаточно ингредиентов';
        const rejectedAction = {
          type: createOrder.rejected.type,
          error: { message: errorMessage }
        };

        const state = reducer(initialState, rejectedAction);

        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(state.order).toBeNull();
      });

      it('Должен использовать сообщение по умолчанию при отсутствии error.message', () => {
        const rejectedAction = {
          type: createOrder.rejected.type,
          error: {}
        };

        const state = reducer(initialState, rejectedAction);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Ошибка создания заказа');
        expect(state.order).toBeNull();
      });

      it('Должен сохранить предыдущий заказ при ошибке', () => {
        const stateWithOrder = {
          order: mockOrder,
          loading: true,
          error: null
        };

        const rejectedAction = {
          type: createOrder.rejected.type,
          error: { message: 'Ошибка сети' }
        };

        const newState = reducer(stateWithOrder, rejectedAction);

        expect(newState.loading).toBe(false);
        expect(newState.error).toBe('Ошибка сети');
        expect(newState.order).toEqual(mockOrder);
      });
    });
  });

  describe('Интеграционные тесты', () => {
    it('Должен корректно обрабатывать успешное создание заказа', () => {
      let state = initialState;

      const pendingAction = { type: createOrder.pending.type };
      state = reducer(state, pendingAction);
      expect(state.loading).toBe(true);
      expect(state.order).toBeNull();

      const fulfilledAction = {
        type: createOrder.fulfilled.type,
        payload: mockOrder
      };
      state = reducer(state, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.order).toEqual(mockOrder);
      expect(state.error).toBeNull();
    });

    it('Должен корректно обрабатывать ошибку создания заказа', () => {
      let state = initialState;

      const pendingAction = { type: createOrder.pending.type };
      state = reducer(state, pendingAction);
      expect(state.loading).toBe(true);

      const rejectedAction = {
        type: createOrder.rejected.type,
        error: { message: 'Ошибка сервера' }
      };
      state = reducer(state, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка сервера');
      expect(state.order).toBeNull();
    });

    it('Должен очищать заказ после создания', () => {
      let state = initialState;

      state = reducer(state, {
        type: createOrder.fulfilled.type,
        payload: mockOrder
      });
      expect(state.order).not.toBeNull();

      state = reducer(state, clearOrder());
      expect(state.order).toBeNull();
      expect(state.error).toBeNull();
    });

    it('Должен обрабатывать повторную отправку после ошибки', () => {
      let state = initialState;

      state = reducer(state, { type: createOrder.pending.type });
      state = reducer(state, {
        type: createOrder.rejected.type,
        error: { message: 'Первая ошибка' }
      });

      expect(state.error).toBe('Первая ошибка');
      expect(state.order).toBeNull();

      state = reducer(state, { type: createOrder.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      state = reducer(state, {
        type: createOrder.fulfilled.type,
        payload: mockOrder
      });

      expect(state.loading).toBe(false);
      expect(state.order).toEqual(mockOrder);
      expect(state.error).toBeNull();
    });
  });

  describe('Крайние случаи', () => {
    it('Должен корректно обрабатывать undefined в payload', () => {
      const fulfilledAction = {
        type: createOrder.fulfilled.type,
        payload: undefined
      };

      const state = reducer(initialState, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.order).toBeUndefined();
    });

    it('Должен корректно обрабатывать несколько последовательных вызовов', () => {
      let state = initialState;

      state = reducer(state, { type: createOrder.pending.type });
      state = reducer(state, {
        type: createOrder.fulfilled.type,
        payload: { ...mockOrder, number: 1 }
      });

      expect(state.order?.number).toBe(1);

      state = reducer(state, { type: createOrder.pending.type });
      state = reducer(state, {
        type: createOrder.fulfilled.type,
        payload: { ...mockOrder, number: 2 }
      });

      expect(state.order?.number).toBe(2);

      state = reducer(state, { type: createOrder.pending.type });
      state = reducer(state, {
        type: createOrder.rejected.type,
        error: { message: 'Ошибка' }
      });

      expect(state.order?.number).toBe(2);
      expect(state.error).toBe('Ошибка');
    });

    it('Должен очищать ошибку при новой попытке создания', () => {
      const stateWithError = {
        order: null,
        loading: false,
        error: 'Предыдущая ошибка'
      };

      const pendingAction = { type: createOrder.pending.type };
      const newState = reducer(stateWithError, pendingAction);

      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(true);
    });
  });
});
