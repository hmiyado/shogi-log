// 駒の日本語表記
export const PIECE_NAMES: Record<string, string> = {
    FU: '歩',
    KY: '香',
    KE: '桂',
    GI: '銀',
    KI: '金',
    KA: '角',
    HI: '飛',
    OU: '王',
    TO: 'と',
    NY: '杏',
    NK: '圭',
    NG: '全',
    UM: '馬',
    RY: '龍',
};

// 成り駒の判定
export function isPromoted(piece: string): boolean {
    return ['TO', 'NY', 'NK', 'NG', 'UM', 'RY'].includes(piece);
}

// 駒の表示名を取得
export function getPieceName(piece: string): string {
    return PIECE_NAMES[piece] || piece;
}

// 座標を将棋の表記に変換 (例: x=7, y=7 -> "７七")
export function positionToJapanese(x: number, y: number): string {
    const xKanji = ['', '１', '２', '３', '４', '５', '６', '７', '８', '９'];
    const yKanji = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return `${xKanji[x]}${yKanji[y]}`;
}
