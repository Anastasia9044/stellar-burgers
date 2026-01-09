import { FC, SyntheticEvent, useState } from 'react';
import { useDispatch } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import { RegisterUI } from '@ui-pages';
import { registerUser } from '../../services/slices/authSlice';
import { getErrorMsg } from '../../utils/util';

export const Register: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await dispatch(
        registerUser({
          name: userName,
          email,
          password
        })
      ).unwrap();

      // После успешной регистрации перенаправляем на главную страницу
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(getErrorMsg(err));
    }
  };

  return (
    <RegisterUI
      errorText={error || ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
