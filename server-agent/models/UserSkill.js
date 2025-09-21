import mongoose from 'mongoose';

const userSkill = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced", "expert"],
  },
  targetSkill: {
    type: String,
    required: true,
    unique: true,
  },
});

const UserSkill = mongoose.model('UserSkill', userSkill);

export default UserSkill;
