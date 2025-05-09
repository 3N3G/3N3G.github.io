/**
 * API Service
 * 
 * This file contains functions for communicating with the game's backend API.
 */

import { Board } from '../types/game';

const API_URL = 'https://strands-up-backend.onrender.com/api/game';

/**
 * Generates a new game board using the provided API key.
 * 
 * @param apiKey - The Anthropic API key for authentication
 * @returns A Promise that resolves to a Board object
 * @throws Error if the API request fails
 */
export const generateGame = async (apiKey: string): Promise<Board> => {
    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                seed_word: null  // Optional seed word for themed generation
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.detail || 
                `Failed to generate game: ${response.statusText}`
            );
        }

        const data = await response.json();
        return {
            grid: data.board,
            words: data.words,
            spangram: data.spangram,
            theme: data.theme,
            placementInfo: {
                spangram: data.placement_info.spangram,
                words: data.placement_info.words,
            },
        };
    } catch (error) {
        console.error('Error generating game:', error);
        throw error;
    }
}; 