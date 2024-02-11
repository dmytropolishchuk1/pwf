import React from "react";
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import twoSpades   from  "./assets/cards/SPADES_2.svg";
import threeSpades from  "./assets/cards/SPADES_3.svg";
import fourSpades  from  "./assets/cards/SPADES_4.svg";
import fiveSpades  from  "./assets/cards/SPADES_5.svg";
import sixSpades   from  "./assets/cards/SPADES_6.svg";
import sevenSpades from  "./assets/cards/SPADES_7.svg";
import eightSpades from  "./assets/cards/SPADES_8.svg";
import nineSpades  from  "./assets/cards/SPADES_9.svg";
import tenSpades   from  "./assets/cards/SPADES_10.svg";
import jackSpades  from  "./assets/cards/SPADES_J.svg";
import queenSpades from  "./assets/cards/SPADES_Q.svg";
import kingSpades  from  "./assets/cards/SPADES_K.svg";
import aceSpades   from  "./assets/cards/SPADES_A.svg";

import twoHearts  from    "./assets/cards/HEARTS_2.svg";
import threeHearts  from  "./assets/cards/HEARTS_3.svg";
import fourHearts  from   "./assets/cards/HEARTS_4.svg";
import fiveHearts  from   "./assets/cards/HEARTS_5.svg";
import sixHearts  from    "./assets/cards/HEARTS_6.svg";
import sevenHearts  from  "./assets/cards/HEARTS_7.svg";
import eightHearts from   "./assets/cards/HEARTS_8.svg";
import nineHearts from    "./assets/cards/HEARTS_9.svg";
import tenHearts from     "./assets/cards/HEARTS_10.svg";
import jackHearts from    "./assets/cards/HEARTS_J.svg";
import queenHearts from   "./assets/cards/HEARTS_Q.svg";
import kingHearts from    "./assets/cards/HEARTS_K.svg";
import aceHearts from     "./assets/cards/HEARTS_A.svg";

import twoDiamonds from    "./assets/cards/DIAMONDS_2.svg";
import threeDiamonds from  "./assets/cards/DIAMONDS_3.svg";
import fourDiamonds from   "./assets/cards/DIAMONDS_4.svg";
import fiveDiamonds from   "./assets/cards/DIAMONDS_5.svg";
import sixDiamonds from    "./assets/cards/DIAMONDS_6.svg";
import sevenDiamonds from  "./assets/cards/DIAMONDS_7.svg";
import eightDiamonds from  "./assets/cards/DIAMONDS_8.svg";
import nineDiamonds from   "./assets/cards/DIAMONDS_9.svg";
import tenDiamonds from    "./assets/cards/DIAMONDS_10.svg";
import jackDiamonds from   "./assets/cards/DIAMONDS_J.svg";
import queenDiamonds from  "./assets/cards/DIAMONDS_Q.svg";
import kingDiamonds from   "./assets/cards/DIAMONDS_K.svg";
import aceDiamonds from    "./assets/cards/DIAMONDS_A.svg";

import twoClubs from    "./assets/cards/CLUBS_2.svg";
import threeClubs from  "./assets/cards/CLUBS_3.svg";
import fourClubs from   "./assets/cards/CLUBS_4.svg";
import fiveClubs from   "./assets/cards/CLUBS_5.svg";
import sixClubs from    "./assets/cards/CLUBS_6.svg";
import sevenClubs from  "./assets/cards/CLUBS_7.svg";
import eightClubs from  "./assets/cards/CLUBS_8.svg";
import nineClubs from   "./assets/cards/CLUBS_9.svg";
import tenClubs from    "./assets/cards/CLUBS_10.svg";
import jackClubs from   "./assets/cards/CLUBS_J.svg";
import queenClubs from  "./assets/cards/CLUBS_Q.svg";
import kingClubs from   "./assets/cards/CLUBS_K.svg";
import aceClubs from    "./assets/cards/CLUBS_A.svg";

const SERVER_URL = 'http://localhost:3000';
const socket = io(SERVER_URL);

function Game() {
        const [playersInGame, setPlayersInGame] = useState([]);

        let { gameId } = useParams();
        // Use gameId to fetch game data, manage state, etc.
        console.log(gameId); // For demonstration

        const [gameState, setGameState] = useState(null);
        // Assuming you have a way to get gameId, e.g., from URL params or passed as a prop
        
      const joinGame = (playerName) => {
            const newPlayerId = uuidv4();
            const newPlayer = {
              id: newPlayerId,
              name: playerName,
              hand: [] // Initialize with an empty hand
            };
            setPlayersInGame(prevPlayers => [...prevPlayers, newPlayer]);
    // Here you could also communicate with the backend to officially add the player to the game
  };
        useEffect(() => {
          // Join the game room when the component mounts
          socket.emit('joinGame', gameId);
          joinGame("PlayerName");
          // Setup event listeners for socket
          socket.on('yourTurn', () => {
            // Notify player it's their turn
            console.log("It's your turn!");
          });

          
      
          socket.on('gameUpdate', (gameState) => {
            // Update client-side game state
            setGameState(gameState);

            
          });
      
          // Cleanup: remove event listeners on component unmount
          return () => {
            socket.off('yourTurn');
            socket.off('gameUpdate');
          };
        }, [gameId]); // Re-run the effect if gameId changes

    const [remainingStack, setRemainingStack] = useState([]);

    const stack = [
        {name: "two", suit: "spades", pic: twoSpades},
        {name: "three", suit: "spades", pic: threeSpades},
        {name: "four", suit: "spades", pic: fourSpades},
        {name: "five", suit: "spades", pic: fiveSpades},
        {name: "six", suit: "spades", pic: sixSpades},
        {name: "seven", suit: "spades", pic: sevenSpades},
        {name: "eight", suit: "spades", pic: eightSpades},
        {name: "nine", suit: "spades", pic: nineSpades},
        {name: "ten", suit: "spades", pic: tenSpades},
        {name: "jack", suit: "spades", pic: jackSpades},
        {name: "queen", suit: "spades", pic:queenSpades},
        {name: "king", suit: "spades", pic:kingSpades},
        {name: "ace", suit: "spades", pic: aceSpades},
        {name: "two", suit: "hearts"    , pic:twoHearts},
        {name: "three", suit: "hearts"  , pic:threeHearts},
        {name: "four", suit: "hearts"   , pic:fourHearts},
        {name: "five", suit: "hearts"   , pic:fiveHearts},
        {name: "six", suit: "hearts"    , pic:sixHearts},
        {name: "seven", suit: "hearts"  , pic:sevenHearts},
        {name: "eight", suit: "hearts"  , pic:eightHearts},
        {name: "nine", suit: "hearts"   , pic:nineHearts},
        {name: "ten", suit: "hearts"    , pic:tenHearts},
        {name: "jack", suit: "hearts"   , pic:jackHearts},
        {name: "queen", suit: "hearts"  , pic:queenHearts},
        {name: "king", suit: "hearts"   , pic:kingHearts},
        {name: "ace", suit: "hearts"    , pic:aceHearts},
        {name: "two", suit: "diamonds"  , pic:twoDiamonds},
        {name: "three", suit: "diamonds", pic:threeDiamonds},
        {name: "four", suit: "diamonds" , pic:fourDiamonds},
        {name: "five", suit: "diamonds" , pic:fiveDiamonds},
        {name: "six", suit: "diamonds"  , pic:sixDiamonds},
        {name: "seven", suit: "diamonds", pic:sevenDiamonds},
        {name: "eight", suit: "diamonds", pic:eightDiamonds},
        {name: "nine", suit: "diamonds" , pic:nineDiamonds},
        {name: "ten", suit: "diamonds"  , pic:tenDiamonds},
        {name: "jack", suit: "diamonds" , pic:jackDiamonds},
        {name: "queen", suit: "diamonds", pic:queenDiamonds},
        {name: "king", suit: "diamonds" , pic:kingDiamonds},
        {name: "ace", suit: "diamonds"  , pic:aceDiamonds},
        {name: "two", suit: "clubs"     , pic:twoClubs},
        {name: "three", suit: "clubs"   , pic:threeClubs},
        {name: "four", suit: "clubs"    , pic:fourClubs},
        {name: "five", suit: "clubs"    , pic:fiveClubs},
        {name: "six", suit: "clubs"     , pic:sixClubs},
        {name: "seven", suit: "clubs"   , pic:sevenClubs},
        {name: "eight", suit: "clubs"   , pic:eightClubs},
        {name: "nine", suit: "clubs"    , pic:nineClubs},
        {name: "ten", suit: "clubs"     , pic:tenClubs},
        {name: "jack", suit: "clubs"    , pic:jackClubs},
        {name: "queen", suit: "clubs"   , pic:queenClubs},
        {name: "king", suit: "clubs"    , pic:kingClubs},
        {name: "ace", suit: "clubs"     , pic:aceClubs}
    ]

    return(
        <div className="game-holder">

        </div>
    )
}

export default Game;