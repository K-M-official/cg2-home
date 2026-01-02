import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type TabType = 'login' | 'register' | 'forgot';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, forgotPassword, sendVerificationCode, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时逻辑
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 根据不同的tab调用不同的发送验证码方法
      let result;
      if (activeTab === 'register') {
        result = await sendVerificationCode(email);
      } else if (activeTab === 'forgot') {
        result = await forgotPassword(email);
      }

      if (result && result.success) {
        setCodeSent(true);
        setCountdown(60);
        setSuccess('Verification code sent to your email');
      } else {
        setError(result?.error || 'Failed to send code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const result = await login(email, password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Login failed');
        }
      } else if (activeTab === 'register') {
        if (!code) {
          setError('Please enter verification code');
          setIsLoading(false);
          return;
        }
        const result = await register(email, password, code);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Registration failed');
        }
      } else if (activeTab === 'forgot') {
        if (!code || !newPassword) {
          setError('Please enter verification code and new password');
          setIsLoading(false);
          return;
        }
        const result = await resetPassword(email, code, newPassword);
        if (result.success) {
          setSuccess('Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            switchTab('login');
            setSuccess('');
          }, 2000);
        } else {
          setError(result.error || 'Reset failed');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNewPassword('');
    setCode('');
    setError('');
    setSuccess('');
    setCodeSent(false);
    setCountdown(0);
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-32 px-4">
      <div className="relative z-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Tab 切换 */}
        <div className="flex border-b border-slate-800 rounded-t-2xl overflow-hidden">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-4 text-center font-semibold transition-all text-sm uppercase tracking-wider ${
              activeTab === 'login'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-4 text-center font-semibold transition-all text-sm uppercase tracking-wider ${
              activeTab === 'register'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => switchTab('forgot')}
            className={`flex-1 py-4 text-center font-semibold transition-all text-sm uppercase tracking-wider ${
              activeTab === 'forgot'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Reset
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-8">
          <h2 className="text-3xl font-serif text-white mb-2">
            {activeTab === 'login' && 'Welcome Back'}
            {activeTab === 'register' && 'Create Account'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-slate-400 mb-6 text-sm font-light">
            {activeTab === 'login' && 'Sign in to your account'}
            {activeTab === 'register' && 'Register a new account'}
            {activeTab === 'forgot' && 'Enter email and verification code to reset password'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                {success}
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-slate-500"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* 密码输入（登录和注册需要） */}
            {activeTab !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-slate-500"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {activeTab === 'register' && (
                  <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
                )}
              </div>
            )}

            {/* 验证码输入（注册和找回密码需要） */}
            {(activeTab === 'register' || activeTab === 'forgot') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-slate-500"
                    placeholder="6-digit code"
                    required
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isLoading}
                    className="px-4 py-3 bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-lg font-medium hover:bg-indigo-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : codeSent ? 'Resend' : 'Send Code'}
                  </button>
                </div>
              </div>
            )}

            {/* 新密码输入（仅找回密码需要） */}
            {activeTab === 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-slate-500"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50"
            >
              {isLoading ? 'Processing...' : (
                <>
                  {activeTab === 'login' && 'Sign In'}
                  {activeTab === 'register' && 'Create Account'}
                  {activeTab === 'forgot' && 'Reset Password'}
                </>
              )}
            </button>

            {/* 返回首页 */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-slate-400 hover:text-slate-200 text-sm mt-2 py-2 transition-colors"
            >
              Back to Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

