import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useModalState = () => {
  const location = useLocation();
  const [modalData, setModalData] = useState<{
    type: 'ingredient' | 'order';
    id: string;
    backgroundPath: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const savedModal = sessionStorage.getItem('activeModal');

    if (savedModal) {
      try {
        const parsed = JSON.parse(savedModal);
        const isExpired = Date.now() - parsed.timestamp > 10 * 60 * 1000;

        if (!isExpired) {
          setModalData(parsed);
        } else {
          sessionStorage.removeItem('activeModal');
        }
      } catch (e) {
        console.error('Error parsing saved modal data:', e);
        sessionStorage.removeItem('activeModal');
      }
    }

    const background = location.state?.background;
    const pathname = location.pathname;

    if (background && pathname) {
      let type: 'ingredient' | 'order' = 'order';
      let id = '';

      if (pathname.includes('/ingredients/')) {
        type = 'ingredient';
        id = pathname.split('/ingredients/')[1];
      } else if (
        pathname.includes('/feed/') ||
        pathname.includes('/profile/orders/')
      ) {
        type = 'order';
        const match = pathname.match(/\/(\d+)$/);
        id = match ? match[1] : '';
      }

      if (id) {
        const modalInfo = {
          type,
          id,
          backgroundPath: background.pathname,
          timestamp: Date.now()
        };

        setModalData(modalInfo);
        sessionStorage.setItem('activeModal', JSON.stringify(modalInfo));
        setTimeout(
          () => {
            sessionStorage.removeItem('activeModal');
          },
          10 * 60 * 1000
        );
      }
    }
    return () => {
      if (
        (!background &&
          modalData &&
          location.pathname.includes('/ingredients/')) ||
        location.pathname.includes('/feed/') ||
        location.pathname.includes('/profile/orders/')
      ) {
        setTimeout(() => {
          sessionStorage.removeItem('activeModal');
        }, 100);
      }
    };
  }, [location, modalData]);

  return modalData;
};
