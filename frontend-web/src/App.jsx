import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import HomeScreen from "./components/HomeScreen"
import Login from "./components/Login"
import Signup from "./components/Signup"
import DiscussionScreen from "./components/DiscussionScreen"
import CycleManagementScreen from "./components/CycleManagementScreen"
import PrivacyPolicy from "./components/PrivacyPolicy"
import PricingPlans from "./components/PricingPlans"
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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/pricing" element={
              <PrivateRoute>
                <PricingPlans />
              </PrivateRoute>
            } />
          <Route
            path="/discussion"
            element={
              <PrivateRoute>
                <DiscussionScreen />
              </PrivateRoute>
            }
          />
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
