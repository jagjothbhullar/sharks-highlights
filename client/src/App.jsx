import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Yearbook from './pages/Yearbook';
import PlayerProfile from './pages/PlayerProfile';
import Goals from './pages/Goals';
import GameDetail from './pages/GameDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Yearbook />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/games/:id" element={<GameDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
