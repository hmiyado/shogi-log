import { useState, useEffect } from 'preact/hooks';
import type { KifuMetadata } from '../types/kifu';
import { loadKifuIndex } from '../utils/dataLoader';

interface OpponentStats {
    wins: number;
    losses: number;
    draws: number;
    total: number;
    winRate: number;
}

interface PlayerStats {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    byOpponent: Map<string, OpponentStats>;
}

export function PlayerStatsPage({ name }: { name: string }) {
    const decodedName = decodeURIComponent(name);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKifuIndex().then((kifus) => {
            const playerStats = calculatePlayerStats(kifus, decodedName);
            setStats(playerStats);
            setLoading(false);
        });
    }, [decodedName]);

    const calculatePlayerStats = (kifus: KifuMetadata[], playerName: string): PlayerStats => {
        const stats: PlayerStats = {
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            byOpponent: new Map(),
        };

        kifus.forEach((kifu) => {
            const isSente = kifu.sente === playerName;
            const isGote = kifu.gote === playerName;

            if (!isSente && !isGote) return;

            stats.totalGames++;

            let isWin = false;
            let isLoss = false;
            let isDraw = false;
            let opponent = '';

            if (isSente) {
                opponent = kifu.gote;
                if (kifu.result === '先手勝ち') isWin = true;
                else if (kifu.result === '後手勝ち') isLoss = true;
                else isDraw = true;
            } else {
                opponent = kifu.sente;
                if (kifu.result === '後手勝ち') isWin = true;
                else if (kifu.result === '先手勝ち') isLoss = true;
                else isDraw = true;
            }

            if (isWin) stats.wins++;
            if (isLoss) stats.losses++;
            if (isDraw) stats.draws++;

            if (!stats.byOpponent.has(opponent)) {
                stats.byOpponent.set(opponent, { wins: 0, losses: 0, draws: 0, total: 0, winRate: 0 });
            }
            const opponentStats = stats.byOpponent.get(opponent)!;
            opponentStats.total++;
            if (isWin) opponentStats.wins++;
            if (isLoss) opponentStats.losses++;
            if (isDraw) opponentStats.draws++;
        });

        stats.winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

        stats.byOpponent.forEach((stat) => {
            stat.winRate = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0;
        });

        return stats;
    };

    if (loading) {
        return <div class="text-center">読み込み中...</div>;
    }

    if (!stats || stats.totalGames === 0) {
        return <div class="text-center">データが見つかりません。</div>;
    }

    const sortedOpponents = Array.from(stats.byOpponent.entries()).sort(([, a], [, b]) => {
        return b.total - a.total; // 対局数順
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <button
                    onClick={() => window.location.href = '/statistics.html'}
                    class="btn"
                    style={{ marginRight: 'var(--spacing-md)' }}
                >
                    ← 戻る
                </button>
                <h2 style={{ margin: 0 }}>{decodedName} の成績</h2>
            </div>

            {/* 総合成績 */}
            <div class="card mb-lg">
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>総合成績</h3>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: 'var(--spacing-md)',
                    }}
                >
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>対局数</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {stats.totalGames}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>勝ち</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: '#4caf50' }}>
                            {stats.wins}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>負け</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: '#f44336' }}>
                            {stats.losses}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>引き分け</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--color-secondary)' }}>
                            {stats.draws}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>勝率</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--color-accent)' }}>
                            {stats.winRate}%
                        </div>
                    </div>
                </div>
            </div>

            {/* 対戦相手別成績 */}
            <h3 class="mb-md">対戦相手別成績</h3>
            <div class="card table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>対戦相手</th>
                            <th class="text-center">対局数</th>
                            <th class="text-center">勝ち</th>
                            <th class="text-center">負け</th>
                            <th class="text-center">引き分け</th>
                            <th class="text-center">勝率</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedOpponents.map(([opponent, record]) => (
                            <tr
                                key={opponent}
                                class="clickable"
                                onClick={() => window.location.href = `/player.html?name=${encodeURIComponent(opponent)}`}
                            >
                                <td class="font-bold">{opponent}</td>
                                <td class="text-center">{record.total}</td>
                                <td class="text-center text-success font-bold">{record.wins}</td>
                                <td class="text-center text-danger font-bold">{record.losses}</td>
                                <td class="text-center">{record.draws}</td>
                                <td class="text-center font-bold">{record.winRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
