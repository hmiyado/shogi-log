// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { useShogiGame, UseShogiGameResult } from './useShogiGame';
import type { JKFData } from '../types/kifu';

const mockKifuData: JKFData = {
    header: {},
    moves: [
        { comments: [] }, // 0: 初期局面
        { move: { to: { x: 7, y: 6 }, from: { x: 7, y: 7 }, piece: 'FU' } }, // 1: 76歩
        { move: { to: { x: 3, y: 4 }, from: { x: 3, y: 3 }, piece: 'FU' } }, // 2: 34歩
    ]
};

// Simple hook runner for Preact
function setupHook(kifuData: JKFData) {
    const result = { current: null as unknown as UseShogiGameResult };

    function TestComponent() {
        result.current = useShogiGame(kifuData);
        return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
        render(<TestComponent />, container);
    });

    return {
        result,
        container,
        unmount: () => {
            render(null, container);
            document.body.removeChild(container);
        }
    };
}

describe('useShogiGame', () => {
    it('初期手数が0で初期化される', () => {
        const { result, unmount } = setupHook(mockKifuData);

        expect(result.current.currentMoveIndex).toBe(0);
        // 初期局面の確認 (77歩がいるはず)
        const pawn77 = result.current.shogi.get(7, 7);
        expect(pawn77).not.toBeNull();
        expect(pawn77?.kind).toBe('FU');

        unmount();
    });

    it('nextMoveで手が進む', () => {
        const { result, unmount } = setupHook(mockKifuData);

        act(() => {
            result.current.nextMove();
        });

        expect(result.current.currentMoveIndex).toBe(1);
        // 1手目: 76歩 (77から移動)
        const pawn76 = result.current.shogi.get(7, 6);
        expect(pawn76).not.toBeNull();
        expect(pawn76?.kind).toBe('FU');
        // 元の場所は空
        expect(result.current.shogi.get(7, 7)).toBeNull();

        unmount();
    });

    it('previousMoveで手が戻る', () => {
        const { result, unmount } = setupHook(mockKifuData);

        // 1手進める
        act(() => {
            result.current.nextMove();
        });
        expect(result.current.currentMoveIndex).toBe(1);

        // 戻る
        act(() => {
            result.current.previousMove();
        });

        expect(result.current.currentMoveIndex).toBe(0);
        // 77に歩が戻っているか
        expect(result.current.shogi.get(7, 7)).not.toBeNull();
        expect(result.current.shogi.get(7, 6)).toBeNull();

        unmount();
    });

    it('resetToMoveで特定の手数へジャンプする', () => {
        const { result, unmount } = setupHook(mockKifuData);

        act(() => {
            result.current.resetToMove(2);
        });

        expect(result.current.currentMoveIndex).toBe(2);
        // 2手目までの状態 (76歩, 34歩)
        expect(result.current.shogi.get(7, 6)).not.toBeNull(); // 76歩
        expect(result.current.shogi.get(3, 4)).not.toBeNull(); // 34歩

        unmount();
    });

    it('最後の手以降には進まない', () => {
        const { result, unmount } = setupHook(mockKifuData);

        // 最後まで進める
        act(() => {
            result.current.resetToMove(2);
        });

        act(() => {
            result.current.nextMove();
        });

        expect(result.current.currentMoveIndex).toBe(2);

        unmount();
    });

    it('最初の手以前には戻らない', () => {
        const { result, unmount } = setupHook(mockKifuData);

        act(() => {
            result.current.previousMove();
        });

        expect(result.current.currentMoveIndex).toBe(0);

        unmount();
    });
});
