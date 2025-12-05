import type { KifuMetadata } from '../types/kifu';

const KIFUS_BASE_URL = '/kifus';

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
export async function loadKifu(id: string, date: string): Promise<any> {
    try {
        const filename = `${id}_${date}.json`;
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
