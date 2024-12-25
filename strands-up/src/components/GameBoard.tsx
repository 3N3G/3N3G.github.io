/**
 * GameBoard Component
 * 
 * This component renders the interactive word search game board and handles game mechanics.
 * 
 * Features:
 * - Interactive grid of letters
 * - Word selection by clicking adjacent cells
 * - Visual path drawing between selected cells
 * - Word validation against theme words and spangram
 * - Visual feedback for selected and found words
 * - Toggleable word list display
 * 
 * Game Rules:
 * - Players can select letters by clicking adjacent cells
 * - Clicking a non-adjacent cell clears the selection
 * - Clicking the same cell twice checks if the selected letters form a valid word
 * - Found words are highlighted and their cells become unclickable
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlacementInfo } from '../types/game';

interface GameBoardProps {
    board: string[][];
    words: string[];
    spangram: string;
    placementInfo: PlacementInfo;
    theme: string;
}

type Position = [number, number];

export const GameBoard: React.FC<GameBoardProps> = ({
    board,
    words,
    spangram,
    placementInfo,
    theme,
}) => {
    // State management for game interaction
    const [selectedCells, setSelectedCells] = useState<Position[]>([]);
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
    const [foundPaths, setFoundPaths] = useState<Set<string>>(new Set());
    const [showWordList, setShowWordList] = useState<boolean>(true);
    const [cellPositions, setCellPositions] = useState<Map<string, DOMRect>>(new Map());
    const gridRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'info' | null }>({ text: '', type: null });

    // Reset state when a new game is started
    useEffect(() => {
        setSelectedCells([]);
        setFoundWords(new Set());
        setFoundPaths(new Set());
    }, [board]);

    // Update cell positions when the grid is mounted or resized
    useEffect(() => {
        const updateCellPositions = () => {
            const newPositions = new Map<string, DOMRect>();
            if (gridRef.current) {
                const cells = gridRef.current.getElementsByClassName('grid-cell');
                Array.from(cells).forEach((cell) => {
                    const rect = cell.getBoundingClientRect();
                    const id = cell.getAttribute('data-position');
                    if (id) {
                        newPositions.set(id, rect);
                    }
                });
            }
            setCellPositions(newPositions);
        };

        updateCellPositions();
        window.addEventListener('resize', updateCellPositions);
        return () => window.removeEventListener('resize', updateCellPositions);
    }, [board]);

    /**
     * Checks if two cells are adjacent (including diagonals)
     */
    const isAdjacent = (pos1: Position, pos2: Position): boolean => {
        const [row1, col1] = pos1;
        const [row2, col2] = pos2;
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
    };

    /**
     * Converts a path to a string for Set storage
     */
    const pathToString = (path: Position[]): string => {
        return path.map(([r, c]) => `${r},${c}`).join('|');
    };

    /**
     * Gets the center coordinates of a cell for line drawing
     */
    const getCellCenter = (position: Position): { x: number; y: number } | null => {
        const rect = cellPositions.get(`${position[0]},${position[1]}`);
        if (!rect) return null;
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    };

    /**
     * Renders SVG bubble paths connecting selected cells
     */
    const renderBubblePath = () => {
        if (selectedCells.length < 2) return null;

        const gridRect = gridRef.current?.getBoundingClientRect();
        if (!gridRect) return null;

        const points: { x: number; y: number }[] = [];
        selectedCells.forEach(pos => {
            const center = getCellCenter(pos);
            if (center) {
                points.push({
                    x: center.x - gridRect.left,
                    y: center.y - gridRect.top
                });
            }
        });

        if (points.length < 2) return null;

        // Create a path that follows the points with a bubble-like shape
        const cellSize = 40; // Size of each grid cell
        const radius = cellSize * 0.36; // Radius of the bubbles around cells (40% smaller than 0.6)
        const tubeWidth = cellSize * 0.4; // Width of the connecting tube

        let path = '';
        
        // Function to create a smooth curve between points
        const createSmoothCurve = (p1: typeof points[0], p2: typeof points[0]) => {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normal = { x: -dy / distance, y: dx / distance };
            
            const halfTubeWidth = tubeWidth / 2;
            
            // Points for the tube sides
            const topStart = { x: p1.x + normal.x * halfTubeWidth, y: p1.y + normal.y * halfTubeWidth };
            const bottomStart = { x: p1.x - normal.x * halfTubeWidth, y: p1.y - normal.y * halfTubeWidth };
            const topEnd = { x: p2.x + normal.x * halfTubeWidth, y: p2.y + normal.y * halfTubeWidth };
            const bottomEnd = { x: p2.x - normal.x * halfTubeWidth, y: p2.y - normal.y * halfTubeWidth };
            
            return `
                M ${topStart.x} ${topStart.y}
                L ${topEnd.x} ${topEnd.y}
                A ${halfTubeWidth} ${halfTubeWidth} 0 0 1 ${bottomEnd.x} ${bottomEnd.y}
                L ${bottomStart.x} ${bottomStart.y}
                A ${halfTubeWidth} ${halfTubeWidth} 0 0 1 ${topStart.x} ${topStart.y}
            `;
        };

        // Create bubbles around each point
        points.forEach((point, i) => {
            path += `
                M ${point.x} ${point.y - radius}
                A ${radius} ${radius} 0 1 0 ${point.x} ${point.y + radius}
                A ${radius} ${radius} 0 1 0 ${point.x} ${point.y - radius}
            `;
            
            // Create connecting tubes between consecutive points
            if (i < points.length - 1) {
                path += createSmoothCurve(point, points[i + 1]);
            }
        });

        return (
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
            >
                <path
                    d={path}
                    fill="rgba(49, 130, 206, 0.2)"  // Semi-transparent blue
                    strokeWidth="0"  // Remove border
                />
            </svg>
        );
    };

    /**
     * Handles cell click events for word selection
     */
    const handleCellClick = (row: number, col: number) => {
        const clickedPos: Position = [row, col];
        
        // Check if clicking the same cell to complete a word
        if (selectedCells.length > 0) {
            const lastCell = selectedCells[selectedCells.length - 1];
            if (lastCell[0] === row && lastCell[1] === col) {
                checkForWord(selectedCells);
                return;
            }
        }
        
        // Clear selection if clicking non-adjacent or found word cell
        if (
            selectedCells.length > 0 &&
            (!isAdjacent(selectedCells[selectedCells.length - 1], clickedPos) ||
            foundPaths.has(`${row},${col}`))
        ) {
            setSelectedCells([]);
            return;
        }
        
        // Add cell to selection
        setSelectedCells([...selectedCells, clickedPos]);
    };

    /**
     * Validates the selected cells against valid words
     */
    const checkForWord = (cells: Position[]) => {
        const selectedWord = cells
            .map(([row, col]) => board[row][col])
            .join('');

        // Check against valid word paths
        const pathStr = pathToString(cells);
        const allPlacements = [
            { word: spangram, path: placementInfo.spangram.path },
            ...placementInfo.words.map(w => ({ word: w.word, path: w.path }))
        ];

        const foundPlacement = allPlacements.find(({ word, path }) => {
            const correctPathStr = pathToString(path);
            return (
                word.toLowerCase() === selectedWord.toLowerCase() &&
                (pathStr === correctPathStr || pathStr === correctPathStr.split('|').reverse().join('|'))
            );
        });

        if (foundPlacement && !foundWords.has(foundPlacement.word)) {
            // Mark word as found
            const newFoundWords = new Set(foundWords);
            newFoundWords.add(foundPlacement.word);
            setFoundWords(newFoundWords);

            // Mark cells as found
            const newFoundPaths = new Set(foundPaths);
            cells.forEach(([r, c]) => newFoundPaths.add(`${r},${c}`));
            setFoundPaths(newFoundPaths);

            // Show success message
            setMessage({
                text: foundPlacement.word === spangram 
                    ? 'Congratulations! You found the spangram!' 
                    : `You found "${foundPlacement.word}"!`,
                type: 'success'
            });

            // Check for game completion
            if (newFoundWords.size === allPlacements.length) {
                setTimeout(() => {
                    setMessage({
                        text: 'Congratulations! You found all the words!',
                        type: 'success'
                    });
                }, 1000);
            }
        } else if (cells.length > 0) {
            // Show "try again" message only if cells were selected
            setMessage({ text: 'Try again!', type: 'info' });
        }

        setSelectedCells([]);
    };

    /**
     * Determines the visual style for a cell based on its state
     */
    const getCellStyle = (row: number, col: number): React.CSSProperties => {
        const isSelected = selectedCells.some(([r, c]) => r === row && c === col);
        const isFound = foundPaths.has(`${row},${col}`);
        
        const baseStyle: React.CSSProperties = {
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            cursor: isFound ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            backgroundColor: 'transparent',
        };

        if (isFound) {
            return {
                ...baseStyle,
                backgroundColor: 'rgba(72, 187, 120, 0.2)',
            };
        }

        if (isSelected) {
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
            };
        }

        return baseStyle;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'stretch' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center' }}>
                Theme: {theme}
            </div>
            <div style={{ position: 'relative' }} ref={gridRef}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${board[0].length}, 40px)`,
                        gap: '4px',
                        margin: '0 auto',
                    }}
                >
                    {board.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className="grid-cell"
                                data-position={`${rowIndex},${colIndex}`}
                                onClick={() => !foundPaths.has(`${rowIndex},${colIndex}`) && handleCellClick(rowIndex, colIndex)}
                                style={getCellStyle(rowIndex, colIndex)}
                            >
                                <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                                    {cell}
                                </span>
                            </div>
                        ))
                    )}
                </div>
                {renderBubblePath()}
            </div>

            {message.text && (
                <div
                    style={{
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: message.type === 'success' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(49, 130, 206, 0.1)',
                        color: message.type === 'success' ? '#2F855A' : '#2B6CB0',
                        textAlign: 'center',
                    }}
                >
                    {message.text}
                </div>
            )}

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold' }}>
                        Words Found: {foundWords.size}/{words.length + 1}
                    </div>
                    <button
                        onClick={() => setShowWordList(!showWordList)}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#4A5568',
                        }}
                    >
                        {showWordList ? 'Hide Words' : 'Show Words'}
                    </button>
                </div>
                {showWordList && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {[...words, spangram].map((word) => (
                            <span
                                key={word}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: foundWords.has(word) ? 'rgba(72, 187, 120, 0.1)' : 'rgba(160, 174, 192, 0.1)',
                                    textDecoration: foundWords.has(word) ? 'line-through' : 'none',
                                    fontSize: '0.875rem',
                                }}
                            >
                                {word}
                                {word === spangram && ' (spangram)'}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 