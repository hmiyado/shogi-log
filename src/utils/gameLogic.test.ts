import { describe, it, expect } from 'vitest';
import { formatMove } from './gameLogic';

describe('formatMove', () => {
    it('先手の通常移動を正しくフォーマットできる', () => {
        const move = {
            color: 0,
            from: { x: 2, y: 7 },
            to: { x: 2, y: 6 },
            piece: 'FU'
        };
        expect(formatMove(move)).toBe('▲26歩');
    });

    it('後手の通常移動を正しくフォーマットできる', () => {
        const move = {
            color: 1,
            from: { x: 3, y: 3 },
            to: { x: 3, y: 4 },
            piece: 'FU'
        };
        expect(formatMove(move)).toBe('△34歩');
    });

    it('成りを正しくフォーマットできる', () => {
        const move = {
            color: 0,
            from: { x: 8, y: 8 },
            to: { x: 2, y: 3 },
            piece: 'KA',
            promote: true
        };
        expect(formatMove(move)).toBe('▲23角成');
    });

    it('「同」を正しく処理できる', () => {
        const prevMove = {
            to: { x: 2, y: 3 }
        };
        const move = {
            color: 1,
            from: { x: 2, y: 2 },
            to: { x: 2, y: 3 },
            piece: 'FU'
        };
        expect(formatMove(move, prevMove)).toBe('△同歩');
    });

    it('駒打ちを正しくフォーマットできる', () => {
        const move = {
            color: 0,
            to: { x: 5, y: 5 },
            piece: 'KE'
            // no from property
        };
        expect(formatMove(move)).toBe('▲55桂打');
    });
});
