import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomeScreen from "./components/HomeScreen"
import Login from "./components/Login"
import Signup from "./components/Signup"
import DiscussionScreen from "./components/DiscussionScreen"
import CycleManagementScreen from "./components/CycleManagementScreen"
import DetailsScreen from "./components/DetailsScreen"
import ProfileScreen from "./components/ProfileScreen"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/discussion" element={<DiscussionScreen />} />
          <Route path="/cycle" element={<CycleManagementScreen />} />
          <Route path="/details" element={<DetailsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
