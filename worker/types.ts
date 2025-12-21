export type ItemGroup = {
    id: number;
    title: string;
    misc: string;
    description: string;
    created_at: string;
}

export type Item = {    
    id: number;
    group_id: number;
    title: string;
    misc: string;
    description: string;
    created_at: string;
}

export type ItemHeatRecordWindow = {
    id: number;
    item_id: number;
    delta: number;
    created_at: number;
    expired_at: number;
}

export type User = {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
}

export type EmailVerificationCode = {
    id: number;
    email: string;
    code: string;
    expires_at: number;
    created_at: number;
}

// ==================== Item Content Types ====================

export type ItemGalleryImage = {
    id: number;
    item_id: number;
    user_id: number | null;
    image_url: string;
    caption: string | null;
    year: number | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: number;
    approved_at: number | null;
    approved_by: number | null;
}

export type ItemTimelineEvent = {
    id: number;
    item_id: number;
    user_id: number | null;
    year: number;
    month: number | null;
    day: number | null;
    title: string;
    description: string;
    image_url: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: number;
    updated_at: number;
    approved_at: number | null;
    approved_by: number | null;
}

export type ItemTribute = {
    id: number;
    item_id: number;
    user_id: number | null;
    author_name: string | null;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: number;
    updated_at: number;
    approved_at: number | null;
    approved_by: number | null;
}

export type ItemModerationLog = {
    id: number;
    content_type: 'gallery' | 'timeline' | 'tribute';
    content_id: number;
    moderator_id: number;
    action: 'approve' | 'reject';
    reason: string | null;
    created_at: number;
}

// ==================== User Roles & Notifications ====================

export type UserRole = {
    id: number;
    user_id: number;
    role: string;
    granted_by: number | null;
    granted_at: number;
    expires_at: number | null;
}

export type UserNotification = {
    id: number;
    user_id: number;
    type: string;
    title: string;
    content: string;
    link: string | null;
    metadata: string | null;
    is_read: number;
    created_at: number;
    read_at: number | null;
}