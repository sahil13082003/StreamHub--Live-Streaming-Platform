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
import VideoPage from "./pages/VideoPage"
import VideoDetailPage from "./pages/VideoDetailPage"
import VideoUploadPage from "./pages/VideoUploadPage"
import CreatorsPage from "./pages/CreatorsPage"
// import CreatorProfilePage from "./pages/CreatorProfilePage"
import StreamSetup from "./pages/stream/StreamSetup"
import Broadcast from "./pages/stream/Broadcast"
import ViewStream from "./pages/stream/ViewStream"
// import Watch from "./pages/stream/Watch"

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              <Route path="/stream" element={<StreamPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/video" element={<VideoPage />} />
              <Route path="/video/:id" element={<VideoDetailPage />} />
              <Route path="/video/upload" element={<VideoUploadPage />} />
              <Route path="/streamers" element={<CreatorsPage />} />
              <Route path="/streamer/:id" element={<div>Streamer Profile Placeholder</div>} />
              <Route path="/stream/setup" element={<StreamSetup />} />
              <Route path="/stream/broadcast/:streamId" element={<Broadcast />} />
              <Route path="/stream/view/:streamId" element={<ViewStream />} />
              {/* <Route path="/stream/watch" element={<Watch />} /> */}

            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
