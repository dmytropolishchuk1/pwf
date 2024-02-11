import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Landing = () => {
  const [gameId, setGameId] = useState('');

    const navigate = useNavigate();

  const startGame = () => {
    const newGameId = uuidv4();
    setGameId(newGameId);
    console.log(newGameId);
    navigate(`/game/${newGameId}`);
  };
    return(
        <div className="landing">
            <a className="start-anchor" onClick={startGame} href="javascript:void(0)">Start Game</a>
            <a className="join-anchor" href="javascript:void(0)">Join Game</a>
        </div>
    )
}

export default Landing;