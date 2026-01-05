import { FC, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const ModalRestorer: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedModal = sessionStorage.getItem('activeModal');
    if (savedModal) {
      const modalData = JSON.parse(savedModal);

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
  }, [navigate]);

  return null;
};
