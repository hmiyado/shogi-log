#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Parsers } = require('json-kifu-format');
import type { KifuMetadata } from '../src/types/kifu';

const KIFUS_SOURCE_DIR = 'kifus-source';
const KIFUS_PUBLIC_DIR = 'public/kifus';
const INDEX_FILE = join(KIFUS_PUBLIC_DIR, 'index.json');

interface ConversionResult {
    success: boolean;
    filename: string;
    error?: string;
}

function convertKifToJkf(kifFilePath: string, outputDir: string): ConversionResult {
    const filename = basename(kifFilePath);

    try {
        console.log(`Converting: ${filename}`);

        // Read .kif file
        const kifContent = readFileSync(kifFilePath, 'utf-8');

        // Parse KIF to JKF
        const jkfData = Parsers.parseKIF(kifContent);

        // Generate output filename (replace .kif with .json)
        const outputFilename = filename.replace(/\.kif$/i, '.json');
        const outputPath = join(outputDir, outputFilename);

        // Write JKF file
        writeFileSync(outputPath, JSON.stringify(jkfData, null, 2), 'utf-8');

        console.log(`✓ Created: ${outputFilename}`);
        return { success: true, filename: outputFilename };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`✗ Failed to convert ${filename}: ${errorMessage}`);
        return { success: false, filename, error: errorMessage };
    }
}

function extractMetadata(jkfData: any, filename: string): KifuMetadata | null {
    try {
        // Extract ID and date from filename: {ID}_{YYYY-MM-DD}.json
        const match = filename.match(/^(\d+)_(\d{4}-\d{2}-\d{2})\.json$/);
        if (!match) {
            console.warn(`Warning: Filename ${filename} doesn't match expected pattern {ID}_{YYYY-MM-DD}.json`);
            return null;
        }

        const [, id, date] = match;
        const header = jkfData.header || {};

        // Count moves (excluding the first empty move)
        const moves = jkfData.moves ? jkfData.moves.length - 1 : 0;

        return {
            id,
            date,
            sente: header['先手'] || header['下手'] || '不明',
            gote: header['後手'] || header['上手'] || '不明',
            result: header['結果'] || header['勝敗'] || '不明',
            moves,
            opening: header['戦型'] || header['戦法'] || undefined,
        };
    } catch (error) {
        console.error(`Failed to extract metadata from ${filename}:`, error);
        return null;
    }
}

function updateIndex(newMetadata: KifuMetadata[]): void {
    try {
        // Load existing index
        let existingIndex: KifuMetadata[] = [];
        if (existsSync(INDEX_FILE)) {
            const indexContent = readFileSync(INDEX_FILE, 'utf-8');
            existingIndex = JSON.parse(indexContent);
        }

        // Merge with new metadata (avoid duplicates by ID and date)
        const mergedIndex = [...existingIndex];
        for (const newEntry of newMetadata) {
            const existingIndex = mergedIndex.findIndex(
                (entry) => entry.id === newEntry.id && entry.date === newEntry.date
            );

            if (existingIndex >= 0) {
                // Update existing entry
                mergedIndex[existingIndex] = newEntry;
                console.log(`Updated index entry: ${newEntry.id}_${newEntry.date}`);
            } else {
                // Add new entry
                mergedIndex.push(newEntry);
                console.log(`Added index entry: ${newEntry.id}_${newEntry.date}`);
            }
        }

        // Sort by date (newest first) and then by ID
        mergedIndex.sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return a.id.localeCompare(b.id);
        });

        // Write updated index
        writeFileSync(INDEX_FILE, JSON.stringify(mergedIndex, null, 2), 'utf-8');
        console.log(`✓ Updated index.json`);
    } catch (error) {
        console.error('Failed to update index:', error);
    }
}

function main() {
    console.log('=== KIF to JKF Conversion Script ===\n');

    // Check if source directory exists
    if (!existsSync(KIFUS_SOURCE_DIR)) {
        console.error(`Error: Source directory "${KIFUS_SOURCE_DIR}" does not exist.`);
        console.log(`Please create it and add .kif files: mkdir -p ${KIFUS_SOURCE_DIR}`);
        process.exit(1);
    }

    // Get all .kif files
    const kifFiles = readdirSync(KIFUS_SOURCE_DIR)
        .filter((file: string) => file.toLowerCase().endsWith('.kif'))
        .map((file: string) => join(KIFUS_SOURCE_DIR, file));

    if (kifFiles.length === 0) {
        console.log(`No .kif files found in ${KIFUS_SOURCE_DIR}`);
        console.log('Add .kif files with naming pattern: {ID}_{YYYY-MM-DD}.kif');
        process.exit(0);
    }

    console.log(`Found ${kifFiles.length} .kif file(s)\n`);

    // Convert all files
    const results: ConversionResult[] = [];
    for (const kifFile of kifFiles) {
        results.push(convertKifToJkf(kifFile, KIFUS_PUBLIC_DIR));
    }

    // Extract metadata from successfully converted files
    const newMetadata: KifuMetadata[] = [];
    for (const result of results) {
        if (result.success) {
            const jkfPath = join(KIFUS_PUBLIC_DIR, result.filename);
            const jkfContent = readFileSync(jkfPath, 'utf-8');
            const jkfData = JSON.parse(jkfContent);
            const metadata = extractMetadata(jkfData, result.filename);
            if (metadata) {
                newMetadata.push(metadata);
            }
        }
    }

    // Update index.json
    if (newMetadata.length > 0) {
        console.log('');
        updateIndex(newMetadata);
    }

    // Summary
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log('\n=== Conversion Summary ===');
    console.log(`✓ Success: ${successCount}`);
    if (failCount > 0) {
        console.log(`✗ Failed: ${failCount}`);
    }
    console.log('');
}

main();
