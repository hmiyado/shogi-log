import { describe, it, expect } from 'vitest';
import { convertToJKF } from './fetch-shogiwars';

describe('SFEN初期局面のサポート', () => {
    it('init_sfen_positionがある場合、initialフィールドに設定される', () => {
        const swData = {
            gameHash: {
                name: 'player1-player2-20251206_103000',
                sente: 'player1',
                gote: 'player2',
                result: 'SENTE_WIN_TORYO',
                moves: [],
                init_sfen_position: 'lk1g3nl/1s5R1/1pg1p1+P1p/p1p3P2/4Np3/P1PpP3P/1P3P3/1SS+b5/LKGS1r+bNL b 2Ppng 1'
            }
        };

        const result = convertToJKF(swData) as any;

        expect(result.initial).toBeDefined();
        expect(result.initial.data.sfen).toBe('lk1g3nl/1s5R1/1pg1p1+P1p/p1p3P2/4Np3/P1PpP3P/1P3P3/1SS+b5/LKGS1r+bNL b 2Ppng 1');
    });

    it('init_sfen_positionがない場合、initialフィールドは設定されない', () => {
        const swData = {
            gameHash: {
                name: 'player1-player2-20251206_103000',
                sente: 'player1',
                gote: 'player2',
                result: 'SENTE_WIN_TORYO',
                moves: []
            }
        };

        const result = convertToJKF(swData) as any;

        expect(result.initial).toBeUndefined();
    });
});
