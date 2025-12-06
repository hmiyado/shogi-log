/// <reference types="preact" />
import { useState, useEffect } from 'preact/hooks';

import type { KifuMetadata } from '../types/kifu';
import { loadKifuIndex } from '../utils/dataLoader';
import { resolvePath } from '../utils/pathHelper';

export function KifuList() {
    const [kifus, setKifus] = useState<KifuMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadKifuIndex().then((data) => {
            setKifus(data);
            setLoading(false);
        });
    }, []);

    const handleKifuClick = (kifu: KifuMetadata) => {
        window.location.href = resolvePath(`/viewer.html?id=${kifu.id}&date=${kifu.date}`);
    };

    // 検索フィルター
    const filteredKifus = kifus.filter((kifu) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            kifu.sente.toLowerCase().includes(query) ||
            kifu.gote.toLowerCase().includes(query)
        );
    });

    // ページネーション
    const totalPages = Math.ceil(filteredKifus.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentKifus = filteredKifus.slice(startIndex, endIndex);

    // 検索クエリが変わったら1ページ目に戻る
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return <div class="text-center">読み込み中...</div>;
    }

    return (
        <div>
            <h2 class="mb-lg">棋譜一覧</h2>

            {/* 検索バー */}
            <div class="mb-lg">
                <input
                    type="text"
                    placeholder="対局者名で検索..."
                    value={searchQuery}
                    onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                    class="search-input"
                    style={{
                        width: '100%',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        fontSize: 'var(--font-size-base)',
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                    }}
                />
            </div>

            {filteredKifus.length === 0 ? (
                <p class="text-center text-muted">
                    {searchQuery ? '検索結果が見つかりませんでした。' : '棋譜がまだ登録されていません。'}
                </p>
            ) : (
                <>
                    <div class="card table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>日付</th>
                                    <th>先手</th>
                                    <th class="text-center">vs</th>
                                    <th>後手</th>
                                    <th>結果</th>
                                    <th class="text-right">手数</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentKifus.map((kifu) => (
                                    <tr
                                        key={`${kifu.id}-${kifu.date}`}
                                        onClick={() => handleKifuClick(kifu)}
                                        class="clickable"
                                    >
                                        <td>{kifu.date}</td>
                                        <td class="font-bold">{kifu.sente}</td>
                                        <td class="text-center text-muted">vs</td>
                                        <td class="font-bold">{kifu.gote}</td>
                                        <td class="text-primary">{kifu.result}</td>
                                        <td class="text-right">{kifu.moves}手</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ページネーション */}
                    {totalPages > 1 && (
                        <div
                            class="pagination"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                marginTop: 'var(--spacing-xl)',
                            }}
                        >
                            <button
                                class="btn"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ◀ 前へ
                            </button>
                            <span style={{ fontSize: 'var(--font-size-base)', fontWeight: '600' }}>
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                class="btn"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                次へ ▶
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
