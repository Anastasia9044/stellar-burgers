import { FC } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { BurgerIngredients, BurgerConstructor } from '@components';
import { Preloader } from '@ui';
import styles from './constructor-page.module.css';

interface ConstructorPageProps {
  onIngredientClick?: (id: string) => void;
}

export const ConstructorPage: FC<ConstructorPageProps> = ({
  onIngredientClick
}) => {
  const { ingredients, loading } = useSelector((state) => state.ingredients);

  const handleIngredientClick = (id: string) => {
    if (onIngredientClick) {
      onIngredientClick(id);
    }
  };

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
