const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { initializeGame, processMove, updateGameState } = require('./gamelogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());

let games = {}; // Stores ongoing games

// Start a new game
app.post('/start', (req, res) => {
    const gameId = `game_${Date.now()}`;
    games[gameId] = initializeGame();
    res.json({ gameId, gameState: games[gameId] });
});

// Get the current game state
app.get('/state/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    if (!games[gameId]) {
        return res.status(404).send('Game not found');
    }
    res.json(games[gameId]);
});

// Make a move
app.post('/move/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const { playerId, move } = req.body;

    if (!games[gameId]) {
        return res.status(404).send('Game not found');
    }

    const moveResult = processMove(playerId, move, games[gameId]);

    if (!moveResult.valid) {
        return res.status(400).json({ error: moveResult.error });
    }

    games[gameId] = updateGameState(games[gameId], move);

    io.to(gameId).emit('gameUpdate', games[gameId]);
    res.json(games[gameId]);
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
