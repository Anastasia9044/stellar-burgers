import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from '../../services/store';
import { Preloader } from '@ui';
import { IngredientDetailsUI } from '@ui';
import { getIngredients } from '../../services/slices/ingredientsSlice';

export const IngredientDetails: FC = () => {
  const { id } = useParams();
  const { ingredients, loading } = useSelector((state) => state.ingredients);
  const ingredientData = ingredients.find(
    (ingredient) => ingredient._id === id
  );

  if (loading) {
    return <Preloader />;
  }

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
