import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { ModerationPanel } from '../components/admin/ModerationPanel';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'moderation'>('profile');
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

        const response = await fetch('/api/auth/verify', {
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
      <div className="min-h-screen pt-24 flex items-center justify-center">
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
    { id: 'notifications', label: 'Notifications', icon: Bell, show: true },
    { id: 'moderation', label: 'Moderation', icon: Shield, show: isModerator },
  ];

  return (
    <div className="min-h-screen pt-24">
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
            {activeSection === 'notifications' && <NotificationsSection />}
            {activeSection === 'moderation' && isModerator && <ModerationSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Section Component
const ProfileSection: React.FC<{ user: any }> = ({ user }) => {
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
      </div>
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
      const response = await fetch(`/api/user/notifications?unread_only=${filter === 'unread'}`, {
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
      await fetch(`/api/user/notifications/${id}/read`, {
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

// Moderation Section Component
const ModerationSection: React.FC = () => {
  return <ModerationPanel />;
};

export default UserProfile;
