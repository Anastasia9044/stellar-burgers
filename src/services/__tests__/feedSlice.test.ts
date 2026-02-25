import reducer, {
  getFeeds,
  wsConnectionStart,
  wsConnectionSuccess,
  wsConnectionError,
  wsConnectionClosed,
  wsGetMessage
} from '../slices/feedSlice';
import { TOrder, TOrdersData } from '@utils-types';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
};

describe('Тесты для feedSlice', () => {
  const initialState: TFeedState = {
    orders: [],
    total: 0,
    totalToday: 0,
    loading: false,
    error: null,
    wsConnected: false
  };

  const mockOrders: TOrder[] = [
    {
      _id: 'order1',
      ingredients: ['ing1', 'ing2'],
      status: 'done',
      name: 'Заказ 1',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:30:00Z',
      number: 12345
    },
    {
      _id: 'order2',
      ingredients: ['ing3', 'ing4'],
      status: 'pending',
      name: 'Заказ 2',
      createdAt: '2024-01-02T12:00:00Z',
      updatedAt: '2024-01-02T12:30:00Z',
      number: 12346
    }
  ];

  const mockOrdersData: TOrdersData = {
    orders: mockOrders,
    total: 100,
    totalToday: 5
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
    describe('wsConnectionStart', () => {
      it('Должен вернуть состояние без изменений', () => {
        const state = reducer(initialState, wsConnectionStart());
        expect(state).toEqual(initialState);
      });
    });

    describe('wsConnectionSuccess', () => {
      it('Должен установить wsConnected в true и очистить ошибку', () => {
        const stateWithError = {
          ...initialState,
          wsConnected: false,
          error: 'Предыдущая ошибка'
        };
        const newState = reducer(stateWithError, wsConnectionSuccess());

        expect(newState.wsConnected).toBe(true);
        expect(newState.error).toBeNull();
      });
    });

    describe('wsConnectionError', () => {
      it('Должен установить wsConnected в false и сохранить ошибку', () => {
        const errorMessage = 'Ошибка соединения';
        const newState = reducer(initialState, wsConnectionError(errorMessage));

        expect(newState.wsConnected).toBe(false);
        expect(newState.error).toBe(errorMessage);
      });
    });

    describe('wsConnectionClosed', () => {
      it('Должен установить wsConnected в false', () => {
        const stateWithConnection = {
          ...initialState,
          wsConnected: true
        };
        const newState = reducer(stateWithConnection, wsConnectionClosed());

        expect(newState.wsConnected).toBe(false);
      });
    });

    describe('wsGetMessage', () => {
      it('Должен обновить данные заказов из сообщения', () => {
        const newState = reducer(initialState, wsGetMessage(mockOrdersData));

        expect(newState.orders).toEqual(mockOrders);
        expect(newState.total).toBe(100);
        expect(newState.totalToday).toBe(5);
      });

      it('Должен заменить существующие заказы новыми', () => {
        const oldOrdersData: TOrdersData = {
          orders: [
            {
              _id: 'old1',
              ingredients: ['old1'],
              status: 'done',
              name: 'Старый заказ',
              createdAt: '2023-01-01T12:00:00Z',
              updatedAt: '2023-01-01T12:30:00Z',
              number: 11111
            }
          ],
          total: 50,
          totalToday: 2
        };

        let state = reducer(initialState, wsGetMessage(oldOrdersData));
        expect(state.orders).toHaveLength(1);
        expect(state.orders[0]._id).toBe('old1');

        state = reducer(state, wsGetMessage(mockOrdersData));
        expect(state.orders).toHaveLength(2);
        expect(state.orders[0]._id).toBe('order1');
        expect(state.total).toBe(100);
        expect(state.totalToday).toBe(5);
      });

      it('Должен корректно обрабатывать пустой массив заказов', () => {
        const emptyOrdersData: TOrdersData = {
          orders: [],
          total: 0,
          totalToday: 0
        };

        const newState = reducer(initialState, wsGetMessage(emptyOrdersData));

        expect(newState.orders).toEqual([]);
        expect(newState.total).toBe(0);
        expect(newState.totalToday).toBe(0);
      });
    });
  });

  describe('getFeeds (асинхронный thunk)', () => {
    it('Должен установить loading в true при pending', () => {
      const pendingAction = { type: getFeeds.pending.type };
      const state = reducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('Должен обновить данные при fulfilled', () => {
      const fulfilledAction = {
        type: getFeeds.fulfilled.type,
        payload: mockOrdersData
      };
      const state = reducer(initialState, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders);
      expect(state.total).toBe(100);
      expect(state.totalToday).toBe(5);
      expect(state.error).toBeNull();
    });

    it('Должен обработать ошибку при rejected', () => {
      const errorMessage = 'Ошибка загрузки';
      const rejectedAction = {
        type: getFeeds.rejected.type,
        error: { message: errorMessage }
      };
      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('Должен использовать сообщение по умолчанию при отсутствии error.message', () => {
      const rejectedAction = {
        type: getFeeds.rejected.type,
        error: {}
      };
      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка загрузки ленты заказов');
    });

    it('Должен сохранять существующие данные при ошибке', () => {
      const stateWithData = reducer(initialState, {
        type: getFeeds.fulfilled.type,
        payload: mockOrdersData
      });

      const rejectedAction = {
        type: getFeeds.rejected.type,
        error: { message: 'Ошибка' }
      };
      const newState = reducer(stateWithData, rejectedAction);

      expect(newState.orders).toEqual(mockOrders);
      expect(newState.total).toBe(100);
      expect(newState.totalToday).toBe(5);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Ошибка');
    });
  });

  describe('Интеграционные тесты', () => {
    it('Должен корректно обрабатывать последовательность WS событий', () => {
      let state = initialState;

      state = reducer(state, wsConnectionStart());
      expect(state.wsConnected).toBe(false);

      state = reducer(state, wsConnectionSuccess());
      expect(state.wsConnected).toBe(true);
      expect(state.error).toBeNull();

      state = reducer(state, wsGetMessage(mockOrdersData));
      expect(state.orders).toHaveLength(2);
      expect(state.total).toBe(100);

      const errorMessage = 'Соединение разорвано';
      state = reducer(state, wsConnectionError(errorMessage));
      expect(state.wsConnected).toBe(false);
      expect(state.error).toBe(errorMessage);

      expect(state.orders).toHaveLength(2);

      state = reducer(state, wsConnectionClosed());
      expect(state.wsConnected).toBe(false);
      expect(state.orders).toHaveLength(2);
    });

    it('Должен корректно обрабатывать комбинацию WS и HTTP запросов', () => {
      let state = initialState;

      state = reducer(state, {
        type: getFeeds.fulfilled.type,
        payload: mockOrdersData
      });
      expect(state.orders).toHaveLength(2);

      state = reducer(state, wsConnectionSuccess());
      const updatedOrdersData: TOrdersData = {
        orders: [
          ...mockOrders,
          {
            _id: 'order3',
            ingredients: ['ing5'],
            status: 'done',
            name: 'Заказ 3',
            createdAt: '2024-01-03T12:00:00Z',
            updatedAt: '2024-01-03T12:30:00Z',
            number: 12347
          }
        ],
        total: 101,
        totalToday: 6
      };

      state = reducer(state, wsGetMessage(updatedOrdersData));
      expect(state.orders).toHaveLength(3);
      expect(state.total).toBe(101);
      expect(state.totalToday).toBe(6);
      expect(state.wsConnected).toBe(true);
    });
  });

  describe('Крайние случаи', () => {
    it('Должен корректно обрабатывать multiple dispatches', () => {
      let state = initialState;

      for (let i = 0; i < 3; i++) {
        state = reducer(state, {
          type: getFeeds.fulfilled.type,
          payload: {
            ...mockOrdersData,
            total: 100 + i,
            totalToday: 5 + i
          }
        });
      }

      expect(state.total).toBe(102);
      expect(state.totalToday).toBe(7);
    });

    it('Должен корректно обрабатывать чередование WS сообщений', () => {
      let state = reducer(initialState, wsConnectionSuccess());

      const messages = [
        {
          orders: [mockOrders[0]],
          total: 50,
          totalToday: 2
        },
        {
          orders: mockOrders,
          total: 100,
          totalToday: 5
        },
        {
          orders: [],
          total: 0,
          totalToday: 0
        }
      ];

      messages.forEach((message) => {
        state = reducer(state, wsGetMessage(message));
      });

      expect(state.orders).toEqual([]);
      expect(state.total).toBe(0);
      expect(state.totalToday).toBe(0);
    });

    it('Должен сохранять состояние WS при ошибке HTTP запроса', () => {
      let state = reducer(initialState, wsConnectionSuccess());
      expect(state.wsConnected).toBe(true);

      const rejectedAction = {
        type: getFeeds.rejected.type,
        error: { message: 'HTTP ошибка' }
      };
      state = reducer(state, rejectedAction);

      expect(state.wsConnected).toBe(true);
      expect(state.error).toBe('HTTP ошибка');
    });
  });
});
