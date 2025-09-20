import mongoose from 'mongoose';

const userQuizFormSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  programmingExperienceLevel: {
    type: String,
    enum: ['Complete beginner', 'Some exposure', 'Intermediate', 'Advanced'],
    required: true,
  },
  programmingLanguages: {
    type: [String],
    required: true,
  },
  programmingLanguagesOther: {
    type: String,
  },
  learningContextAndGoals: {
    type: String,
    enum: ['Web development (frontend)', 'Backend development', 'Full-stack development', 'Data science/analytics', 'Mobile app development', 'Game development', 'Other'],
    required: true,
  },
  learningContextAndGoalsOther: {
    type: String,
  },
  primaryLearningGoal: {
    type: String,
    enum: ['Career change into tech', 'Skill enhancement for current job', 'Personal projects and hobbies', 'Academic requirements', 'Freelancing opportunities'],
    required: true,
  },
  learningStyleAssessment: {
    type: String,
    enum: ['Watch explanations first, then practice', 'Jump into coding immediately with minimal theory', 'Need lots of examples and repetition', 'Prefer reading documentation and references', 'Learn best through building real projects'],
    required: true,
  },
  stuckOnProblem: {
    type: String,
    enum: ['Try to figure it out independently for a long time', 'Look up solutions immediately', 'Ask for help after trying for a few minutes', 'Take breaks and come back with fresh perspective'],
    required: true,
  },
  timeCommitment: {
    type: String,
    enum: ['1-3 hours (casual pace)', '4-8 hours (steady progress)', '9-15 hours (intensive learning)', '16+ hours (bootcamp pace)'],
    required: true,
  },
  preferredSessionLength: {
    type: String,
    enum: ['15-30 minutes (short bursts)', '30-60 minutes (standard sessions)', '1-2 hours (deep focus)', '2+ hours (marathon sessions)'],
    required: true,
  },
  developmentEnvironmentExperience: {
    type: String,
    enum: ['Never used a code editor', 'Basic text editors (Notepad, TextEdit)', 'Code editors (VS Code, Sublime Text)', 'IDEs (WebStorm, PyCharm, Eclipse)', 'Command line comfortable'],
    required: true,
  },
  installingSoftwareComfort: {
    type: String,
    enum: ['Very', 'Somewhat', 'Not at all'],
    required: true,
  },
  terminalComfort: {
    type: String,
    enum: ['Very', 'Somewhat', 'Not at all'],
    required: true,
  },
  managingFilesComfort: {
    type: String,
    enum: ['Very', 'Somewhat', 'Not at all'],
    required: true,
  },
  learningDifficulty: {
    type: [String],
    required: true,
  },
  learningDifficultyOther: {
    type: String,
  },
  frustrationHandling: {
    type: String,
    enum: ['Take breaks and return later', 'Systematically debug step by step', 'Seek help from others immediately', 'Get discouraged and stop', 'Power through until it works'],
    required: true,
  },
}, { timestamps: true });

const UserQuizForm = mongoose.model('UserQuizForm', userQuizFormSchema);

export default UserQuizForm;
