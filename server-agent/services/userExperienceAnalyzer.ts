import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import UserQuizForm from "../models/UserQuizForm.js";
import UserSkill from "../models/UserSkill.js";
import z from "zod";
import dotenv from 'dotenv';
dotenv.config();

const IntentSchema = z.object({
  uid: z.string().describe("User UID"),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]).describe("The biggest challenge the learner faces"),
  targetSkill: z.string().describe("The primary programming language like Python, Java and so on"),
});


const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});

const queryClassifyRouterAgent = llm.withStructuredOutput(IntentSchema);

export default async function classifyAndSave(userUID: string) {
  try {
    const userQuizForm = await UserQuizForm.findOne({ uid: userUID });
    if (!userQuizForm) {
      throw new Error("No quiz form found for this UID");
    }

    const decision = await queryClassifyRouterAgent.invoke([
      {
        role: "system",
        content: `You are an analyzer. Given a user's quiz form, extract ONLY:
        1. The user experience level with choices of beginner, intermediate, advanced, expert.
        2. The main target programming language.
        `,
      },
      {
        role: "user",
        content: JSON.stringify(userQuizForm),
      },
    ]);

    const updatedUserLevel = await UserSkill.findOneAndUpdate(
      { uid: userUID },
      {
        uid: decision.uid,
        difficulty: decision.difficulty,
        targetSkill: decision.targetSkill,
      },
      { new: true, upsert: true }
    );

    return updatedUserLevel;
  } catch (err) {
    console.error("Error in classifyAndSave:", err);
    throw err;
  }
}
