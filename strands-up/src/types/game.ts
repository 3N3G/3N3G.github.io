/**
 * Game Types
 * 
 * This file contains type definitions for the word search game.
 */

export type Position = [number, number];

export interface WordPlacement {
    word: string;
    path: Position[];
}

export interface PlacementInfo {
    spangram: WordPlacement;
    words: WordPlacement[];
}

export interface Board {
    grid: string[][];
    words: string[];
    spangram: string;
    theme: string;
    placementInfo: PlacementInfo;
} 