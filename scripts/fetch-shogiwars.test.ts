import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, readdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { parseMove, convertToJKF, getNextId, updateIndex } from './fetch-shogiwars';

describe('fetch-shogiwars', () => {
    const testDir = join(process.cwd(), 'test-kifus');
    const testIndexPath = join(testDir, 'index.json');

    beforeEach(() => {
        // テスト用ディレクトリを作成
        if (!existsSync(testDir)) {
            mkdirSync(testDir, { recursive: true });
        }

        // 空のindex.jsonを作成
        writeFileSync(testIndexPath, JSON.stringify([], null, 2));
    });

    afterEach(() => {
        // テストファイルをクリーンアップ
        if (existsSync(testDir)) {
            const files = readdirSync(testDir);
            files.forEach(file => {
                unlinkSync(join(testDir, file));
            });
            rmdirSync(testDir);
        }
    });

    describe('parseMove', () => {
        it('先手の通常移動を正しくパースできる', () => {
            const result = parseMove('+7968KI');

            expect(result).toEqual({
                move: {
                    from: { x: 7, y: 9 },
                    to: { x: 6, y: 8 },
                    piece: 'KI',
                    color: 0
                }
            });
        });

        it('後手の通常移動を正しくパースできる', () => {
            const result = parseMove('-3142GI');

            expect(result).toEqual({
                move: {
                    from: { x: 3, y: 1 },
                    to: { x: 4, y: 2 },
                    piece: 'GI',
                    color: 1
                }
            });
        });

        it('先手の駒打ちを正しくパースできる', () => {
            const result = parseMove('+0067KE');

            expect(result).toEqual({
                move: {
                    to: { x: 6, y: 7 },
                    piece: 'KE',
                    color: 0
                }
            });
        });

        it('後手の駒打ちを正しくパースできる', () => {
            const result = parseMove('-0055FU');

            expect(result).toEqual({
                move: {
                    to: { x: 5, y: 5 },
                    piece: 'FU',
                    color: 1
                }
            });
        });
    });

    describe('convertToJKF', () => {
        it('将棋ウォーズ形式をJKF形式に変換できる', () => {
            const swData = {
                gameHash: {
                    name: 'player1-player2-20251206_103000',
                    sente: 'player1',
                    gote: 'player2',
                    result: 'SENTE_WIN_TORYO',
                    moves: [
                        { t: 175, n: 0, m: '+7968GI' },
                        { t: 164, n: 1, m: '-0055KE' }
                    ]
                }
            };

            const result = convertToJKF(swData);

            expect(result.header['棋戦']).toBe('将棋ウォーズ');
            expect(result.header['先手']).toBe('player1');
            expect(result.header['後手']).toBe('player2');
            expect(result.header['結果']).toBe('先手勝ち（投了）');
            expect(result.moves).toHaveLength(3); // 0手目 + 2手
            expect(result.moves[0]).toEqual({});
            expect(result.moves[1].move?.piece).toBe('GI');
            expect(result.moves[1].time?.now).toBe(175);
            expect(result.moves[2].move?.piece).toBe('KE');
        });

        it('指し手がない対局を処理できる', () => {
            const swData = {
                gameHash: {
                    name: 'player1-player2-20251206_103000',
                    sente: 'player1',
                    gote: 'player2',
                    result: 'SENTE_WIN_TORYO',
                    moves: []
                }
            };

            const result = convertToJKF(swData);

            expect(result.moves).toHaveLength(1); // 0手目のみ
            expect(result.moves[0]).toEqual({});
        });

        it('後手勝ちの結果を正しく設定できる', () => {
            const swData = {
                gameHash: {
                    name: 'test-game-20251206_103000',
                    sente: 'player1',
                    gote: 'player2',
                    result: 'GOTE_WIN_TORYO',
                    moves: []
                }
            };

            const result = convertToJKF(swData);

            expect(result.header['結果']).toBe('後手勝ち（投了）');
        });

        it('先手勝ち（詰み）の結果を正しく設定できる', () => {
            const swData = {
                gameHash: {
                    name: 'test-game-20251206_103000',
                    sente: 'player1',
                    gote: 'player2',
                    result: 'SENTE_WIN_CHECKMATE',
                    moves: []
                }
            };

            const result = convertToJKF(swData);

            expect(result.header['結果']).toBe('先手勝ち（詰み）');
        });

        it('後手勝ち（詰み）の結果を正しく設定できる', () => {
            const swData = {
                gameHash: {
                    name: 'test-game-20251206_103000',
                    sente: 'player1',
                    gote: 'player2',
                    result: 'GOTE_WIN_CHECKMATE',
                    moves: []
                }
            };

            const result = convertToJKF(swData);

            expect(result.header['結果']).toBe('後手勝ち（詰み）');
        });

        it('先手勝ち（時間切れ）の結果を正しく設定できる', () => {
            const swData = {
                gameHash: {
                    name: 'test-game-20251206_103000',
                    sente: 'player1',
                    gote: 'player2',
                    result: 'SENTE_WIN_TIMEOUT',
                    moves: []
                }
            };

            const result = convertToJKF(swData);

            expect(result.header['結果']).toBe('先手勝ち（時間切れ）');
        });

        it('後手勝ち（時間切れ）の結果を正しく設定できる', () => {
            const swData = {
                gameHash: {
                    name: 'test-game-20251206_103000',
                    sente: 'player1',
                    gote: 'player2',
                    result: 'GOTE_WIN_TIMEOUT',
                    moves: []
                }
            };

            const result = convertToJKF(swData);

            expect(result.header['結果']).toBe('後手勝ち（時間切れ）');
        });
    });

    describe('getNextId', () => {
        it('index.jsonが空の場合は"001"を返す', () => {
            const result = getNextId(testIndexPath);
            expect(result).toBe('001');
        });

        it('index.jsonにエントリがある場合は次のIDを返す', () => {
            const indexData = [
                { id: '001', date: '2025-12-01', sente: 'p1', gote: 'p2', result: '先手勝ち', moves: 50 },
                { id: '002', date: '2025-12-02', sente: 'p1', gote: 'p2', result: '先手勝ち', moves: 50 },
                { id: '003', date: '2025-12-03', sente: 'p1', gote: 'p2', result: '先手勝ち', moves: 50 }
            ];
            writeFileSync(testIndexPath, JSON.stringify(indexData, null, 2));

            const result = getNextId(testIndexPath);
            expect(result).toBe('004');
        });

        it('連番でないIDを処理できる', () => {
            const indexData = [
                { id: '001', date: '2025-12-01', sente: 'p1', gote: 'p2', result: '先手勝ち', moves: 50 },
                { id: '005', date: '2025-12-05', sente: 'p1', gote: 'p2', result: '先手勝ち', moves: 50 },
                { id: '003', date: '2025-12-03', sente: 'p1', gote: 'p2', result: '先手勝ち', moves: 50 }
            ];
            writeFileSync(testIndexPath, JSON.stringify(indexData, null, 2));

            const result = getNextId(testIndexPath);
            expect(result).toBe('006'); // max + 1
        });

        it('index.jsonが存在しない場合は"001"を返す', () => {
            unlinkSync(testIndexPath);

            const result = getNextId(testIndexPath);
            expect(result).toBe('001');
        });
    });

    describe('updateIndex', () => {
        it('新しいエントリをindexに追加できる', () => {
            const jkfData = {
                header: {
                    '先手': 'player1',
                    '後手': 'player2',
                    '結果': '先手勝ち'
                },
                moves: [
                    {},
                    { move: { to: { x: 7, y: 7 }, piece: 'FU', color: 0 } },
                    { move: { to: { x: 7, y: 6 }, piece: 'FU', color: 1 } }
                ] // 2手
            };

            updateIndex('001', '2025-12-06', jkfData, testIndexPath);

            const indexData = JSON.parse(readFileSync(testIndexPath, 'utf-8'));
            expect(indexData).toHaveLength(1);
            expect(indexData[0]).toEqual({
                id: '001',
                date: '2025-12-06',
                sente: 'player1',
                gote: 'player2',
                result: '先手勝ち',
                moves: 2
            });
        });

        it('エントリを日付順（新しい順）にソートできる', () => {
            const existingData = [
                { id: '001', date: '2025-12-01', sente: 'p1', gote: 'p2', result: '先手勝ち', moves: 50 }
            ];
            writeFileSync(testIndexPath, JSON.stringify(existingData, null, 2));

            const jkfData = {
                header: {
                    '先手': 'player3',
                    '後手': 'player4',
                    '結果': '後手勝ち'
                },
                moves: [
                    {},
                    { move: { to: { x: 5, y: 5 }, piece: 'FU', color: 0 } }
                ]
            };

            updateIndex('002', '2025-12-06', jkfData, testIndexPath);

            const indexData = JSON.parse(readFileSync(testIndexPath, 'utf-8'));
            expect(indexData).toHaveLength(2);
            expect(indexData[0].id).toBe('002'); // 新しいエントリが先頭
            expect(indexData[0].date).toBe('2025-12-06');
            expect(indexData[1].id).toBe('001');
        });
    });
});
