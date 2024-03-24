import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
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

const SERVER_URL = 'http://localhost:3001';
const socket = io(SERVER_URL);

function Game() {
  const cardImages = {
"two_spades": twoSpades,
"three_spades": threeSpades,
"four_spades": fourSpades,       
"five_spades": fiveSpades,
"six_spades": sixSpades,
"seven_spades": sevenSpades,
"eight_spades": eightSpades,
"nine_spades": nineSpades,
"ten_spades": tenSpades,
"jack_spades": jackSpades, 
"queen_spades": queenSpades,
"king_spades": kingSpades,
"ace_spades": aceSpades,
"two_hearts" : twoHearts,
"three_hearts": threeHearts,
"four_hearts"  : fourHearts,
"five_hearts"  : fiveHearts,
"six_hearts"  : sixHearts,
"seven_hearts" : sevenHearts,
"eight_hearts" : eightHearts,
"nine_hearts"  : nineHearts,
"ten_hearts"  : tenHearts,
"jack_hearts"  : jackHearts,
"queen_hearts" : queenHearts,
"king_hearts"  : kingHearts,
"ace_hearts"  : aceHearts,
"two_diamonds": twoDiamonds,
"three_diamonds": threeDiamonds,
"four_diamonds": fourDiamonds,
"five_diamonds": fiveDiamonds,
"six_diamonds": sixDiamonds,
"seven_diamonds": sevenDiamonds,
"eight_diamonds": eightDiamonds,
"nine_diamonds": nineDiamonds,
"ten_diamonds": tenDiamonds,
"jack_diamonds": jackDiamonds,
"queen_diamonds": queenDiamonds,
"king_diamonds": kingDiamonds,
"ace_diamonds": aceDiamonds,
"two_clubs"   : twoClubs,
"three_clubs" :threeClubs,
"four_clubs" : fourClubs,
"five_clubs" : fiveClubs,
"six_clubs" : sixClubs,
"seven_clubs" : sevenClubs,
"eight_clubs" : eightClubs,
"nine_clubs" : nineClubs,
"ten_clubs" : tenClubs,
"jack_clubs" : jackClubs,
"queen_clubs" : queenClubs,
"king_clubs" : kingClubs,
"ace_clubs"   : aceClubs
  };

  const [playersInGame, setPlayersInGame] = useState([]);
  const [playerId, setPlayerId] = useState([]);
  const [gameState, setGameState] = useState(null);
  const { gameId } = useParams(); // Get gameId from URL parameters
  const navigate = useNavigate();
  const [playerHand, setPlayerHand] = useState([]);
  const [tableCards, setTableCards] = useState([]); // If you plan to handle flop, turn, river updates
  const [turnCard, setTurnCard] = useState([]); // If you plan to handle flop, turn, river updates
  const [riverCard, setRiverCard] = useState([]); // If you plan to handle flop, turn, river updates
  const [isTurn, setIsTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [playerMoney, setPlayerMoney] = useState(0); // Initialize with default 1000 chips
  const [turnCount, setTurnCount] = useState(0);
  const [turnCount2, setTurnCount2] = useState(0);
  const [turnCount3, setTurnCount3] = useState(0);
  const [pot, setPot] = useState(0);
  const [clientBetAmount, setClientBetAmount] = useState(0); 
  const [cards, setCards] = useState([]); // Assuming you want to keep track of all dealt cards
  const [runIndex, setRunIndex] = useState(0);
  const [runIndex2, setRunIndex2] = useState(0);
  const [runIndex3, setRunIndex3] = useState(0);
  const [potDifference, setPotDifference] = useState(0);
  const [betResCounter, setBetResCounter] = useState(0);
  const [betResBoolean, setBetResBoolean] = useState(false);
  const [showBet, setShowBet] = useState(false);
  const [checkNoShow, setCheckNoShow] = useState(false);
  const [saveBet, setSaveBet] = useState(false);
  const [winner, setWinner] = useState(false);
  const [clientRaiseAmount, setClientRaiseAmount] = useState(0);
  const [midBet, setMidBet] = useState(0);
  const [multiRaise, setMultiRaise] = useState(false);
  const [dealer, setDealer] = useState(0);
  const [inputInteracted, setInputInteracted] = useState(false);
  const [noLimitIndex, setNoLimitIndex] = useState(0);
  const [clientBetDif, setClientBetDif] = useState(0);
  const [plusBool, setPlusBool] = useState(false);
  const [moneySaved, setMoneySaved] = useState(0);
  const [interRaise, setInterRaise] = useState(0);
  const [raised, setRaised] = useState(false);
  const [justOneRaise, setJustOneRaise] = useState(false);
  const [secondRaise, setSecondRaise] = useState(false);
  const [abstractRaise, setAbstractRaise] = useState(false);
  const [minusBetBoolean, setMinusBetBoolean] = useState(false);
  const [minusBet, setMinusBet] = useState(false);
  const [brSecRaise, setBrSecRaise] = useState(0);
  const [lastBetRezz, setLastBetRezz] = useState(0);
  const [stopIndex, setStopIndex] = useState(0);
  const [secBr, setSecBr] = useState(0);
  const [upR, setUpR] = useState(0);
  const [blindStopper, setBlindStopper] = useState(0);
  const [clientSB, setClientSB] = useState(0);
  const [clientBB, setClientBB] = useState(0); 

  const [interBet, setInterBet] = useState(0);
  const [interIndex, setInterIndex] = useState(0);

  useEffect(() => {
    if (isTurn) {
      // Increment turnCount each time isTurn becomes true
      setTurnCount(prevCount => prevCount + 1);
    } 
    if (turnCount >= 1){
      if (isTurn) {
      setTurnCount2(prevCount2 => prevCount2 + 1)
      }
    }
    if (turnCount2 >= 1){
      if (isTurn) {
      setTurnCount3(prevCount3 => prevCount3 + 1)
      }
    }
    
  }, [isTurn]);
  
  useEffect(() => {
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
      playerId = uuidv4();
      localStorage.setItem('playerId', playerId);
    }
    setPlayerId(playerId);

    socket.emit('joinGame', { gameId, playerId });

    socket.emit('joinRoom', { roomId: gameId });

    const handleGameUpdated = ({ game }) => {
      setGameState(game);
      setPlayersInGame(game.playersIds);
    };

    socket.on('gameUpdated', handleGameUpdated);

    socket.on('gameStarted', ({ gameId}) => {
      console.log('Game started:');
    });
    socket.on('cardsDealt', (dealtCards) => {
      setPlayerHand(dealtCards);
      console.log(dealtCards);
      });
    socket.on('chipsDealt', (playerChips) => {
      setPlayerMoney(playerChips);
      console.log(playerChips);
    })
    socket.on('noCheck', ()=> {
      setCheckNoShow(true);
    }); 
    socket.on('onlyBetRes', () => {
      setBetResBoolean(true);
    });

    socket.on('flopDealt', (flopCards) => {
      if(runIndex <= 1){
        const newCards = [...cards, ...flopCards];
        setCards(newCards);
        setTableCards(newCards.slice(0, 3));
        console.log('flop dealt');
        setRunIndex(runIndex + 1);      
      }
      });
      socket.on('goFlop', () => {
        socket.emit('requestFlop', { gameId });
        setCheckNoShow(false);
        setBetResBoolean(false);
        setClientBetAmount(0);
        setClientRaiseAmount(0);
        setSaveBet(0);
        setPotDifference(0);
        setMultiRaise(false);
        setInputInteracted(false);
        setNoLimitIndex(0);
        setMidBet(0);
        setInterBet(0);
        setPlusBool(false);
        setInterRaise(0);
        setRaised(false);
        setJustOneRaise(false);
        setSecondRaise(false);
        setAbstractRaise(0);
        setMinusBetBoolean(false);
        setMinusBet(0);
        setBrSecRaise(0);
        setLastBetRezz(false);
        setStopIndex(0);
        setSecBr(0);
        setUpR(0);
      });
    socket.on('turnDealt', (turnCards) => {
      if(runIndex2 <= 1){
      const newCards = [...cards, ...turnCards];
      setCards(newCards);
      setTableCards(newCards.slice(0, 4));
      console.log('turn dealt');
      setRunIndex2(runIndex2 + 1);
      }

    });
    socket.on('goTurn', () => {
      socket.emit('requestTurn', { gameId });
      setCheckNoShow(false);
      setBetResBoolean(false);
      setClientBetAmount(0);
      setClientRaiseAmount(0);
      setSaveBet(0);
      setPotDifference(0);
      setMultiRaise(false);
      setInputInteracted(false);
      setNoLimitIndex(0);
      setMidBet(0);
      setInterBet(0);
      setPlusBool(false);
      setInterRaise(0);
      setRaised(false);
      setJustOneRaise(false);
      setSecondRaise(false);
      setAbstractRaise(0);
      setMinusBetBoolean(false);
      setMinusBet(0);
      setBrSecRaise(0);
      setLastBetRezz(false);
      setStopIndex(0);
      setSecBr(0);
      setUpR(0);
        });
    
    socket.on('riverDealt', (riverCards) => {
      if(runIndex3 <= 1){
      const newCards = [...cards, ...riverCards];
      setCards(newCards);
      setTableCards(newCards.slice(0, 5));
      console.log('river dealt');
      setRunIndex3(runIndex3 + 1);
      }

    });
    socket.on('goRiver', () => {
      socket.emit('requestRiver', { gameId });
      setCheckNoShow(false);
      setBetResBoolean(false);
      setClientBetAmount(0);
      setClientRaiseAmount(0);
      setSaveBet(0);
      setPotDifference(0);
      setMultiRaise(false);
      setInputInteracted(false);
      setNoLimitIndex(0);
      setMidBet(0);
      setInterBet(0);
      setPlusBool(false);
      setInterRaise(0);
      setRaised(false);
      setJustOneRaise(false);
      setSecondRaise(false);
      setAbstractRaise(0);
      setMinusBetBoolean(false);
      setMinusBet(0);
      setBrSecRaise(0);
      setLastBetRezz(false);
      setStopIndex(0);
      setSecBr(0);
      setUpR(0);
    });

    socket.on('updateTurn', ({ isTurn, playerId: currentTurnPlayerId }) => {
      if (playerId === currentTurnPlayerId) {
          setIsTurn(isTurn);
      }
  });
  socket.on('didRaise', () => {
    setRaised(true);
});

    socket.on('dealerEmitted', ({isDealer}) => {
      setDealer(Number(isDealer));
    });
      // Listen for 'playersReady' event to update UI with ready count
    socket.on('playersReady', ({ count, total }) => {
      // Update your UI to show something like "1/2 Players Ready"
      setGameStatus(`${count}/${total} Players Ready`);
    });

    // Listen for 'gameStarted' to proceed to the game view
    socket.on('gameStarted', ({ gameId }) => {
      socket.emit('startGame', { gameId });
      console.log('Game has started');
      setGameStarted(true);
});
    socket.on('potUpdated', ({ betAmount }) => {
      console.log(`Received betAmount:`, betAmount, `Current pot:`, pot);
      const numericBetAmount = Number(betAmount);
    // Assuming betAmount is the amount to add to the current pot
    const updatedPot = Number(pot) + Number(betAmount);
    console.log(`Updated pot:`, updatedPot);
    setClientBetAmount(numericBetAmount);
    setPot(Number(updatedPot));
});
socket.on('raiseEmitted', ({ betAmount }) => {
  console.log(`Received betAmount:`, betAmount, `Current pot:`, pot);
  const numericBetAmount = Number(betAmount);
// Assuming betAmount is the amount to add to the current pot
const updatedPot = Number(pot) + Number(betAmount);
console.log(`Updated pot:`, updatedPot);
if (noLimitIndex===1){
setMultiRaise(false);
const noLimitPot = Number(pot) + numericBetAmount;
setClientBetAmount (numericBetAmount);
setPot(pot + numericBetAmount);
}
 else if (noLimitIndex>=2){
  if (interIndex<=1){
    setMultiRaise(true);
    setClientBetAmount (numericBetAmount);
    setPot(pot + numericBetAmount);
    setInterIndex(interIndex+1);
  }else{
    if (plusBool){
      console.log(`Updated pot:`, updatedPot);
      setClientBetAmount(numericBetAmount);
      setPot(Number(pot)+numericBetAmount);
        }
    else{    
    setMultiRaise(true);
    setClientBetAmount (numericBetAmount);
    setPot(pot + numericBetAmount);
  }
}
  }
else{
  if (plusBool){
console.log(`Updated pot:`, updatedPot);
setClientBetAmount(numericBetAmount);
setPot(Number(pot)+numericBetAmount);
  }
  else{
  console.log(`Updated pot:`, updatedPot);
setClientBetAmount(numericBetAmount);
setPot(Number(pot)+numericBetAmount);
  }
}
});
socket.on('raisecTwo', ({ betAmount }) => {
  setPlusBool(true);
});
socket.on('interRaiseBetres', ({ ir })=>{
  setAbstractRaise(Number(ir));
});
socket.on('onlyOneRaise',() => {
  setJustOneRaise(true);
});
socket.on('twoRaise',() => {
  setSecondRaise(true);
});
socket.on('minusBet',() => {
  setMinusBetBoolean(true);
});
socket.on('betRezzySecRaise',({brSecRaise}) => {
  setBrSecRaise(Number(brSecRaise));
});
/*socket.on('lastBetRezzy',({betRezzy}) => {
  setLastBetRezz(true);
  if (stopIndex<1 && interBet === 0 && interRaise === 0 && isTurn){
  setPlayerMoney(playerMoney-Number(betRezzy));
  setStopIndex(stopIndex+1);
  console.log(`secBr:${secBr}`);
}
  setLastBetRezz(false);
});*/
  socket.on ('hhGG', ({hhGG}) => {
    if (interBet === 0 && interRaise === 0 && isTurn){
    setPlayerMoney(playerMoney-Number(hhGG));
    }else{
      setPlayerMoney(playerMoney+0);
    }
  });
  socket.on ('seccyBR', ({seccyBR}) => {
    if (interBet === 0 && interRaise === 0){
    setPlayerMoney(playerMoney-Number(seccyBR));
    setSecBr(Number(seccyBR));
    }else{
      setPlayerMoney(playerMoney+0);
    }
  });
socket.on('potPlus', ({potPlus}) => {
  setPot(pot+Number(potPlus));
});
socket.on('upRaise', ({upRaise}) => {
  if (interBet === 0 && interRaise === 0 && isTurn){
  setPlayerMoney(playerMoney+0);
  }
});
socket.on('chipsMinus', ({chipsMinus}) =>{
  if (interBet === 0 && interRaise !== 0){
  setPlayerMoney(playerMoney-Number(chipsMinus));
    }
});
socket.on('chipsMinus2', ({chipsMinus2}) => {
  if (interBet !== 0 && interRaise === 0){
  setPlayerMoney(playerMoney-Number(chipsMinus2));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on('twoPtwoR', ({twoPtwoR}) => {
  if (interBet !== 0 && interRaise === 0){
    setPlayerMoney(playerMoney-Number(twoPtwoR));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on('tootsiePlus', ({tootsiePlus}) => {
  if (interBet === 0 && interRaise !== 0){
    setPlayerMoney(playerMoney-Number(tootsiePlus));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on('chippyMin', ({chippyMin}) => {
  if (interBet === 0 && interRaise === 0){
    setPlayerMoney(playerMoney-Number(chippyMin));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on('chippyM', ({chippyM}) => {
  if (interBet === 0 && interRaise === 0 && isTurn){
    setPlayerMoney(playerMoney-Number(chippyM));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on('cPMM', ({cPMM}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
    setPlayerMoney(playerMoney-Number(cPMM));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on('zzTT', ({zzTT}) => {
  if (interBet !== 0 && interRaise === 0 && isTurn){
    setPlayerMoney(playerMoney-Number(zzTT));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});
socket.on ('secSEC', ({secSEC}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(secSEC));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});
socket.on ('vvPP', ({vvPP}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(vvPP));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});
socket.on ('aaTT', ({aaTT}) => {
  if (interBet === 0 && interRaise === 0 && isTurn){
  setPlayerMoney(playerMoney-Number(aaTT));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});
socket.on ('ppPP', ({ppPP}) => {
  if (interBet !== 0 && interRaise === 0 && isTurn){
  setPlayerMoney(playerMoney-Number(ppPP));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});
socket.on ('ddDD', ({ddDD}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(ddDD));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});
socket.on ('xXX', ({xXX}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(xXX));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});
socket.on ('bBB', ({bBB}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(bBB));
  }else{
    setPlayerMoney(playerMoney+0);
  }
  setIsTurn(false);
});

socket.on('sB', () => {
  if (isTurn){
    setPlayerMoney(playerMoney-25); 
  }
  });
socket.on('bB', () => {
  if (isTurn){
    setPlayerMoney(playerMoney-50);
  }
  });












socket.on('newHand', () => {
  setPlayerHand([]);
  setCheckNoShow(false);
  setBetResBoolean(false);
  setClientBetAmount(0);
  setClientRaiseAmount(0);
  setSaveBet(0);
  setPotDifference(0);
  setPot(0);
  setTableCards([]);
  setCards([]);
  setRunIndex(0);
  setRunIndex2(0);
  setRunIndex3(0);
  setNoLimitIndex(0);
  setMultiRaise(false);  
  setInputInteracted(false);
  setInterBet(0);
  setMidBet(0);
  setPlusBool(false);
  setInterRaise(0);
  setRaised(false);
  setJustOneRaise(false);
  setSecondRaise(false);
  setAbstractRaise(0);
  setMinusBetBoolean(false);
  setMinusBet(0);
  setBrSecRaise(0);
  setLastBetRezz(false);
  setStopIndex(0);
  setSecBr(0);
  setUpR(0);
})

window.addEventListener('beforeunload', function(event) {
  // Emit an event to the server indicating the player is leaving the game
  socket.emit('playerLeaving', { gameId, playerId });
});
               
      return () => {
        socket.off('gameUpdated', handleGameUpdated);
        socket.off('gameStarted');
        socket.off('cardsDealt');
        socket.off('flopDealt');
        socket.off('turnDealt');
        socket.off('riverDealt');
        socket.off('updateTurn');
        socket.off('playersReady');
        socket.off('chipsDealt');
        socket.off('betMade');
        socket.off('potUpdated');
        socket.off('raiseEmitted');
        socket.off('dealerEmitted');
        socket.off('interRaiseBetres');
        socket.off('didRaise');
        socket.off('onlyOneRaise');
        socket.off('twoRaise');
        socket.off('raisecTwo');
        socket.off('minusBet');
        socket.off('lastBetRezzy');
        socket.off('seccyBR'); 
        socket.off('upRaise');
        socket.off('chipsMinus');
        socket.off('chipsMinus2');
        socket.off('twoPtwoR');
        socket.off('tootsiePlus');
        socket.off('chippyMin');
        socket.off('cPMM');
        socket.off('zzTT');
        socket.off('vvPP');
        socket.off('aaTT');
        socket.off('ppPP');
        socket.off('ddDD');
        socket.off('hhGG');
        socket.off('chippyM');
        socket.off('xXX');
        socket.off('bBB');
        socket.off('sB');
        socket.off('bB');
      };
    }, [gameId, socket, turnCount, playerId, pot, cards, runIndex, dealer]);
  

    const handlePlayerAction = (actionType, betAmount, event, clientBetAmount) => {
      
      const playerId = localStorage.getItem('playerId');
    
      // Ensure betAmount is a number
      const numericBetAmount = Number(betAmount);
      const numericRaiseAmount = Number(clientRaiseAmount);
      // Ensure playerMoney and pot are treated as numbers
      const numericPlayerMoney = Number(playerMoney);
      const numericPot = Number(pot);
      const updatedChips = numericPlayerMoney - numericBetAmount;
      let actionPayload = { gameId, playerId, action: actionType, betAmount: numericBetAmount };


      if (isTurn && (actionType === 'bet') && numericBetAmount > 0 && betAmount>0 && betAmount<=playerMoney && numericBetAmount <= numericPlayerMoney) {
        setNoLimitIndex(noLimitIndex+1);
        setClientBetAmount(numericBetAmount);
        setPlayerMoney(numericPlayerMoney-numericBetAmount);
        setInterBet(numericBetAmount);
      }
      else if (isTurn && (actionType === 'raise') && numericBetAmount > 0 && betAmount>0 && betAmount<=playerMoney && numericBetAmount <= numericPlayerMoney) {
        setNoLimitIndex(noLimitIndex+1);

        if(minusBetBoolean === true){
          setPlayerMoney(numericPlayerMoney-numericBetAmount+interBet);
          console.log('c1');
        }
        else{
        setClientBetAmount(numericBetAmount);
        setInputInteracted(false);
        setPlayerMoney(numericPlayerMoney-numericBetAmount);
        setInterRaise(numericBetAmount);console.log('c2');
        }
        
      }
      
      else if (isTurn && actionType === 'betres') {
        console.log(`lastbetrezz: ${lastBetRezz}`);
        if (raised && justOneRaise===true && secondRaise === false){
        if (interBet>0){
        setClientBetAmount(numericBetAmount);
        setPlayerMoney(numericPlayerMoney-numericBetAmount+interBet);
        setPlusBool(true);
        console.log ('r1');
        }else if(interRaise>0){
        setClientBetAmount(numericBetAmount);
        setPlayerMoney(numericPlayerMoney-numericBetAmount+interRaise);
        setPlusBool(true);
        console.log ('r2');
        }
        else {
          setClientBetAmount(numericBetAmount);
          setPlayerMoney(numericPlayerMoney-numericBetAmount);
          setPlusBool(true);
          console.log ('r2.5');
        }
        }
          else if (raised && secondRaise === true && justOneRaise === true){
          if (interBet>0){
          setClientBetAmount(numericBetAmount);
          setPlayerMoney(numericPlayerMoney-numericBetAmount+interBet);
          setPlusBool(true);
          console.log ('r3');
          }
          else if(interRaise>0 && minusBetBoolean===false){
          setClientBetAmount(numericBetAmount);
          setPlayerMoney(numericPlayerMoney-abstractRaise+interRaise);
          setPlusBool(true);
          console.log ('r4');
          }
          else if(interRaise>0 && minusBetBoolean===true){
          setSaveBet(numericPlayerMoney-(numericPlayerMoney-brSecRaise+interRaise));
          setPlayerMoney(numericPlayerMoney-brSecRaise+interRaise);
          setPlusBool(true);
          console.log ('r4.5');
          console.log(abstractRaise);console.log(numericBetAmount);console.log(interRaise);
          }
        }
        else{
        setClientBetAmount(numericBetAmount);
        setPlayerMoney(numericPlayerMoney-numericBetAmount);
        console.log ('r5');
      }
      
  }
      else if (isTurn && actionType === 'check'){
    }
    else if (actionType === 'check'){
    }
    socket.emit('playerAction', actionPayload);
       
};
    
const markPlayerReady = () => {
  socket.emit('playerReady', { gameId, playerId });
};

    
  

    return (
      <div>
        <h2>Players in Game:</h2>
        {playersInGame.map((_, index) => (
        <div key={index} style={{ width: '150px', height: '150px', backgroundColor: 'black', margin: '10px' }}>
        {index === dealer && <p className="dealer-chip">Dealer</p>}
        </div>
        ))}
        {!gameStarted && (
        <>
        <button onClick={markPlayerReady}>Start Game</button>
        <p>{gameStatus}</p>
        </>
        )}
          
          <p>Chips: ${playerMoney}</p>
          <p>Pot: ${Number(pot)}</p>
        <h2>Your Hand:</h2>
        <div className="hand">
          {/* Assuming you have a way to map card names and suits to images */}
          {playerHand.map((card, index) => (
            <img key={index} src={cardImages[`${card.name}_${card.suit}`]} alt={`${card.name} of ${card.suit}`} />
          ))}
        </div>

        {isTurn &&(
        <div>
        {!checkNoShow && (
        <button onClick={() => handlePlayerAction('check')}>Check</button>
        )}
        {!betResBoolean && (
        <input
          type="number"
          value={clientBetAmount}
          onChange={(e) => setClientBetAmount(Number(e.target.value))}
          placeholder="Bet Amount"
        />)}
        {betResBoolean && !multiRaise && !inputInteracted && (
        <button onClick={() => handlePlayerAction('betres', clientBetAmount)}>Bet: ${clientBetAmount}</button>
        )}
        {betResBoolean && multiRaise && !inputInteracted && (
        <button onClick={() => handlePlayerAction('betres', clientBetAmount)}>Bet//: ${clientBetAmount}</button>
        )}
        {!betResBoolean && (
        <button onClick={() => handlePlayerAction('bet', clientBetAmount)}>Bet</button>
        )}
        {betResBoolean && (
        <input
          type="number"
          value={Number(clientBetAmount)}
          onChange={(e) => {
            setClientBetAmount(Number(e.target.value));
            setInputInteracted(true); // Set to true on change
          }}
          onClick={() => setInputInteracted(true)} // Set to true on click
          placeholder="Raise Amount"
        />
        )}
        {betResBoolean && (
        <button onClick={() => handlePlayerAction('raise', Number(clientBetAmount))}>Raise</button>
        )}
        <button onClick={() => handlePlayerAction('fold')}>Fold</button>
        </div>
      )}
      {!isTurn && (
        <div>Waiting for other players...</div>
      )}
      
        <h2>Table Cards:</h2>
        <div className="flop">
          {tableCards.map((card, index) => (
            <img key={index} src={cardImages[`${card.name}_${card.suit}`]} alt={`${card.name} of ${card.suit}`} />
          ))}
        </div>
      </div>
    );
  };
  

export default Game;