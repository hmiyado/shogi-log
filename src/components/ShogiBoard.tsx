import { useState, useEffect } from 'preact/hooks';
import type { JKFData } from '../types/kifu';
import { getPieceName } from '../utils/gameLogic';
import { useShogiGame } from '../hooks/useShogiGame';
import '../styles/board.css';

interface ShogiBoardProps {
    kifuData: JKFData;
}

export function ShogiBoard({ kifuData }: ShogiBoardProps) {
    const { shogi, currentMoveIndex, nextMove, previousMove, resetToMove } = useShogiGame(kifuData);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const moves = kifuData.moves;

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
                resetToMove(moveIndex);
            }
        }
    }, [kifuData]); // kifuDataが変わったときも再チェック

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
    }, [currentMoveIndex]);

    // キーボード操作
    useEffect(() => {
        // キーボード操作のリセットは不要、現在のcurrentMoveIndexに基づいてnext/prevを呼ぶ
        // ただし、フックから返される nextMove/previousMove は内部で currentMoveIndex を参照しているため
        // このEffect自体は nextMove/previousMove が変わらない限り再実行されなくてよい
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousMove();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextMove();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextMove, previousMove]); // フックの関数依存

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
        const lastMove = currentMoveIndex > 0 ? moves[currentMoveIndex].move : null;

        for (let y = 1; y <= 9; y++) {
            for (let x = 9; x >= 1; x--) {
                const piece = boardState[x - 1][y - 1];
                const isLastMoveTo = lastMove && lastMove.to && lastMove.to.x === x && lastMove.to.y === y;

                cells.push(
                    <div
                        key={`${x}-${y}`}
                        class={`board-cell ${isLastMoveTo ? 'highlight' : ''}`}
                        data-x={x}
                        data-y={y}
                    >
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
    const renderCapturedPieces = (color: number) => {
        const hands = shogi.hands[color] as any;
        const pieces = [];

        // 駒の並び順を定義（歩、香、桂、銀、金、角、飛）
        const order = ['FU', 'KY', 'KE', 'GI', 'KI', 'KA', 'HI'];

        // shogi.hands[color] は配列形式なのでカウントする
        const counts: { [kind: string]: number } = {};
        if (Array.isArray(hands)) {
            hands.forEach((p: any) => {
                counts[p.kind] = (counts[p.kind] || 0) + 1;
            });
        }

        for (const kind of order) {
            if (counts[kind] > 0) {
                pieces.push({ kind, count: counts[kind] });
            }
        }

        return (
            <div class="captured-pieces">
                <div class="captured-list">
                    {pieces.length === 0 ? (
                        <div class="no-pieces">なし</div>
                    ) : (
                        pieces.map((item) => (
                            <div key={item.kind} class="captured-piece-item">
                                <img
                                    src={getPieceImageUrl(item.kind, color)}
                                    alt={getPieceName(item.kind)}
                                    class="captured-piece-image"
                                />
                                {item.count > 1 && <span class="piece-count">{item.count}</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const getPlayerName = (color: number) => {
        const header = kifuData.header;
        if (color === 0) {
            const name = header['先手'] || header['Sente'];
            return name || '先手';
        } else {
            const name = header['後手'] || header['Gote'];
            return name || '後手';
        }
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
                {renderCapturedPieces(1)}

                <div class="board-main-column">
                    <div class="player-info gote text-left">
                        <span class="player-mark">☖</span>
                        {getPlayerName(1)}
                    </div>

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

                    <div class="player-info sente text-right">
                        <span class="player-mark">☗</span>
                        {getPlayerName(0)}
                    </div>
                </div>

                {renderCapturedPieces(0)}
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
