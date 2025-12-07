import { useState, useEffect } from 'preact/hooks';
import { Shogi } from 'shogi.js';
import type { JKFData, JKFMoveData } from '../types/kifu';
import { getPieceName } from '../utils/gameLogic';
import '../styles/board.css';

interface ShogiBoardProps {
    kifuData: JKFData;
}

export function ShogiBoard({ kifuData }: ShogiBoardProps) {
    const [shogi, setShogi] = useState<Shogi>(() => {
        // 初期局面がある場合はSFENから初期化
        const initial = (kifuData as any).initial;
        const shogi = new Shogi();
        if (initial?.data?.sfen) {
            try {
                shogi.initializeFromSFENString(initial.data.sfen);
            } catch (error) {
                console.error('Failed to initialize from SFEN:', error);
                shogi.initialize();
            }
        }
        return shogi;
    });
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const moves = kifuData.moves;

    // ... (existing useEffects)

    // ... (existing helper functions)

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // URLクエリパラメータから初期手数を取得
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const moveParam = params.get('move');
        if (moveParam) {
            const moveIndex = parseInt(moveParam, 10);
            if (!isNaN(moveIndex) && moveIndex >= 0 && moveIndex < moves.length) {
                setCurrentMoveIndex(moveIndex);
            }
        }
    }, []);

    // 手数が変わったらURLを更新
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (currentMoveIndex > 0) {
            params.set('move', currentMoveIndex.toString());
        } else {
            params.delete('move');
        }
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);

        // 手数が変わったら盤面を更新
        resetToMove(currentMoveIndex);
    }, [currentMoveIndex]);

    // キーボード操作
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (currentMoveIndex > 0) {
                    setCurrentMoveIndex(currentMoveIndex - 1);
                }
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (currentMoveIndex < moves.length - 1) {
                    setCurrentMoveIndex(currentMoveIndex + 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentMoveIndex, moves.length]);

    // 局面をリセット
    const resetToMove = (moveIndex: number) => {
        // 初期局面から開始
        const initial = (kifuData as any).initial;
        const newShogi = new Shogi();

        if (initial?.data?.sfen) {
            try {
                newShogi.initializeFromSFENString(initial.data.sfen);
            } catch (error) {
                console.error('Failed to initialize from SFEN:', error);
                newShogi.initialize();
            }
        }

        // 指定された手数まで進める
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
            const pieceAtSource = shogiInstance.get(move.from.x, move.from.y);
            let shouldPromote = move.promote;

            // プロモーションフラグがない場合、駒の種類が変わっているかチェックして自動判定
            if (!shouldPromote && pieceAtSource) {
                const boardPieceKind = pieceAtSource.kind;
                const movePieceKind = move.piece;

                // 成り駒への変化マッピング
                const promotionMap: { [key: string]: string } = {
                    'FU': 'TO',
                    'KY': 'NY',
                    'KE': 'NK',
                    'GI': 'NG',
                    'KA': 'UM',
                    'HI': 'RY',
                };

                // 盤上の駒が成れる種類で、かつ移動後の駒種が成った後のものである場合
                if (promotionMap[boardPieceKind] === movePieceKind) {
                    shouldPromote = true;
                }
            }

            shogiInstance.move(move.from.x, move.from.y, move.to.x, move.to.y, shouldPromote || false);
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

    // 駒の画像URLを取得
    const getPieceImageUrl = (pieceKind: string, color: number) => {
        const colorPrefix = color === 0 ? 'black' : 'white';
        const baseUrl = 'https://sunfish-shogi.github.io/shogi-images/hitomoji_wood';

        const pieceMap: { [key: string]: string } = {
            'FU': 'pawn',
            'KY': 'lance',
            'KE': 'knight',
            'GI': 'silver',
            'KI': 'gold',
            'KA': 'bishop',
            'HI': 'rook',
            'OU': 'king',
            'TO': 'prom_pawn',
            'NY': 'prom_lance',
            'NK': 'prom_knight',
            'NG': 'prom_silver',
            'UM': 'horse',
            'RY': 'dragon',
        };

        const pieceName = pieceMap[pieceKind];
        if (!pieceName) return '';

        return `${baseUrl}/${colorPrefix}_${pieceName}.png`;
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
                            <img
                                src={getPieceImageUrl(piece.kind, piece.color)}
                                alt={getPieceName(piece.kind)}
                                class={`piece-image ${piece.color === 1 ? 'gote' : 'sente'}`}
                            />
                        )}
                    </div>
                );
            }
        }
        return cells;
    };

    // 持ち駒を描画
    const renderCapturedPieces = (color: number, playerName: string) => {
        const hands = shogi.hands[color];
        const pieces = [];

        console.log(`持ち駒 (color ${color}):`, hands);

        // 駒の並び順を定義（歩、香、桂、銀、金、角、飛）
        const pieceOrder = ['FU', 'KY', 'KE', 'GI', 'KI', 'KA', 'HI'];

        // モバイル（768px以下）では両方同じ順序、デスクトップでは後手は逆順
        const displayOrder = (color === 1 && !isMobile) ? [...pieceOrder].reverse() : pieceOrder;

        // handsは配列形式: [{kind: 'FU', color: 0}, ...]
        if (Array.isArray(hands)) {
            // 駒の種類ごとにカウント
            const pieceCounts: { [key: string]: number } = {};
            hands.forEach((piece: any) => {
                const kind = piece.kind;
                pieceCounts[kind] = (pieceCounts[kind] || 0) + 1;
            });

            // 定義された順序で駒を表示
            for (const pieceKind of displayOrder) {
                const count = pieceCounts[pieceKind];
                if (count && count > 0) {
                    pieces.push(
                        <div key={pieceKind} class="captured-piece-item">
                            <img
                                src={getPieceImageUrl(pieceKind, color)}
                                alt={getPieceName(pieceKind)}
                                class="captured-piece-image"
                            />
                            {count > 1 && <span class="piece-count">{count}</span>}
                        </div>
                    );
                }
            }
        }

        const mark = color === 0 ? '☗' : '☖';

        return (
            <div class="captured-pieces">
                <h3 title={playerName} style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    <span style={{ fontSize: '120%', marginRight: '4px' }}>{mark}</span>
                    {playerName}
                </h3>
                <div class="captured-list">{pieces.length > 0 ? pieces : <span class="no-pieces">なし</span>}</div>
            </div>
        );
    };

    return (
        <div class="board-container" style={{ position: 'relative' }}>
            {/* トースト通知 */}
            {toastMessage && (
                <div class="toast-notification">
                    {toastMessage}
                </div>
            )}

            {/* ヘッダー情報 (コンパクト化) */}
            <div class="text-center mb-md text-muted" style={{ fontSize: 'var(--font-size-sm)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <span>{kifuData.header['棋戦'] || '対局'} | {kifuData.header['開始日時'] || '不明'}</span>
                <button
                    type="button"
                    class="btn btn-sm"
                    onClick={async () => {
                        try {
                            const { exportKIF } = await import('../utils/kifuExporter');
                            const kif = exportKIF(kifuData);
                            await navigator.clipboard.writeText(kif);
                            showToast('棋譜(KIF)をコピーしました');
                        } catch (e) {
                            console.error('Failed to copy kifu:', e);
                            showToast('棋譜のコピーに失敗しました');
                        }
                    }}
                    title="KIF形式でコピー"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    📋 棋譜
                </button>
            </div>

            {/* 盤面エリア */}
            <div class="board-wrapper">
                {renderCapturedPieces(1, kifuData.header['後手'] || '後手')}
                <div
                    class="shogi-board"
                    onClick={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const width = rect.width;
                        if (x > width / 2) {
                            nextMove();
                        } else {
                            previousMove();
                        }
                    }}
                >
                    {renderBoard()}
                </div>
                {renderCapturedPieces(0, kifuData.header['先手'] || '先手')}
            </div>

            {/* コントロール */}
            <div class="board-controls">
                <button class="btn" onClick={previousMove} disabled={currentMoveIndex === 0}>
                    {isMobile ? '◀' : '◀ 前へ'}
                </button>
                <div class="move-info">
                    {currentMoveIndex} / {moves.length - 1}手
                </div>
                <button
                    class="btn"
                    onClick={nextMove}
                    disabled={currentMoveIndex >= moves.length - 1}
                >
                    {isMobile ? '▶' : '次へ ▶'}
                </button>
            </div>
        </div>
    );
}
