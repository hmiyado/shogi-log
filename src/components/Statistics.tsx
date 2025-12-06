import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import type { KifuMetadata } from '../types/kifu';
import { loadKifuIndex } from '../utils/dataLoader';

interface OpponentStats {
    wins: number;
    losses: number;
    draws: number;
    total: number;
    winRate: number;
}

export function StatisticsView() {
    const [opponentStats, setOpponentStats] = useState<[string, OpponentStats][]>([]);
    const [loading, setLoading] = useState(true);
    const { route } = useLocation();

    useEffect(() => {
        loadKifuIndex().then((kifus) => {
            const stats = calculateStatistics(kifus);
            // 勝率順、同率なら対局数順にソート
            const sortedStats = Array.from(stats.entries()).sort(([, a], [, b]) => {
                if (b.winRate !== a.winRate) {
                    return b.winRate - a.winRate;
                }
                return b.total - a.total;
            });
            setOpponentStats(sortedStats);
            setLoading(false);
        });
    }, []);

    const calculateStatistics = (kifus: KifuMetadata[]): Map<string, OpponentStats> => {
        const stats = new Map<string, OpponentStats>();

        kifus.forEach((kifu) => {
            // 自分の名前（先手または後手）を除外して対戦相手を特定するロジックが必要だが、
            // 現状は簡易的に「自分以外」を判定するのが難しいので、
            // 暫定的に「gote」を対戦相手として扱う（将棋ウォーズのデータ構造に依存）
            // ※本来はユーザー設定などで「自分の名前」を持つべき

            // 将棋ウォーズのデータでは、自分がsenteかgoteかはURLやデータからは一意に決まらない場合があるが、
            // ここでは簡易的に「対戦相手」を集計する。
            // ただし、現状のデータ構造では「誰が自分か」の情報がないため、
            // 単純に「先手 vs 後手」の勝敗を集計するのではなく、
            // 「対戦相手ごとの成績」を出すには視点が必要。

            // ここでは、一旦「全ての対局者」をリストアップし、それぞれの勝敗を集計する形にする
            // つまり、A vs B で A勝ちなら、Aは1勝、Bは1敗とする。

            updateStats(stats, kifu.sente, kifu.result === '先手勝ち', kifu.result === '後手勝ち', kifu.result === '引き分け');
            updateStats(stats, kifu.gote, kifu.result === '後手勝ち', kifu.result === '先手勝ち', kifu.result === '引き分け');
        });

        // 勝率を計算
        stats.forEach((stat) => {
            stat.winRate = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0;
        });

        return stats;
    };

    const updateStats = (
        stats: Map<string, OpponentStats>,
        name: string,
        isWin: boolean,
        isLoss: boolean,
        isDraw: boolean
    ) => {
        if (!stats.has(name)) {
            stats.set(name, { wins: 0, losses: 0, draws: 0, total: 0, winRate: 0 });
        }
        const stat = stats.get(name)!;
        if (isWin) stat.wins++;
        if (isLoss) stat.losses++;
        if (isDraw) stat.draws++;
        stat.total++;
    };

    if (loading) {
        return <div class="text-center">読み込み中...</div>;
    }

    return (
        <div>
            <h2 class="mb-lg">対局者別成績</h2>
            {/* 対戦相手別成績 */}
            {opponentStats.length > 0 && (
                <>
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
                                {opponentStats.map(([opponent, record]) => {
                                    return (
                                        <tr
                                            key={opponent}
                                            class="clickable"
                                            onClick={() => route(`/player/${encodeURIComponent(opponent)}`)}
                                        >
                                            <td class="font-bold">{opponent}</td>
                                            <td class="text-center">{record.total}</td>
                                            <td class="text-center text-success font-bold">{record.wins}</td>
                                            <td class="text-center text-danger font-bold">{record.losses}</td>
                                            <td class="text-center">{record.draws}</td>
                                            <td class="text-center font-bold">{record.winRate}%</td>
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
