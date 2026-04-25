import { useState } from 'preact/hooks';
import { Shogi } from 'shogi.js';
import type { JKFData, JKFMoveData, JKFPosition } from '../types/kifu';

export interface UseShogiGameResult {
    shogi: Shogi;
    currentMoveIndex: number;
    nextMove: () => void;
    previousMove: () => void;
    resetToMove: (index: number) => void;
}

export function useShogiGame(kifuData: JKFData): UseShogiGameResult {
    const moves = kifuData.moves;

    const [shogi, setShogi] = useState<Shogi>(() => {
        const initial = kifuData.initial;
        const shogiInstance = new Shogi();
        if (initial?.data?.sfen) {
            try {
                shogiInstance.initializeFromSFENString(initial.data.sfen);
            } catch (error) {
                console.error('Failed to initialize from SFEN:', error);
                shogiInstance.initialize();
            }
        }
        return shogiInstance;
    });

    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

    // 手を適用する内部関数
    const applyMove = (shogiInstance: Shogi, moveData: JKFMoveData, prevTo?: JKFPosition) => {
        const move = moveData.move;
        if (!move) return;

        const to = move.to ?? prevTo;
        if (!to) return;

        if (move.from) {
            const pieceAtSource = shogiInstance.get(move.from.x, move.from.y);
            let shouldPromote = move.promote;

            // プロモーションフラグがない場合、駒の種類が変わっているかチェックして自動判定
            if (!shouldPromote && pieceAtSource) {
                const boardPieceKind = pieceAtSource.kind;
                const movePieceKind = move.piece;

                const promotionMap: { [key: string]: string } = {
                    'FU': 'TO',
                    'KY': 'NY',
                    'KE': 'NK',
                    'GI': 'NG',
                    'KA': 'UM',
                    'HI': 'RY',
                };

                if (promotionMap[boardPieceKind] === movePieceKind) {
                    shouldPromote = true;
                }
            }

            shogiInstance.move(move.from.x, move.from.y, to.x, to.y, shouldPromote || false);
        } else {
            shogiInstance.drop(to.x, to.y, move.piece as any);
        }
    };

    const resetToMove = (moveIndex: number) => {
        if (moveIndex < 0 || moveIndex >= moves.length) return;

        const initial = kifuData.initial;
        const newShogi = new Shogi();

        if (initial?.data?.sfen) {
            try {
                newShogi.initializeFromSFENString(initial.data.sfen);
            } catch (error) {
                console.error('Failed to initialize from SFEN:', error);
                newShogi.initialize();
            }
        }

        let prevTo: JKFPosition | undefined;
        for (let i = 1; i <= moveIndex; i++) {
            const moveData = moves[i];
            if (moveData && moveData.move) {
                try {
                    applyMove(newShogi, moveData, prevTo);
                    prevTo = moveData.move.to ?? prevTo;
                } catch (error) {
                    console.error('Error resetting to move:', error);
                    break;
                }
            }
        }

        setShogi(newShogi);
        setCurrentMoveIndex(moveIndex);
    };

    const nextMove = () => {
        if (currentMoveIndex < moves.length - 1) {
            resetToMove(currentMoveIndex + 1);
        }
    };

    const previousMove = () => {
        if (currentMoveIndex > 0) {
            resetToMove(currentMoveIndex - 1);
        }
    };

    return {
        shogi,
        currentMoveIndex,
        nextMove,
        previousMove,
        resetToMove,
    };
}
