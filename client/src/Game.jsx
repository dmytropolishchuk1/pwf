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

import cardBack from "./assets/cards/BACK.svg";

import betSound from "./assets/betSound.mp3";
import checkSound from "./assets/checkSound.mp3";
import foldSound from "./assets/foldSound.mp3";




const SERVER_URL = "https://pwfpwfpwf-3f02d2a899b2.herokuapp.com/"; 
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
  const [betResBoolean, setBetResBoolean] = useState(false);
  const [checkNoShow, setCheckNoShow] = useState(false);
  const [clientRaiseAmount, setClientRaiseAmount] = useState(0);
  const [multiRaise, setMultiRaise] = useState(false);
  const [dealer, setDealer] = useState(0);
  const [inputInteracted, setInputInteracted] = useState(false);
  const [noLimitIndex, setNoLimitIndex] = useState(0);
  const [plusBool, setPlusBool] = useState(false);
  const [interRaise, setInterRaise] = useState(0);
  const [raised, setRaised] = useState(false);
  const [justOneRaise, setJustOneRaise] = useState(false);
  const [secondRaise, setSecondRaise] = useState(false);
  const [abstractRaise, setAbstractRaise] = useState(false);
  const [minusBetBoolean, setMinusBetBoolean] = useState(false);
  const [brSecRaise, setBrSecRaise] = useState(0);
  const [lastBetRezz, setLastBetRezz] = useState(0);
  const [SB, setSB] = useState(0);
  const [isSmallBlind, setIsSmallBlind] = useState(false);
  const [isBigBlind, setIsBigBlind] = useState(false);
  const [stopB1, setStopB1] = useState(0);
  const [stopB2, setStopB2] = useState(0);
  const [titkiStopper, setTitkiStopper] = useState(0);
  const [stopper99, setStopper99] = useState(0);
  const [playerFolded, setPlayerFolded] = useState(false);
  const [foldedChipsSave, setFoldedChipsSave] = useState(0);
  const [playerMarkedReady, setPlayerMarkedReady] = useState(false);
  const [betDraggingValue, setBetDraggingValue] = useState(0);
  const [raiseDraggingValue, setRaiseDraggingValue] = useState(0);
  const [minRaise, setMinRaise] = useState(0);
  const [raiseLimitReached, setRaiseLimitReached] = useState(false);
  const [input2Interacted, setInput2Interacted] = useState(false);
  const [everyonesChips, setEveryonesChips] = useState([]);
  const [copied, setCopied] = useState(false);
  const [combinedCards, setCombinedCards]= useState([]);
  const [myHandQuant, setMyHandQuant] = useState(0);
  const [showOtherCards, setShowOtherCards] = useState(false);
  const [storePot, setStorePot] = useState(0);
  const [everyonesHand, setEveryonesHand] = useState ([]);
  const [payoutStopper, setPayoutStopper] = useState(0);
  const [payoutStopper2, setPayoutStopper2] = useState(0);

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
      console.log(`players in game are: ${playersInGame}`)
    };


    socket.on('gameUpdated', handleGameUpdated);

    socket.on('cardsDealt', (dealtCards) => {
      setPlayerHand(dealtCards);
      });

    socket.on('chipsDealt', (playerChips) => {
      setPlayerMoney(playerChips);
      const newEveryonesChips = Array(playersInGame.length).fill(5000);
      setEveryonesChips(newEveryonesChips);
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
        setRaiseLimitReached(false);
        setInput2Interacted(false);
        setCheckNoShow(false);
        setBetResBoolean(false);
        setClientBetAmount(0);
        setClientRaiseAmount(0);
        setMultiRaise(false);
        setInputInteracted(false);
        setNoLimitIndex(0);
        setInterBet(0);
        setPlusBool(false);
        setInterRaise(0);
        setRaised(false);
        setJustOneRaise(false);
        setSecondRaise(false);
        setAbstractRaise(0);
        setMinusBetBoolean(false);
        setBrSecRaise(0);
        setLastBetRezz(false);
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
      setRaiseLimitReached(false);
      setInput2Interacted(false);
      setCheckNoShow(false);
      setBetResBoolean(false);
      setClientBetAmount(0);
      setClientRaiseAmount(0);
      setMultiRaise(false);
      setInputInteracted(false);
      setNoLimitIndex(0);
      setInterBet(0);
      setPlusBool(false);
      setInterRaise(0);
      setRaised(false);
      setJustOneRaise(false);
      setSecondRaise(false);
      setAbstractRaise(0);
      setMinusBetBoolean(false);
      setBrSecRaise(0);
      setLastBetRezz(false);

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
      setRaiseLimitReached(false);
      setInput2Interacted(false);
      setCheckNoShow(false);
      setBetResBoolean(false);
      setClientBetAmount(0);
      setClientRaiseAmount(0);
      setMultiRaise(false);
      setInputInteracted(false);
      setNoLimitIndex(0);
      setInterBet(0);
      setPlusBool(false);
      setInterRaise(0);
      setRaised(false);
      setJustOneRaise(false);
      setSecondRaise(false);
      setAbstractRaise(0);
      setMinusBetBoolean(false);
      setBrSecRaise(0);
      setLastBetRezz(false);
    });
    socket.on('titkiBig', ({titkiBig}) => {
      if (titkiStopper<1 && isTurn){
      setIsSmallBlind(false);
      setIsBigBlind(false);
      setClientBetAmount(Number(titkiBig));
      setTitkiStopper(titkiStopper+1);
    }
    
    });
    socket.on('sB', () => {
      setIsSmallBlind(true);
      });
    socket.on('bB', () => {
      setIsBigBlind(true);
      });
    socket.on('newPot2', ({newPot2, betAmount}) => {
      setPot(Number(newPot2));
      if (Number(newPot2) === 50){
        setPot(75);
      } 
      socket.emit('blindSter', {blindSter: betAmount, gameId});
    });
    socket.on('updateTurnAfterBlinds', ({ isTurn, playerId: currentTurnPlayerId }) => {
      setIsSmallBlind(false);
      setIsBigBlind(false);
      const playerId = localStorage.getItem('playerId'); 
      if (playerId === currentTurnPlayerId) {
        setIsTurn(isTurn);
        setBetResBoolean(true);
        setCheckNoShow(true);
        console.log('after blinds player');
        console.log('isTurn:', isTurn);
      }
    });  
    socket.on('updateTurnBigBlind', ({ isTurn, playerId: currentTurnPlayerId }) => {
      setIsSmallBlind(false);
      const playerId = localStorage.getItem('playerId'); 
      if (playerId === currentTurnPlayerId) {
        setIsTurn(isTurn);
        if (isBigBlind && isTurn && stopB2<1) {
          if (playerMoney>=50 && stopper99<1){
            console.log(`player money:  ${playerMoney} `);
          setPlayerMoney(playerMoney - 50);
          console.log(`player money:  ${playerMoney} `);
          socket.emit('potBB', {potBB: 50, gameId});
          setIsBigBlind(false);
          setStopper99(stopper99+1);
          console.log(`player money:  ${playerMoney} `);
        } else if (playerMoney<50 && stopper99<1){
          socket.emit('potBB', {potBB: playerMoney, gameId});
          setPlayerMoney(playerMoney-playerMoney);
          setIsBigBlind(false);
          setStopper99(stopper99+1);
          console.log(`player money:  ${playerMoney} 2`);
        }
        console.log(`player money:  ${playerMoney} 3`);
          setStopB2(stopB2+1);
          console.log(`player money:  ${playerMoney} 4`);
        }
        setIsBigBlind(false);
        console.log(`player money:  ${playerMoney} 5`);
        console.log('Update turn event received');
        console.log('isBigBlind:', isBigBlind);
        console.log('isTurn:', isTurn);
      }
    });  
    socket.on('updateTurnSmallBlind', ({ isTurn, playerId: currentTurnPlayerId }) => {
      const playerId = localStorage.getItem('playerId'); 
      if (playerId === currentTurnPlayerId) {
        setIsTurn(isTurn);
        if (isSmallBlind && isTurn && stopB1<1) {
          if (playerMoney>25){
          setPlayerMoney(playerMoney - 25);
          setSB(25);
          socket.emit('potSB', {potSB: 25, gameId});
          setIsSmallBlind(false);
          setIsBigBlind(false);
        } else {
          socket.emit('potSB', {potSB: playerMoney, gameId});
          setPlayerMoney(playerMoney-playerMoney);
          setIsSmallBlind(false);
          setIsBigBlind(false);
        }
          setStopB1(stopB1+1);
          playSound(betSound);
        }
        console.log('Update turn event received');
        console.log('isSmallBlind:', isSmallBlind);
        console.log('isTurn:', isTurn);
      }
    });  
    socket.on('updateTurn', ({ isTurn, playerId: currentTurnPlayerId }) => {
      const playerId = localStorage.getItem('playerId'); 
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
      setGameStatus(`: ${count}/${total} Players Ready`);
      setPlayerMarkedReady(true);
    });

    // Listen for 'gameStarted' to proceed to the game view
    socket.on('gameStarted', ({ gameId }) => {
      setPlayerMarkedReady(false);
      socket.emit('startGame', { gameId });
      console.log('Game has started');
      setGameStarted(true);
});
    socket.on('potUpdated', ({ betAmount }) => {
      console.log(`Received betAmountpotUpd:`, betAmount, `Current pot:`, pot);
      const numericBetAmount = Number(betAmount);
    // Assuming betAmount is the amount to add to the current pot
    const updatedPot = Number(pot) + Number(betAmount);
    console.log(`Updated pot:`, updatedPot);
    if (!playerFolded){
    setClientBetAmount(numericBetAmount);
    }
    setPot(Number(updatedPot));
});
socket.on('betAfterFold', ({ betAmount }) => {
  console.log(`Received betAmountAfterFold:`, betAmount);
  const numericBetAmount = Number(betAmount);
setClientBetAmount(numericBetAmount);
});
socket.on('betAfterFold2', ({ betAmount }) => {
  console.log(`Received betAmount:`, betAmount);
  const numericBetAmount = 0;
setClientBetAmount(0);
});
socket.on('raiseEmitted', ({ betAmount }) => {
  console.log(`Received betAmountRaiseEmitted:`, betAmount, `Current pot:`, pot);
  const numericBetAmount = Number(betAmount);
// Assuming betAmount is the amount to add to the current pot
const updatedPot = Number(pot) + Number(betAmount);
console.log(`Updated pot:`, updatedPot);
if (noLimitIndex===1){
setMultiRaise(false);
const noLimitPot = Number(pot) + numericBetAmount;
if (!playerFolded){
setClientBetAmount (numericBetAmount);
}
setPot(pot + numericBetAmount);
}
 else if (noLimitIndex>=2){
  if (interIndex<=1){
    setMultiRaise(true);
    if (!playerFolded){
      setClientBetAmount (numericBetAmount);
      }
    setPot(pot + numericBetAmount);
    setInterIndex(interIndex+1);
  }else{
    if (plusBool){
      console.log(`Updated pot:`, updatedPot);
      if (!playerFolded){
        setClientBetAmount (numericBetAmount);
        }
      setPot(Number(pot)+numericBetAmount);
        }
    else{    
    setMultiRaise(true);
    if (!playerFolded){
      setClientBetAmount (numericBetAmount);
      }
    setPot(pot + numericBetAmount);
  }
}
  }
else{
  if (plusBool){
console.log(`Updated pot:`, updatedPot);
if (!playerFolded){
  setClientBetAmount (numericBetAmount);
  }
setPot(Number(pot)+numericBetAmount);
  }
  else{
  console.log(`Updated pot:`, updatedPot);
  if (!playerFolded){
    setClientBetAmount (numericBetAmount);
    }
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
    if (interBet === 0 && interRaise === 0 && !playerFolded){
    setPlayerMoney(playerMoney-Number(seccyBR));
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
  if (interBet === 0 && interRaise !== 0 && isTurn){
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
});
socket.on ('secSEC', ({secSEC}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(secSEC));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on ('vvPP', ({vvPP}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(vvPP));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on ('aaTT', ({aaTT}) => {
  if (interBet === 0 && interRaise === 0 && isTurn){
  setPlayerMoney(playerMoney-Number(aaTT));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on ('ppPP', ({ppPP}) => {
  if (interBet !== 0 && interRaise === 0 && isTurn){
  setPlayerMoney(playerMoney-Number(ppPP));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on ('ddDD', ({ddDD}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(ddDD));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on ('xXX', ({xXX}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(xXX));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});
socket.on ('bBB', ({bBB}) => {
  if (interBet === 0 && interRaise !== 0 && isTurn){
  setPlayerMoney(playerMoney-Number(bBB));
  }else{
    setPlayerMoney(playerMoney+0);
  }
});

socket.on('skiPot', ({skiPot}) => {
  setPot(Number(skiPot));
  });
socket.on('lll2', ({lll2}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(lll2));
  }
});
socket.on('lll3', ({lll3}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(lll3));
  }
});
socket.on('lll35', ({lll35}) => {
  if (isTurn && !playerFolded){
  setPlayerMoney(playerMoney-Number(lll35));    
} else if (isTurn && playerFolded) {
  setPlayerMoney(playerMoney+Number(lll35));
}
});
socket.on('rrr3', ({rrr3}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(rrr3));
  }
});
socket.on('lll4', ({lll4}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(lll4));
  }
});
socket.on('lll22', ({lll22}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(lll22));
  }
});
socket.on('lll223', ({lll223}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(lll223));
  }
});
socket.on('preflop008', ({preflop008}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflop008));
  }
});
socket.on('preflop0082', ({preflop0082}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflop0082));
  }
});
socket.on('preflop0085', ({preflop0085}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflop0085));
  }
});
socket.on('rr2235', ({rr2235}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(rr2235));
  }
});
socket.on('preflop149999', ({preflop149999}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflop149999));
  }
});
socket.on('preflop31', ({preflop31}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflop31));
  }
});
socket.on('tripprefin', ({tripprefin}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(tripprefin));
  }
});
socket.on('preflopXX', ({preflopXX}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflopXX));
  }
});
socket.on('tgTG', ({tgTG}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(tgTG));
  }
});
socket.on('preflopOO', ({preflopOO}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflopOO));
  }
});
socket.on('preflop1454', ({preflop1454}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(preflop1454));
  }
});
socket.on('zXY', ({zXY}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(zXY));
  }
});
socket.on('jjII', ({jjII}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(jjII));
  }
});
socket.on('jjKK', ({jjKK}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(jjKK));
  }
});
socket.on('ccCC', ({ccCC}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(ccCC));
  }
});
socket.on('ccCC2', ({ccCC2}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(ccCC2));
  }
});
socket.on('yyTT', ({yyTT}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(yyTT));
  }
});
socket.on('jjKK2', ({jjKK2}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(jjKK2));
  }
});
socket.on('ccCC3', ({ccCC3}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(ccCC3));
  }
});
socket.on('yyTT33', ({yyTT33}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(yyTT33));
  }
});
socket.on('yyTTKK', ({yyTTKK}) => {
  if (isTurn){
  setPlayerMoney(playerMoney-Number(yyTTKK));
  }
});
socket.on('gimmeCashUpdate', () => {
  socket.emit('cashUpdate', {cashUpdate: playerMoney, playerId, gameId});
});

socket.on('oneChi', ({oneChi}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(oneChi));
    }
});
socket.on('tootsieD', ({tootsieD}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(tootsieD));
    }
});
socket.on('thatCase', ({thatCase}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(thatCase));
    }
});
socket.on('folderfourp09', ({folderfourp09}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(folderfourp09));
    }
});
socket.on('playerFolded', () => {
  if (isTurn){
    setPlayerFolded(true);
    setFoldedChipsSave(playerMoney);
    }
});
socket.on('for4withonefold', ({for4withonefold}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(for4withonefold));
    }
});
socket.on('seccyBR20', ({seccyBR20}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(seccyBR20));
    }
});
socket.on('twoPtwoR33', ({twoPtwoR33}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(twoPtwoR33));
    }
});
socket.on('jjII233', ({jjII233}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(jjII233));
    }
});
socket.on('trippyFins', ({trippyFins}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(trippyFins));
    }
});
socket.on('minusDuplicate', ({gameId}) => {
  socket.emit('duplicateSubtract', {gameId});
});
socket.on('criTri', ({criTri}) => {
  if (isTurn){
    setPlayerMoney(playerMoney-Number(criTri));
    }
});
socket.on('raiseLimitReached', () => {
  setRaiseLimitReached(true);
});
socket.on('minRaise', ({minRaise}) => {
    setMinRaise(Number(minRaise)+1);
});
socket.on('minRaiseEqBB', ({minRaiseEqBB}) => {
  setMinRaise(Number(minRaise)+1);
});
/*if (playerFolded && isTurn){
  socket.emit('foldSkip', {gameId});
};*/

if (playerFolded){
  setPlayerMoney(foldedChipsSave);
};

socket.on('selectWinner', () => {
  setStorePot(pot);
  const newCombinedCards = [...playerHand, ...tableCards];
  const namesForStraight = ['two','three','four','five','six','seven','eight','nine','ten','jack','queen','king','ace'];
  setCombinedCards(newCombinedCards);
  console.log('Combined cards:', newCombinedCards, newCombinedCards.name, combinedCards.name, combinedCards.suit);
  console.log('Player hand:', playerHand);
  console.log('Table cards:', tableCards);

  let handScore = 0;
  let twoCardScore = 0;

  const playerHandCardNames = playerHand.map(card => card.name);

  for (let i = 0; i < namesForStraight.length; i++){
    if (playerHandCardNames.includes(namesForStraight[i])){
      twoCardScore = i;
    }
  }


  const tableCardNames = tableCards.map(card => card.name);
  const tableCardSuits = tableCards.map(card => card.suit);

  const tableCardNameCounts = tableCards.reduce((counts, card) => {
    counts[card.name] = (counts[card.name] || 0)+1;
    return counts;
  }, {});
  const tableCardSuitCounts = tableCards.reduce((counts, card) => {
    counts[card.suit] = (counts[card.suit] || 0)+1;
    return counts;
  }, {});

  const uniqueTableCardNames = Object.keys(tableCardNameCounts);
  const uniqueTableCardSuits = Object.keys(tableCardSuitCounts);

  const tablePairCardNames = Object.keys(tableCardNameCounts).filter(name => tableCardNameCounts[name] === 2);
  const setTableCardNames = Object.keys(tableCardNameCounts).filter(name => tableCardNameCounts[name] === 3);
  const twoPairTableCardNames = tablePairCardNames.filter(name => tableCardNameCounts[name] === 2);
  const fourTableCardNames = Object.keys(tableCardNameCounts).filter(name => tableCardNameCounts[name] === 4);
  const fullHousetableCardNamePairs = tablePairCardNames.filter(name => !setTableCardNames.includes(name));


  const flushTableCardSuits = Object.keys(tableCardSuitCounts).filter(suit => tableCardSuitCounts[suit] === 5);
// top = table //////////////////////////// bottom = combined /////////////////////////////////////////////////////////////
  


  const cardNames = newCombinedCards.map(card => card.name);
  const cardSuits = newCombinedCards.map(card => card.suit);

  const cardNameCounts = newCombinedCards.reduce((counts, card) => {
    counts[card.name] = (counts[card.name] || 0)+1;
    return counts;
  }, {});
  const cardSuitCounts = newCombinedCards.reduce((counts, card) => {
    counts[card.suit] = (counts[card.suit] || 0)+1;
    return counts;
  }, {});

    const uniqueCardNames = Object.keys(cardNameCounts);

    const pairCardNames = Object.keys(cardNameCounts).filter(name => cardNameCounts[name] === 2);
    const setCardNames = Object.keys(cardNameCounts).filter(name => cardNameCounts[name] === 3);
    const twoPairCardNames = pairCardNames.filter(name => cardNameCounts[name] === 2);
    const fourCardNames = Object.keys(cardNameCounts).filter(name => cardNameCounts[name] === 4);
    const fullHouseCardNamePairs = pairCardNames.filter(name => !setCardNames.includes(name));

    const flushCardSuits = Object.keys(cardSuitCounts).filter(suit => cardSuitCounts[suit] === 5);
    const flushCardSuitsplusone = Object.keys(cardSuitCounts).filter(suit => cardSuitCounts[suit] === 6);
    const flushCardSuitsplustwo = Object.keys(cardSuitCounts).filter(suit => cardSuitCounts[suit] === 7);


    const pairCardName = playerHand.map(card => card.name).find(name => pairCardNames.includes(name));
    const pairIndex = namesForStraight.indexOf(pairCardName);

    let flush = false;

    let pair = false;
    let twopair = false;
    let set = false;
    let fourofakind = false;
    let straightflush = false;
    let royalflush = false;



    let straight = false;
    const sortedNamesForStraight = namesForStraight.slice().sort();
    
    for (let i = 0; i <= cardNames.length - 5; i++) {
      const subList = cardNames.slice(i, i + 5);
    
      const sortedSubList = subList.slice().sort();
    
      const isStraight = sortedSubList.every((name, index) => name === sortedNamesForStraight[index]);
    
      if (isStraight) {
        straight = true;
        break;
      }
    }
const isFullHousePossible = (fullHouseCardNamePairs.length === 1 && setCardNames.length > 0 && fullHousetableCardNamePairs.length === 0) || (fullHouseCardNamePairs.length === 2 && setCardNames.length > 0 && fullHousetableCardNamePairs.length === 1);

if (pairCardNames.length === 1 ){
  //pair
  pair = true;
  handScore = 300+pairIndex;
}

if (twoPairCardNames.length === 2){
  //two pairs
  twopair = true;
  handScore = 325+twoCardScore;
}

if (setCardNames.length === 1 && setTableCardNames < 1){
  //set
  set = true;
  handScore = 350+twoCardScore;
}
else if (setCardNames.length === 2 && setTableCardNames < 2){
  //set
  set = true;
  handScore = 350+twoCardScore;
}

if (straight){
  //straight
  handScore = 375+twoCardScore;
}

if ((flushCardSuits.length === 1 && flushTableCardSuits < 1) || (flushCardSuitsplusone.length === 1 && flushTableCardSuits === 1 || flushCardSuitsplusone.length === 1 && flushTableCardSuits === 0) || (flushCardSuitsplustwo.length === 1 && flushTableCardSuits === 1 || flushCardSuitsplustwo.length === 1 && flushTableCardSuits === 0)){
  //flush
  flush = true;
  handScore = 400+twoCardScore;
}

if (isFullHousePossible){
  //full house
  handScore = 425+twoCardScore;
}
if (fourCardNames.length === 1 && fourTableCardNames !== 1){
  //four of a kind
  fourofakind = true;
  handScore = 450+twoCardScore;
}

if (straight && flush){
  //straight flush 
  straightflush = true;

  handScore = 475+twoCardScore;
}

if (straight && flush && cardNames.includes('ten') && cardNames.includes('jack') &&
cardNames.includes('queen') && cardNames.includes('king') && cardNames.includes('ace')){
  //royal flush 
royalflush = true;
handScore = 500+twoCardScore;
}

if (!pair && !twopair && !set && !straight && !flush && !isFullHousePossible && !fourofakind && !straightflush && !royalflush){
  handScore = 0+twoCardScore;
}

  console.log(`handscore : ${handScore}`);
  setMyHandQuant(handScore);
  console.log(`myhandquant inside handscore DecompressionStreammining func ${myHandQuant}`);
  socket.emit('sendHandScore', { gameId, handScore });
  
 
});
socket.on('determineWinner', ({highestHandScore, numPlayersWithHighestScore}) => {


  let allHands = Array(playersInGame.length).fill([]);
  setEveryonesHand(allHands);
  
  socket.emit('winnerIntermed', {gameId, highestHandScore, numPlayersWithHighestScore, playerHand, playerId}); 
});


socket.on('winningHandScore', ({highestHandScore, numPlayersWithHighestScore, playerHand, playerI}) => {

  console.log("Before updating everyonesHand");
  console.log(`playersInGame: ${playersInGame}`);
  console.log(`playerId: ${playerId}`);
  console.log(`playerI: ${playerI}`);
  console.log(`everyonesHand before update: ${everyonesHand}`);

  let updatedEveryonesHand = [...everyonesHand];
const playerIndex = playersInGame.indexOf(playerI);
updatedEveryonesHand[playerIndex] = playerHand;
setEveryonesHand(updatedEveryonesHand);

console.log(`upd evrns hnd ${updatedEveryonesHand}`);
console.log(`everyonesHand before update: ${everyonesHand}`);


  setShowOtherCards(true);

  console.log(`pm before applying winnings: ${playerMoney}`);
  console.log(`myHandQuant: ${myHandQuant}`);
  console.log(`highestHandScore: ${highestHandScore}`);
  console.log(`numPlayersWithHighestScore: ${numPlayersWithHighestScore}`);

  if (!playerFolded && myHandQuant === Number(highestHandScore) && Number(numPlayersWithHighestScore) === 1 && payoutStopper < 1){
    setPlayerMoney(playerMoney + storePot);
    console.log(`pm after applying winnings: ${playerMoney}`);
    setPayoutStopper(payoutStopper + 1);
  }
  else if (!playerFolded && Number(numPlayersWithHighestScore) > 1 && payoutStopper2 < 1 && playersInGame.length === 2){
    setPlayerMoney(playerMoney + (storePot/2));
    setPayoutStopper2(payoutStopper2 + 1);
  }
  // need to add more func for 2 + players 
  console.log(highestHandScore);
  console.log(`storepot: ${storePot}`);

});

socket.on('newHand', () => {
  setIsSmallBlind(false);
  setIsBigBlind(false);
  setRaiseLimitReached(false);
  setPlayerFolded(false);
  setInput2Interacted(false);
  socket.emit('requestCashUpdate', {gameId}); 
  setPlayerHand([]);
  setCheckNoShow(false);
  setBetResBoolean(false);
  setClientBetAmount(0);
  setClientRaiseAmount(0);
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
  setPlusBool(false);
  setInterRaise(0);
  setRaised(false);
  setJustOneRaise(false);
  setSecondRaise(false);
  setAbstractRaise(0);
  setMinusBetBoolean(false);
  setBrSecRaise(0);
  setLastBetRezz(false);
  setStopB1(0);
  setStopB2(0);
  setTitkiStopper(0);
  setStopper99(0);
  setTurnCount(0);
  setTurnCount2(0);
  setTurnCount3(0);
  setPayoutStopper(0);
  setPayoutStopper2(0);
  socket.emit('gameSequence2', { gameId });
});

window.addEventListener('beforeunload', function(event) {
  // Emit an event to the server indicating the player is leaving the game
  socket.emit('playerLeaving', { gameId, playerId });
});

socket.emit('newPlayerChips', {newPlayerChips: playerMoney, gameId, whoseChips:playersInGame.indexOf(playerId)});
socket.on('newChipsRightBack', ({ newChipsRightBack, whosMoney }) => {
    setEveryonesChips((prevChips) => {
      const updatedChips = [...prevChips];
      const playerIndex = Number(whosMoney);
      updatedChips[playerIndex] = newChipsRightBack;
      return updatedChips;
    });
    console.log(`everyones chips array: ${everyonesChips}`);
});
const playSound = (soundUrl) => {
  const audio = new Audio(soundUrl);
  audio.play();
};

socket.on('emitFoldSound', () => {
  playSound(foldSound);
});
socket.on('emitCheckSound', () => {
  playSound(checkSound);
});
socket.on('emitBetResSound', () => {
  playSound(betSound);
});
socket.on('emitBetSound', () => {
  playSound(betSound);
});
socket.on('payTheNonFolder', () => {
  if (!playerFolded){
    setPlayerMoney(playerMoney+pot);
  }
});


      return () => {
        socket.off('gameUpdated', handleGameUpdated);
        socket.off('noCheck');
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
        socket.off('updateTurnSmallBlind');
        socket.off('updateTurnBigBlind');
        socket.off('updateTurnAfterBlinds');
        socket.off('newPot2');
        socket.off('skiPot');
        socket.off('lll2');
        socket.off('lll3');
        socket.off('rrr3');
        socket.off('lll4');
        socket.off('lll22');
        socket.off('lll223');
        socket.off('preflop008');
        socket.off('preflop0082');
        socket.off('preflop0085');
        socket.off('preflop149999');
        socket.off('rr2235');
        socket.off('preflop31');
        socket.off('tripprefin');
        socket.off('preflopXX');
        socket.off('tgTG');
        socket.off('preflopOO');
        socket.off('preflop1454');
        socket.off('zXY');
        socket.off('jjII');
        socket.off('jjKK');
        socket.off('ccCC');
        socket.off('ccCC2');
        socket.off('yyTT');
        socket.off('jjKK2');
        socket.off('ccCC3');
        socket.off('yyTT33');
        socket.off('yyTTKK');
        socket.off('newHand');
        socket.off('titkiBig');
        socket.off('onlyBetRes');
        socket.off('goFlop');
        socket.off('goTurn');
        socket.off('goRiver');
        socket.off('gimmeCashUpdate');
        socket.off('betRezzySecRaise');
        socket.off('potPlus'); 
        socket.off('secSEC');
        socket.off('oneChi');
        socket.off('tootsieD');
        socket.off('thatCase');
        socket.off('playerFolded');
        socket.off('betAfterFold');
        socket.off('betAfterFold2');
        socket.off('folderfourp09');
        socket.off('for4withonefold');
        socket.off('seccyBR20');
        socket.off('lll35');
        socket.off('twoPtwoR33');
        socket.off('jjII233');
        socket.off('trippyFins');
        socket.off('criTri');
        socket.off('duplicateSubtract');
        socket.off('minRaise');
        socket.off('raiseLimitReached');
        socket.off('minRaiseEqBB');
        socket.off('newChipsRightBack');
        socket.off('emitBetSound');
        socket.off('emitBetResSound');
        socket.off('emitCheckSound');
        socket.off('emitFoldSound');
        socket.off('winnerSelected');
        socket.off('selectWinner');
        socket.off('payTheNonFolder');
        socket.off('winningHandScore');
        socket.off('gameCardsDealt');
        socket.off('determineWinner');
        socket.off('minusDuplicate');
      };
    }, [gameId, socket, turnCount, playerId, pot, cards, runIndex, dealer, myHandQuant, storePot, everyonesHand, isSmallBlind, isBigBlind, titkiStopper]);
  

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
        socket.emit('betSound', {gameId}); 
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
        socket.emit('betSound', {gameId}); 
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
          setPlayerMoney(numericPlayerMoney-brSecRaise+interRaise);
          setPlusBool(true);
          console.log ('r4.5');
          console.log(abstractRaise);console.log(numericBetAmount);console.log(interRaise);
          }
        }
        else if(SB>0){
          setPlayerMoney(playerMoney-numericBetAmount+SB);
          let potski = pot - SB;
          socket.emit('potski', {potski, gameId});
          setSB(0);
        }
        else{
        setClientBetAmount(numericBetAmount);
        setPlayerMoney(numericPlayerMoney-numericBetAmount);
        setInputInteracted(false);
        setInput2Interacted(false);
        console.log ('r5');
      }
      socket.emit('betResSound', {gameId}); 
  }
      else if (isTurn && actionType === 'check'){
        socket.emit('checkSound', {gameId}); 
    }
    else if (actionType === 'check'){
      socket.emit('checkSound', {gameId}); 
    }
    else if (isTurn && actionType === 'fold'){
      socket.emit('foldSound', {gameId});  
    }
    socket.emit('playerAction', actionPayload);  
    setBetDraggingValue(0);
    setRaiseDraggingValue(0);
};
    
const markPlayerReady = () => {
  socket.emit('playerReady', { gameId, playerId });
};
const handleInput = (e) => {
  setBetDraggingValue(Number(e.target.value));
};
const copyToClipboard = () => {
  navigator.clipboard.writeText(window.location.href);
  setCopied(true);
  setTimeout(() => {
    setCopied(false);
  }, 500);
};    
  

    return (
      <div className="floor">
      {!gameStarted &&(
      <button className="invite-link" onClick={copyToClipboard}>
      <h1>{copied ? 'Copied!' : 'Copy Invite Link'}</h1>
      </button>
      )}
      <div className="poker-table"><div className="tablecloth"></div></div>
        {playersInGame.map((_, index) => (
        <div key={index} className={`player-${index}`} style={{ width: '70px', height: '120px', backgroundColor: 'black', margin: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        {index === dealer && <p className="dealer-chip">Dealer</p>}
        {index === playersInGame.indexOf(playerId) && <p className="you">You</p>}
        {<p className="chips">$ {everyonesChips[index]}</p>}
        </div>
        ))}
        {!gameStarted && playersInGame.length>=2 &&(
        <>
        <button
        className={` ${playerMarkedReady ? 'player-ready' : 'start-game-button'}`}
        onClick={() => markPlayerReady()}
        >
        {playersInGame.length>=2 &&(
        <h1>Start Game <span className="howmany-ready">{gameStatus}</span>
        </h1>
        )}
        </button>
        </>
        )}
          
          <div className="pot"><p>Pot: ${Number(pot)}</p></div>
          <div className={`hand hand-${playersInGame.indexOf(playerId)}`}>
          {/* mapping current player's cards */}
          {!playerFolded && playerHand.map((card, index) => (
            <img key={index} className='cards' src={cardImages[`${card.name}_${card.suit}`]} alt={`${card.name} of ${card.suit}`} />  
          ))}
         {/* {showOtherCards && ( everyonesHand.map((hand, playerIndex) => (
  // Render cards for each player
        <div key={playerIndex} className={`ncp-${playerIndex}`}>
  
          {hand.map((card, index) => (
            <img
              key={index}
              className='cards'
              src={cardImages[`${card.name}_${card.suit}`]}
              alt={`${card.name} of ${card.suit}`}
            />
          ))}
        </div>
      )))}*/}
        </div>
        {/* mapping card backs for non-current players */}
        <div className="ncp-container">
          {( playersInGame.map((_, index) => (
            index !== playersInGame.indexOf(playerId) && (
              <div className={`ncp-${index}`}>
              <img
                key={index}
                src={cardBack}
                className="ncp"
                alt="back of the card"
              ></img>
              <img
                key={index}
                src={cardBack}
                className="ncp"
                alt="back of the card"
              ></img>
              </div>
            )
          )))}
        </div>
        

        {isTurn &&(
        <div className="action-choices">
        {!playerFolded && !checkNoShow && (
        <button className="check" onClick={() => handlePlayerAction('check')}><p>Check</p></button>
        )}
        {!playerFolded && !betResBoolean &&(
          <div>
          <div className="number-dragging"><p>{inputInteracted || input2Interacted ? betDraggingValue : `Drag to Bet`}</p></div>
        <input
          className="draggable"
          type="range"
          min={playerMoney<25 ? 0 : 25}
          max={playerMoney}
          value={clientBetAmount}
          onInput={handleInput}
          onChange={(e) => {setClientBetAmount(Number(e.target.value))
                            setInput2Interacted(true);
                    }}
          placeholder="Bet Amount"
        />
        </div>
        )}
        {!playerFolded && betResBoolean && !multiRaise && !inputInteracted && (
        <button className="check" onClick={() => handlePlayerAction('betres', clientBetAmount)}><p>Bet: ${clientBetAmount}</p></button>
        )}
        {!playerFolded && betResBoolean && multiRaise && !inputInteracted && (
        <button className="check" onClick={() => handlePlayerAction('betres', clientBetAmount)}><p>Bet: ${clientBetAmount}</p></button>
        )}
        {!playerFolded && !betResBoolean && (
        <button className="bet" onClick={() => handlePlayerAction('bet', clientBetAmount)}><p>Bet</p></button>
        )}
        {!playerFolded && betResBoolean && !raiseLimitReached &&(
          <div>
          <div className="number-dragging"><p>{betDraggingValue}</p></div>
        <input
          className="draggable"
          type="range"
          value={Number(clientBetAmount)}
          min={playerMoney > minRaise ? minRaise : playerMoney} 
          max={playerMoney}
          onInput={handleInput}
          onChange={(e) => {
            setClientBetAmount(Number(e.target.value));
            setInputInteracted(true); // Set to true on change
          }}
          onClick={() => setInputInteracted(true)} // Set to true on click
          placeholder="Raise Amount"
        /></div>
        )}
        {!playerFolded && betResBoolean && inputInteracted && (
        <button className="bet" onClick={() => handlePlayerAction('raise', Number(clientBetAmount))}><p>Raise</p></button>
        )}
        {!playerFolded &&(
        <button className="fold" onClick={() => handlePlayerAction('fold')}><p>Fold</p></button>
        )}
        </div>
      )}
      {!isTurn && (
        <div></div>
      )}
      

        <div className="flop">
          {tableCards.map((card, index) => (
            <img key={index} src={cardImages[`${card.name}_${card.suit}`]} alt={`${card.name} of ${card.suit}`} />
          ))}
        </div>
        </div>
    );
  };
  

export default Game;