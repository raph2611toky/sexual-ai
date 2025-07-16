import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import HomeScreen from "./components/HomeScreen"
import Login from "./components/Login"
import Signup from "./components/Signup"
import ProtectedDiscussionScreen from "./components/ProtectedDiscussionScreen"
import CycleManagementScreen from "./components/CycleManagementScreen"
import PrivacyPolicy from "./components/PrivacyPolicy"
import TermsOfServices from "./components/TermsOfService"
import Donation from "./components/Donation"
import OTPVerification from "./components/OTPVerification"
import GoogleCallback from "./components/GoogleCallback"
import NotFound from "./components/NotFound"

import "./App.css"

// Utility to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
  return null
}

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const token = getCookie("auth_token")
  return token ? children : <Navigate to="/login" replace />
}

document.addEventListener('contextmenu', (e) => e.preventDefault());

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ProtectedDiscussionScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/terms-of-services" element={<TermsOfServices />} />
          <Route path="/donation" element={
                <Donation />
            } />
          <Route
            path="/cycle"
            element={
              <PrivateRoute>
                <CycleManagementScreen />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
