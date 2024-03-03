import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const SERVER_URL = 'http://localhost:3001';
const socket = io(SERVER_URL);

const Landing = () => {
  const navigate = useNavigate();
  const [joinGameId, setJoinGameId] = useState('');
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    // Check if a playerId already exists in localStorage
    let storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      // If not, generate a new one and store it
      storedPlayerId = uuidv4();
      localStorage.setItem('playerId', storedPlayerId);
    }
    setPlayerId(storedPlayerId);
  }, []);

  const startGame = () => {
    const newGameId = uuidv4();
    // Emit 'joinGame' with the new gameId, the persisted playerId, and a placeholder playerName
    socket.emit('joinGame', { gameId: newGameId, playerId, playerName: 'Host' });
    // Navigate to the game page with the new gameId
    navigate(`/game/${newGameId}`);
  };

  const joinGame = () => {
    if (joinGameId) {
      // Emit 'joinGame' event with the gameId from input, the persisted playerId, and a playerName
      socket.emit('joinGame', { gameId: joinGameId, playerId, playerName: 'Guest' });
      // Navigate to the game page with the joinGameId
      navigate(`/game/${joinGameId}`);
    }
  };


  return (
    <div className="landing">
      <a className="start-anchor" href='#' onClick={startGame}>Start Game</a>
      <input
        type="text"
        placeholder="Enter Game ID"
        value={joinGameId}
        onChange={(e) => setJoinGameId(e.target.value)}
      />
      <a className="join-anchor" href='#' onClick={joinGame}>Join Game</a>
    </div>
  );
};

export default Landing;