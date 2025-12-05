import { useState } from 'preact/hooks';
import { Shogi } from 'shogi.js';
import type { JKFData, JKFMoveData } from '../types/kifu';
import { getPieceName, isPromoted } from '../utils/gameLogic';
import '../styles/board.css';

interface ShogiBoardProps {
    kifuData: JKFData;
}

export function ShogiBoard({ kifuData }: ShogiBoardProps) {
    const [shogi, setShogi] = useState<Shogi>(new Shogi());
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const moves = kifuData.moves;

    // 局面をリセット
    const resetToMove = (moveIndex: number) => {
        const newShogi = new Shogi();
        for (let i = 1; i <= moveIndex; i++) {
            const move = moves[i];
            if (move.move) {
                try {
                    applyMove(newShogi, move);
                } catch (error) {
                    console.error('Error resetting to move:', error);
                    break;
                }
            }
        }
        setShogi(newShogi);
    };

    // 手を適用
    const applyMove = (shogiInstance: Shogi, moveData: JKFMoveData) => {
        const move = moveData.move;
        if (!move) return;

        if (move.from) {
            shogiInstance.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote || false);
        } else {
            shogiInstance.drop(move.to.x, move.to.y, move.piece as any);
        }
    };

    // 次の手
    const nextMove = () => {
        if (currentMoveIndex < moves.length - 1) {
            const nextIndex = currentMoveIndex + 1;
            resetToMove(nextIndex);
            setCurrentMoveIndex(nextIndex);
        }
    };

    // 前の手
    const previousMove = () => {
        if (currentMoveIndex > 0) {
            const prevIndex = currentMoveIndex - 1;
            resetToMove(prevIndex);
            setCurrentMoveIndex(prevIndex);
        }
    };

    // 盤面の駒を描画
    const renderBoard = () => {
        const cells = [];
        const boardState = shogi.board;

        for (let y = 1; y <= 9; y++) {
            for (let x = 9; x >= 1; x--) {
                const piece = boardState[x - 1][y - 1];
                cells.push(
                    <div key={`${x}-${y}`} class="board-cell" data-x={x} data-y={y}>
                        {piece && (
                            <div
                                class={`piece ${piece.color === 1 ? 'gote' : 'sente'} ${isPromoted(piece.kind) ? 'promoted' : ''
                                    }`}
                            >
                                {getPieceName(piece.kind)}
                            </div>
                        )}
                    </div>
                );
            }
        }
        return cells;
    };

    // 持ち駒を描画
    const renderCapturedPieces = (color: number) => {
        const hands = shogi.hands[color];
        const pieces = [];

        for (const [pieceKind, count] of Object.entries(hands)) {
            const countNum = typeof count === 'number' ? count : 0;
            if (countNum > 0) {
                pieces.push(
                    <span key={pieceKind} class="piece">
                        {getPieceName(pieceKind)}
                        {countNum > 1 ? countNum : ''}
                    </span>
                );
            }
        }

        return (
            <div class="captured-pieces">
                <h3>{color === 0 ? '先手の持ち駒' : '後手の持ち駒'}</h3>
                <div class="captured-list">{pieces}</div>
            </div>
        );
    };

    return (
        <div class="board-container">
            {/* ヘッダー情報 */}
            <div class="card mb-lg">
                <h2>{kifuData.header['棋戦'] || '対局'}</h2>
                <p>
                    <strong>先手:</strong> {kifuData.header['先手'] || '不明'}
                </p>
                <p>
                    <strong>後手:</strong> {kifuData.header['後手'] || '不明'}
                </p>
                <p>
                    <strong>日時:</strong> {kifuData.header['開始日時'] || '不明'}
                </p>
            </div>

            {/* 盤面エリア */}
            <div class="board-wrapper">
                {renderCapturedPieces(1)}
                <div class="shogi-board">{renderBoard()}</div>
                {renderCapturedPieces(0)}
            </div>

            {/* コントロール */}
            <div class="board-controls">
                <button class="btn" onClick={previousMove} disabled={currentMoveIndex === 0}>
                    ◀ 前へ
                </button>
                <div class="move-info">
                    {currentMoveIndex} / {moves.length - 1}手
                </div>
                <button
                    class="btn"
                    onClick={nextMove}
                    disabled={currentMoveIndex >= moves.length - 1}
                >
                    次へ ▶
                </button>
            </div>
        </div>
    );
}
