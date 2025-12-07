// 棋譜メタデータ（インデックス用）
export interface KifuMetadata {
    id: string;
    date: string; // YYYY-MM-DD
    sente: string;
    gote: string;
    result: string;
    moves: number;
    opening?: string;
}

// JSON Kifu Format (JKF) の型定義
export interface JKFHeader {
    先手?: string;
    後手?: string;
    開始日時?: string;
    棋戦?: string;
    手合割?: string;
    [key: string]: string | undefined;
}

export interface JKFPosition {
    x: number;
    y: number;
}

export interface JKFMove {
    from?: JKFPosition;
    to: JKFPosition;
    piece: string;
    promote?: boolean;
    same?: boolean;
    capture?: string;
}

export interface JKFMoveData {
    move?: JKFMove;
    time?: {
        now?: { m: number; s: number };
        total?: { h?: number; m: number; s: number };
    };
    comments?: string[];
}

export interface JKFData {
    header: JKFHeader;
    initial?: {
        preset: string;
        data?: {
            sfen?: string;
            [key: string]: any;
        };
    };
    moves: JKFMoveData[];
}
