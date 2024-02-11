import { BrowserRouter as Router, Route, Switch, Routes } from 'react-router-dom';
import Landing from './Landing';
import Game from './Game';

function App() {
  return (
    <div className="App">
        
          <Router>
          <Routes>
          <Route path="/" element={<><Landing /></>} />
          <Route path="/game/:gameId" element={<Game />} />
          </Routes>
          </Router>
    </div>
  );
}

export default App;
