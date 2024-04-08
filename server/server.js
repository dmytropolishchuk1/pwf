const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require ('mongoose');
const cors = require ('cors');
const dotenv = require ('dotenv');
const { v4: uuidv4 } = require('uuid');
const { basename } = require('path');
dotenv.config();
const app = express();
const { Mutex } = require('async-mutex');
const { error } = require('console');
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
  game.currentPlayerIndexFoldRef = 0;

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
    try {
        let chips = 5000;
        let game = await Game.findOne({ gameId });

        for (const playerId of playersIds) {
            const socketId = playerToSocketMap[playerId];
            if (socketId) {
                const playerChips = chips;
                console.log(`Dealing chips to socket ${socketId}:`, playerChips);
                io.to(socketId).emit('chipsDealt', playerChips);
                game.playerMoney.push(playerChips);
            }
        }

        await game.save();

    } catch (error) {
        console.error('Error initializing player chips:', error);
    }
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
async function blindsTurnUpdate(gameId) {
  let game = await Game.findOne({ gameId });
  if (!game || !game.playersIds.length) return;

  game.currentPlayerIndex = (game.dealerIndex + 1) % game.playersIds.length;
  

  // Notify players about the turn update
  game.playersIds.forEach((playerId, index) => {
    const isTurn = index === game.currentPlayerIndex;
    const socketId = playerToSocketMap[playerId];
    if (socketId) {
      io.to(socketId).emit('updateTurnSmallBlind', { isTurn, playerId });
      console.log(`${socketId} ${playerToSocketMap[playerId]} ${game.playersIds} ${isTurn} ${game.currentPlayerIndex}`)
    }
  });
  await game.save();
}
async function blindsTurnUpdate2(gameId) {
  let game = await Game.findOne({ gameId });
  if (!game || !game.playersIds.length) return;

  // Advance the turn
  game.currentPlayerIndex = (game.dealerIndex + 2) % game.playersIds.length;
  
  

  // Notify players about the turn update
  game.playersIds.forEach((playerId, index) => {
    const isTurn = index === game.currentPlayerIndex;
    const socketId = playerToSocketMap[playerId];
    if (socketId) {
      io.to(socketId).emit('updateTurnBigBlind', { isTurn, playerId });
      console.log(`${socketId} ${playerToSocketMap[playerId]} ${game.playersIds} ${isTurn} ${game.currentPlayerIndex}`)
    }
  });
  await game.save();
}
async function blindsTurnUpdate3(gameId) {
  let game = await Game.findOne({ gameId });
  if (!game || !game.playersIds.length) return;

  // Advance the turn
  game.currentPlayerIndex = (game.dealerIndex + 3) % game.playersIds.length;
  
  

  // Notify players about the turn update
  game.playersIds.forEach((playerId, index) => {
    const isTurn = index === game.currentPlayerIndex;
    const socketId = playerToSocketMap[playerId];
    if (socketId) {
      io.to(socketId).emit('updateTurnAfterBlinds', { isTurn, playerId });
      console.log(`${socketId} ${playerToSocketMap[playerId]} ${game.playersIds} ${isTurn} ${game.currentPlayerIndex}`)
    }
  });
  await game.save();
}
async function advanceDealer(gameId) {
  let game = await Game.findOne({ gameId });
  if (!game || !game.playersIds.length) return;

  // Advance the dealer
  game.dealerIndex = (game.dealerIndex + 1) % game.playersIds.length;

  game.playersIds.forEach((playerId, index) => {
    const isDealer = index === game.dealerIndex;
    const socketId = playerToSocketMap[playerId];
    if (socketId) {
      io.to(socketId).emit('dealerEmitted', { isDealer, playerId });
    }
  }); 

  await game.save();
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
  gameTurns: {
    turnIndex: { type: Number, default: 0 },
    actionsTaken: { type: Number, default: 0 },
  },
  tableCards: {},
  dealerIndex: { type: Number, default: 0 },
  isLive: Boolean,
  pot: { type: Number, default: 0 },
  playerMoney: {},
  currentPlayerIndex: { type: Number, default: 0 }, // Ensure this is included
  betDifference: { type: Number, default: 0 },
  raiseCount: { type: Number, default: 0 },
  interBet: { type: Number, default: 0 },
  betAmount: { type: Number, default: 0 },
  raiseAmount: { type: Number, default: 0 },
  whoBet: String,
  whoRaised: String,
  raisedHowMany: { type: Number, default: 0 },
  betresBeforeRaise: { type: Number, default: 0 },
  whoBetRes:String,
  betRezzed: { type: Number, default: 0 },
  minusBet: { type: Number, default: 0 },
  eventSequence: {
    type: [String],
    default: [] // Initialize as an empty array
  },
  abSy: { type: Number, default: 0 },
  abSy2: { type: Number, default: 0 },
  whoRaised2: String, 
  aB: { type: Number, default: 0 },
  aA: { type: Number, default: 0 },
  blindStopper: { type: Number, default: 0 },
  isTurnAdvanced: { type: Boolean, default: false },
  isDealCardsCompleted: { type: Boolean, default: false },
  sB: { type: Number, default: 0 },
  bB: { type: Number, default: 0 },
  lT: { type: Boolean, default: false },
  rT: { type: Boolean, default: false },
  reserveRaise: {
    type: [Number],
    default: [] // Initialize as an empty array
  },
  combinedBlinds: { type: Number, default: 0 },
  cashChips: {
    type: [Number],
    default: [] // Initialize as an empty array
  },
  storeBet: { type: Number, default: 0 },
  folderPlayers: [String], 
  updatedPlayersLength: { type: Number, default: 0 },
  whoSb: { type: String, default: '' },
  saveDealer: {type: String, default: ''},
  foldDelay: { type: Number, default: 0 },
  currentPlayerIndexFoldRef: { type: Number, default: 0 },
  gameIsLive: { type: Boolean, default: false }
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
          game = new Game({ gameId, playersIds: [], currentPlayerIndex: 0, pot: 0, isLive: false, tableCards: [], gameTurns: {turnIndex: 0, actionsTaken: 0}, betDifference: 0, playerMoney: [], raiseCount: 0, interBet: 0, betAmount: 0, whoBet:'', whoRaised: '', raiseAmount: 0, raisedHowMany: 0, betresBeforeRaise: 0, whoBetRes: '', betRezzed: 0, minusBet: 0, eventSequence: [], abSy: 0, absy2: 0, whoRaised2: '', aB: 0, aA: 0, dealerIndex: 0, blindStopper: 0, isTurnAdvanced: false, isDealCardsCompleted: false, sB: 0, bB: 0, lT: false, rT: false, reserveRaise: [], combinedBlinds: 0, cashChips: [0,0,0,0,0,0,0,0,0,0], storeBet: 0, folderPlayers: [], updatedPlayersLength: 0, whoSb: '', saveDealer: '', foldDelay: 0, currentPlayerIndexFoldRef: 0, gameIsLive: false });
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
        if (!game.gameIsLive){
        await game.save();
        socket.join(gameId);  
        console.log(game.playersIds);
        
        const uniquePlayersIds = [...new Set(game.playersIds)];
        if (uniquePlayersIds.length !== game.playersIds.length) {
          console.log('Duplicate playerId found, subtracter emitted');
          io.to(gameId).emit('minusDuplicate', { gameId });
        }
        // Notify all players in the game about the updated game state
        io.to(gameId).emit('gameUpdated', { gameId, game }); // Ensure clients join the gameId room to receive this
        }
      await game.save();
    });
    socket.on('duplicateSubtract', async ({ gameId, playersIds }) => {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          let game = await Game.findOne({ gameId: gameId });
    
          // Check if the document exists
          if (!game) {
            throw new Error('Game not found');
          }
    
          // Update the playersIds array to remove duplicates
          let hasDuplicate = false;
    
      for (let i = 0; i < game.playersIds.length; i++) {
        for (let j = i + 1; j < game.playersIds.length; j++) {
          if (game.playersIds[i] === game.playersIds[j]) {
            hasDuplicate = true;
            // Remove the duplicate player ID
            game.playersIds.splice(j, 1);
            j--; // Adjust index after splice
          }
        }
      }
    
      if (hasDuplicate) {
        console.log('Duplicate player id found and removed');
        console.log(game.playersIds);
      }
    
          // Save the updated document with optimistic concurrency control
          await game.save({ versionKey: '__v' });
    
          // Emit the updated game to clients
          io.to(gameId).emit('gameUpdated', { gameId, game });
    
          // Exit the loop if save is successful
          break;
        } catch (error) {
          if (error.name === 'VersionError' && retryCount < maxRetries) {
            console.log('Save failed due to version conflict. Retrying...');
            retryCount++;
          } else {
            console.error('Error updating game:', error);
            // Handle the error as needed
            break;
          }
        }
      }
    });
    
    
    socket.on('startGame', async ({ gameId,playersIds }) => {
      let game = await Game.findOne({ gameId: gameId });
      game.saveDealer = game.dealerIndex;
      game.playersIds.length = game.playersIds.length;
      game.gameIsLive = true;
      const currentPlayerId = game.playersIds[game.currentPlayerIndex];

      if (game && game.playersIds.length >= 2) {
        game.isLive = true;
        game.dealerIndex = 0;
        await game.save();
        console.log(game.playersIds)
        // Initialize and shuffle the game's deck
        await gameSequence(game);
        await game.save();

        
        /*await advanceTurn(gameId);
        await game.save();
        await io.to(gameId).emit('bB');
        await advanceTurn(gameId);
        await game.save();
        console.log('here');
        */
        
          //io.to(gameId).emit('bigBlind', {bigBlind:50});

      }
    });

    async function gameSequence({ gameId,playersIds }) {
      try {
      let game = await Game.findOne({ gameId: gameId });
      const currentPlayerId = game.playersIds[game.currentPlayerIndex];
      await initializePlayerChips(gameId, game.playersIds);
      gameDecks[gameId] = shuffleDeck(stack);
      await dealCards(gameId, game.playersIds);
      game.isDealCardsCompleted = true;
        await game.save();
        io.to(gameId).emit('minRaiseEqBB', {minRaiseEqBB: 50});
        
        //blinds
        if (!game.isTurnAdvanced && game.isDealCardsCompleted && game.blindStopper < 1) {
            io.to(gameId).emit('sB');
            await blindsTurnUpdate(gameId);
            console.log('small blinding');
            game.blindStopper = 1;
            game.isTurnAdvanced = true; // Set flag to indicate turn advancement
            await game.save();
          }
          if (game.blindStopper === 1 && !game.lT && game.isTurnAdvanced){
            io.to(gameId).emit('bB');
            game.whoSb = currentPlayerId;//previous player saved
            await blindsTurnUpdate2(gameId);
            console.log('big blinding');
            game.blindStopper = 2;
            game.lT = true;
            await game.save();
          }
          if (game.blindStopper === 2 && !game.rT && game.lT){
          await blindsTurnUpdate3(gameId);
          console.log('after blinds player');
          game.blindStopper = 3;
          game.rT = true;
          await game.save()
          }
          console.log(`${game.blindStopper} ${game.isTurnAdvanced}`);
        } catch (error) {
          console.error('Error in gameSequence:', error);
      }
  }

  async function gameSequence2({ gameId,playersIds }) {
    try {
    let game = await Game.findOne({ gameId: gameId });
    const currentPlayerId = game.playersIds[game.currentPlayerIndex];
    gameDecks[gameId] = shuffleDeck(stack);
    await dealCards(gameId, game.playersIds);
    game.isDealCardsCompleted = true;
      await game.save();
      io.to(gameId).emit('minRaiseEqBB', {minRaiseEqBB: 50});
      
      //blinds
      if (!game.isTurnAdvanced && game.isDealCardsCompleted && game.blindStopper < 1) {
          io.to(gameId).emit('sB');
          await blindsTurnUpdate(gameId);
          game.whoSb = currentPlayerId;
          console.log('small blinding');
          game.blindStopper = 1;
          game.isTurnAdvanced = true; // Set flag to indicate turn advancement
          await game.save();
        }
        if (game.blindStopper === 1 && !game.lT && game.isTurnAdvanced){
          io.to(gameId).emit('bB');
          game.whoSb = currentPlayerId;//previous player saved
          await blindsTurnUpdate2(gameId);
          console.log('big blinding');
          game.blindStopper = 2;
          game.lT = true;
          await game.save();
        }
        if (game.blindStopper === 2 && !game.rT && game.lT){
        await blindsTurnUpdate3(gameId);
        console.log('after blinds player');
        game.blindStopper = 3;
        game.rT = true;
        await game.save()
        }
        console.log(`${game.blindStopper} ${game.isTurnAdvanced}`);
      } catch (error) {
        console.error('Error in gameSequence:', error);
    }
}

socket.on('gameSequence2', async ({ gameId }) => {
  const game = await Game.findOne({ gameId });
  await gameSequence2(game);
});

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
    let indy = 1;
    let interMed;
    
   
    
socket.on('playerAction', async ({ gameId, action, playersIds, betAmount, betDiff, pot }) => {
  let game = await Game.findOne({ gameId });
   const currentPlayerId = game.playersIds[game.currentPlayerIndex];
  if (!game) return;
  
  const uniquePlayersIds = [...new Set(game.playersIds)];
      if (uniquePlayersIds.length !== game.playersIds.length) {
        console.log('Duplicate playerId found and removed');
        game.playersIds = uniquePlayersIds;
      }
  
      await game.save();


  switch (action) {
    case 'fold':
      if ((game.playersIds[(game.currentPlayerIndex - 1 + game.playersIds.length) % game.playersIds.length] === game.whoRaised && game.raiseCount === 1) 
      || (game.playersIds[(game.currentPlayerIndex - 1 + game.playersIds.length) % game.playersIds.length] === game.whoRaised2 && game.raiseCount === 2) 
      || (game.gameTurns.turnIndex > 0 && (game.playersIds[(game.currentPlayerIndex - 1 + game.playersIds.length) % game.playersIds.length]) === game.whoBet) 
      || (game.gameTurns.turnIndex > 0 && (game.playersIds[(game.currentPlayerIndex - 1 + game.playersIds.length) % game.playersIds.length]) !== game.whoBet 
      && (game.playersIds[(game.currentPlayerIndex - 2 + game.playersIds.length) % game.playersIds.length]) === game.whoBet && game.raiseCount === 0 && game.playersIds.length === 3) 
      || ((game.playersIds[(game.currentPlayerIndex - 1 + game.playersIds.length) % game.playersIds.length] === game.whoRaised) && game.updatedPlayersLength !== 3
      && game.raiseCount === 1 && game.playersIds.length === 4 && game.gameTurns.turnIndex === 0 
      || (game.playersIds[(game.currentPlayerIndex - 3 + game.playersIds.length) % game.playersIds.length]) === game.whoRaised && game.updatedPlayersLength !== 3
      && game.raiseCount === 1 && game.playersIds.length === 4 && game.gameTurns.turnIndex === 0  
      || (game.playersIds[(game.currentPlayerIndex - 2 + game.playersIds.length) % game.playersIds.length] === game.whoRaised) && game.updatedPlayersLength !== 3
      && game.raiseCount === 1 && game.playersIds.length === 4 && game.gameTurns.turnIndex === 0 
      
      //one player fold 4 players in game 2 raises
      || game.updatedPlayersLength !== 3
      && game.raiseCount === 2 && game.playersIds.length === 4 && game.gameTurns.turnIndex === 0 


      //two players fold 4 players in game 2 raises
      || game.updatedPlayersLength === 3
      && game.raiseCount === 2 && game.playersIds.length === 4 && game.gameTurns.turnIndex === 0  
      

    //two players fold 4 players in game 1 raise
      || (game.playersIds[(game.currentPlayerIndex - 3 + game.playersIds.length) % game.playersIds.length]) === game.whoRaised && game.updatedPlayersLength === 3
      && game.raiseCount === 1 && game.playersIds.length === 4 && game.gameTurns.turnIndex === 0  
      || (game.playersIds[(game.currentPlayerIndex - 2 + game.playersIds.length) % game.playersIds.length] === game.whoRaised) && game.updatedPlayersLength === 3
      && game.raiseCount === 1 && game.playersIds.length === 4 && game.gameTurns.turnIndex === 0 

    )){
        console.log(`previous player: ${(game.playersIds[(game.currentPlayerIndex - 1 + game.playersIds.length) % game.playersIds.length])} previous player-1: ${(game.playersIds[(game.currentPlayerIndex - 2 + game.playersIds.length) % game.playersIds.length])} rc: ${game.raiseCount} wr: ${game.whoRaised}`);
      }
      else{
      game.gameTurns.actionsTaken = game.gameTurns.actionsTaken+1;  
      }
      io.to(gameId).emit('playerFolded');
      game.folderPlayers.push(currentPlayerId);
      game.foldDelay += 1;
      game.currentPlayerIndexFoldRef = (game.currentPlayerIndexFoldRef+1) % game.playersIds.length;
      game.updatedPlayersLength -= 1;
      console.log(`previous player..: ${(game.playersIds[(game.currentPlayerIndex - 1 + game.playersIds.length) % game.playersIds.length])} cpind-3: ${(game.playersIds[(game.currentPlayerIndex - 3 + game.playersIds.length) % game.playersIds.length])} rc: ${game.raiseCount} wr: ${game.whoRaised} wr2 ${game.whoRaised2}`);
      console.log(`yes0. actions taken: ${game.gameTurns.actionsTaken}`);
      if (game.gameTurns.turnIndex === 0 && game.raiseCount === 0){
        betAmount = 50;
        console.log('player folded, betAmount saved');
        io.to(gameId).emit('betAfterFold', { betAmount });
      }
      await game.save();
      break;
  }

  if (game.folderPlayers.includes(currentPlayerId) && game.gameTurns.actionsTaken !== (game.playersIds.length-game.folderPlayers.length)){
    await advanceTurn(gameId);
    /*if (game.raiseCount === 0 && game.gameTurns.turnIndex === 0){
      game.gameTurns.actionsTaken = game.gameTurns.actionsTaken + 1;
    }*/
    console.log(`yes. actions taken: ${game.gameTurns.actionsTaken}`);
    game.currentPlayerIndexFoldRef = (game.currentPlayerIndexFoldRef+1) % game.playersIds.length;
    await game.save();
  }


  switch (action) {
    case 'check':
      game.gameTurns.actionsTaken = game.gameTurns.actionsTaken+1;
      if (socket.id === playerToSocketMap[currentPlayerId]) {
    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    await advanceTurn(gameId);
  } 
  break;
    case 'bet':
      game.gameTurns.actionsTaken = 1;
      console.log(game.raiseCount);
  if (socket.id === playerToSocketMap[currentPlayerId]) {
    game.betAmount = betAmount;
    game.whoBet = currentPlayerId;
    game.raisedHowMany = 0;
    //game.playerMoney[currentPlayerId] -= game.betDifference;
    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    io.to(gameId).emit('noCheck');
    io.to(gameId).emit('onlyBetRes');
    await advanceTurn(gameId);
    game.eventSequence.push('bet');
  }
      break;
    case 'raise': 
    game.aB = game.aB + 1;
    game.raisedHowMany = game.raisedHowMany+1;
    game.gameTurns.actionsTaken = 1;
  if (socket.id === playerToSocketMap[currentPlayerId]) {
    console.log(game.raiseCount);
    io.to(gameId).emit('didRaise');
    io.to(gameId).emit('minRaise', {minRaise:betAmount});
    let betDiff = game.betDifference;
    if(game.raiseCount===0){
      game.whoRaised = currentPlayerId;
      game.raiseAmount = betAmount;
      let ir = betAmount;
      io.to(gameId).emit('onlyOneRaise', { ir });
    }
    if (game.updatedPlayersLength != 2 && game.raiseCount === 1 && game.betRezzed < 1 && game.gameTurns.turnIndex !== 0 && (((!game.folderPlayers.some(playerId => game.playersIds.includes(playerId))) && game.playersIds.length > 2))){
      game.whoRaised2 = currentPlayerId;
      game.interBet = betAmount; 
          let ir = betAmount;
          io.to(gameId).emit('interRaiseBetres', { ir });
          io.to(gameId).emit('twoRaise');
          console.log('31');
          //wrap currentplayerid and create a new else if to target the next player
    } 
    else if (game.playersIds.length > 2 && game.updatedPlayersLength === 2 && game.raiseCount === 1 && currentPlayerId !== game.whoRaised && game.whoBet !== currentPlayerId && game.gameTurns.turnIndex > 0){
      game.whoRaised2 = currentPlayerId;
      game.interBet = betAmount; 
      betAmount = betAmount - game.betAmount;
      io.to(gameId).emit('trippyFins', {trippyFins: betAmount});
      console.log(`trippyFins absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`)
    }
    else if (game.updatedPlayersLength === 3 && game.raiseCount === 1 && currentPlayerId !== game.whoRaised && game.whoBet !== currentPlayerId && game.gameTurns.turnIndex > 0 && game.playersIds.length === 4){
      game.whoRaised2 = currentPlayerId;
      game.interBet = betAmount; 
      betAmount = betAmount - game.betAmount;
      io.to(gameId).emit('trippyFins', {trippyFins: betAmount});
      console.log(`trippyFins3232 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`)
    }
    
    else if (game.updatedPlayersLength != 2 && game.raiseCount === 1 && game.betRezzed < 1 && game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 3){
      game.whoRaised2 = currentPlayerId;
      game.interBet = betAmount; 
          let ir = betAmount-25;
          betAmount = betAmount-25;
          io.to(gameId).emit('preflop31', { preflop31:ir });
          console.log('preflop31');
          //wrap currentplayerid and create a new else if to target the next player
    }
    else if (game.gameTurns.turnIndex === 0 && game.raiseCount === 1 && game.betRezzed === 1 && game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 3 && currentPlayerId !== game.whoRaised && game.currentPlayerIndex === (game.dealerIndex + 2) % game.playersIds.length){
      game.whoRaised2 = currentPlayerId;
      game.interBet = betAmount; 
          let ir = betAmount-50;
          betAmount = betAmount-50;
          io.to(gameId).emit('preflopXX', { preflopXX:ir });
          console.log(`preflopXX absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
          //wrap currentplayerid and create a new else if to target the next player
    }     
    else if (game.gameTurns.turnIndex === 0 && game.raiseCount === 1 && game.betRezzed === 2 && game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 3 && currentPlayerId !== game.whoRaised && game.currentPlayerIndex === game.dealerIndex){
      game.whoRaised2 = currentPlayerId;
      game.interBet = betAmount; 
          let ir = betAmount-50;
          betAmount = betAmount-50;
          io.to(gameId).emit('preflopOO', { preflopOO:ir });
          console.log(`preflopOO absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
          //wrap currentplayerid and create a new else if to target the next player
    }     
    else if (game.updatedPlayersLength != 2 && game.updatedPlayersLength < 4 && game.raiseCount === 1 && game.betRezzed > 0 && currentPlayerId === game.whoBet){
        game.whoRaised2 = currentPlayerId;
        game.abSy = betAmount; 
        io.to(gameId).emit('betRezzySecRaise', {brSecRaise:betAmount});
        betAmount = betAmount - game.betAmount; 
        io.to(gameId).emit('twoRaise');
        console.log('32');
    } else if (game.gameTurns.turnIndex !== 0 && game.updatedPlayersLength != 2 && game.raiseCount === 1 && game.betRezzed === 2 && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && game.whoBetRes === currentPlayerId && (((!game.folderPlayers.some(playerId => game.playersIds.includes(playerId))) && game.updatedPlayersLength < 4))){
        game.whoRaised2 = currentPlayerId;  
        game.abSy2 = betAmount; 
        io.to(gameId).emit('upRaise', {upRaise: betAmount});
        betAmount = betAmount - game.betresBeforeRaise;
        io.to(gameId).emit('twoRaise');
        console.log('09');
    } 
    else if (game.gameTurns.turnIndex !== 0 && game.updatedPlayersLength != 2 && game.raiseCount === 1 && game.betRezzed === 2 && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && game.whoBetRes === currentPlayerId && (((game.folderPlayers.some(playerId => game.playersIds.includes(playerId))) && game.updatedPlayersLength > 3))){
      game.whoRaised2 = currentPlayerId;  
      game.abSy2 = betAmount; 
      betAmount = betAmount - game.betresBeforeRaise;
      io.to(gameId).emit('twoRaise');
      io.to(gameId).emit('folderfourp09', {folderfourp09:betAmount});
      console.log(`09folderfourp ${betAmount} ${game.abSy2} ${game.betresBeforeRaise}`);
  } 
      else if (game.updatedPlayersLength === 2 && game.raiseCount === 1){
      game.whoRaised2 = currentPlayerId;
      if (currentPlayerId === game.whoBet){
        game.interBet = betAmount;
        betAmount = betAmount - game.betAmount;
        io.to(gameId).emit('twoPtwoR', {twoPtwoR:betAmount});
        console.log('1.1');
      }
      else if(currentPlayerId !== game.whoRaised && game.playersIds.length === 3 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 2) % game.playersIds.length){
        game.abSy2 = betAmount;
        betAmount = betAmount - 50;
        io.to(gameId).emit('twoPtwoR33', {twoPtwoR33:betAmount});
        console.log(`1.1 for 3 one fold preflop absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
      }
      else if (game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === game.dealerIndex){
        game.abSy2 = betAmount;
        betAmount=betAmount-50;
        io.to(gameId).emit('oneChi', { oneChi: betAmount });
        console.log('oneChi');
      }
    } else if (game.updatedPlayersLength != 2 && game.updatedPlayersLength > 3 && game.raiseCount === 1 && game.betRezzed === 0){
      if (currentPlayerId === game.whoRaised && currentPlayerId != game.whoBetRes){
        betAmount = betAmount - game.interBet;
        console.log('003');
      }
      else if(currentPlayerId === game.whoBet && currentPlayerId != game.whoRaised){
        betAmount = betAmount - game.betAmount;
        console.log('004');
      }
      else if (currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised){
        betAmount = betAmount;
        game.interBet = betAmount;
        console.log('005');
      }
    }

      if (game.updatedPlayersLength != 2 && game.updatedPlayersLength > 3 && game.raiseCount === 1 && game.betRezzed > 0){
        if (currentPlayerId === game.whoRaised && currentPlayerId != game.whoBetRes){
          console.log('006');
          betAmount = betAmount - game.interBet;
        }
        else if(currentPlayerId === game.whoBet && currentPlayerId != game.whoRaised){
          game.abSy2 = betAmount; 
          betAmount = betAmount - game.betAmount;
          io.to(gameId).emit('zzTT', {zzTT:betAmount});
          console.log('007');
        }
        else if (game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 5 && game.betRezzed === 3 && game.whoBet !== currentPlayerId && game.whoRaised !== currentPlayerId){
          game.abSy2 = betAmount;
          betAmount = betAmount-50;
          io.to(gameId).emit('yyTT', {yyTT:betAmount});
          console.log(`yyTT absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
        }
        else if (game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 5 && game.betRezzed === 5 && game.whoBet !== currentPlayerId && game.whoRaised !== currentPlayerId && game.currentPlayerIndex === (game.dealerIndex + 4) % game.playersIds.length){
          game.abSy2 = betAmount;
          betAmount = betAmount-50;
          io.to(gameId).emit('yyTT33', {yyTT33:betAmount});
          console.log(`yyTT33 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
        }
        else if (game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 5 && game.betRezzed === 6 && game.whoBet !== currentPlayerId && game.whoRaised !== currentPlayerId && game.currentPlayerIndex === game.dealerIndex){
          game.abSy2 = betAmount;
          betAmount = betAmount-50;
          io.to(gameId).emit('yyTTKK', {yyTTKK:betAmount});
          console.log(`yyTTKK absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
        }
        else if (currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && game.betRezzed < 3 && game.gameTurns.turnIndex !== 0 && (((!game.folderPlayers.some(playerId => game.playersIds.includes(playerId))) && game.updatedPlayersLength < 4))){
          game.abSy2 = betAmount;
          console.log('008');
        }
        else if (game.currentPlayerIndex === (game.dealerIndex + 1) % game.playersIds.length && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && currentPlayerId != game.whoRaised2 && game.betRezzed < 3 && game.gameTurns.turnIndex === 0){
          game.abSy2 = betAmount;
          betAmount = betAmount - 25;
          io.to(gameId).emit('preflop008', {preflop008:betAmount});
          console.log('preflop008');
        }
        else if (game.currentPlayerIndex === (game.dealerIndex + 2) % game.playersIds.length && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && currentPlayerId != game.whoRaised2 && game.betRezzed === 2 && game.gameTurns.turnIndex === 0){
          game.abSy2 = betAmount;
          betAmount = betAmount - 50;
          io.to(gameId).emit('preflop0082', {preflop0082:betAmount});
          console.log('preflop0082');
        }
        else if (game.betRezzed > 2 && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && game.gameTurns.turnIndex !== 0){
          game.abSy2 = betAmount;
          betAmount = betAmount - game.betAmount;
          io.to(gameId).emit('aaTT', {aaTT:betAmount});
          console.log('008.5');
        }
        
        else if (game.betRezzed > 2 && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 3) % game.playersIds.length){
          game.abSy2 = betAmount;
          betAmount = betAmount - 50;
          io.to(gameId).emit('preflop0085', {preflop0085:betAmount});
          console.log('preflop0085');
        }
        else if (game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex) && currentPlayerId !== game.whoRaised && game.betRezzed < game.updatedPlayersLength + 2 && game.updatedPlayersLength > 3 && game.updatedPlayersLength !== 5){
          game.abSy2 = betAmount;
          betAmount=betAmount-50;
          io.to(gameId).emit('rr2235', { rr2235: betAmount });
          console.log('rr2235');
        }
      } else if (game.raiseCount === 0 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 1) % game.playersIds.length){
        game.storeBet = betAmount;
        betAmount=betAmount-25;
        io.to(gameId).emit('rrr3', { rrr3: betAmount });
        console.log('rrr3');
      }
      if (game.raiseCount === 0 && game.gameTurns.turnIndex === 0 && game.betRezzed === 1 && game.updatedPlayersLength === 4 && game.currentPlayerIndex === (game.dealerIndex)){
        game.whoRaised = currentPlayerId;
        console.log(`whoRaised set`);
      }

    
      
    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    console.log(betAmount);
    game.reserveRaise.push(betAmount);
    console.log(betDiff);
    io.to(gameId).emit('noCheck');
    io.to(gameId).emit('onlyBetRes');

    game.raiseCount = game.raiseCount+1;
        await advanceTurn(gameId);
        game.eventSequence.push('raise');
        await game.save();
  }
  
      break;
      case 'betres':
        if (game.aB !== 2){
          game.aB = 0;
          game.aA = 2;
        }
        console.log(game.raiseCount);
        game.betRezzed = game.betRezzed+1
      game.gameTurns.actionsTaken = game.gameTurns.actionsTaken+1;
  if (socket.id === playerToSocketMap[currentPlayerId]) {
    if (game.raiseCount>=2 && game.updatedPlayersLength != 2){
    if(game.whoBet === currentPlayerId && game.betRezzed < 4){
      game.interBet = betAmount;
      betAmount = betAmount-game.betAmount; //for two raise scenario
      console.log('11');
    }
    else if(game.gameTurns.turnIndex !== 0 && game.betRezzed>=1 && game.betRezzed<3 && game.whoBetRes != currentPlayerId && game.updatedPlayersLength < 4 && (!game.folderPlayers.some(playerId => game.playersIds.includes(playerId)))){
      betAmount = betAmount+game.betAmount-game.raiseAmount;
      console.log('12');
  }
    else if (game.currentPlayerIndex === (game.dealerIndex + 1) % game.playersIds.length && game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 3 && game.raiseCount === 2 && game.whoBet !== currentPlayerId && game.whoRaised === currentPlayerId && game.whoRaised2 !== currentPlayerId && game.betRezzed === 3 && game.updatedPlayersLength === 3){
      betAmount = game.interBet-game.raiseAmount;
      io.to(gameId).emit('tgTG', {tgTG:betAmount});
      console.log(`tgTG absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
    }
    else if (game.betRezzed>=1 && game.betRezzed<3 && game.whoBetRes != currentPlayerId && game.whoRaised != currentPlayerId && game.whoRaised2 != currentPlayerId && game.updatedPlayersLength > 3 && game.gameTurns.turnIndex !== 0 ){
      if (game.updatedPlayersLength === 4){
      io.to(gameId).emit('chippyMin', {chippyMin:betAmount});
      console.log('12.25');
      }
      else if(game.updatedPlayersLength === 5){
      io.to(gameId).emit('chippyM', {chippyM:betAmount});
      console.log('12.25.5');
      }
    }
    else if (game.gameTurns.turnIndex !== 0 && game.updatedPlayersLength === 5 && game.betRezzed === 4 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.abSy2===0){
      betAmount = game.interBet-game.raiseAmount;
      console.log(`12.45.5 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
    }
    else if (game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 5 && game.betRezzed === 4 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.abSy2===0 && game.currentPlayerIndex !== (game.dealerIndex + 3) % game.playersIds.length){
      betAmount = game.interBet-game.raiseAmount;
      io.to(gameId).emit('jjKK', {jjKK:betAmount});
      console.log(`12.45.5jjKK absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
    }
    else if (game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 5 && game.betRezzed === 4 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.abSy2===0 && game.currentPlayerIndex === (game.dealerIndex + 3) % game.playersIds.length){
      betAmount = game.reserveRaise[1]-game.raiseAmount;
      io.to(gameId).emit('jjKK2', {jjKK2:betAmount});
      console.log(`12.45.5jjKK2 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
    }
    else if (game.updatedPlayersLength === 5 && game.betRezzed === 4 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.abSy2>0){
      betAmount = game.abSy2-game.raiseAmount;
      io.to(gameId).emit('bBB', {bBB:betAmount});
      console.log('12.45.555');
    }
    else if (game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 3 && game.betRezzed === 1 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised !== currentPlayerId && game.raiseCount === 2 ){
      betAmount = game.interBet-50;
      io.to(gameId).emit('zXY', {zXY:betAmount});
      console.log(`zXY absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
    }
    else if(game.updatedPlayersLength === 5 && game.betRezzed === 7 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId){
      betAmount = game.abSy2-game.raiseAmount;
      io.to(gameId).emit('xXX', {xXX:betAmount});
      console.log('12.47.5');
      console.log(`absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);

    }
    else if(game.gameTurns.turnIndex === 0 && game.updatedPlayersLength === 4 && game.whoRaised === currentPlayerId && game.whoRaised2 !== currentPlayerId && game.betRezzed === 4 && game.currentPlayerIndex === game.dealerIndex) {
      betAmount = game.abSy2-game.raiseAmount;
      io.to(gameId).emit('thatCase', { thatCase: betAmount});
      console.log('thatCase');
      console.log(`thatCase:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
    }
    else if(game.gameTurns.turnIndex !== 0 && game.whoRaised === currentPlayerId && game.betRezzed <= 2 && (!game.folderPlayers.some(playerId => game.playersIds.includes(playerId)))) {
      betAmount = game.interBet;
      betAmount = betAmount - game.raiseAmount;//for two raise scenario
      console.log('13');
    }
    else if(game.gameTurns.turnIndex !== 0 && game.whoRaised === currentPlayerId && game.betRezzed <= 2 && (game.folderPlayers.some(playerId => game.playersIds.includes(playerId)))) {
      betAmount = game.interBet-game.raiseAmount;//for two raise scenario
      console.log('13for4withonefold');
      io.to(gameId).emit('for4withonefold', { for4withonefold: betAmount});
      console.log(`absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);

    }
    else if(game.betRezzed===3 && currentPlayerId != game.whoBet && currentPlayerId === game.whoRaised && game.abSy > 0) {
      betAmount = game.abSy-game.raiseAmount;
      io.to(gameId).emit('potPlus', { potPlus: game.interBet});
      console.log('14');
      console.log(`absy: ${game.abSy} game.raiseAmount: ${game.raiseAmount}`);
    } else if (game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised !== currentPlayerId && game.betRezzed === 3 && game.updatedPlayersLength < 4 && game.updatedPlayersLength !== 2){
      io.to(gameId).emit('hhGG', { hhGG: betAmount});
      console.log('14.45');
    }
    else if (game.updatedPlayersLength === 3 && game.raiseCount === 2 && currentPlayerId === game.whoRaised && game.whoBet !== currentPlayerId && currentPlayerId !== game.whoRaised2 && game.gameTurns.turnIndex > 0 && game.playersIds.length === 4){
      betAmount = game.interBet - game.raiseAmount;
      io.to(gameId).emit('trippyFins', {trippyFins: betAmount});
      console.log(`trippyFins4242 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`)
    }
    else if (game.updatedPlayersLength === 3 && game.raiseCount === 2 && currentPlayerId === game.whoRaised && game.whoBet !== currentPlayerId && currentPlayerId !== game.whoRaised2 && game.gameTurns.turnIndex === 0 && game.playersIds.length === 4){
      betAmount = game.abSy2 - game.raiseAmount;
      io.to(gameId).emit('trippyFins', {trippyFins: betAmount});
      console.log(`trippyFins4343 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`)
    }
    else if (game.updatedPlayersLength === 3 && game.raiseCount === 2 && currentPlayerId !== game.whoRaised && game.whoBet !== currentPlayerId && currentPlayerId !== game.whoRaised2 && game.gameTurns.turnIndex === 0 && game.playersIds.length === 4){
      betAmount = game.interBet - game.raiseAmount;
      io.to(gameId).emit('trippyFins', {trippyFins: betAmount});
      console.log(`trippyFins5252 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`)
    }
      else if (game.gameTurns.turnIndex !== 0 && game.whoBet !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === 3 && game.updatedPlayersLength < 4){
      betAmount = game.abSy2-game.raiseAmount;
      io.to(gameId).emit('chipsMinus', { chipsMinus: betAmount });
      console.log('14.5');
    } else if (game.gameTurns.turnIndex !== 0 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === 3 && game.updatedPlayersLength > 3 && game.aB === 2){
      betAmount = game.interBet - game.raiseAmount;
      io.to(gameId).emit('cPMM', { cPMM: betAmount });
      console.log('14.5 for 4+');
    }
    else if (game.gameTurns.turnIndex === 0 && game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === 3 && game.updatedPlayersLength > 3 && game.aB === 2){
      betAmount = game.interBet-game.raiseAmount;
      io.to(gameId).emit('preflop1454', { preflop1454: betAmount });
      console.log(`preflop1454 ${game.abSy2} ${game.raiseAmount} ${game.betAmount} ${game.interBet} ${betAmount}`);
    }
    else if (game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === 3 && game.updatedPlayersLength > 3 && game.aB !== 2){
      betAmount = game.abSy2 - game.raiseAmount;
      io.to(gameId).emit('secSEC', { secSEC: betAmount });
      console.log('14.5 for4+ no 2RaisesInaRow');
    }
      else if (game.whoBet === currentPlayerId && game.whoRaised !== currentPlayerId && game.betRezzed === 4){
      betAmount = betAmount;
      io.to(gameId).emit('chipsMinus2', { chipsMinus2: betAmount });
      console.log('14.75');
    }
    else if (game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === game.updatedPlayersLength && game.aA === 2 && game.updatedPlayersLength !== 2 && game.updatedPlayersLength >3 && game.gameTurns.turnIndex !== 0 ){
      betAmount = game.abSy2 - game.raiseAmount;
      io.to(gameId).emit('vvPP', { vvPP: betAmount });
      console.log('14.95 2raInARow && 4 ');
    }
    else if (game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === game.updatedPlayersLength && game.aA === 2 && game.updatedPlayersLength !== 2 && game.updatedPlayersLength===5 && game.gameTurns.turnIndex === 0 && game.reserveRaise[1] >= game.abSy2){
      betAmount = game.reserveRaise[1]-game.raiseAmount;
      io.to(gameId).emit('ccCC', { ccCC: betAmount });
      console.log(`14.95 2raInARow && 4ccCC ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount}`);
    }
    else if (game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === game.updatedPlayersLength && game.aA === 2 && game.updatedPlayersLength !== 2 && game.updatedPlayersLength===5 && game.gameTurns.turnIndex === 0 && game.reserveRaise[1] < game.abSy2){
      betAmount = game.abSy2-game.raiseAmount;
      io.to(gameId).emit('ccCC3', { ccCC3: betAmount });
      console.log(`14.95 2raInARow && ccCC3 ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount}`);
    }
    else if (game.whoBet !== currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === game.updatedPlayersLength+1 && game.aA === 2 && game.updatedPlayersLength===5 && game.gameTurns.turnIndex === 0 ){
      betAmount = game.abSy2-game.raiseAmount;
      io.to(gameId).emit('ccCC2', { ccCC2: betAmount });
      console.log(`ccCC2 ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount}`);
    }
      else if (game.betRezzed > game.updatedPlayersLength+1 && game.whoBet === currentPlayerId && game.updatedPlayersLength > 3){
        io.to(gameId).emit('ppPP', { ppPP: game.abSy2-game.raiseAmount });
        console.log('14.975');
      }
      else if(game.gameTurns.turnIndex !== 0 && game.betRezzed === game.updatedPlayersLength+1 && game.whoRaised === currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoBet != currentPlayerId && game.updatedPlayersLength>3){
        betAmount = game.abSy2 - game.raiseAmount;
        io.to(gameId).emit('ddDD', { ddDD: betAmount });
      console.log('14.9999 2raInARow && 4 ');
      }
      else if(game.updatedPlayersLength === 3 && game.gameTurns.turnIndex === 0 && game.betRezzed === 2 && game.whoRaised2 !== currentPlayerId && game.whoRaised === currentPlayerId && game.whoBet != currentPlayerId && game.currentPlayerIndex === game.dealerIndex){
        betAmount = game.interBet - game.raiseAmount;
        io.to(gameId).emit('tripprefin', { tripprefin: betAmount });
      console.log(`tripprefin ${game.abSy2} ${game.raiseAmount} ${game.betAmount} ${game.interBet}`);
      }
      else if(game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 1) % game.playersIds.length && game.betRezzed === game.updatedPlayersLength+1 && game.whoRaised === currentPlayerId && game.whoRaised2 !== currentPlayerId && game.whoBet != currentPlayerId && game.updatedPlayersLength>3){
        betAmount = game.abSy2 - game.raiseAmount;
        io.to(gameId).emit('preflop149999', { preflop149999: betAmount });
      console.log(`14.9999 2raInARow && 4 preflop ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount}`);
      }
      else if (game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 1) % game.playersIds.length && currentPlayerId !== game.whoRaised && currentPlayerId !== game.whoRaised2 && game.betRezzed < game.updatedPlayersLength){
        betAmount=betAmount-25;
        io.to(gameId).emit('lll22', { lll22: betAmount });
        console.log('lll22');
      }
      else if (game.updatedPlayersLength !== 3 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 2) % game.playersIds.length && currentPlayerId !== game.whoRaised && currentPlayerId !== game.whoRaised2 && game.betRezzed < game.updatedPlayersLength + 2){
        betAmount=betAmount-25;
        io.to(gameId).emit('lll223', { lll223: betAmount });
        console.log('lll223');
      }
   
    } else if (game.raiseCount === 0 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 1) % game.playersIds.length && (!game.folderPlayers.some(playerId => game.playersIds.includes(playerId)))){
      game.gameTurns.actionsTaken = game.playersIds.length;
      console.log('lll');
    }
    else if (game.raiseCount === 1 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 1) % game.playersIds.length && currentPlayerId !== game.whoRaised){
      betAmount=betAmount-25;
      io.to(gameId).emit('lll2', { lll2: betAmount });
      console.log('lll2');
    }
    else if (game.raiseCount === 1 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 2) % game.playersIds.length && currentPlayerId !== game.whoRaised && (!game.folderPlayers.some(playerId => game.playersIds.includes(playerId)))){
      betAmount=betAmount-25;
      io.to(gameId).emit('lll3', { lll3: betAmount });
      console.log('lll3');
    }
    else if (game.raiseCount === 1 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 2) % game.playersIds.length && currentPlayerId !== game.whoRaised && (game.folderPlayers.some(playerId => game.playersIds.includes(playerId))) && game.playersIds.length >= 3){
      betAmount=game.raiseAmount-50;
      io.to(gameId).emit('lll35', { lll35: betAmount });
      console.log(`lll35 absy2:${game.abSy2} absy1 ${game.abSy} gib ${game.interBet } gra ${game.raiseAmount} ba ${betAmount} gba ${game.betAmount}`);
    }
    else if (game.raiseCount === 1 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 3) % game.playersIds.length && currentPlayerId !== game.whoRaised && (!game.folderPlayers.some(playerId => game.playersIds.includes(playerId)))){
      betAmount=betAmount;
      io.to(gameId).emit('lll4', { lll4: betAmount });
      console.log('lll4');
    }
    else if (game.raiseCount === 1 && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 3) % game.playersIds.length && currentPlayerId !== game.whoRaised && (game.folderPlayers.some(playerId => game.playersIds.includes(playerId))) && game.playersIds.length === 3 && game.updatedPlayersLength === 2){
      betAmount=betAmount-25;
      io.to(gameId).emit('lll4', { lll4: betAmount });
      console.log('lll4 with folder');
    }
    else if (game.updatedPlayersLength != 2 && game.updatedPlayersLength < 4 && game.playersIds.length === 4 && game.raiseCount === 1 && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && game.gameTurns.turnIndex === 0 && game.currentPlayerIndex === (game.dealerIndex + 3) % game.playersIds.length){
      betAmount = game.raiseAmount - 50;
      io.to(gameId).emit('criTri', { criTri: betAmount });
      console.log('1533');
    }
    else if (game.updatedPlayersLength != 2 && game.updatedPlayersLength < 4 && game.raiseCount === 1 && game.whoBetRes === currentPlayerId && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised){
      betAmount = game.raiseAmount - game.betresBeforeRaise;
      console.log('15');
    }
    else if (game.updatedPlayersLength != 2 && game.updatedPlayersLength > 3 && game.raiseCount === 1 && game.whoBetRes === currentPlayerId && currentPlayerId != game.whoBet && currentPlayerId != game.whoRaised && game.updatedPlayersLength !== 5){
      betAmount = game.raiseAmount - game.betresBeforeRaise;
      console.log(`15 for4+  ${betAmount} ${game.raiseAmount} ${game.betresBeforeRaise}`);
    }
      else if (game.updatedPlayersLength != 2 && game.raiseCount === 0){
      game.whoBetRes = currentPlayerId;
      game.betresBeforeRaise = betAmount;
      console.log('16');
    }
      else if(game.updatedPlayersLength != 2 && game.updatedPlayersLength < 4  && game.raiseCount === 1 && game.whoBet != currentPlayerId){ //1 bet 1 raise then betres
      betAmount = game.raiseAmount;
      console.log('17');
    } else if(game.updatedPlayersLength != 2 && game.gameTurns.turnIndex !== 0  && game.updatedPlayersLength > 3  && game.raiseCount === 1 && game.whoBet != currentPlayerId && game.betRezzed > 3){ //1 bet 1 raise then betres
      betAmount = game.raiseAmount - game.betAmount;
      console.log('17 for 4+');
    }
      else if(game.updatedPlayersLength != 2 && game.raiseCount === 1 && game.whoBet === currentPlayerId){
      betAmount = game.raiseAmount - game.betAmount;
      console.log('18');
    }
      else if(game.updatedPlayersLength != 2 && game.raisedHowMany === 0){
      betAmount = game.betAmount; //1 bet 0 raises
      console.log('19');
    }
    else if (game.updatedPlayersLength === 5 && game.raiseCount === 1 && game.betRezzed === 6 && game.gameTurns.turnIndex === 0 && currentPlayerId !== game.whoRaised && game.currentPlayerIndex === (game.dealerIndex + 4) % game.playersIds.length){
      betAmount = game.raiseAmount - 50;
      // io.to(gameId).emit('jjII', { jjII: betAmount });
      console.log(`jjII ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount}`);
    }
    else if (game.updatedPlayersLength === 5 && game.raiseCount === 1 && game.betRezzed === 7 && game.gameTurns.turnIndex === 0 && currentPlayerId !== game.whoRaised && game.currentPlayerIndex === game.dealerIndex){
      betAmount = game.raiseAmount - 50;
      // io.to(gameId).emit('jjII', { jjII: betAmount });
      console.log(`jjII2 ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount}`);
    }
    else if(game.updatedPlayersLength === 2 && game.playersIds.length === 3 && game.raiseCount === 1 && currentPlayerId !== game.whoBet && currentPlayerId !== game.whoRaised && game.gameTurns.turnIndex > 0){
      betAmount = game.raiseAmount-game.betAmount;
      io.to(gameId).emit('jjII233', { jjII233: betAmount });
      console.log(`jjII233 ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount}`);
    }
      else{
        if (game.updatedPlayersLength != 2){
      betAmount = game.raiseAmount;
      console.log('21');
        }
      else if(game.updatedPlayersLength === 2 && game.playersIds.length === 4 && game.raiseCount === 1 && currentPlayerId === game.whoBet && game.gameTurns.turnIndex !== 0){
        betAmount = betAmount-game.betAmount;
        io.to(gameId).emit('tootsieD', { tootsieD: betAmount });
        console.log('001100quads');
      }
      else if(game.updatedPlayersLength === 2 && game.playersIds.length === 4 && game.raiseCount === 2 && currentPlayerId === game.whoBet && game.gameTurns.turnIndex !== 0){
        if (game.interBet > game.abSy2){
        betAmount = game.interBet-game.raiseAmount;
        }else{
        betAmount = game.abSy2-game.raiseAmount;  
        }
        io.to(gameId).emit('tootsieD', { tootsieD: betAmount });
        console.log(`001100quadst ${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount} ${game.interBet}`);
      }
      else if(game.updatedPlayersLength === 2 && game.playersIds.length === 4 && game.raiseCount === 2 && currentPlayerId === game.whoRaised && game.gameTurns.turnIndex !== 0){
        betAmount = game.abSy2-game.raiseAmount;
        io.to(gameId).emit('tootsieD', { tootsieD: betAmount });
        console.log('001100quadsy');
      }
      else if(game.updatedPlayersLength === 2 && currentPlayerId === game.whoBet && game.gameTurns.turnIndex !== 0){
        betAmount = betAmount-game.betAmount;
        console.log('001100');
      }
      else if(game.updatedPlayersLength === 2 && game.gameTurns.turnIndex === 0 && game.raiseCount === 2 && game.playersIds.length !== 3){
        betAmount = game.abSy2-game.storeBet;
        io.to(gameId).emit('tootsieD', { tootsieD: betAmount });
        console.log('001101');
        console.log(`${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount} ${game.storeBet} ${game.interBet}`)
      }
      else if(game.updatedPlayersLength === 2 && currentPlayerId === game.whoRaised && currentPlayerId !== game.whoRaised2 && game.gameTurns.turnIndex === 0 && game.raiseCount === 2 && game.playersIds.length === 3){
        if (game.interBet > game.abSy2){
        betAmount = game.interBet-game.raiseAmount;
        }else{
        betAmount = game.abSy2-game.raiseAmount;
        }
        io.to(gameId).emit('tootsieD', { tootsieD: betAmount });
        console.log('001101 for 3 with folder');
        console.log(`${betAmount} ${game.betAmount} ${game.abSy2} ${game.raiseAmount} ${game.storeBet} ${game.interBet}`)
      }
      else if (game.updatedPlayersLength === 2 && game.raiseCount === 2 && currentPlayerId !== game.whoBet && currentPlayerId !== game.whoRaised2 && game.playersIds.length > 2 && game.gameTurns.turnIndex > 0 && game.abSy > game.interBet){
        betAmount = game.abSy-game.raiseAmount;
        io.to(gameId).emit('tootsiePlus', { tootsiePlus: betAmount });
        console.log(`tootsieplus22 ${game.interBet} ${game.raiseAmount} ${game.storeBet}  ${game.abSy2}`);
      }
      else if (game.updatedPlayersLength === 2 && currentPlayerId === game.whoRaised){
        betAmount = game.interBet-game.raiseAmount;
        io.to(gameId).emit('tootsiePlus', { tootsiePlus: betAmount });
        console.log(`${game.interBet} ${game.raiseAmount}`);
      }
      
    }

    console.log(`Action ${action} processed for player ${currentPlayerId}`);
    io.to(gameId).emit('noCheck');
    io.to(gameId).emit('resetTurn');
    game.currentPlayerIndexFoldRef = (game.currentPlayerIndexFoldRef+1) % game.playersIds.length;
    await game.save();
    await advanceTurn(gameId);
    game.eventSequence.push('betRes');
    console.log(game.eventSequence);
    console.log (`gti ${game.gameTurns.turnIndex} gpidl ${game.playersIds.length} gwr ${game.whoRaised} gwr2 ${game.whoRaised2} gbr ${game.betRezzed} gcpi ${game.currentPlayerIndex}`);
  }
      break;


  }


  if (action === 'raise' || action === 'betres'){
    io.to(gameId).emit('raiseEmitted', { betAmount, pot:game.pot });
  }else if (action === 'bet'){
    io.to(gameId).emit('potUpdated', { betAmount, pot:game.pot });
    io.to(gameId).emit('minRaise', { minRaise: betAmount });
  }


  if (game.updatedPlayersLength != 2 && game.raiseCount === 1 && game.betRezzed > 0 && game.updatedPlayersLength<4){
    io.to(gameId).emit('minusBet');
    console.log('hello1');
  }

 if (game.gameTurns.turnIndex !== 0 && game.updatedPlayersLength != 2 && game.betRezzed===3 && game.raiseCount >= 2 && game.updatedPlayersLength<4){
      io.to(gameId).emit('lastBetRezzy', {betRezzy:betAmount});
      console.log('hello2');
    }

  if (game.gameTurns.turnIndex !== 0 && game.updatedPlayersLength != 2 && game.raiseCount === 2 && game.whoBet !== currentPlayerId && game.whoRaised != currentPlayerId && game.betRezzed === 2 && game.updatedPlayersLength < 4 && (((!game.folderPlayers.some(playerId => game.playersIds.includes(playerId)))&& game.betRezzed < 3 ))){
    io.to(gameId).emit('seccyBR', {seccyBR: betAmount});
    console.log('yesw1');
  }  
  
  if (game.raiseCount === 2){
    io.to(gameId).emit('raiseLimitReached');
  }

  if ((game.gameTurns.turnIndex > 0 || game.gameTurns.turnIndex === 0 && game.raiseCount > 0 ) && game.folderPlayers.includes(game.playersIds[(game.currentPlayerIndex+1)%game.playersIds.length])){
    await advanceTurn(gameId);//risky, may need a different approach
    console.log(`folder's turn, skipping folder`);
    await game.save();
  }
console.log(`you know ${game.playersIds[(game.currentPlayerIndex+1)%game.playersIds.length]}`);


  /*else if (game.raiseCount === 2 && game.whoBet !== currentPlayerId && game.whoRaised === currentPlayerId && game.betRezzed === 3){
    betAmount = game.abSy2-game.raiseAmount;
    console.log(`yesw2 gameRA:${game.raiseAmount} gameBA:${game.betAmount} gameabsy2:${game.abSy2}`);
  } */

  console.log(`yes22. actions taken: ${game.gameTurns.actionsTaken} and curindfold: ${game.currentPlayerIndexFoldRef}`);



    if (game.gameTurns.turnIndex === 0 && game.playersIds.length > 2 && game.raiseCount === 0 && currentPlayerId === game.playersIds[(game.dealerIndex+1)] && game.folderPlayers.includes(currentPlayerId)){
      game.gameTurns.actionsTaken = (game.playersIds.length-game.folderPlayers.length);
    }

    if (game.folderPlayers.length === (game.playersIds.length-1) && game.playersIds.length>1){
      game.gameTurns.actionsTaken = game.playersIds.length-game.folderPlayers.length;
      //isWinner implementation goes here
      game.gameTurns.turnIndex = 3;
      await game.save();
      console.log('all but one folded, new hand');
    }

    console.log(`cpid ${currentPlayerId} gfp ${game.folderPlayers} ${game.whoSb} ${game.playersIds[(game.dealerIndex+1)]}`)
    if (game.gameTurns.actionsTaken === (game.playersIds.length-game.folderPlayers.length)) {
    // Reset actionsTaken for the next round of actions
   
    // Move to the next stage of the game
    game.gameTurns.turnIndex = game.gameTurns.turnIndex+1;
    game.gameTurns.actionsTaken = 0;

    const mutexTurns = new Mutex();

    // Trigger the appropriate game stage based on turnIndex
    if (game.gameTurns.turnIndex === 1) {
        io.to(gameId).emit('goFlop');
        await blindsTurnUpdate(gameId);
        if (game.updatedPlayersLength === game.playersIds.length || !game.folderPlayers.includes(game.playersIds[game.dealerIndex+1])){
        game.currentPlayerIndex = (game.dealerIndex+1);
        }
        await game.save();
        
        if (game.folderPlayers.includes(game.playersIds[game.dealerIndex]) && game.currentPlayerIndex === game.dealerIndex){
          mutexTurns.acquire(); 
          try {
        await advanceTurn(gameId);
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
        await game.save();
         console.log(`advancing turn skipping folder.`);
          } finally {
            mutexTurns.release();
          }
      }
        if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+1]) && game.currentPlayerIndex === game.dealerIndex+1){
          mutexTurns.acquire(); 
          try {
        await advanceTurn(gameId);
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
        await game.save();
         console.log(`advancing turn skipping folder.`);
          } finally {
            mutexTurns.release();
          }
        }
              if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+2]) && game.currentPlayerIndex === game.dealerIndex+2){
                mutexTurns.acquire(); 
                try {
              await advanceTurn(gameId);
              game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
              await game.save();
               console.log(`advancing turn skipping folder.`);
                } finally {
                  mutexTurns.release();
                }
            }
                if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+3]) && game.currentPlayerIndex === game.dealerIndex+3){
                  mutexTurns.acquire(); 
                  try {
                await advanceTurn(gameId);
                game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
                await game.save();
                 console.log(`advancing turn skipping folder.`);
                  } finally {
                    mutexTurns.release();
                  }
              }
                  if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+4]) && game.currentPlayerIndex === game.dealerIndex+4){
                    mutexTurns.acquire(); 
                    try {
                  await advanceTurn(gameId);
                  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
                  await game.save();
                   console.log(`advancing turn skipping folder.`);
                    } finally {
                      mutexTurns.release();
                    }
                  }
        betAmount = 0;
        io.to(gameId).emit('potUpdated', { betAmount });
        game.betDifference = 0;
        game.raiseCount = 0;
        game.interBet = 0;
        game.betAmount = 0;
        game.whoBet = '';
        game.whoRaised = '';
        game.raiseAmount = 0;
        game.raisedHowMany = 0;
        game.whoBetRes = '';
        game.betresBeforeRaise = 0;
        game.betRezzed = 0;
        game.abSy = 0;
        game.abSy2 = 0;
        game.whoRaised2 = '';
        game.aB = 0;
        game.aA = 0;
        game.isTurnAdvanced = false;
        game.blindStopper = 0;
        game.lT = false;
        game.rT = false;
        game.reserveRaise = [];
        game.eventSequence = [];
        game.storeBet = 0;
        game.whoSb = '';
        console.log(`${currentPlayerId} ${game.playersIds[game.dealerIndex+1]}`);
    } else if (game.gameTurns.turnIndex === 2) {
        io.to(gameId).emit('goTurn');
        await blindsTurnUpdate(gameId);
        if (game.updatedPlayersLength === game.playersIds.length || !game.folderPlayers.includes(game.playersIds[game.dealerIndex+1])){
          game.currentPlayerIndex = (game.dealerIndex+1);
          }
        await game.save();


       if (game.folderPlayers.includes(game.playersIds[game.dealerIndex]) && game.currentPlayerIndex === game.dealerIndex){
          mutexTurns.acquire(); 
          try {
        await advanceTurn(gameId);
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
        await game.save();
         console.log(`advancing turn skipping folder.`);
          } finally {
            mutexTurns.release();
          }
      }
        if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+1]) && game.currentPlayerIndex === game.dealerIndex+1){
          mutexTurns.acquire(); 
          try {
        await advanceTurn(gameId);
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
        await game.save();
         console.log(`advancing turn skipping folder.`);
          } finally {
            mutexTurns.release();
          }
        }
              if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+2]) && game.currentPlayerIndex === game.dealerIndex+2){
                mutexTurns.acquire(); 
                try {
              await advanceTurn(gameId);
              game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
              await game.save();
               console.log(`advancing turn skipping folder.`);
                } finally {
                  mutexTurns.release();
                }
            }
                if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+3]) && game.currentPlayerIndex === game.dealerIndex+3){
                  mutexTurns.acquire(); 
                  try {
                await advanceTurn(gameId);
                game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
                await game.save();
                 console.log(`advancing turn skipping folder.`);
                  } finally {
                    mutexTurns.release();
                  }
              }
                  if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+4]) && game.currentPlayerIndex === game.dealerIndex+4){
                    mutexTurns.acquire(); 
                    try {
                  await advanceTurn(gameId);
                  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
                  await game.save();
                   console.log(`advancing turn skipping folder.`);
                    } finally {
                      mutexTurns.release();
                    }
                  }

        betAmount = 0;
        io.to(gameId).emit('potUpdated', { betAmount });
        game.betDifference = 0;
        game.raiseCount = 0;
        game.interBet = 0;
        game.betAmount = 0;
        game.whoBet = '';
        game.whoRaised = '';
        game.raiseAmount = 0;
        game.raisedHowMany = 0;
        game.whoBetRes = '';
        game.betresBeforeRaise = 0;
        game.betRezzed = 0;
        game.abSy = 0;
        game.abSy2 = 0;
        game.whoRaised2 = '';
        game.aB = 0;
        game.aA = 0;
        game.isTurnAdvanced = false;
        game.blindStopper = 0;
        game.lT = false;
        game.rT = false;
        game.reserveRaise = [];
        game.eventSequence = [];
        game.storeBet = 0;
        game.whoSb = '';
        console.log(`${currentPlayerId} ${game.playersIds[game.dealerIndex+1]}`);
    } else if (game.gameTurns.turnIndex === 3) {
        io.to(gameId).emit('goRiver');
        await blindsTurnUpdate(gameId);
        if (game.updatedPlayersLength === game.playersIds.length || !game.folderPlayers.includes(game.playersIds[game.dealerIndex+1])){
          game.currentPlayerIndex = (game.dealerIndex+1);
          }
        await game.save();

       if (game.folderPlayers.includes(game.playersIds[game.dealerIndex]) && game.currentPlayerIndex === game.dealerIndex){
          mutexTurns.acquire(); 
          try {
        await advanceTurn(gameId);
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
        await game.save();
         console.log(`advancing turn skipping folder.`);
          } finally {
            mutexTurns.release();
          }
      }
        if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+1]) && game.currentPlayerIndex === game.dealerIndex+1){
          mutexTurns.acquire(); 
          try {
        await advanceTurn(gameId);
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
        await game.save();
         console.log(`advancing turn skipping folder.`);
          } finally {
            mutexTurns.release();
          }
        }
              if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+2]) && game.currentPlayerIndex === game.dealerIndex+2){
                mutexTurns.acquire(); 
                try {
              await advanceTurn(gameId);
              game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
              await game.save();
               console.log(`advancing turn skipping folder.`);
                } finally {
                  mutexTurns.release();
                }
            }
                if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+3]) && game.currentPlayerIndex === game.dealerIndex+3){
                  mutexTurns.acquire(); 
                  try {
                await advanceTurn(gameId);
                game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
                await game.save();
                 console.log(`advancing turn skipping folder.`);
                  } finally {
                    mutexTurns.release();
                  }
              }
                  if (game.folderPlayers.includes(game.playersIds[game.dealerIndex+4]) && game.currentPlayerIndex === game.dealerIndex+4){
                    mutexTurns.acquire(); 
                    try {
                  await advanceTurn(gameId);
                  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playersIds.length;
                  await game.save();
                   console.log(`advancing turn skipping folder.`);
                    } finally {
                      mutexTurns.release();
                    }
                  }
        betAmount = 0;
        io.to(gameId).emit('potUpdated', { betAmount });
        game.betDifference = 0;
        game.raiseCount = 0;
        game.interBet = 0;
        game.betAmount = 0;
        game.whoBet = '';
        game.whoRaised = '';
        game.raiseAmount = 0;
        game.raisedHowMany = 0;
        game.whoBetRes = '';
        game.betresBeforeRaise = 0;
        game.betRezzed = 0;
        game.abSy = 0;
        game.abSy2 = 0;
        game.whoRaised2 = '';
        game.aB = 0;
        game.aA = 0;
        game.isTurnAdvanced = false;
        game.blindStopper = 0;
        game.lT = false;
        game.rT = false;
        game.reserveRaise = [];
        game.eventSequence = [];
        game.storeBet = 0;
        game.whoSb = '';
        console.log(`${currentPlayerId} ${game.playersIds[game.dealerIndex+1]}`);
    } else if (game.gameTurns.turnIndex === 4){  
      game.updatedPlayersLength = game.playersIds.length;   
      game.betDifference = 0;
      game.gameTurns.turnIndex = 0;
      game.gameTurns.actionsTaken = 0;
      game.raiseCount = 0;
      game.interBet = 0;
      game.betAmount = 0;
      game.whoBet = '';
      game.whoRaised = '';
      game.raiseAmount = 0;
      game.raisedHowMany = 0;
      game.whoBetRes = '';
      game.betresBeforeRaise = 0;
      game.betRezzed = 0;
      game.abSy = 0;
      game.abSy2 = 0;
      game.whoRaised2 = '';
      game.aB = 0;
      game.aA = 0;
      game.isTurnAdvanced = false;
      game.blindStopper = 0;
      game.isDealCardsCompleted = false;
      game.sB = 0;
      game.bB = 0;
      game.lT = false;
      game.rT = false;
      game.reserveRaise = [];
      game.combinedBlinds = 0;
      game.eventSequence = [];
      game.storeBet = 0;
      game.folderPlayers = [];
      game.whoSb = '';
      game.dealerIndex = (game.dealerIndex + 1) % game.playersIds.length;
      game.playersIds.length = game.playersIds.length;
      await game.save();
      const isDealer = game.dealerIndex;
      io.to(gameId).emit('dealerEmitted', { isDealer });
      io.to(gameId).emit('newHand');
      await game.save();
      console.log(game.cashChips);
    }
}
  await game.save();
});

socket.on('blindSter', ({blindSter, gameId}) => {
  io.to(gameId).emit('titkiBig', {titkiBig:blindSter});
});

socket.on('foldSkip', async ({gameId}) => {
  let game = await Game.findOne({ gameId });
  const currentPlayerId = game.playersIds[game.currentPlayerIndex];

  if (game.folderPlayers.includes(currentPlayerId)){
    io.to(gameId).emit('heFolded');
    console.log('heFolded');  
  await advanceTurn(gameId);
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
        game.updatedPlayersLength = game.playersIds.length;
        await game.save();
  
        // Notify players that the game has started
        io.to(gameId).emit('gameStarted', { gameId });
      } else {
        // Not all players are ready, update all clients with the current ready count
        io.to(gameId).emit('playersReady', { count: game.readyPlayers.length, total: game.playersIds.length });
      }
    }
  });

  socket.on('playerLeaving', async ({ gameId, playerId }) => {
    console.log(`Player ${playerId} leaving game ${gameId}`);
    let game = await Game.findOne({ gameId });
    
    try {
        const filter = { gameId };
        let update = {};
        
        const index = game.playersIds.findIndex(id => playerToSocketMap[id] === socket.id);
        if (index !== -1) {
            update = { $pull: { playersIds: playerId } };
            console.log(`Player ${playerId} removed from game ${gameId}.`);
        } else {
            console.log(`Player ${playerId} not found in game ${gameId}.`);
        }

        // If there are no more players left in the game, delete the game object
        const options = { new: true }; // Return the modified document
        const updatedGame = await Game.findOneAndUpdate(filter, update, options);

        if (!updatedGame) {
            console.log(`Game ${gameId} not found.`);
            return;
        }

        // If the game object has no players left, delete it
        if (updatedGame.playersIds.length === 0) {
            await Game.deleteOne({ gameId });
            console.log(`Game ${gameId} removed as no players left.`);
        } else {
            console.log("Updated playersIds:", updatedGame.playersIds);
        }
        
        // Notify clients about the updated game state
        io.to(gameId).emit('gameUpdated', { gameId, game: updatedGame });
    } catch (error) {
        console.error('Error handling player leaving:', error);
    }
});
socket.on('potski', async ({ potski, gameId }) => {
  io.to(gameId).emit('skiPot', { skiPot: potski });
});
const gameMutex = new Mutex();

// Socket event listener for 'cashUpdate'
socket.on('cashUpdate', async ({ cashUpdate, playerId, gameId }) => {
    try {
        // Acquire the mutex to serialize access to the critical section
        const release = await gameMutex.acquire();

        // Retrieve the game document
        let game = await Game.findOne({ gameId });

        console.log(`Cash updating, cash update: ${cashUpdate}, playerId: ${playerId}`);
        console.log("Length of playersIds:", game.playersIds.length);
        console.log("Length of cashChips:", game.cashChips.length);

        const playerIndex = game.playersIds.indexOf(playerId);

        if (playerIndex !== -1) {
            // Update cashChips at the corresponding index
            game.cashChips[playerIndex] = Number(cashUpdate);
            // Save the updated game document
            await game.save();
        }

        console.log(game.cashChips);

        // Release the mutex to allow other concurrent operations
        release();
    } catch (error) {
        console.error('Error in cashUpdate socket listener:', error);
    }
});
  socket.on('requestCashUpdate', async ({gameId}) => {
    let game = await Game.findOne({ gameId });
    io.to(gameId).emit('gimmeCashUpdate');
  })
  socket.on('potSB', async ({ potSB, gameId }) => {
    let game = await Game.findOne({ gameId });
    game.sB = potSB;
    await game.save();
  });
  socket.on('potBB', async ({ potBB, gameId }) => {
    let game = await Game.findOne({ gameId });
    game.bB = potBB;
    console.log(game.bB);
    await game.save();
    game.combinedBlinds = game.bB + game.sB;
    console.log(game.sB);
    await game.save();
    io.to(gameId).emit('newPot2', { newPot2:game.combinedBlinds, betAmount: game.bB });
  });
  socket.on('disconnect', async ({ gameId }) => {
    try {
      // Find the game
      let game = await Game.findOne({ gameId });
  
      if (!game) {
        // Game not found, handle appropriately
        return;
      }
  
      // Find and remove the disconnecting player's mapping
      const playerId = Object.keys(playerToSocketMap).find(id => playerToSocketMap[id] === socket.id);
      if (playerId) {
        delete playerToSocketMap[playerId];
      }
  
      // Update the playersIds array to remove the disconnected player
      game.playersIds = game.playersIds.filter(id => id !== playerId);
  
      // If there are no more players left in the game, delete the game object
      if (game.playersIds.length === 0 ) {
        await Game.deleteOne({ gameId });
        console.log(`game deleted ${gameId}`)
        // You might also want to emit an event to inform other clients that the game has been deleted
        // socket.broadcast.to(gameId).emit('gameDeleted');
      } else {
        // Save the updated game object
        await game.save();
      }
    } catch (error) {
      // Handle errors appropriately
      console.error("Error:", error);
    }
  });
  
  socket.on('betSound', async ({gameId}) => {
    io.to(gameId).emit('emitBetSound');
    });
    socket.on('betResSound', async ({gameId}) => {
      io.to(gameId).emit('emitBetResSound');
      });
      socket.on('checkSound', async ({gameId}) => {
        io.to(gameId).emit('emitCheckSound');
        });
        socket.on('foldSound', async ({gameId}) => {
          io.to(gameId).emit('emitFoldSound');
          });


  socket.on('newPlayerChips', async ({newPlayerChips, gameId, whoseChips}) => {
  io.to(gameId).emit('newChipsRightBack', { newChipsRightBack:newPlayerChips, whosMoney:whoseChips });
  });

  });


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});