const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require ('mongoose');
const cors = require ('cors');
const dotenv = require ('dotenv');
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

  const gameSchema = new mongoose.Schema({
    gameId: String,
    playersIds: String
  })

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
  });

io.on('connection', (socket) => {
  socket.on('joinGame', (gameId) => {
    socket.join(gameId);
    // Handle player joining a game
  });

  socket.on('playerAction', (action) => {
    // Process action, update game state, determine next turn
    io.to(action.gameId).emit('gameUpdate', updatedGameState);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});