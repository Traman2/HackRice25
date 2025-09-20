import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./interface/landingpage";
import Quizzes from "./interface/pages/quizzes";
import SidebarSocket from "./interface/pages/tutorialInterface/sidebarSocket";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quizzes" element={<Quizzes/>}/>
          <Route path="/dashboard" element={<SidebarSocket pages="dashboard"/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
