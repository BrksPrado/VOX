import Home from '../pages/Home';  // ← novo
import Login from '../pages/Login';
import PaginaInicial from '../pages/PaginaInicial';

import { Router, Routes, Route } from 'react-router-dom';

const AppRoutes = () => {

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<PaginaInicial />} />
        </Routes>
    );
};

export default AppRoutes;