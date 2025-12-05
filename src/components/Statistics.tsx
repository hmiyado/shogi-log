import { useState, useEffect } from 'preact/hooks';
import type { KifuMetadata } from '../types/kifu';
import { loadKifuIndex } from '../utils/dataLoader';

interface Statistics {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    byOpponent: Map<string, { wins: number; losses: number; draws: number }>;
}

export function StatisticsView() {
    const [stats, setStats] = useState<Statistics | null>(null);

    useEffect(() => {
        loadKifuIndex().then((kifus) => {
            const calculated = calculateStatistics(kifus);
            setStats(calculated);
        });
    }, []);

    const calculateStatistics = (kifus: KifuMetadata[]): Statistics => {
        const stats: Statistics = {
            totalGames: kifus.length,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            byOpponent: new Map(),
        };

        kifus.forEach((kifu) => {
            if (kifu.result.includes('先手勝ち')) {
                stats.wins++;
            } else if (kifu.result.includes('後手勝ち')) {
                stats.losses++;
            } else {
                stats.draws++;
            }

            const opponent = kifu.gote;
            if (!stats.byOpponent.has(opponent)) {
                stats.byOpponent.set(opponent, { wins: 0, losses: 0, draws: 0 });
            }
            const opponentStats = stats.byOpponent.get(opponent)!;

            if (kifu.result.includes('先手勝ち')) {
                opponentStats.wins++;
            } else if (kifu.result.includes('後手勝ち')) {
                opponentStats.losses++;
            } else {
                opponentStats.draws++;
            }
        });

        stats.winRate =
            stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

        return stats;
    };

    if (!stats) {
        return <div class="text-center">読み込み中...</div>;
    }

    return (
        <div>
            <h2 class="mb-lg">対戦成績</h2>

            {/* 総合成績 */}
            <div class="card mb-lg">
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>総合成績</h3>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 'var(--spacing-md)',
                    }}
                >
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            対局数
                        </div>
                        <div
                            style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '700',
                                color: 'var(--color-primary)',
                            }}
                        >
                            {stats.totalGames}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            勝ち
                        </div>
                        <div
                            style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: '#4caf50' }}
                        >
                            {stats.wins}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            負け
                        </div>
                        <div
                            style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: '#f44336' }}
                        >
                            {stats.losses}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            引き分け
                        </div>
                        <div
                            style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '700',
                                color: 'var(--color-secondary)',
                            }}
                        >
                            {stats.draws}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            勝率
                        </div>
                        <div
                            style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '700',
                                color: 'var(--color-accent)',
                            }}
                        >
                            {stats.winRate}%
                        </div>
                    </div>
                </div>
            </div>

            {/* 対戦相手別成績 */}
            {stats.byOpponent.size > 0 && (
                <>
                    <h3 class="mb-md">対戦相手別成績</h3>
                    <div class="card" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>対戦相手</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>勝ち</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>負け</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>引き分け</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>勝率</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(stats.byOpponent.entries()).map(([opponent, record]) => {
                                    const total = record.wins + record.losses + record.draws;
                                    const winRate = total > 0 ? Math.round((record.wins / total) * 100) : 0;

                                    return (
                                        <tr
                                            key={opponent}
                                            style={{ borderBottom: '1px solid var(--color-border-light)' }}
                                        >
                                            <td style={{ padding: 'var(--spacing-md)' }}>{opponent}</td>
                                            <td
                                                style={{
                                                    padding: 'var(--spacing-md)',
                                                    textAlign: 'center',
                                                    color: '#4caf50',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {record.wins}
                                            </td>
                                            <td
                                                style={{
                                                    padding: 'var(--spacing-md)',
                                                    textAlign: 'center',
                                                    color: '#f44336',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {record.losses}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                                                {record.draws}
                                            </td>
                                            <td
                                                style={{
                                                    padding: 'var(--spacing-md)',
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {winRate}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
