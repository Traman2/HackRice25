import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./interface/landingpage";
import Dashboard from "./interface/pages/dashboard";
import Quizzes from "./interface/pages/quizzes";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/quizzes" element={<Quizzes/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
