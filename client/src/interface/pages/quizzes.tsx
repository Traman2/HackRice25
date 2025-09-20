import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import axios from "axios";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    IconSettings,
    IconLogout,
    IconHome,
} from "@tabler/icons-react"

import { useNavigate } from "react-router-dom";

import { z } from "zod";

export const userQuizFormSchema = z.object({
  programmingExperienceLevel: z.enum([
    "Complete beginner",
    "Some exposure",
    "Intermediate",
    "Advanced",
  ]),
  programmingLanguages: z.array(z.string()).min(1, "Select at least one"),
  programmingLanguagesOther: z.string().optional(),
  learningContextAndGoals: z.enum([
    "Web development (frontend)",
    "Backend development",
    "Full-stack development",
    "Data science/analytics",
    "Mobile app development",
    "Game development",
    "Other",
  ]),
  learningContextAndGoalsOther: z.string().optional(),
  primaryLearningGoal: z.enum([
    "Career change into tech",
    "Skill enhancement for current job",
    "Personal projects and hobbies",
    "Academic requirements",
    "Freelancing opportunities",
  ]),
  learningStyleAssessment: z.enum([
    "Watch explanations first, then practice",
    "Jump into coding immediately with minimal theory",
    "Need lots of examples and repetition",
    "Prefer reading documentation and references",
    "Learn best through building real projects",
  ]),
  stuckOnProblem: z.enum([
    "Try to figure it out independently for a long time",
    "Look up solutions immediately",
    "Ask for help after trying for a few minutes",
    "Take breaks and come back with fresh perspective",
  ]),
  timeCommitment: z.enum([
    "1-3 hours (casual pace)",
    "4-8 hours (steady progress)",
    "9-15 hours (intensive learning)",
    "16+ hours (bootcamp pace)",
  ]),
  preferredSessionLength: z.enum([
    "15-30 minutes (short bursts)",
    "30-60 minutes (standard sessions)",
    "1-2 hours (deep focus)",
    "2+ hours (marathon sessions)",
  ]),
  developmentEnvironmentExperience: z.enum([
    "Never used a code editor",
    "Basic text editors (Notepad, TextEdit)",
    "Code editors (VS Code, Sublime Text)",
    "IDEs (WebStorm, PyCharm, Eclipse)",
    "Command line comfortable",
  ]),
  installingSoftwareComfort: z.enum(["Very", "Somewhat", "Not at all"]),
  terminalComfort: z.enum(["Very", "Somewhat", "Not at all"]),
  managingFilesComfort: z.enum(["Very", "Somewhat", "Not at all"]),
  learningDifficulty: z.array(z.string()).min(1, "Select at least one"),
  learningDifficultyOther: z.string().optional(),
  frustrationHandling: z.enum([
    "Take breaks and return later",
    "Systematically debug step by step",
    "Seek help from others immediately",
    "Get discouraged and stop",
    "Power through until it works",
  ]),
});

export type UserQuizFormInput = z.infer<typeof userQuizFormSchema>;

export default function Quizzes() {
    const { user, logout } = useAuth0();
    const navigate = useNavigate();
    useEffect(() => {
        const sendUserData = async () => {
            if (user) {
                try {
                    const userData = {
                        uid: user.sub,
                        userName: user.name,
                        email: user.email
                    };
                    await axios.post('http://localhost:3000/api/users', userData); // Assuming your backend is at http://localhost:3001
                    console.log("User data sent to backend");
                } catch (error) {
                    console.error("Error sending user data to backend:", error);
                }
            }
        };
        sendUserData();
    }, [user]);

    return (
        <>
            <div className="px-6 py-4">
                <nav className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/CodeFlowLogo.svg" className="w-7" />
                        <h1 className="text-2xl font-brand pt-1.5">CodeFlow.AI</h1>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 hover:rounded-xl bg-blue-100 hover:bg-gray-200 transition-all cursor-pointer px-4 py-1 rounded-lg">
                                {user?.given_name?.charAt(0)}{user?.family_name?.charAt(0)}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 rounded-lg bg-white border shadow-lg"
                            align="end"
                            side="bottom"
                            sideOffset={8}
                        >
                            <DropdownMenuLabel className="text-sm font-medium px-3 pt-2">
                                {user?.given_name} {user?.family_name}
                                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/dashboard")} className="px-3 py-2 cursor-pointer hover:bg-gray-100">
                                <IconHome />
                                Home
                            </DropdownMenuItem>
                            <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-gray-100">
                                <IconSettings />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => logout()}
                                className="px-3 py-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                variant="destructive"
                            >
                                <IconLogout />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>

                <div className="flex gap-2">
                    {/* Quiz Form Tabs */}
                    <div className="flex-1 flex flex-col">

                    </div>

                    {/* Main Content */}
                    <div className="flex-6 flex flex-col">
                        {user?.given_name}
                    </div>

                </div>
            </div>

        </>
    )
}