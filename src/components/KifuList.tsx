/// <reference types="preact" />
import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import type { KifuMetadata } from '../types/kifu';
import { loadKifuIndex } from '../utils/dataLoader';

export function KifuList() {
    const [kifus, setKifus] = useState<KifuMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const { route } = useLocation();

    useEffect(() => {
        loadKifuIndex().then((data) => {
            setKifus(data);
            setLoading(false);
        });
    }, []);

    const handleKifuClick = (kifu: KifuMetadata) => {
        route(`/kifu/${kifu.id}/${kifu.date}`);
    };

    if (loading) {
        return <div class="text-center">読み込み中...</div>;
    }

    return (
        <div>
            <h2 class="mb-lg">棋譜一覧</h2>

            {kifus.length === 0 ? (
                <p class="text-center text-muted">棋譜がまだ登録されていません。</p>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 'var(--spacing-lg)',
                    }}
                >
                    {kifus.map((kifu) => (
                        <div
                            key={`${kifu.id}-${kifu.date}`}
                            class="card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleKifuClick(kifu)}
                        >
                            <div class="text-muted mb-sm">{kifu.date}</div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
                                {kifu.sente} vs {kifu.gote}
                            </h3>
                            <div style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                                {kifu.result}
                            </div>
                            <div class="text-muted mt-sm">{kifu.moves}手</div>
                            {kifu.opening && (
                                <div class="mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                    戦型: {kifu.opening}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
