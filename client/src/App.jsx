import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import { ToastContainer } from 'react-toastify';
import { useAuth } from "./contexts/AuthContext";
import  Layout from "./components/Layout";

// Dummy auth check
const isLoggedIn = () => localStorage.getItem("token");


export default function App() {
  return (
    <>
    <AuthProvider>
      <UserProvider>
        <Router>

      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route element={<ProtectedRoute/>}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      
      </Routes>
    </Router>
      </UserProvider>
    </AuthProvider>
    <ToastContainer />
    </>
  );
}
