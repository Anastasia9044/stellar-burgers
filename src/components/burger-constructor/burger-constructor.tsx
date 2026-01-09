import { FC, useMemo } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { createOrder, clearOrder } from '../../services/slices/orderSlice';
import { clearConstructor } from '../../services/slices/constructorSlice';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector((state) => state.burgerConstructor);
  const { order, loading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const onOrderClick = () => {
    if (!constructorItems.bun || loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    dispatch(createOrder(ingredientIds))
      .unwrap()
      .then(() => {
        dispatch(clearConstructor());
      })
      .catch((error) => {
        console.error('Failed to create order:', error);
      });
  };

  const closeOrderModal = () => {
    dispatch(clearOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={loading}
      constructorItems={constructorItems}
      orderModalData={order}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
