// Chess piece Unicode characters
const pieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',  // White pieces
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'   // Black pieces
};

// Initial board setup
const initialPosition = [
    'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
    'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
];

// The Immortal Game moves in algebraic notation
const immortalGame = [
    "e4", "e5",
    "f4", "exf4",
    "Bc4", "Qh4+",
    "Kf1", "b5",
    "Bxb5", "Nf6",
    "Nf3", "Qh6",
    "d3", "Nh5",
    "Nh4", "Qg5",
    "Nf5", "c6",
    "g4", "Nf6",
    "Rg1", "cxb5",
    "h4", "Qg6",
    "h5", "Qg5",
    "Qf3", "Ng8",
    "Bxf4", "Qf6",
    "Nc3", "Bc5",
    "Nd5", "Qxb2",
    "Bd6", "Bxg1",
    "e5", "Qxa1+",
    "Ke2", "Na6",
    "Nxg7+", "Kd8",
    "Qf6+", "Nxf6",
    "Be7#"
];

let currentBoard = [...initialPosition];
let currentMoveIndex = 0;
let isPlaying = false;
let playInterval;
let boardHistory = [initialPosition];

// Convert algebraic notation to board indices
function algebraicToIndex(algebraic) {
    const file = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(algebraic[1]);
    return rank * 8 + file;
}

// Get coordinates from index
function getCoordinates(index) {
    const rank = Math.floor(index / 8);
    const file = index % 8;
    return { x: file * 70, y: rank * 70 };
}

// Create the chess board
function createBoard() {
    const board = document.getElementById('board');
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        const row = Math.floor(i / 8);
        const col = i % 8;
        square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
        square.id = `square-${i}`;
        board.appendChild(square);
    }
    updateBoard();
}

// Create a piece element
function createPieceElement(piece, index) {
    const pieceDiv = document.createElement('div');
    pieceDiv.className = 'piece';
    pieceDiv.textContent = pieces[piece];
    pieceDiv.setAttribute('data-piece', pieces[piece]);
    pieceDiv.id = `piece-${index}`;
    return pieceDiv;
}

// Update the board display
function updateBoard() {
    // Clear all squares
    for (let i = 0; i < 64; i++) {
        const square = document.getElementById(`square-${i}`);
        square.innerHTML = '';
        if (currentBoard[i] !== ' ') {
            const pieceDiv = createPieceElement(currentBoard[i], i);
            square.appendChild(pieceDiv);
        }
    }
    document.getElementById('moveInfo').textContent = `Move: ${Math.floor(currentMoveIndex / 2) + 1}${currentMoveIndex % 2 === 0 ? ' (White)' : ' (Black)'}`;
}

// Animate piece movement
function animatePieceMovement(fromIndex, toIndex, piece) {
    const fromSquare = document.getElementById(`square-${fromIndex}`);
    const toSquare = document.getElementById(`square-${toIndex}`);
    const pieceElement = fromSquare.querySelector('.piece');
    
    if (pieceElement) {
        // Add moving class for elevation
        pieceElement.classList.add('moving');
        
        // Calculate the movement distance
        const fromCoord = getCoordinates(fromIndex);
        const toCoord = getCoordinates(toIndex);
        const deltaX = toCoord.x - fromCoord.x;
        const deltaY = toCoord.y - fromCoord.y;
        
        // Update the board state immediately but keep the old piece for animation
        currentBoard = [...boardHistory[boardHistory.length - 1]];
        
        // Animate the piece
        pieceElement.style.transform = `translateZ(100px) translate(${deltaX}px, ${deltaY}px)`;
        
        // After animation, update the visual board
        setTimeout(() => {
            updateBoard();
        }, 500);
    }
}

// Get piece position
function findPiece(piece, targetSquare, isWhiteTurn, sourceFile = null, sourceRank = null) {
    const pieceChar = isWhiteTurn ? piece.toUpperCase() : piece.toLowerCase();
    const targetIndex = algebraicToIndex(targetSquare);
    const targetRank = 8 - parseInt(targetSquare[1]);
    const targetFile = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    
    // For pawns
    if (piece === 'P') {
        const file = sourceFile ? sourceFile.charCodeAt(0) - 'a'.charCodeAt(0) : targetFile;
        const startRank = isWhiteTurn ? 6 : 1;
        const direction = isWhiteTurn ? -1 : 1;
        const currentRank = targetRank - direction;
        
        // For captures
        if (sourceFile) {
            const fromIndex = currentRank * 8 + file;
            if (currentBoard[fromIndex] === pieceChar) {
                return fromIndex;
            }
        } else {
            // Normal pawn moves
            const fromIndex = currentRank * 8 + file;
            if (currentBoard[fromIndex] === pieceChar) {
                return fromIndex;
            }
            
            // Check two squares ahead if on starting rank
            if (currentRank === startRank) {
                const twoAhead = (startRank + direction * 2) * 8 + file;
                if (currentBoard[twoAhead] === pieceChar && currentBoard[fromIndex] === ' ') {
                    return twoAhead;
                }
            }
        }
        return -1;
    }
    
    // For other pieces
    const candidates = [];
    for (let i = 0; i < 64; i++) {
        if (currentBoard[i] === pieceChar) {
            const rank = Math.floor(i / 8);
            const file = i % 8;
            
            // Filter by source file/rank if provided
            if (sourceFile && file !== (sourceFile.charCodeAt(0) - 'a'.charCodeAt(0))) continue;
            if (sourceRank && rank !== (8 - parseInt(sourceRank))) continue;
            
            // Check if the move is legal based on piece type
            if (isLegalMove(piece, i, targetIndex, isWhiteTurn)) {
                candidates.push(i);
            }
        }
    }
    
    // If only one candidate, return it
    if (candidates.length === 1) {
        return candidates[0];
    }
    
    // If multiple candidates, try to find the most logical one
    if (candidates.length > 1) {
        // Prefer pieces that are closer to the target
        return candidates.reduce((best, current) => {
            const bestDist = getManhattanDistance(best, targetIndex);
            const currentDist = getManhattanDistance(current, targetIndex);
            return currentDist < bestDist ? current : best;
        });
    }
    
    return -1;
}

// Helper function to calculate Manhattan distance between squares
function getManhattanDistance(from, to) {
    const fromRank = Math.floor(from / 8);
    const fromFile = from % 8;
    const toRank = Math.floor(to / 8);
    const toFile = to % 8;
    return Math.abs(fromRank - toRank) + Math.abs(fromFile - toFile);
}

// Check if a move is legal based on piece type
function isLegalMove(piece, from, to, isWhiteTurn) {
    const fromRank = Math.floor(from / 8);
    const fromFile = from % 8;
    const toRank = Math.floor(to / 8);
    const toFile = to % 8;
    
    const rankDiff = Math.abs(toRank - fromRank);
    const fileDiff = Math.abs(toFile - fromFile);
    
    switch (piece) {
        case 'K':
            return rankDiff <= 1 && fileDiff <= 1;
        case 'Q':
            return rankDiff === fileDiff || rankDiff === 0 || fileDiff === 0;
        case 'R':
            return rankDiff === 0 || fileDiff === 0;
        case 'B':
            return rankDiff === fileDiff;
        case 'N':
            return (rankDiff === 2 && fileDiff === 1) || (rankDiff === 1 && fileDiff === 2);
        default:
            return true; // Pawns are handled separately
    }
}

// Make a move on the board
function makeMove(move) {
    const isWhiteTurn = currentMoveIndex % 2 === 0;
    let piece = 'P';  // Default to pawn
    let targetSquare = move;
    let capture = false;
    let sourceFile = null;
    let sourceRank = null;
    
    // Handle special move notations
    if (move.includes('x')) {
        capture = true;
        const parts = move.split('x');
        if (parts[0].length === 1 && !parts[0].match(/[KQRBN]/)) {
            // Pawn capture
            sourceFile = parts[0];
            piece = 'P';
        } else {
            // Piece capture
            piece = parts[0][0];
            if (parts[0].length > 1) {
                // Source square info included
                sourceFile = parts[0][1];
                if (parts[0].length > 2) {
                    sourceRank = parts[0][2];
                }
            }
        }
        targetSquare = parts[1];
    } else if (move.match(/^[KQRBN]/)) {
        // Piece move
        piece = move[0];
        if (move.length > 3) {
            // Source square info included
            sourceFile = move[1];
            if (move.length > 4) {
                sourceRank = move[2];
                targetSquare = move.slice(3);
            } else {
                targetSquare = move.slice(2);
            }
        } else {
            targetSquare = move.slice(1);
        }
    }
    
    // Handle castling
    if (move === 'O-O' || move === 'O-O-O') {
        const rank = isWhiteTurn ? 7 : 0;
        const kingFrom = rank * 8 + 4;
        const rookFrom = rank * 8 + (move === 'O-O' ? 7 : 0);
        const kingTo = rank * 8 + (move === 'O-O' ? 6 : 2);
        const rookTo = rank * 8 + (move === 'O-O' ? 5 : 3);
        
        // Create new board state for castling
        const newBoard = [...currentBoard];
        newBoard[kingTo] = newBoard[kingFrom];
        newBoard[kingFrom] = ' ';
        newBoard[rookTo] = newBoard[rookFrom];
        newBoard[rookFrom] = ' ';
        
        // Store the new state
        boardHistory.push([...newBoard]);
        
        // Move king
        animatePieceMovement(kingFrom, kingTo, 'K');
        setTimeout(() => {
            // Move rook
            animatePieceMovement(rookFrom, rookTo, 'R');
        }, 500);
        return;
    }
    
    const toIndex = algebraicToIndex(targetSquare);
    const fromIndex = findPiece(piece, targetSquare, isWhiteTurn, sourceFile, sourceRank);
    
    if (fromIndex >= 0 && toIndex >= 0) {
        // Create new board state
        const newBoard = [...currentBoard];
        newBoard[toIndex] = newBoard[fromIndex];
        newBoard[fromIndex] = ' ';
        
        // Store the new state
        boardHistory.push([...newBoard]);
        
        // Animate the move
        animatePieceMovement(fromIndex, toIndex, piece);
    }
}

// Play/Pause the animation
function togglePlay() {
    const playPauseButton = document.getElementById('playPause');
    if (isPlaying) {
        clearInterval(playInterval);
        playPauseButton.textContent = 'Play';
    } else {
        playInterval = setInterval(() => {
            if (currentMoveIndex < immortalGame.length) {
                makeMove(immortalGame[currentMoveIndex]);
                currentMoveIndex++;
            } else {
                clearInterval(playInterval);
                playPauseButton.textContent = 'Play';
                isPlaying = false;
            }
        }, 1500);
        playPauseButton.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
}

// Event listeners
document.getElementById('playPause').addEventListener('click', togglePlay);
document.getElementById('nextMove').addEventListener('click', () => {
    if (currentMoveIndex < immortalGame.length) {
        makeMove(immortalGame[currentMoveIndex]);
        currentMoveIndex++;
    }
});
document.getElementById('prevMove').addEventListener('click', () => {
    if (currentMoveIndex > 0) {
        currentMoveIndex--;
        boardHistory.pop(); // Remove the last state
        currentBoard = [...boardHistory[boardHistory.length - 1]];
        updateBoard();
    }
});

// Add rotation controls
let rotationY = 0;
document.addEventListener('keydown', (e) => {
    const container = document.querySelector('.chess-container');
    if (e.key === 'ArrowLeft') {
        rotationY -= 5;
        container.style.transform = `rotateX(20deg) rotateY(${rotationY}deg)`;
    } else if (e.key === 'ArrowRight') {
        rotationY += 5;
        container.style.transform = `rotateX(20deg) rotateY(${rotationY}deg)`;
    }
});

// Initialize the board
createBoard(); 