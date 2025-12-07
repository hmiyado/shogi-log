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

// 座標をアラビア数字で表記 (例: x=2, y=6 -> "26")
export function positionToArabic(x: number, y: number): string {
    return `${x}${y}`;
}

// 指し手文字列を生成 (例: ▲26歩, △34歩, ▲同歩)
// simple: 略記（26歩など）、full: 詳細（▲26歩）
export function formatMove(move: any, prevMove: any = null): string {
    if (!move) return '';

    const isSente = move.color === 0;
    const mark = isSente ? '▲' : '△';
    let text = mark;

    // 同位置への移動
    if (prevMove && prevMove.to && move.to && prevMove.to.x === move.to.x && prevMove.to.y === move.to.y) {
        text += '同';
    } else if (move.to) {
        text += positionToArabic(move.to.x, move.to.y);
    }

    // 駒名
    let pieceName = PIECE_NAMES[move.piece] || move.piece;
    if (move.promote) {
        pieceName += '成';
    }
    text += pieceName;

    // 打つ場合 (移動元がない)
    if (!move.from) {
        text += '打';
    }

    return text;
}
