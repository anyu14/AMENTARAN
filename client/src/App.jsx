import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header.jsx'
import Inicio from './pages/Inicio.jsx'
import Apoyo from './pages/Apoyo.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import Historias from './pages/Historias.jsx'

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
      </Routes>
    </main>
  )
}

export default App
