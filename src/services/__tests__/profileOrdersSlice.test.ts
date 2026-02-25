import reducer, {
  getProfileOrders,
  wsProfileConnectionStart,
  wsProfileConnectionSuccess,
  wsProfileConnectionError,
  wsProfileConnectionClosed,
  wsProfileGetMessage
} from '../slices/profileOrdersSlice';
import { TOrder } from '@utils-types';

type TProfileOrdersState = {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
};

describe('Тесты для profileOrdersSlice', () => {
  const initialState: TProfileOrdersState = {
    orders: [],
    loading: false,
    error: null,
    wsConnected: false
  };

  const mockOrders: TOrder[] = [
    {
      _id: 'order1',
      ingredients: ['ing1', 'ing2', 'ing3'],
      status: 'done',
      name: 'Заказ 1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      number: 12345
    },
    {
      _id: 'order2',
      ingredients: ['ing4', 'ing5'],
      status: 'pending',
      name: 'Заказ 2',
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:30:00Z',
      number: 12346
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Начальное состояние', () => {
    it('Вернет начальное состояние', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('Редюсеры (reducers)', () => {
    describe('wsProfileConnectionStart', () => {
      it('Должен вернуть состояние без изменений', () => {
        const state = reducer(initialState, wsProfileConnectionStart());
        expect(state).toEqual(initialState);
      });
    });

    describe('wsProfileConnectionSuccess', () => {
      it('Должен установить wsConnected в true и очистить ошибку', () => {
        const stateWithError = {
          ...initialState,
          wsConnected: false,
          error: 'Предыдущая ошибка'
        };
        const newState = reducer(stateWithError, wsProfileConnectionSuccess());

        expect(newState.wsConnected).toBe(true);
        expect(newState.error).toBeNull();
      });
    });

    describe('wsProfileConnectionError', () => {
      it('Должен установить wsConnected в false и сохранить ошибку', () => {
        const errorMessage = 'Ошибка соединения с WebSocket';
        const newState = reducer(
          initialState,
          wsProfileConnectionError(errorMessage)
        );

        expect(newState.wsConnected).toBe(false);
        expect(newState.error).toBe(errorMessage);
      });
    });

    describe('wsProfileConnectionClosed', () => {
      it('Должен установить wsConnected в false', () => {
        const stateWithConnection = {
          ...initialState,
          wsConnected: true
        };
        const newState = reducer(
          stateWithConnection,
          wsProfileConnectionClosed()
        );

        expect(newState.wsConnected).toBe(false);
      });
    });

    describe('wsProfileGetMessage', () => {
      it('Должен обновить заказы из сообщения', () => {
        const newState = reducer(initialState, wsProfileGetMessage(mockOrders));

        expect(newState.orders).toEqual(mockOrders);
        expect(newState.orders).toHaveLength(2);
      });
    });
  });

  describe('getProfileOrders (асинхронный thunk)', () => {
    it('pending: должен установить loading в true и очистить ошибку', () => {
      const pendingAction = { type: getProfileOrders.pending.type };
      const state = reducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('fulfilled: должен загрузить заказы и установить loading в false', () => {
      const fulfilledAction = {
        type: getProfileOrders.fulfilled.type,
        payload: mockOrders
      };
      const state = reducer(initialState, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders);
      expect(state.error).toBeNull();
    });

    it('rejected: должен обработать ошибку и установить loading в false', () => {
      const errorMessage = 'Ошибка загрузки истории заказов';
      const rejectedAction = {
        type: getProfileOrders.rejected.type,
        error: { message: errorMessage }
      };
      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('rejected: должен использовать сообщение по умолчанию при отсутствии error.message', () => {
      const rejectedAction = {
        type: getProfileOrders.rejected.type,
        error: {}
      };
      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка загрузки истории заказов');
    });

    it('должен сохранять существующие заказы при ошибке', () => {
      const stateWithOrders = reducer(initialState, {
        type: getProfileOrders.fulfilled.type,
        payload: mockOrders
      });

      const rejectedAction = {
        type: getProfileOrders.rejected.type,
        error: { message: 'Ошибка' }
      };
      const newState = reducer(stateWithOrders, rejectedAction);

      expect(newState.orders).toEqual(mockOrders);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Ошибка');
    });
  });

  describe('Интеграционные тесты', () => {
    it('Должен корректно обрабатывать последовательность WS событий', () => {
      let state = initialState;

      state = reducer(state, wsProfileConnectionStart());
      expect(state.wsConnected).toBe(false);

      state = reducer(state, wsProfileConnectionSuccess());
      expect(state.wsConnected).toBe(true);
      expect(state.error).toBeNull();

      state = reducer(state, wsProfileGetMessage(mockOrders));
      expect(state.orders).toHaveLength(2);
      expect(state.wsConnected).toBe(true);

      const errorMessage = 'Соединение разорвано';
      state = reducer(state, wsProfileConnectionError(errorMessage));
      expect(state.wsConnected).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.orders).toHaveLength(2);

      state = reducer(state, wsProfileConnectionClosed());
      expect(state.wsConnected).toBe(false);
      expect(state.orders).toHaveLength(2);
    });

    it('Должен корректно обрабатывать комбинацию WS и HTTP запросов', () => {
      let state = initialState;

      state = reducer(state, { type: getProfileOrders.pending.type });
      state = reducer(state, {
        type: getProfileOrders.fulfilled.type,
        payload: mockOrders.slice(0, 1)
      });
      expect(state.orders).toHaveLength(1);

      state = reducer(state, wsProfileConnectionSuccess());
      state = reducer(state, wsProfileGetMessage(mockOrders));

      expect(state.orders).toHaveLength(2);
      expect(state.wsConnected).toBe(true);
    });
  });
});
