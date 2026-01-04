import { FC, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from '../services/store';
import { getFeeds } from '../services/slices/feedSlice';
import { getProfileOrders } from '../services/slices/profileOrdersSlice';
import { getIngredients } from '../services/slices/ingredientsSlice';

export const ModalRestorer: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const savedModal = sessionStorage.getItem('activeModal');
    if (savedModal) {
      const modalData = JSON.parse(savedModal);

      if (modalData.type === 'ingredient') {
        dispatch(getIngredients());
      } else if (modalData.type === 'order') {
        if (modalData.backgroundPath.includes('/profile')) {
          dispatch(getProfileOrders());
        } else {
          dispatch(getFeeds());
        }
      }

      if (modalData.type === 'ingredient') {
        navigate(`/ingredients/${modalData.id}`, {
          state: { background: { pathname: modalData.backgroundPath } }
        });
      } else {
        const path = modalData.backgroundPath.includes('/profile')
          ? `/profile/orders/${modalData.id}`
          : `/feed/${modalData.id}`;
        navigate(path, {
          state: { background: { pathname: modalData.backgroundPath } }
        });
      }

      sessionStorage.removeItem('activeModal');
    }
  }, [navigate, dispatch]);

  return null;
};
