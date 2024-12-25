/**
 * App Component
 * 
 * This is the root component of the application.
 * It renders the game title and the GameContainer component.
 */

import React from 'react';
import { GameContainer } from './components/GameContainer';

export const App: React.FC = () => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            textAlign: 'center',
        }}>
            <h1 style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
                color: '#2D3748',
            }}>
                Strands Up
            </h1>
            <p style={{
                fontSize: '1.1rem',
                marginBottom: '2rem',
                color: '#4A5568',
            }}>
                Find themed words and a special "spangram" - the longest word that ties the theme together.
            </p>
            <GameContainer />
        </div>
    );
};
