import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '@ui';
import { IngredientDetailsUI } from '@ui';

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
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p className='text text_type_main-medium'>Ингредиент не найден</p>
      </div>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
