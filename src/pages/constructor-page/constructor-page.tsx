import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { getIngredients } from '../../services/slices/ingredientsSlice';
import { BurgerIngredients, BurgerConstructor } from '@components';
import { Preloader } from '@ui';
import styles from './constructor-page.module.css';

interface ConstructorPageProps {
  onIngredientClick?: (id: string) => void;
}

export const ConstructorPage: FC<ConstructorPageProps> = ({
  onIngredientClick
}) => {
  const dispatch = useDispatch();
  const { ingredients, loading } = useSelector((state) => state.ingredients);

  const handleIngredientClick = (id: string) => {
    if (onIngredientClick) {
      onIngredientClick(id);
    }
  };

  useEffect(() => {
    if (ingredients.length === 0) {
      dispatch(getIngredients());
    }
  }, [dispatch, ingredients.length]);

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <main className={styles.containerMain}>
          <h1
            className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
          >
            Соберите бургер
          </h1>
          <div className={`${styles.main} pl-5 pr-5`}>
            <BurgerIngredients />
            <BurgerConstructor />
          </div>
        </main>
      )}
    </>
  );
};
