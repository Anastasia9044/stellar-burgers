import reducer, {
  loginUser,
  registerUser,
  logoutUser,
  getUser,
  updateUser,
  checkUserAuth,
  refreshToken,
  clearError,
  setAuthChecked,
  setUser
} from '../slices/authSlice';
import { TUser } from '@utils-types';

jest.mock('@api', () => ({
  loginUserApi: jest.fn(),
  registerUserApi: jest.fn(),
  logoutApi: jest.fn(),
  getUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  refreshTokenApi: jest.fn()
}));

type TAuthState = {
  user: TUser | null;
  loading: boolean;
  error: string | null;
  isAuthChecked: boolean;
  isAuthInProgress: boolean;
};

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('Тесты для authSlice', () => {
  const initialState: TAuthState = {
    user: null,
    loading: false,
    isAuthChecked: false,
    isAuthInProgress: false,
    error: null
  };

  const mockUser: TUser = {
    email: 'test@test.com',
    name: 'Test User'
  };

  const mockTokens = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Начальное состояние', () => {
    it('Вернет начальное состояние', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('Редюсеры (reducers)', () => {
    describe('clearError', () => {
      it('Должен очистить ошибку', () => {
        const stateWithError = {
          ...initialState,
          error: 'Какая-то ошибка'
        };
        const newState = reducer(stateWithError, clearError());
        expect(newState.error).toBeNull();
      });
    });

    describe('setAuthChecked', () => {
      it('Должен установить isAuthChecked в true', () => {
        const newState = reducer(initialState, setAuthChecked(true));
        expect(newState.isAuthChecked).toBe(true);
      });

      it('Должен установить isAuthChecked в false', () => {
        const newState = reducer(initialState, setAuthChecked(false));
        expect(newState.isAuthChecked).toBe(false);
      });
    });

    describe('setUser', () => {
      it('Должен установить пользователя', () => {
        const newState = reducer(initialState, setUser(mockUser));
        expect(newState.user).toEqual(mockUser);
      });

      it('Должен установить null вместо пользователя', () => {
        const stateWithUser = {
          ...initialState,
          user: mockUser
        };
        const newState = reducer(stateWithUser, setUser(null));
        expect(newState.user).toBeNull();
      });
    });
  });

  describe('loginUser', () => {
    const loginData = {
      email: 'test@test.com',
      password: 'password123'
    };

    it('Должен успешно авторизовать пользователя', () => {
      const pendingAction = { type: loginUser.pending.type };
      let state = reducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      const fulfilledAction = {
        type: loginUser.fulfilled.type,
        payload: mockUser
      };
      state = reducer(state, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBeNull();
    });

    it('Должен обработать ошибку авторизации', () => {
      const errorMessage = 'Неверные учетные данные';
      const rejectedAction = {
        type: loginUser.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('Должен использовать сообщение по умолчанию при ошибке', () => {
      const rejectedAction = {
        type: loginUser.rejected.type,
        error: {}
      };

      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка авторизации');
    });
  });

  describe('registerUser', () => {
    const registerData = {
      email: 'test@test.com',
      password: 'password123',
      name: 'Test User'
    };

    it('Должен зарегистрировать пользователя', () => {
      const pendingAction = { type: registerUser.pending.type };
      let state = reducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      const fulfilledAction = {
        type: registerUser.fulfilled.type,
        payload: mockUser
      };
      state = reducer(state, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
    });

    it('Должен обработать ошибку регистрации', () => {
      const errorMessage = 'Пользователь уже существует';
      const rejectedAction = {
        type: registerUser.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('logoutUser', () => {
    it('Должен успешно выйти из системы', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthChecked: true
      };

      const pendingAction = { type: logoutUser.pending.type };
      let state = reducer(stateWithUser, pendingAction);
      expect(state.loading).toBe(true);

      const fulfilledAction = { type: logoutUser.fulfilled.type };
      state = reducer(state, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
    });

    it('Должен очистить пользователя даже при ошибке выхода', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthChecked: true
      };

      const rejectedAction = { type: logoutUser.rejected.type };
      const state = reducer(stateWithUser, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe('getUser', () => {
    it('Должен успешно получить данные пользователя', () => {

      const pendingAction = { type: getUser.pending.type };
      let state = reducer(initialState, pendingAction);
      expect(state.loading).toBe(true);

      const fulfilledAction = {
        type: getUser.fulfilled.type,
        payload: mockUser
      };
      state = reducer(state, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
    });

    it('Должен обработать ошибку получения данных', () => {
      const errorMessage = 'Ошибка получения данных';
      const rejectedAction = {
        type: getUser.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateUser', () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@test.com'
    };

    it('Должен успешно обновить данные пользователя', () => {

      const pendingAction = { type: updateUser.pending.type };
      let state = reducer(initialState, pendingAction);
      expect(state.loading).toBe(true);

      const fulfilledAction = {
        type: updateUser.fulfilled.type,
        payload: { ...mockUser, ...updateData }
      };
      state = reducer(state, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual({ ...mockUser, ...updateData });
    });

    it('Должен обработать ошибку обновления', () => {
      const errorMessage = 'Ошибка обновления';
      const rejectedAction = {
        type: updateUser.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('checkUserAuth', () => {
    it('Должен установить состояние загрузки при pending', () => {
      const pendingAction = { type: checkUserAuth.pending.type };
      const state = reducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.isAuthInProgress).toBe(true);
      expect(state.error).toBeNull();
    });

    it('Должен успешно проверить авторизацию и установить пользователя', () => {
      const fulfilledAction = {
        type: checkUserAuth.fulfilled.type,
        payload: mockUser
      };

      const state = reducer(initialState, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.isAuthInProgress).toBe(false);
      expect(state.isAuthChecked).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('Должен обработать отсутствие авторизации', () => {
      const fulfilledAction = {
        type: checkUserAuth.fulfilled.type,
        payload: null
      };

      const state = reducer(initialState, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.isAuthInProgress).toBe(false);
      expect(state.isAuthChecked).toBe(true);
      expect(state.user).toBeNull();
    });

    it('Должен обработать ошибку проверки авторизации', () => {
      const errorMessage = 'Ошибка проверки';
      const rejectedAction = {
        type: checkUserAuth.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(initialState, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.isAuthInProgress).toBe(false);
      expect(state.isAuthChecked).toBe(true);
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('Должен использовать сообщение по умолчанию при ошибке', () => {
      const rejectedAction = {
        type: checkUserAuth.rejected.type,
        error: {}
      };

      const state = reducer(initialState, rejectedAction);

      expect(state.error).toBe('Ошибка проверки авторизации');
    });
  });

  describe('refreshToken', () => {
    it('Должен успешно обновить токен', () => {
      const fulfilledAction = {
        type: refreshToken.fulfilled.type
      };

      const state = reducer(initialState, fulfilledAction);

      expect(state).toEqual(initialState);
    });

    it('Должен сбросить пользователя при ошибке обновления токена', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser
      };

      const rejectedAction = {
        type: refreshToken.rejected.type
      };

      const state = reducer(stateWithUser, rejectedAction);

      expect(state.user).toBeNull();
    });
  });

  describe('Комплексные тесты', () => {
    it('Должен корректно обрабатывать последовательность действий', () => {
      expect(initialState.isAuthChecked).toBe(false);
      let state = reducer(initialState, { type: loginUser.pending.type });
      state = reducer(state, {
        type: loginUser.fulfilled.type,
        payload: mockUser
      });

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      state = reducer(state, {
        type: updateUser.fulfilled.type,
        payload: updatedUser
      });

      expect(state.user).toEqual(updatedUser);

      state = reducer(state, { type: logoutUser.fulfilled.type });

      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {

      jest.mock('@api', () => ({
        refreshTokenApi: jest.fn()
      }));
      jest.mock('../../utils/cookie', () => ({
        setCookie: jest.fn(),
        deleteCookie: jest.fn()
      }));
    });

    it('должен успешно обновить токен при наличии refreshToken в localStorage', async () => {

      localStorage.setItem('refreshToken', 'valid-refresh-token');

      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      const mockRefreshTokenApi = require('@api').refreshTokenApi;
      mockRefreshTokenApi.mockResolvedValue(mockResponse);

      const mockSetCookie = require('../../utils/cookie').setCookie;
      const dispatch = jest.fn();
      const thunk = refreshToken();

      const result = await thunk(dispatch, () => ({}), undefined);

      expect(mockRefreshTokenApi).toHaveBeenCalledWith({
        token: 'valid-refresh-token'
      });
    });

    it('должен обработать ошибку при отсутствии refreshToken в localStorage', async () => {

      localStorage.clear();

      const dispatch = jest.fn();
      const thunk = refreshToken();

      try {
        await thunk(dispatch, () => ({}), undefined);
      } catch (error) {
        const mockDeleteCookie = require('../../utils/cookie').deleteCookie;
        expect(mockDeleteCookie).toHaveBeenCalledWith('accessToken');
        expect(localStorage.getItem('refreshToken')).toBeNull();
      }
    });

    it('должен обработать ошибку API при обновлении токена', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      const mockRefreshTokenApi = require('@api').refreshTokenApi;
      mockRefreshTokenApi.mockRejectedValue(new Error('API Error'));

      const mockDeleteCookie = require('../../utils/cookie').deleteCookie;
      const dispatch = jest.fn();
      const thunk = refreshToken();

      try {
        await thunk(dispatch, () => ({}), undefined);
      } catch (error) {
        expect(mockDeleteCookie).toHaveBeenCalledWith('accessToken');
        expect(localStorage.getItem('refreshToken')).toBeNull();
      }
    });
  });
});