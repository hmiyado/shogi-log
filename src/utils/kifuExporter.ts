import type { JKFData, JKFMove } from '../types/kifu';
import { PIECE_NAMES, positionToJapanese } from './gameLogic';

/**
 * JKFデータをKIF形式の文字列に変換する
 */
export function exportKIF(jkf: JKFData): string {
    const lines: string[] = [];

    // ヘッダー
    const header = jkf.header;
    if (header) {
        for (const [key, value] of Object.entries(header)) {
            lines.push(`${key}：${value}`);
        }
    }

    // 初期局面 (SFEN or 平手)
    // KIF形式では通常、平手の場合は何も書かないか「手合割：平手」
    // SFENがある場合は特殊な対応が必要だが、KIFの標準的なヘッダーで表現するのは難しい場合がある
    // ここではヘッダーに含まれていることを期待する

    lines.push('手数----指手---------消費時間--');

    // 指し手
    let moveCount = 0; // 開始局面は0手目
    let prevMove: JKFMove['move'] | null = null;

    for (const moveData of jkf.moves) {
        // 0手目（初期配置）はスキップ、ただしコメントなどがある場合は考慮が必要だが
        // JKFの仕様上、moves[0]は通常空または特殊
        if (moveCount === 0) {
            moveCount++;
            continue;
        }

        const move = moveData.move;
        if (!move) {
            // 中断、投了など
            if (moveData.special) {
                // TORYO, CHUDAN etc.
                // KIFでは特殊な記述になる
                // ここでは簡易的に出力しない、または必要に応じて実装
                // console.log('Special move:', moveData.special);
            }
            continue;
        }

        let moveStr = '';

        // 座標
        if (move.to) {
            // 同位置の場合は「同」
            if (prevMove && prevMove.to && prevMove.to.x === move.to.x && prevMove.to.y === move.to.y) {
                moveStr += '同　';
            } else {
                moveStr += positionToJapanese(move.to.x, move.to.y);
            }
        }

        // 駒名
        let pieceName = PIECE_NAMES[move.piece] || move.piece;

        // 成り
        if (move.promote) {
            pieceName += '成';
        }

        moveStr += pieceName;

        // 打つ
        if (!move.from) {
            moveStr += '打';
        } else {
            // 成らず (KIFでは通常明示しないが、文脈によっては「不成」)
            // ここではシンプルに

            // 移動元
            moveStr += `(${move.from.x}${move.from.y})`;
        }

        // 行を追加
        lines.push(`${String(moveCount).padStart(4, ' ')} ${moveStr}`);

        prevMove = move;
        moveCount++;
    }

    return lines.join('\n');
}
