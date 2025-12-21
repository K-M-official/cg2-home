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