import { handleRegister, handleLogin, handleForgotPassword, handleResetPassword, handleVerifyToken, handleSendCode } from '../auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
} as const;

/**
 * 认证相关路由处理
 * /api/auth/*
 */
export async function handleAuthRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  // 发送验证码
  if (path === '/api/auth/send-code' && request.method === 'POST') {
    return handleSendCode(request, env);
  }

  // 用户注册
  if (path === '/api/auth/register' && request.method === 'POST') {
    return handleRegister(request, env);
  }

  // 用户登录
  if (path === '/api/auth/login' && request.method === 'POST') {
    return handleLogin(request, env);
  }

  // 请求密码重置
  if (path === '/api/auth/forgot-password' && request.method === 'POST') {
    return handleForgotPassword(request, env);
  }

  // 重置密码
  if (path === '/api/auth/reset-password' && request.method === 'POST') {
    return handleResetPassword(request, env);
  }

  // 验证JWT令牌
  if (path === '/api/auth/verify' && request.method === 'GET') {
    return handleVerifyToken(request, env);
  }

  return null;
}
