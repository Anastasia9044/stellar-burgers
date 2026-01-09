import { useEffect } from 'react';
import { useDispatch } from '../store';
import { checkUserAuth } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkUserAuth());
  }, [dispatch]);
};
