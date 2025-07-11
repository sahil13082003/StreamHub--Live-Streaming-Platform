import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
// import Dashboard from "./pages/Dashboard"
import StreamPage from "./pages/StreamPage"
// import Profile from "./pages/Profile"
import "./App.css"
import Navbar from "./components/ui/Navbar"
import ProfilePage from "./pages/Profile"

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Navbar /> 
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              <Route path="/stream" element={<StreamPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
