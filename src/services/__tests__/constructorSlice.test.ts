import reducer, {
  addBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../slices/constructorSlice';
import { TIngredient } from '@utils-types';

type TConstructorIngredient = TIngredient & {
  id: string;
};

type TConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

const mockBun: TIngredient = {
  _id: 'bun-1',
  name: 'Краторная булка',
  type: 'bun',
  proteins: 100,
  fat: 30,
  carbohydrates: 60,
  calories: 476,
  price: 1300,
  image: 'bun-image.png',
  image_mobile: 'bun-mobile.png',
  image_large: 'bun-large.png'
};

const mockIngredient: TIngredient = {
  _id: 'ingredient-1',
  name: 'Соус',
  type: 'sauce',
  proteins: 14,
  fat: 7,
  carbohydrates: 21,
  calories: 120,
  price: 350,
  image: 'sauce-image.png',
  image_mobile: 'sauce-mobile.png',
  image_large: 'sauce-large.png'
};

describe('Тесты для constructorSlice', () => {
  const initialState: TConstructorState = {
    bun: null,
    ingredients: []
  };

  describe('Начальное состояние', () => {
    it('Вернет начальное состояние', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('Добавление ингредиентов', () => {
    it('При добавлении ингредиента - возвращает массив ингредиентов', () => {
      const action = addIngredient(mockIngredient);
      const result = reducer(initialState, action);

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]).toMatchObject({
        ...mockIngredient,
        id: expect.any(String)
      });
    });
  });

  describe('Удаление ингредиентов', () => {
    it('Должен корректно удалить заданный ингредиент', () => {
      let state = reducer(initialState, addIngredient(mockIngredient));
      const secondIngredient = { ...mockIngredient, _id: 'ingredient-2' };
      state = reducer(state, addIngredient(secondIngredient));
      const thirdIngredient = { ...mockIngredient, _id: 'ingredient-3' };
      state = reducer(state, addIngredient(thirdIngredient));

      expect(state.ingredients).toHaveLength(3);
      
      const idToRemove = state.ingredients[1].id;
      state = reducer(state, removeIngredient(idToRemove));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0]._id).toBe('ingredient-1');
      expect(state.ingredients[1]._id).toBe('ingredient-3');
    });

    it('Должен корректно удалить первый ингредиент', () => {
      let state = reducer(initialState, addIngredient(mockIngredient));
      const secondIngredient = { ...mockIngredient, _id: 'ingredient-2' };
      state = reducer(state, addIngredient(secondIngredient));

      const idToRemove = state.ingredients[0].id;
      state = reducer(state, removeIngredient(idToRemove));

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]._id).toBe('ingredient-2');
    });

    it('Должен корректно удалить последний ингредиент', () => {
      let state = reducer(initialState, addIngredient(mockIngredient));
      const secondIngredient = { ...mockIngredient, _id: 'ingredient-2' };
      state = reducer(state, addIngredient(secondIngredient));

      const idToRemove = state.ingredients[1].id;
      state = reducer(state, removeIngredient(idToRemove));

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]._id).toBe('ingredient-1');
    });
  });

  describe('Перемещение ингредиента', () => {
    it('Должен переместить ингредиент с меньшего индекса на больший', () => {

      const ingredient1: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '1', 
        _id: 'ing-1', 
        name: 'Ингредиент 1' 
      };
      const ingredient2: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '2', 
        _id: 'ing-2', 
        name: 'Ингредиент 2' 
      };
      const ingredient3: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '3', 
        _id: 'ing-3', 
        name: 'Ингредиент 3' 
      };

      const testState = {
        bun: null,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };

      const newState = reducer(testState, moveIngredient({ fromIndex: 0, toIndex: 2 }));

      expect(newState.ingredients).toEqual([
        ingredient2,
        ingredient3,
        ingredient1
      ]);
    });

    it('Должен переместить ингредиент с большего индекса на меньший', () => {

      const ingredient1: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '1', 
        _id: 'ing-1', 
        name: 'Ингредиент 1' 
      };
      const ingredient2: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '2', 
        _id: 'ing-2', 
        name: 'Ингредиент 2' 
      };
      const ingredient3: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '3', 
        _id: 'ing-3', 
        name: 'Ингредиент 3' 
      };

      const testState = {
        bun: null,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };

      const newState = reducer(testState, moveIngredient({ fromIndex: 2, toIndex: 0 }));

      expect(newState.ingredients).toEqual([
        ingredient3,
        ingredient1,
        ingredient2
      ]);
    });

    it('Не должен изменять ингредиенты при перемещении на тот же индекс', () => {

      const ingredient1: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '1', 
        _id: 'ing-1', 
        name: 'Ингредиент 1' 
      };
      const ingredient2: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '2', 
        _id: 'ing-2', 
        name: 'Ингредиент 2' 
      };
      const ingredient3: TConstructorIngredient = { 
        ...mockIngredient, 
        id: '3', 
        _id: 'ing-3', 
        name: 'Ингредиент 3' 
      };

      const testState = {
        bun: null,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };

      const newState = reducer(testState, moveIngredient({ fromIndex: 1, toIndex: 1 }));

      expect(newState.ingredients).toEqual(testState.ingredients);
      expect(newState.ingredients).not.toBe(testState.ingredients);
    });
  });

  describe('Очищение конструктора', () => {
    it('Должен очистить все ингредиенты и сбросить булку', () => {
      let state = reducer(initialState, addBun(mockBun));
      state = reducer(state, addIngredient(mockIngredient));
      const secondIngredient = { ...mockIngredient, _id: 'ingredient-2' };
      state = reducer(state, addIngredient(secondIngredient));

      expect(state.bun).toEqual(mockBun);
      expect(state.ingredients).toHaveLength(2);

      state = reducer(state, clearConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });
});