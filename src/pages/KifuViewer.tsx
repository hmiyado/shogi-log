import { useState, useEffect } from 'preact/hooks';
import { ShogiBoard } from '../components/ShogiBoard';
import { loadKifu } from '../utils/dataLoader';
import type { JKFData } from '../types/kifu';

interface KifuViewerProps {
    id: string;
    date?: string; // date is now optional
}

export function KifuViewer({ id, date }: KifuViewerProps) {
    const [kifuData, setKifuData] = useState<JKFData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true); // Reset loading state when id changes
        loadKifu(id, date).then((data) => {
            if (data) {
                setKifuData(data);
                setError(false);
            } else {
                setError(true);
            }
            setLoading(false);
        });
    }, [id, date]);

    if (loading) {
        return <div class="text-center">読み込み中...</div>;
    }

    if (error || !kifuData) {
        return (
            <div class="card text-center">
                <p>棋譜が見つかりませんでした。</p>
            </div>
        );
    }

    return <ShogiBoard kifuData={kifuData} />;
}
