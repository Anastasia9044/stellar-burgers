import reducer, { getIngredients } from '../slices/ingredientsSlice';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';

type TIngredientsState = {
  ingredients: TIngredient[];
  loading: boolean;
  error: string | null;
};

jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

const mockGetIngredientsApi = getIngredientsApi as jest.MockedFunction<
  typeof getIngredientsApi
>;

describe('Тесты для ingredientsSlice', () => {
  const initialState: TIngredientsState = {
    ingredients: [],
    loading: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Начальное состояние', () => {
    it('Вернет начальное состояние', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('getIngredients.pending', () => {
    it('Должен установить loading в true и очистить error', () => {
      const action = { type: getIngredients.pending.type };
      const state = reducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.ingredients).toEqual([]);
    });
  });

  describe('getIngredients.fulfilled', () => {
    it('Должен загрузить ингредиенты и установить loading в false', () => {
      const mockIngredients: TIngredient[] = [
        {
          _id: '1',
          name: 'Ингредиент 1',
          type: 'main',
          proteins: 10,
          fat: 5,
          carbohydrates: 20,
          calories: 150,
          price: 100,
          image: 'image1.png',
          image_mobile: 'mobile1.png',
          image_large: 'large1.png'
        },
        {
          _id: '2',
          name: 'Ингредиент 2',
          type: 'sauce',
          proteins: 5,
          fat: 10,
          carbohydrates: 15,
          calories: 120,
          price: 80,
          image: 'image2.png',
          image_mobile: 'mobile2.png',
          image_large: 'large2.png'
        }
      ];

      const action = {
        type: getIngredients.fulfilled.type,
        payload: mockIngredients
      };
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.ingredients).toEqual(mockIngredients);
      expect(state.ingredients).toHaveLength(2);
    });

    it('Должен заменить старые ингредиенты новыми при повторной загрузке', () => {
      const firstIngredients: TIngredient[] = [
        {
          _id: '1',
          name: 'Ингредиент 1',
          type: 'main',
          proteins: 10,
          fat: 5,
          carbohydrates: 20,
          calories: 150,
          price: 100,
          image: 'image1.png',
          image_mobile: 'mobile1.png',
          image_large: 'large1.png'
        }
      ];

      let state = reducer(initialState, {
        type: getIngredients.fulfilled.type,
        payload: firstIngredients
      });

      expect(state.ingredients).toHaveLength(1);

      const secondIngredients: TIngredient[] = [
        {
          _id: '2',
          name: 'Ингредиент 2',
          type: 'sauce',
          proteins: 5,
          fat: 10,
          carbohydrates: 15,
          calories: 120,
          price: 80,
          image: 'image2.png',
          image_mobile: 'mobile2.png',
          image_large: 'large2.png'
        }
      ];

      state = reducer(state, {
        type: getIngredients.fulfilled.type,
        payload: secondIngredients
      });

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients).toEqual(secondIngredients);
    });
  });

  describe('getIngredients.rejected', () => {
    it('Должен установить error и loading в false при ошибке', () => {
      const errorMessage = 'Ошибка сети';
      const action = {
        type: getIngredients.rejected.type,
        error: { message: errorMessage }
      };
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.ingredients).toEqual([]);
    });

    it('Должен использовать сообщение по умолчанию, если error.message отсутствует', () => {
      const action = {
        type: getIngredients.rejected.type,
        error: {}
      };
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка загрузки ингредиентов');
      expect(state.ingredients).toEqual([]);
    });
  });

  describe('Интеграционные тесты с createAsyncThunk', () => {
    it('Должен успешно загрузить ингредиенты через API', async () => {
      const mockIngredients: TIngredient[] = [
        {
          _id: '1',
          name: 'Тестовый ингредиент',
          type: 'main',
          proteins: 10,
          fat: 5,
          carbohydrates: 20,
          calories: 150,
          price: 100,
          image: 'test.png',
          image_mobile: 'test-mobile.png',
          image_large: 'test-large.png'
        }
      ];

      mockGetIngredientsApi.mockResolvedValue(mockIngredients);

      const dispatch = jest.fn();
      const thunk = getIngredients();

      const pendingAction = { type: getIngredients.pending.type };
      const fulfilledAction = {
        type: getIngredients.fulfilled.type,
        payload: mockIngredients
      };

      let state = reducer(initialState, pendingAction);
      expect(state.loading).toBe(true);

      state = reducer(state, fulfilledAction);
      expect(state.loading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
    });

    it('Должен обработать ошибку при загрузке ингредиентов через API', async () => {
      const error = new Error('Ошибка сервера');
      mockGetIngredientsApi.mockRejectedValue(error);

      const pendingAction = { type: getIngredients.pending.type };
      const rejectedAction = {
        type: getIngredients.rejected.type,
        error: { message: error.message }
      };

      let state = reducer(initialState, pendingAction);
      expect(state.loading).toBe(true);

      state = reducer(state, rejectedAction);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error.message);
      expect(state.ingredients).toEqual([]);
    });
  });

  describe('Крайние случаи', () => {
    it('Должен корректно обрабатывать пустой массив ингредиентов', () => {
      const action = {
        type: getIngredients.fulfilled.type,
        payload: []
      };
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.ingredients).toEqual([]);
      expect(state.ingredients).toHaveLength(0);
    });

    it('Должен сохранять существующие данные при ошибке', () => {
      const mockIngredients: TIngredient[] = [
        {
          _id: '1',
          name: 'Ингредиент 1',
          type: 'main',
          proteins: 10,
          fat: 5,
          carbohydrates: 20,
          calories: 150,
          price: 100,
          image: 'image1.png',
          image_mobile: 'mobile1.png',
          image_large: 'large1.png'
        }
      ];

      let state = reducer(initialState, {
        type: getIngredients.fulfilled.type,
        payload: mockIngredients
      });

      const errorAction = {
        type: getIngredients.rejected.type,
        error: { message: 'Ошибка' }
      };

      state = reducer(state, errorAction);

      expect(state.ingredients).toEqual(mockIngredients);
      expect(state.error).toBe('Ошибка');
      expect(state.loading).toBe(false);
    });
  });
});
