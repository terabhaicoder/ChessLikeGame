function initializeGame() {
    return {
        grid: [
            ['P1', 'P1', 'H1', 'P1', 'P1'],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['P2', 'P2', 'H2', 'P2', 'P2']
        ],
        players: {
            player1: { id: 'P1', characters: ['P1', 'H1'], alive: 5 },
            player2: { id: 'P2', characters: ['P2', 'H2'], alive: 5 }
        },
        currentTurn: 'player1'
    };
}

function processMove(playerId, move, gameState) {
    const [character, direction] = move.split(':');
    const { grid, players } = gameState;
    const player = players[playerId];
    const opponentId = playerId === 'player1' ? 'player2' : 'player1';
    const opponent = players[opponentId];

    if (!player.characters.includes(character)) {
        return { valid: false, error: 'Invalid character selection' };
    }

    const [x, y] = findCharacterPosition(grid, character);
    if (x === -1 && y === -1) {
        return { valid: false, error: 'Character not found on the grid' };
    }

    let [newX, newY] = [x, y];
    switch (direction) {
        case 'L':
            newY -= 1;
            break;
        case 'R':
            newY += 1;
            break;
        case 'F':
            newX -= 1;
            break;
        case 'B':
            newX += 1;
            break;
        case 'FL':
            newX -= 2;
            newY -= 2;
            break;
        case 'FR':
            newX -= 2;
            newY += 2;
            break;
        case 'BL':
            newX += 2;
            newY -= 2;
            break;
        case 'BR':
            newX += 2;
            newY += 2;
            break;
        default:
            return { valid: false, error: 'Invalid move direction' };
    }

    if (isOutOfBounds(newX, newY) || (character === 'H2' && !['FL', 'FR', 'BL', 'BR'].includes(direction)) || (character === 'H1' && (Math.abs(newX - x) !== 2 || Math.abs(newY - y) !== 0))) {
        return { valid: false, error: 'Move is out of bounds or invalid for this character' };
    }

    if (grid[newX][newY] && grid[newX][newY].startsWith(player.id)) {
        return { valid: false, error: 'Cannot move onto a friendly character' };
    }

    if (grid[newX][newY] && grid[newX][newY].startsWith(opponent.id)) {
        opponent.alive -= 1;
    }

    grid[x][y] = '';
    grid[newX][newY] = character;

    return { valid: true };
}

function updateGameState(gameState, move) {
    const { grid, players, currentTurn } = gameState;
    const playerId = currentTurn;
    const moveResult = processMove(playerId, move, gameState);

    if (moveResult.valid) {
        gameState.currentTurn = playerId === 'player1' ? 'player2' : 'player1';
    }

    return {
        ...gameState,
        grid,
        players,
        currentTurn: gameState.currentTurn
    };
}

function findCharacterPosition(grid, character) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === character) {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}

function isOutOfBounds(x, y) {
    return x < 0 || x >= 5 || y < 0 || y >= 5;
}

module.exports = { initializeGame, processMove, updateGameState };
