import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Yearbook from './pages/Yearbook';
import PlayerProfile from './pages/PlayerProfile';
import Goals from './pages/Goals';
import GameDetail from './pages/GameDetail';
import Legal from './pages/Legal';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Yearbook />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
