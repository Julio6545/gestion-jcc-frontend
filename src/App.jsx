import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Catalogo from './pages/Catalogo'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Catalogo />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}