#!/usr/bin/env tsx

/**
 * 将棋ウォーズのURLから棋譜を取得してJKF形式に変換するスクリプト
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Window } from 'happy-dom';
import { Shogi } from 'shogi.js';

interface ShogiWarsMove {
    t: number;
    n: number;
    m: string;
}

interface ShogiWarsGameHash {
    name: string;
    sente: string;
    gote: string;
    result: string;
    moves: ShogiWarsMove[];
    init_sfen_position?: string;
}

interface ShogiWarsData {
    gameHash: ShogiWarsGameHash;
}

interface JKFMove {
    move?: {
        from?: { x: number; y: number };
        to: { x: number; y: number };
        piece: string;
        color: number;
    };
    time?: { now: number };
}

interface JKFData {
    header: Record<string, string>;
    moves: JKFMove[];
}

interface KifuMetadata {
    id: string;
    date: string;
    sente: string;
    gote: string;
    result: string;
    moves: number;
}

/**
 * 将棋ウォーズの指し手文字列をJKF形式に変換
 * 例: "+7968KI" -> {from: {x:7, y:9}, to: {x:6, y:8}, piece: "KI"}
 */
export function parseMove(moveStr: string): JKFMove {
    const isBlack = moveStr.startsWith('+');
    const moveData = moveStr.slice(1); // +/- を除去

    // 駒打ちの場合: "0067KE"
    if (moveData.startsWith('00')) {
        const toX = parseInt(moveData[2]);
        const toY = parseInt(moveData[3]);
        const piece = moveData.slice(4);

        return {
            move: {
                to: { x: toX, y: toY },
                piece: piece,
                color: isBlack ? 0 : 1
            }
        };
    }

    // 通常の移動: "7968KI"
    const fromX = parseInt(moveData[0]);
    const fromY = parseInt(moveData[1]);
    const toX = parseInt(moveData[2]);
    const toY = parseInt(moveData[3]);
    const piece = moveData.slice(4);

    return {
        move: {
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
            piece: piece,
            color: isBlack ? 0 : 1
        }
    };
}

/**
 * 将棋ウォーズ形式からJKF形式に変換
 */
export function convertToJKF(swData: ShogiWarsData): JKFData {
    const gameHash = swData.gameHash;

    // ヘッダー情報を作成
    const header: Record<string, string> = {
        '棋戦': '将棋ウォーズ',
        '先手': gameHash.sente,
        '後手': gameHash.gote,
        '開始日時': gameHash.name.split('-').pop()?.replace(/_/g, ' ') || '',
    };

    // 結果を設定
    if (gameHash.result === 'SENTE_WIN_TORYO') {
        header['結果'] = '先手勝ち';
    } else if (gameHash.result === 'GOTE_WIN_TORYO') {
        header['結果'] = '後手勝ち';
    }

    // 初期局面を設定（SFEN形式がある場合）
    let initial: any = undefined;
    const shogi = new Shogi();

    if (gameHash.init_sfen_position) {
        initial = {
            data: {
                sfen: gameHash.init_sfen_position
            }
        };
        header['手合割'] = '平手';
        try {
            shogi.initializeFromSFENString(gameHash.init_sfen_position);
        } catch (e) {
            console.error('SFEN parsing failed, falling back to HIRATE', e);
            shogi.initialize();
        }
    } else {
        shogi.initialize();
    }

    // 指し手を変換
    const moves: JKFMove[] = [{}]; // JKFは0手目が空オブジェクト

    if (gameHash.moves && Array.isArray(gameHash.moves)) {
        for (const swMove of gameHash.moves) {
            const jkfMove = parseMove(swMove.m);
            const move = jkfMove.move;

            if (move) {
                if (move.from) {
                    // 盤上の駒を取得
                    const pieceOnBoard = shogi.get(move.from.x, move.from.y);

                    if (pieceOnBoard) {
                        // 盤上の駒と移動後の駒が異なる場合は「成り」と判定
                        if (pieceOnBoard.kind !== move.piece) {
                            // JKF形式では「移動する前の駒種」と「promote: true」を記録する
                            move.piece = pieceOnBoard.kind;
                            (move as any).promote = true;
                        } else {
                            // 成らない場合でも、元の駒種を使う（念のため）
                            move.piece = pieceOnBoard.kind;
                        }
                    }

                    // 内部状態を更新
                    try {
                        shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, (move as any).promote || false);
                    } catch (e) {
                        console.error('Move error:', e);
                    }
                } else {
                    // 駒打ち
                    try {
                        shogi.drop(move.to.x, move.to.y, move.piece as any);
                    } catch (e) {
                        console.error('Drop error:', e);
                    }
                }

                if (swMove.t) {
                    jkfMove.time = { now: swMove.t };
                }
                moves.push(jkfMove);
            }
        }
    }

    const result: JKFData = {
        header: header,
        moves: moves
    };

    // 初期局面がある場合は追加
    if (initial) {
        (result as any).initial = initial;
    }

    return result;
}

/**
 * 次のIDを取得
 */
export function getNextId(indexPath: string = join(process.cwd(), 'public/kifus/index.json')): string {
    if (!existsSync(indexPath)) {
        return '001';
    }

    const indexData: KifuMetadata[] = JSON.parse(readFileSync(indexPath, 'utf-8'));

    if (indexData.length === 0) {
        return '001';
    }

    // 最大のIDを取得
    const maxId = Math.max(...indexData.map(k => parseInt(k.id)));
    return String(maxId + 1).padStart(3, '0');
}

/**
 * index.jsonを更新
 */
export function updateIndex(
    id: string,
    date: string,
    jkfData: JKFData,
    indexPath: string = join(process.cwd(), 'public/kifus/index.json')
): void {
    let indexData: KifuMetadata[] = [];

    if (existsSync(indexPath)) {
        indexData = JSON.parse(readFileSync(indexPath, 'utf-8'));
    }

    const metadata: KifuMetadata = {
        id: id,
        date: date,
        sente: jkfData.header['先手'] || '不明',
        gote: jkfData.header['後手'] || '不明',
        result: jkfData.header['結果'] || '不明',
        moves: jkfData.moves.length - 1
    };

    indexData.push(metadata);

    // 日付順にソート（新しい順）
    indexData.sort((a, b) => b.date.localeCompare(a.date));

    writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log(`✓ Updated index.json`);
}

/**
 * メイン処理
 */
export async function fetchAndConvert(url: string): Promise<{
    id: string;
    date: string;
    filename: string;
    jkfData: JKFData;
}> {
    // URLからHTMLを取得
    const response = await fetch(url);
    const html = await response.text();

    // happy-domでパース
    const window = new Window();
    window.document.write(html);

    // data-react-props属性を持つ要素を探す
    const propsElement = window.document.querySelector('[data-react-props]');

    if (!propsElement) {
        throw new Error('data-react-props not found in the page');
    }

    // JSONをパース
    const propsJson = propsElement.getAttribute('data-react-props');
    if (!propsJson) {
        throw new Error('data-react-props attribute is empty');
    }

    const swData: ShogiWarsData = JSON.parse(propsJson);

    console.log('✓ Fetched game data');
    console.log(`  Players: ${swData.gameHash.sente} vs ${swData.gameHash.gote}`);
    console.log(`  Moves: ${swData.gameHash.moves?.length || 0}`);

    // JKF形式に変換
    const jkfData = convertToJKF(swData);

    // ファイル名を生成
    const id = getNextId();
    const date = new Date().toISOString().split('T')[0];
    const filename = `${id}_${date}.json`;
    const filepath = join(process.cwd(), 'public/kifus', filename);

    // JKFファイルを保存
    writeFileSync(filepath, JSON.stringify(jkfData, null, 2));
    console.log(`\n✓ Created: ${filename}`);

    // index.jsonを更新
    updateIndex(id, date, jkfData);

    console.log('\n=== Conversion Complete ===');

    return { id, date, filename, jkfData };
}

// CLIとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    const url = process.argv[2] || process.env.SHOGIWARS_URL;

    if (!url) {
        console.error('Error: URL is required');
        console.error('Usage: tsx fetch-shogiwars.ts <URL>');
        process.exit(1);
    }

    console.log('=== Shogi Wars Kifu Fetcher ===\n');
    console.log(`Fetching: ${url}\n`);

    fetchAndConvert(url).catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
}
