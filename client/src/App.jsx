import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header.jsx'
import Inicio from './pages/Inicio.jsx'
import Apoyo from './pages/Apoyo.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import Historias from './pages/Historias.jsx'
import Conectar from './pages/Conectar.jsx'
import Moderacion from './pages/Moderacion.jsx'

function App() {
  return (
    <main>
      <Header />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/apoyo" element={<Apoyo />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/historias" element={<Historias />} />
        <Route path="/conectar" element={<Conectar />} />
        <Route path="/moderacion" element={<Moderacion />} />
      </Routes>
    </main>
  )
}

export default App
