const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require ('mongoose');
const cors = require ('cors');
const dotenv = require ('dotenv');
const { v4: uuidv4 } = require('uuid');
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // Allow only the client origin to connect
  }
});
app.use(cors());
app.use(express.json());

const stack = [
  {name: "two",   suit: "spades"},
  {name: "three", suit: "spades"},
  {name: "four",  suit: "spades"}, 
  {name: "five",  suit: "spades"}, 
  {name: "six",   suit: "spades"},
  {name: "seven", suit: "spades"}, 
  {name: "eight", suit: "spades"}, 
  {name: "nine",  suit: "spades"}, 
  {name: "ten",   suit: "spades"},
  {name: "jack",  suit: "spades"}, 
  {name: "queen", suit: "spades"}, 
  {name: "king",  suit: "spades"},
  {name: "ace",   suit: "spades"},
  {name: "two",   suit: "hearts"},
  {name: "three", suit: "hearts"}, 
  {name: "four",  suit: "hearts"},
  {name: "five",  suit: "hearts"},
  {name: "six",   suit: "hearts"},
  {name: "seven", suit: "hearts"}, 
  {name: "eight", suit: "hearts"}, 
  {name: "nine",  suit: "hearts"},
  {name: "ten",   suit: "hearts"},
  {name: "jack",  suit: "hearts"},
  {name: "queen", suit: "hearts"}, 
  {name: "king",  suit: "hearts"},
  {name: "ace",   suit: "hearts"},
  {name: "two",  suit:"diamonds"}, 
  {name:"three",suit: "diamonds"},
  {name: "four",suit:"diamonds"},
  {name: "five",suit:"diamonds"},
  {name: "six",suit: "diamonds" },
  {name: "seven", suit:"diamonds"},
  {name: "eight",suit:"diamonds"},
  {name: "nine",suit:"diamonds" },
  {name: "ten",   suit:"diamonds"},
  {name: "jack",suit:"diamonds" },
  {name: "queen",suit:"diamonds"},
  {name: "king",suit:"diamonds" },
  {name: "ace",suit:"diamonds"  },
  {name: "two",suit: "clubs"    }, 
  {name: "three",suit: "clubs"  }, 
  {name: "four",  suit: "clubs" }, 
  {name: "five",  suit: "clubs" }, 
  {name: "six",   suit: "clubs" }, 
  {name: "seven", suit: "clubs" }, 
  {name: "eight", suit: "clubs" }, 
  {name: "nine",  suit: "clubs" }, 
  {name: "ten",   suit: "clubs" }, 
  {name: "jack",  suit: "clubs" }, 
  {name: "queen", suit: "clubs" }, 
  {name: "king",  suit: "clubs" }, 
  {name: "ace",   suit: "clubs" },               
]

const gameDecks = {};
let playerToSocketMap = {};
let currentPlayerIndex;


function shuffleDeck(stack) {
  const deck = [...stack]; // Create a copy of the deck to avoid modifying the original
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
  }
  return deck;
}
async function dealCards(gameId, playersIds) {
  let deck = gameDecks[gameId];
  let game = await Game.findOne({ gameId });

  playersIds.forEach(playerId => {
    const socketId = playerToSocketMap[playerId];
    if (socketId) {
      const dealtCards = deck.splice(0, 2); // Take the first two cards from the deck
      console.log(`Dealing cards to socket ${socketId}:`, dealtCards);
      io.to(socketId).emit('cardsDealt', dealtCards);
    }
  });

  gameDecks[gameId] = deck; // Save the updated deck back to the gameDecks

  if (game) {
    // Assuming the dealer is the first player in the list for this example
    // This logic may change depending on your game's rules
    let firstPlayerIndex = 0;
    game.currentPlayerIndex = firstPlayerIndex;
    await game.save();

    // Notify all players about who's turn it is
    playersIds.forEach((playerId, index) => {
      const isTurn = index === firstPlayerIndex;
      const socketId = playerToSocketMap[playerId];
      if (socketId) {
        io.to(socketId).emit('updateTurn', { isTurn, playerId });
      }
    });
  }

  // Optionally, update the game state in MongoDB if needed
  // This part can be expanded based on how you store and manage game state
}
const Chips = {};

// When a game is started or players join, initialize their chips
const initializePlayerChips = async (gameId, playersIds) => {
  let chips = 1000;
  let game = await Game.findOne({ gameId });
  playersIds.forEach(playerId => {
    const socketId = playerToSocketMap[playerId];
    if (socketId) {
      const playerChips = chips;
      console.log(`Dealing chips to socket ${socketId}:`, playerChips);
      io.to(socketId).emit('chipsDealt', playerChips);
    }
  });
};
async function validateBetAmount(gameId, playerId, playerChips, betAmount) {
  let game = await Game.findOne({ gameId });
  const socketId = playerToSocketMap[playerId];
  // Example validation criteria
  const isAmountValid = betAmount > 0 && betAmount <= playerChips;
  const meetsMinimumBet = betAmount >= 20;
  return isAmountValid && meetsMinimumBet;
}
async function advanceTurn(gameId) {
  let game = await Game.findOne({ gameId });
  if (!game || !game.playersIds.length) return;

  // Advance the turn
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
  await game.save();

  // Notify players about the turn update
  game.playersIds.forEach((playerId, index) => {
    const isTurn = index === game.currentPlayerIndex;
    const socketId = playerToSocketMap[playerId];
    if (socketId) {
      io.to(socketId).emit('updateTurn', { isTurn, playerId });
    }
  });
}
function dealFlop(gameId) {
  let deck = gameDecks[gameId];
  
  // Deal three cards for the flop
  const flopCards = deck.splice(0, 3); // Take the first three cards from the deck

  // Save the updated deck back to the gameDecks
  gameDecks[gameId] = deck;
  
  // Return the flop cards to be broadcasted
  return flopCards;
}
function dealTurn(gameId) {
  let deck = gameDecks[gameId];
  
  // Deal three cards for the flop
  const turnCards = deck.splice(0, 1); // Take the first three cards from the deck

  // Save the updated deck back to the gameDecks
  gameDecks[gameId] = deck;
  
  // Return the flop cards to be broadcasted
  return turnCards;
}
function dealRiver(gameId) {
  let deck = gameDecks[gameId];
  
  // Deal three cards for the flop
  const riverCards = deck.splice(0, 1); // Take the first three cards from the deck

  // Save the updated deck back to the gameDecks
  gameDecks[gameId] = deck;
  
  // Return the flop cards to be broadcasted
  return riverCards;
}



const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Assuming you've connected to MongoDB successfully
const gameSchema = new mongoose.Schema({
  gameId: String,
  playersIds: [String],
  readyPlayers: {
    type: [String],
    default: [] // Initialize as an empty array
  },
  tableCards: {},
  isLive: Boolean,
  pot: { type: Number, default: 0 },
  currentPlayerIndex: { type: Number, default: 0 } // Ensure this is included
});

  const Game = mongoose.model('Game', gameSchema);

  app.get('/api/get-game-id', async (req, res) => {
    const gameId = req.query.gameId;
    try {
        const games = await Game.find({ gameId: gameId });
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching games');
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
  });

  io.on('connection', (socket) => {
    socket.on('joinGame', async ({ gameId, playerName, playerId }) => {
      playerToSocketMap[playerId] = socket.id;
      
      
        let game = await Game.findOne({ gameId: gameId });        
  
        if (!game) {
          // If the game does not exist, create a new one with the current player as the host
          game = new Game({ gameId, playersIds: [], currentPlayerIndex: 0, pot: 0, isLive: false, tableCards: [] });
          await game.save();
          console.log(`Game created with ID: ${gameId} by host: ${playerId}`);
          if (!game.playersIds.includes(playerId)) {
            game.playersIds.push(playerId);
            game.pot = 0;
          }
        } else if (!game.playersIds.includes(playerId)) {
          game.playersIds.push(playerId);
          console.log(`Player ${playerId} joined game ${gameId}`);
        }
        await game.save();
        socket.join(gameId);  
        console.log(game.playersIds);
        // Notify all players in the game about the updated game state
        io.to(gameId).emit('gameUpdated', { gameId, game }); // Ensure clients join the gameId room to receive this
  
    });
    socket.on('startGame', async ({ gameId,playersIds }) => {
      let game = await Game.findOne({ gameId: gameId });
      if (game) {
        game.isLive = true;
        await game.save();
        console.log(game.playersIds)
        // Initialize and shuffle the game's deck
        gameSequence(game);
      }
    });
    async function gameSequence({ gameId,playersIds }) {
      let game = await Game.findOne({ gameId: gameId });
      initializePlayerChips(gameId, game.playersIds);
      gameDecks[gameId] = shuffleDeck(stack);
        dealCards(gameId, game.playersIds);
    }
    
    socket.on('requestFlop', async ({ gameId }) => {
      try {
        const game = await Game.findOne({ gameId: gameId });
        if (game) { // Check if the game is live
          const flopCards = dealFlop(gameId); // Get the flop cards from the deck
          // Broadcast the flop cards to all players in the game
          io.to(gameId).emit('flopDealt', flopCards);
        }
      } catch (error) {
        console.error('Error dealing flop:', error);
      }
    });
    socket.on('requestTurn', async ({ gameId }) => {
      try {
        const game = await Game.findOne({ gameId: gameId });
        if (game) { // Check if the game is live
          const turnCards = dealTurn(gameId); // Get the flop cards from the deck
          
          // Broadcast the flop cards to all players in the game
          io.to(gameId).emit('turnDealt', turnCards);
        }
      } catch (error) {
        console.error('Error dealing turn:', error);
      }
    });
    socket.on('requestRiver', async ({ gameId }) => {
      try {
        const game = await Game.findOne({ gameId: gameId });
        if (game) { // Check if the game is live
          const riverCards = dealRiver(gameId); // Get the flop cards from the deck
          
          // Broadcast the flop cards to all players in the game
          io.to(gameId).emit('riverDealt', riverCards);
        }
      } catch (error) {
        console.error('Error dealing river:', error);
      }
    });
    
socket.on('playerAction', async ({ gameId, action, playersIds, betAmount }) => {
  let game = await Game.findOne({ gameId });
   const currentPlayerId = game.playersIds[game.currentPlayerIndex];
  if (!game) return;
  switch (action) {
    case 'check':
      if (socket.id === playerToSocketMap[currentPlayerId]) {
    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    await advanceTurn(gameId);
  } 
  break;
    case 'bet':
  if (socket.id === playerToSocketMap[currentPlayerId]) {
    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    io.to(gameId).emit('potUpdated', { betAmount });
    io.to(gameId).emit('noCheck');
    io.to(gameId).emit('onlyBetRes');
    await advanceTurn(gameId);
  }
      break;
    case 'raise': 
  if (socket.id === playerToSocketMap[currentPlayerId]) {
    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    io.to(gameId).emit('potUpdated', { betAmount });
    io.to(gameId).emit('noCheck');
    io.to(gameId).emit('onlyBetRes');
    await advanceTurn(gameId);
  }
      break;
      case 'betres':
  if (socket.id === playerToSocketMap[currentPlayerId]) {
    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    io.to(gameId).emit('potUpdated', { betAmount });
    io.to(gameId).emit('noCheck');
    io.to(gameId).emit('resetTurn');
    await advanceTurn(gameId);
  }      
      break;
    case 'fold':
      // Handle fold
      break;
  }
});


  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
  });
  socket.on('playerReady', async ({ gameId, playerId }) => {
    let game = await Game.findOne({ gameId });
    if (game) {
      if (!game.readyPlayers.includes(playerId)) {
        game.readyPlayers.push(playerId);
      }
  
      // Remove duplicates from playersIds
      const uniquePlayersIds = [...new Set(game.playersIds)];
      if (uniquePlayersIds.length !== game.playersIds.length) {
        console.log('Duplicate playerId found and removed');
        game.playersIds = uniquePlayersIds;
      }
  
      await game.save();
      
      // Check if all players are ready
      if (game.readyPlayers.length === game.playersIds.length) {
        // All players are ready, start the game
        game.isLive = true;
        await game.save();
  
        // Notify players that the game has started
        io.to(gameId).emit('gameStarted', { gameId });
      } else {
        // Not all players are ready, update all clients with the current ready count
        io.to(gameId).emit('playersReady', { count: game.readyPlayers.length, total: game.playersIds.length });
      }
    }
  });
  socket.on('disconnect', () => {
    // Find and remove the disconnecting player's mapping
    const playerId = Object.keys(playerToSocketMap).find(id => playerToSocketMap[id] === socket.id);
    if (playerId) {
      delete playerToSocketMap[playerId];
    }
  });
  });


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});