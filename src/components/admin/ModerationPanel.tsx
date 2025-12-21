import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Filter, Search } from 'lucide-react';

type ContentType = 'gallery' | 'timeline' | 'tribute';
type FilterType = 'all' | 'my_reviews' | 'pending' | 'approved' | 'rejected' | 'my_rejected';

interface ModerationItem {
  id: number;
  item_id: number;
  item_title: string;
  user_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: number;
  approved_by: number | null;
  // Type-specific fields
  image_url?: string;
  caption?: string;
  year?: number;
  title?: string;
  description?: string;
  content?: string;
  author_name?: string;
}

export const ModerationPanel: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>('gallery');
  const [filter, setFilter] = useState<FilterType>('pending');
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadItems();
    loadStats();
  }, [contentType, filter]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/moderation-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/admin/moderation?type=${contentType}&filter=${filter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: contentType, id, action, reason })
      });

      // Reload items and stats
      loadItems();
      loadStats();
    } catch (error) {
      console.error('Moderation failed:', error);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-white mb-2">Moderation Panel</h2>
        <p className="text-slate-300">Review and moderate user-submitted content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-amber-500/20 border border-amber-400/30 rounded-lg">
          <div className="text-2xl font-bold text-amber-300">{stats.pending}</div>
          <div className="text-sm text-amber-200">Pending Review</div>
        </div>
        <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
          <div className="text-2xl font-bold text-green-300">{stats.approved}</div>
          <div className="text-sm text-green-200">Approved</div>
        </div>
        <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
          <div className="text-2xl font-bold text-red-300">{stats.rejected}</div>
          <div className="text-sm text-red-200">Rejected</div>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="flex gap-2 mb-4 border-b border-white/20">
        {(['gallery', 'timeline', 'tribute'] as ContentType[]).map(type => (
          <button
            key={type}
            onClick={() => setContentType(type)}
            className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
              contentType === type
                ? 'text-indigo-300 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Filter className="w-4 h-4 inline mr-2" />
          Pending
        </button>
        <button
          onClick={() => setFilter('my_reviews')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'my_reviews'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          My Reviews
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-green-500/20 text-green-300 border border-green-400/30'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'rejected'
              ? 'bg-red-500/20 text-red-300 border border-red-400/30'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          All Rejected
        </button>
        <button
          onClick={() => setFilter('my_rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'my_rejected'
              ? 'bg-red-500/20 text-red-300 border border-red-400/30'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          My Rejected
        </button>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No items found for this filter
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <ModerationCard
              key={item.id}
              item={item}
              contentType={contentType}
              onModerate={handleModerate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Moderation Card Component
interface ModerationCardProps {
  item: ModerationItem;
  contentType: ContentType;
  onModerate: (id: number, action: 'approve' | 'reject', reason?: string) => void;
}

const ModerationCard: React.FC<ModerationCardProps> = ({ item, contentType, onModerate }) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState('');

  const handleApprove = () => {
    onModerate(item.id, 'approve');
  };

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    onModerate(item.id, 'reject', reason);
    setShowRejectInput(false);
    setReason('');
  };

  const isPending = item.status === 'pending';

  return (
    <div className={`p-6 rounded-lg border-2 transition-all ${
      item.status === 'approved' ? 'bg-green-500/10 border-green-400/30' :
      item.status === 'rejected' ? 'bg-red-500/10 border-red-400/30' :
      'bg-white/5 border-white/20 hover:border-indigo-400/50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-white">{item.item_title}</h3>
          <p className="text-sm text-slate-400">
            Submitted by: {item.user_email || 'Anonymous'} • {new Date(item.created_at).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
          item.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
          'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        }`}>
          {item.status}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        {contentType === 'gallery' && (
          <div>
            <img
              src={item.image_url}
              alt="Preview"
              className="w-full max-w-md h-64 object-cover rounded-lg mb-2"
            />
            <p className="text-sm text-slate-300 mb-1">
              <span className="font-medium text-slate-200">Caption:</span> {item.caption || 'No caption provided'}
            </p>
            <p className="text-xs text-slate-400">
              <span className="font-medium text-slate-300">Year:</span> {item.year || 'Not specified'}
            </p>
          </div>
        )}

        {contentType === 'timeline' && (
          <div>
            <h4 className="font-medium text-white mb-1">{item.title}</h4>
            <p className="text-sm text-slate-300 mb-2">{item.description}</p>
            {item.year && <p className="text-xs text-slate-400">Date: {item.year}</p>}
            {item.image_url && (
              <img src={item.image_url} alt="Event" className="w-full max-w-md h-48 object-cover rounded-lg mt-2" />
            )}
          </div>
        )}

        {contentType === 'tribute' && (
          <div>
            <p className="text-slate-300 mb-2 italic">"{item.content}"</p>
            <p className="text-xs text-slate-400">
              <span className="font-medium text-slate-300">By:</span> {item.user_email || 'Anonymous User'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex items-center gap-3">
          {showRejectInput && (
            <input
              type="text"
              placeholder="Reason for rejection (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          )}
          <button
            onClick={handleApprove}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
          >
            <XCircle className="w-4 h-4" />
            {showRejectInput ? 'Confirm Reject' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;
