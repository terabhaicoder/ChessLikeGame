let socket;
let gameId;
let playerId = 'player1';

document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('makeMove').addEventListener('click', makeMove);

function startGame() {
    fetch('/start', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        gameId = data.gameId;
        socket = io();

        socket.emit('joinGame', gameId);
        socket.on('gameUpdate', updateGameBoard);

        document.getElementById('moveControls').style.display = 'block';
        updateGameBoard(data.gameState);
    });
}

function makeMove() {
    const character = document.getElementById('character').value.trim();
    const direction = document.getElementById('direction').value.trim();

    if (!character || !direction) {
        alert('Please enter both character and direction.');
        return;
    }

    fetch(`/move/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, move: `${character}:${direction}` })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            updateGameBoard(data);
        }
    });
}

function updateGameBoard(gameState) {
    const grid = gameState.grid;
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = document.createElement('div');
            cell.innerText = grid[i][j] || '';
            gridContainer.appendChild(cell);
        }
    }

    const status = document.getElementById('status');
    status.innerText = `Current Turn: ${gameState.currentTurn}`;
}
