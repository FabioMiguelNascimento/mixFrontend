
import { useApi } from './useApi';
import { useNavigate } from 'react-router-dom';

import { z } from 'zod';
import { type UserData, useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

interface LoginApiResponse {
  data: UserData;
}

export const useLogin = () => {
  const { request, loading, error } = useApi<LoginApiResponse>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginUser = async (credentials: z.infer<typeof loginSchema>) => {
    const validatedCredentials = loginSchema.parse(credentials);

    const responseData = await request({
      method: 'POST',
      url: '/api/auth/login',
      data: validatedCredentials,
    });

    if (responseData) {
      login(responseData.data);
      navigate('/dashboard');
    }
  };

  return { loginUser, loading, error };
};
