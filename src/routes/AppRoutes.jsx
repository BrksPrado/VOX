import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import PaginaInicial from '../pages/PaginaInicial';
import NovoChamado from '../pages/NovoChamado';
import MeusChamados from '../pages/MeusChamados';
import DetalheChamado from '../pages/DetalheChamado';
import AdminChamados from '../pages/AdminChamados';
import MapaCidade from '../pages/MapaCidade';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard"     element={<PrivateRoute><PaginaInicial /></PrivateRoute>} />
      <Route path="/novo-chamado"  element={<PrivateRoute><NovoChamado /></PrivateRoute>} />
      <Route path="/meus-chamados" element={<PrivateRoute><MeusChamados /></PrivateRoute>} />
      <Route path="/chamado/:id"   element={<PrivateRoute><DetalheChamado /></PrivateRoute>} />
      <Route path="/mapa" element={<PrivateRoute><MapaCidade /></PrivateRoute>} />
      <Route path="/admin/chamados" element={<AdminRoute><AdminChamados /></AdminRoute>} />
    </Routes>
  );
};

export default AppRoutes;
