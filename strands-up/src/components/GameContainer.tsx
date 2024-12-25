/**
 * GameContainer Component
 * 
 * This component serves as the main container for the word search game.
 * It manages the game state, handles API communication, and renders the game board.
 * 
 * Features:
 * - API key input for game generation
 * - Game board rendering
 * - Error handling for API communication
 * - Loading state management
 */

import React, { useState } from 'react';
import { GameBoard } from './GameBoard';
import { generateGame } from '../services/api';
import { Board } from '../types/game';

export const GameContainer: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [board, setBoard] = useState<Board | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGenerateGame = async () => {
        if (!apiKey) {
            setError('Please enter your API key');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const newBoard = await generateGame(apiKey);
            setBoard(newBoard);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate game');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="game-container">
            <div className="api-key-input">
                <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    style={{
                        padding: '8px',
                        marginRight: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                />
                <button
                    onClick={handleGenerateGame}
                    disabled={isLoading}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        backgroundColor: '#4299E1',
                        color: 'white',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                    }}
                >
                    {isLoading ? 'Generating...' : 'Generate Game'}
                </button>
            </div>

            {error && (
                <div style={{ color: 'red', marginTop: '8px' }}>
                    {error}
                </div>
            )}

            {board && (
                <GameBoard
                    board={board.grid}
                    words={board.words}
                    spangram={board.spangram}
                    placementInfo={board.placementInfo}
                    theme={board.theme}
                />
            )}
        </div>
    );
}; 