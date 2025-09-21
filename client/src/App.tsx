import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./interface/landingpage";
import Quizzes from "./interface/pages/quizzes";
import VideoWithAgent from "./interface/pages/videoWithAgentProblems";
import CoursesPage from "./interface/pages/CoursesPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* First */}
          <Route path="/quizzes" element={<Quizzes/>}/> {/* Second */}
          <Route path="/video" element={<VideoWithAgent/>}/> {/* Fourth */}
          <Route path="/dashboard" element={<CoursesPage/>}/> {/* Third */}
        </Routes>
      </Router>
    </>
  )
}

export default App
