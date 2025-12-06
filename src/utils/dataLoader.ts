import type { KifuMetadata } from '../types/kifu';

const KIFUS_BASE_URL = `${import.meta.env.BASE_URL}kifus`;

// 棋譜インデックスを取得
export async function loadKifuIndex(): Promise<KifuMetadata[]> {
    try {
        const response = await fetch(`${KIFUS_BASE_URL}/index.json`);
        if (!response.ok) {
            throw new Error('Failed to load kifu index');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading kifu index:', error);
        return [];
    }
}

// 個別の棋譜データを取得
export async function loadKifu(id: string, date?: string): Promise<any> {
    try {
        let targetDate = date;

        // 日付が指定されていない場合はインデックスから検索
        if (!targetDate) {
            const index = await loadKifuIndex();
            const entry = index.find((item) => item.id === id);
            if (entry) {
                targetDate = entry.date;
            } else {
                throw new Error(`Kifu ID not found: ${id}`);
            }
        }

        const filename = `${id}_${targetDate}.json`;
        const response = await fetch(`${KIFUS_BASE_URL}/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load kifu: ${filename}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading kifu:', error);
        return null;
    }
}
