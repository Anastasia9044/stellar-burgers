import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { updateUser, getUser } from '../../services/slices/authSlice';
import { getErrorMsg } from '../../utils/util';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);

  const [formValue, setFormValue] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setUpdateError(null);

    try {
      await dispatch(
        updateUser({
          name: formValue.name,
          email: formValue.email,
          password: formValue.password || undefined
        })
      ).unwrap();

      // Сбрасываем пароль после успешного обновления
      setFormValue((prev) => ({ ...prev, password: '' }));
    } catch (err: unknown) {
      setUpdateError(getErrorMsg(err));
    }
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
    setUpdateError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      updateUserError={updateError || error || undefined}
    />
  );
};
