import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from "zod";

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useLogin } from '../hooks/useLogin';

const loginSchema = z.object({
  email: z.email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { loginUser, loading, error: apiError } = useLogin();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const adminRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER];
      if (adminRoles.includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (apiError) {
      // @ts-ignore
      const errorMessage = apiError.response?.data?.message || 'Ocorreu um erro inesperado.';
      toast.error(`${errorMessage}`);
    }
  }, [apiError]);

  const onSubmit = async (data: LoginFormValues) => {
    await loginUser(data);
  };

  const features = [
    "Histórico completo de pedidos",
    "Ofertas exclusivas para membros",
    "Suporte prioritário",
  ];

  return (
    <div className="login-page">
      <div className="login-page__showcase">
        <img src="/assets/icons/favIco.svg" alt="Mix Bazar Logo" className="login-page__showcase__logo" width={200}/>
        <h1>Acesse sua conta</h1>
        <p>Acompanhe seus pedidos, veja seu histórico de compras e aproveite ofertas exclusivas.</p>
        <ul className="feature-list">
          {features.map((feature, index) => (
            <li key={index} className="feature-list__item">
              <CheckCircle2 size={20} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="login-page__form-area">
        <div className="login-form">
          <div className="login-form__header">
            <h2>Bem-vindo de volta!</h2>
            <p>Entre com suas credenciais para continuar</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="login-form__content">
            <div className="form-field">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                {...register("email")} 
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            
            <div className="form-field">
              <Label htmlFor="password">Senha</Label>
              <div className="input-with-icon">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  {...register("password")} 
                />
                <Button variant="ghost" type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            
            <div className="form-options">
              <Link to="/forgot-password" className="forgot-password">
                Esqueci a senha
              </Link>
            </div>
            
            <Button className="submit-button" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
            
            <div className="separator">ou</div>
            
            <div className="signup-prompt">
              Não tem uma conta?{" "}
              <Link to="/signup" className="signup-link">
                Criar conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;