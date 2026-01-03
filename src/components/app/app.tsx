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

const AppContent: FC = () => {
  useAuth();
  const location = useLocation();
  const background = location.state?.background;

  return (
    <div className={styles.app}>
      <AppHeader />
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
        <Route
          path='/profile/orders/:number'
          element={<ProtectedRoute element={<OrderInfoPage />} />}
        />
        <Route path='*' element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={<ModalRoute type='ingredient' />}
          />
          <Route
            path='/feed/:number'
            element={<ModalRoute type='feed-order' />}
          />
          <Route
            path='/profile/orders/:number'
            element={<ModalRoute type='profile-order' />}
          />
        </Routes>
      )}
    </div>
  );
};

const ModalRoute: FC<{
  type: 'ingredient' | 'feed-order' | 'profile-order';
}> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const background = location.state?.background;

  const handleClose = () => {
    if (type === 'ingredient') {
      navigate(-1);
    } else if (type === 'feed-order') {
      navigate('/feed');
    } else {
      navigate('/profile/orders');
    }
  };

  const getTitle = () =>
    type === 'ingredient' ? 'Детали ингредиента' : 'Детали заказа';

  return (
    <Modal title={getTitle()} onClose={handleClose}>
      {type === 'ingredient' ? <IngredientDetails /> : <OrderInfo />}
    </Modal>
  );
};

const IngredientDetailsPage: FC = () => (
  <div className={styles.detailPageWrap}>
    <h1 className={`text text_type_main-large ${styles.detailHeader}`}>
      Детали ингредиента
    </h1>
    <IngredientDetails />
  </div>
);

const OrderInfoPage: FC = () => (
  <div className={styles.detailPageWrap}>
    <OrderInfo />
  </div>
);

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

const App: FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
