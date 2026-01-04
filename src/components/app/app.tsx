import { FC, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import '../../index.css';
import styles from './app.module.css';
import { useSelector, useDispatch } from '../../services/store';
import { useAuth } from '../../services/slices/useAuth';
import { getFeeds } from '../../services/slices/feedSlice';
import { getProfileOrders } from '../../services/slices/profileOrdersSlice';
import { getIngredients } from '../../services/slices/ingredientsSlice';

const App: FC = () => {
  useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getIngredients());
    dispatch(getFeeds());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <AppHeader />
        <RoutesHandler />
      </div>
    </BrowserRouter>
  );
};

const RoutesHandler: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.state?.background) {
      const path = location.pathname;
      if (path.startsWith('/ingredients/')) {
        navigate('/', {
          replace: true,
          state: { background: location }
        });
      } else if (path.startsWith('/feed/')) {
        navigate('/feed', {
          replace: true,
          state: { background: location }
        });
      } else if (path.startsWith('/profile/orders/')) {
        navigate('/profile/orders', {
          replace: true,
          state: { background: location }
        });
      }
    }
  }, [location, navigate]);

  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/feed/:number' element={<OrderInfoPage />} />
        <Route path='/ingredients/:id' element={<IngredientDetailsPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route
          path='/reset-password'
          element={<ProtectedRoute element={<ResetPassword />} />}
        />
        <Route
          path='/profile'
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path='/profile/orders'
          element={<ProtectedRoute element={<ProfileOrders />} />}
        />
        <Route path='/profile/orders/:number' element={<OrderInfoPage />} />
        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='Детали ингредиента' onClose={() => navigate(-1)}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/feed/:number'
            element={
              <Modal title='Детали заказа' onClose={() => navigate(-1)}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute
                element={
                  <Modal title='Детали заказа' onClose={() => navigate(-1)}>
                    <OrderInfo />
                  </Modal>
                }
              />
            }
          />
        </Routes>
      )}
    </>
  );
};

const IngredientDetailsPage: FC = () => {
  const location = useLocation();
  const background = location.state?.background;

  if (background) {
    return null;
  }

  return (
    <div className={styles.detailPageWrap}>
      <h1 className={`text text_type_main-large ${styles.detailHeader}`}>
        Детали ингредиента
      </h1>
      <IngredientDetails />
    </div>
  );
};

const OrderInfoPage: FC = () => {
  const location = useLocation();
  const background = location.state?.background;

  if (background) {
    return null;
  }

  const isProfile = location.pathname.includes('/profile');
  return (
    <div className={styles.detailPageWrap}>
      {isProfile && (
        <h1 className={`text text_type_main-large ${styles.detailHeader}`}>
          Детали заказа
        </h1>
      )}
      <OrderInfo />
    </div>
  );
};

const ProtectedRoute: FC<{ element: JSX.Element }> = ({ element }) => {
  const { user, isAuthChecked } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthChecked) {
    return null;
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return element;
};

export default App;
