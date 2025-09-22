import UserQuizForm from '../models/UserQuizForm.js';
import classifyAndSave from "../services/userExperienceAnalyzer.ts";
import GenerateDashboard from "../services/userUniqueDashboardCreation.ts";

export const createUserQuizForm = async (req, res) => {
  try {
    const { uid, programmingExperienceLevel, programmingLanguages, programmingLanguagesOther, learningContextAndGoals, learningContextAndGoalsOther, primaryLearningGoal, learningStyleAssessment, stuckOnProblem, timeCommitment, preferredSessionLength, developmentEnvironmentExperience, installingSoftwareComfort, terminalComfort, managingFilesComfort, learningDifficulty, learningDifficultyOther, frustrationHandling } = req.body;
    const newUserQuizForm = new UserQuizForm({
      uid, programmingExperienceLevel, programmingLanguages, programmingLanguagesOther, learningContextAndGoals, learningContextAndGoalsOther, primaryLearningGoal, learningStyleAssessment, stuckOnProblem, timeCommitment, preferredSessionLength, developmentEnvironmentExperience, installingSoftwareComfort, terminalComfort, managingFilesComfort, learningDifficulty, learningDifficultyOther, frustrationHandling
    });
    await newUserQuizForm.save();
    
    await classifyAndSave(uid);

    await GenerateDashboard(uid);
    
    res.status(201).json(newUserQuizForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserQuizForm = async (req, res) => {
  try {
    const { uid } = req.params;
    const userQuizForm = await UserQuizForm.findOne({ uid });
    if (!userQuizForm) {
      return res.status(404).json({ message: 'User quiz form not found' });
    }
    res.status(200).json(userQuizForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
