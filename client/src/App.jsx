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
    <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "#1E293B",
          color: "#F8FAFC",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}
      />
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
