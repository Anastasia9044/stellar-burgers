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

  // Определяем контекст: из профиля или из общей ленты
  const isProfile = location.pathname.includes('/profile');

  // Получаем данные из store
  const { ingredients } = useSelector((state) => state.ingredients);
  const { orders: feedOrders, loading: feedLoading } = useSelector(
    (state) => state.feed
  );
  const { orders: profileOrders, loading: profileLoading } = useSelector(
    (state) => state.profileOrders
  );

  // Выбираем нужные заказы в зависимости от контекста
  const currentOrders = isProfile ? profileOrders : feedOrders;
  const currentLoading = isProfile ? profileLoading : feedLoading;

  // Ищем заказ
  const orderData = currentOrders.find((order) => order.number === orderId);

  // Загружаем данные при необходимости
  useEffect(() => {
    if (!currentOrders.length && orderId > 0) {
      if (isProfile) {
        dispatch(getUserOrdersThunk());
      } else {
        dispatch(getFeedsThunk());
      }
    }
  }, [dispatch, currentOrders.length, orderId, isProfile]);

  // Формируем информацию о заказе
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

  // Показываем прелоадер при загрузке
  if (currentLoading) {
    return <Preloader />;
  }

  // Если заказ не найден после загрузки
  if (!orderInfo) {
    return <Preloader />; // или компонент ошибки
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
