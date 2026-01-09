import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { ProfileOrdersUI } from '@ui-pages';
import { getProfileOrders } from '../../services/slices/profileOrdersSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.profileOrders);

  useEffect(() => {
    dispatch(getProfileOrders());
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
