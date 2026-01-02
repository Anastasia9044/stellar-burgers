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

const App: FC = () => (
  <BrowserRouter>
    <div className={styles.app}>
      <AppHeader />
      <Routes>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/feed/:number/*' element={<OrderInfoPage />} />
        <Route path='/ingredients/:id/*' element={<IngredientDetailsPage />} />
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
          path='/profile/orders/:number/*'
          element={<ProtectedRoute element={<OrderInfoPage />} />}
        />
        <Route path='*' element={<NotFound404 />} />
      </Routes>
    </div>
  </BrowserRouter>
);

const IngredientDetailsPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state?.background;

  const handleClose = () => {
    navigate(-1);
  };

  if (background) {
    return (
      <>
        <Routes>
          <Route path='/ingredients/:id/*' element={<ConstructorPage />} />
        </Routes>
        <Modal title='Детали ингредиента' onClose={handleClose}>
          <IngredientDetails />
        </Modal>
      </>
    );
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
  const navigate = useNavigate();
  const background = location.state?.background;

  const handleClose = () => {
    if (location.pathname.includes('/profile/orders')) {
      navigate('/profile/orders');
    } else if (location.pathname.includes('/feed')) {
      navigate('/feed');
    } else {
      navigate(-1);
    }
  };

  if (background) {
    return (
      <>
        <Routes>
          <Route path='/feed/:number/*' element={<Feed />} />
          <Route path='/profile/orders/:number/*' element={<ProfileOrders />} />
        </Routes>
        <Modal title='' onClose={handleClose}>
          <OrderInfo />
        </Modal>
      </>
    );
  }

  return (
    <div className={styles.detailPageWrap}>
      <OrderInfo />
    </div>
  );
};

const ProtectedRoute: FC<{ element: JSX.Element }> = ({ element }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return element;
};

export default App;
