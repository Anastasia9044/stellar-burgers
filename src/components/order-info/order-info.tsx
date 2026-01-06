import { FC, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from '../../services/store';
import { Preloader } from '@ui';
import { OrderInfoUI } from '@ui';
import { TIngredient } from '@utils-types';
import { getFeedsThunk } from '../../services/slices/feedSlice';
import { getUserOrdersThunk } from '../../services/slices/profileOrdersSlice';

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const orderId = parseInt(number || '0');

  const isProfile = location.pathname.includes('/profile');

  const { ingredients } = useSelector((state) => state.ingredients);
  const { orders: feedOrders, loading: feedLoading } = useSelector(
    (state) => state.feed
  );
  const { orders: profileOrders, loading: profileLoading } = useSelector(
    (state) => state.profileOrders
  );

  const currentOrders = isProfile ? profileOrders : feedOrders;
  const currentLoading = isProfile ? profileLoading : feedLoading;

  const orderData = currentOrders.find((order) => order.number === orderId);

  useEffect(() => {
    if (orderId > 0 && currentOrders.length === 0) {
      if (isProfile) {
        dispatch(getUserOrdersThunk());
      } else {
        dispatch(getFeedsThunk());
      }
    }
  }, [dispatch, orderId, isProfile, currentOrders.length]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (currentLoading) {
    return <Preloader />;
  }

  if (!orderData && !currentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p className='text text_type_main-medium'>Заказ #{orderId} не найден</p>
      </div>
    );
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
