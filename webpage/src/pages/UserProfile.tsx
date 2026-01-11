import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, LogOut, ChevronRight, Wallet, Settings } from 'lucide-react';
import { ModerationPanel } from '../components/admin/ModerationPanel';
import { API_BASE_URL } from '../constants';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'moderation' | 'transactions' | 'settings'>('profile');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 主动从后端获取最新的用户信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.error) {
          console.error('Failed to verify token:', data.error);
          navigate('/auth');
          return;
        }

        if (data.success && data.user) {
          // 后端已经返回完整的用户信息（包括 roles）
          setCurrentUser(data.user);
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="pt-24 py-32 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // 检查用户是否有审核权限
  const isModerator = currentUser.roles?.includes('moderator') || currentUser.roles?.includes('admin');

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User, show: true },
    { id: 'transactions', label: 'Transactions', icon: Wallet, show: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, show: true },
    { id: 'settings', label: 'Settings', icon: Settings, show: true },
    { id: 'moderation', label: 'Moderation', icon: Shield, show: isModerator },
  ];

  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Drawer */}
          <div className="w-64 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 h-fit sticky top-24 shadow-2xl">
            <div className="mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                  <User className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <p className="font-medium text-white">{currentUser.email.split('@')[0]}</p>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.filter(item => item.show).map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all font-sans ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-400/30 font-sans"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {activeSection === 'profile' && <ProfileSection user={currentUser} />}
            {activeSection === 'transactions' && <TransactionsSection />}
            {activeSection === 'notifications' && <NotificationsSection />}
            {activeSection === 'settings' && <SettingsSection />}
            {activeSection === 'moderation' && isModerator && <ModerationSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Section Component
const ProfileSection: React.FC<{ user: any }> = ({ user }) => {
  const [wallet, setWallet] = React.useState<any>(null);
  const [loadingWallet, setLoadingWallet] = React.useState(true);

  React.useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/wallet`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setWallet(data.wallet);
        }
      } catch (error) {
        console.error('Failed to load wallet:', error);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWallet();
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl font-sans">
      <h2 className="text-2xl font-serif text-white mb-6">Profile Information</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white">
            {user.email}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Account Created</label>
          <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white">
            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Roles</label>
          <div className="flex flex-wrap gap-2">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role: string) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium border border-indigo-400/30"
                >
                  {role}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-sm border border-white/10">
                User
              </span>
            )}
          </div>
        </div>

        {/* Wallet Information */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xl font-serif text-white mb-4">Wallet</h3>

          {loadingWallet ? (
            <div className="text-slate-400">Loading wallet...</div>
          ) : wallet ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">USD Balance</label>
                <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white font-mono text-lg">
                  ${wallet.balance_usd?.toFixed(2) || '0.00'} USD
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Arweave Balance</label>
                <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white font-mono text-lg">
                  {wallet.balance_ar?.toFixed(6) || '0.000000'} AR
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Arweave Address</label>
                <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white font-mono text-xs break-all">
                  {wallet.arweave_address || <span className="text-slate-500 italic">Generating...</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400">Failed to load wallet</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Transactions Section Component
const TransactionsSection: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  React.useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = filter
        ? `${API_BASE_URL}/api/wallet/arweave-transactions?status=${filter}`
        : `${API_BASE_URL}/api/wallet/arweave-transactions`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelTransaction = async (txId: number) => {
    if (!confirm('Are you sure you want to cancel this transaction?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/wallet/arweave-transactions/${txId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();

      if (data.success) {
        // 重新加载交易列表
        loadTransactions();
      } else {
        alert(data.message || 'Failed to cancel transaction');
      }
    } catch (error) {
      console.error('Failed to cancel transaction:', error);
      alert('Failed to cancel transaction');
    }
  };

  const canCancelTransaction = (status: string) => {
    // 只能取消 pending_execution, pending_balance, error 状态的交易
    return status === 'pending_execution' || status === 'pending_balance' || status === 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'pending_confirmation':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'pending_execution':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'pending_balance':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending_confirmation':
        return 'Pending Confirmation';
      case 'pending_execution':
        return 'Pending Execution';
      case 'pending_balance':
        return 'Waiting for Balance';
      case 'cancelled':
        return 'Cancelled';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'text':
        return '📝';
      case 'json':
        return '📋';
      case 'video':
        return '🎥';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Arweave Transactions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === null
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending_balance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending_balance'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Pending Balance
          </button>
          <button
            onClick={() => setFilter('pending_confirmation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending_confirmation'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'confirmed'
                ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'error'
                ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Error
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No transactions found
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getContentTypeIcon(tx.content_type)}</span>
                  <div>
                    <h3 className="text-white font-medium capitalize">{tx.content_type} Upload</h3>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                    {getStatusLabel(tx.status)}
                  </span>
                  {canCancelTransaction(tx.status) && (
                    <button
                      onClick={() => cancelTransaction(tx.id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {tx.tx_id && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">Transaction ID:</p>
                  <a
                    href={`https://viewblock.io/arweave/tx/${tx.tx_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-300 hover:text-indigo-200 text-sm font-mono break-all"
                  >
                    {tx.tx_id}
                  </a>
                </div>
              )}

              {tx.content_reference && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">Content Reference:</p>
                  <p className="text-slate-300 text-sm font-mono break-all">{tx.content_reference}</p>
                </div>
              )}

              <div className="flex items-center gap-6 text-xs text-slate-400">
                {tx.data_size && (
                  <span>Size: {(tx.data_size / 1024).toFixed(2)} KB</span>
                )}
                {tx.fee_amount && (
                  <span>Fee: {tx.fee_amount.toFixed(6)} AR</span>
                )}
                {tx.confirmed_at && (
                  <span>Confirmed: {new Date(tx.confirmed_at).toLocaleString()}</span>
                )}
              </div>

              {tx.error_message && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                  <p className="text-xs text-red-300">Error: {tx.error_message}</p>
                </div>
              )}

              {tx.metadata && (
                <details className="mt-3">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                    View Metadata
                  </summary>
                  <pre className="mt-2 p-3 bg-black/30 rounded text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(JSON.parse(tx.metadata), null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Notifications Section Component
const NotificationsSection: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  React.useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/user/notifications?unread_only=${filter === 'unread'}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE_URL}/api/user/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Notifications</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all ${
                notification.is_read
                  ? 'bg-white/5 border-white/10'
                  : 'bg-indigo-500/10 border-indigo-400/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">{notification.title}</h3>
                  <p className="text-sm text-slate-300 mb-2">{notification.content}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-400/30"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Settings Section Component
const SettingsSection: React.FC = () => {
  const [showIntroAlways, setShowIntroAlways] = useState(() => {
    return localStorage.getItem('showIntroAlways') === 'true';
  });

  const handleToggle = () => {
    const newValue = !showIntroAlways;
    setShowIntroAlways(newValue);
    localStorage.setItem('showIntroAlways', String(newValue));
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h2 className="text-2xl font-serif text-white mb-6">Settings</h2>

      <div className="space-y-6">
        {/* 开屏页面设置 */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-white mb-2">Intro Animation</h3>
              <p className="text-sm text-slate-300">
                Show the particle intro animation every time you visit the site
              </p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showIntroAlways ? 'bg-indigo-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showIntroAlways ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Moderation Section Component
const ModerationSection: React.FC = () => {
  return <ModerationPanel />;
};

export default UserProfile;
