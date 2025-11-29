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