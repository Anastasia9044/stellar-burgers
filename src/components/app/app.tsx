import { FC } from 'react';
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
import { useSelector } from '../../services/store';
import { useAuth } from '../../services/slices/useAuth';

const App: FC = () => {
  useAuth();

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <AppHeader />
        <Routes>
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
      </div>
    </BrowserRouter>
  );
};

const IngredientDetailsPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const background = location.state?.background;

  const handleClose = () => {
    navigate(background?.pathname || '/');
  };

  return (
    <>
      <ConstructorPage />

      <Modal title='Детали ингредиента' onClose={handleClose}>
        <IngredientDetails />
      </Modal>
    </>
  );
};

const OrderInfoPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const background = location.state?.background;
  const isProfile = location.pathname.includes('/profile');

  const handleClose = () => {
    navigate(background?.pathname || (isProfile ? '/profile/orders' : '/feed'));
  };

  return (
    <>
      {isProfile ? <ProfileOrders /> : <Feed />}

      <Modal title='Детали заказа' onClose={handleClose}>
        <OrderInfo />
      </Modal>
    </>
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
