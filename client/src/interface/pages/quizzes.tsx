import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox";

import {
    IconSettings,
    IconLogout,
    IconHome,
} from "@tabler/icons-react"

import { useNavigate } from "react-router-dom";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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

const formSections = [
    {
        name: "Skill Level",
        fields: ["programmingExperienceLevel", "programmingLanguages", "programmingLanguagesOther"],
    },
    {
        name: "Goals",
        fields: ["learningContextAndGoals", "learningContextAndGoalsOther", "primaryLearningGoal"],
    },
    {
        name: "Learning Style",
        fields: ["learningStyleAssessment", "stuckOnProblem", "frustrationHandling"],
    },
    {
        name: "Commitment",
        fields: ["timeCommitment", "preferredSessionLength"],
    },
    {
        name: "Tech Comfort",
        fields: ["developmentEnvironmentExperience", "installingSoftwareComfort", "terminalComfort", "managingFilesComfort"],
    },
    {
        name: "Difficulties",
        fields: ["learningDifficulty", "learningDifficultyOther"],
    },
    {
        name: "Verify",
        fields: [],
    },
];

function camelCaseToTitleCase(camelCase: string) {
    return camelCase
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, function (str) {
            return str.toUpperCase();
        });
}

export default function Quizzes() {
    const { user, logout } = useAuth0();
    const [formProgress, setFormProgress] = useState(0);
    const totalSections = formSections.length;
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof userQuizFormSchema>>({
        resolver: zodResolver(userQuizFormSchema),
        defaultValues: {
            programmingExperienceLevel: "Complete beginner",
            programmingLanguages: [],
            programmingLanguagesOther: "",
            learningContextAndGoals: "Web development (frontend)",
            learningContextAndGoalsOther: "",
            primaryLearningGoal: "Career change into tech",
            learningStyleAssessment: "Watch explanations first, then practice",
            stuckOnProblem: "Try to figure it out independently for a long time",
            frustrationHandling: "Take breaks and return later",
            timeCommitment: "1-3 hours (casual pace)",
            preferredSessionLength: "15-30 minutes (short bursts)",
            developmentEnvironmentExperience: "Never used a code editor",
            installingSoftwareComfort: "Very",
            terminalComfort: "Very",
            managingFilesComfort: "Very",
            learningDifficulty: [],
            learningDifficultyOther: "",
        },
    })

    const onSubmit = (values: z.infer<typeof userQuizFormSchema>) => {
        const dataToSend = { ...values, uid: user?.sub };
        axios
            .post(`http://localhost:3000/api/quiz/`, dataToSend)
            .then(() => {
                console.log("success")
            })
            .catch((error) => {
                console.log("error: ", error)
            })
        //Redirect to dashboard after gemini creates the custom tutorial paths hree

    }


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
            <div className="px-32 py-4">
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

                <div className="flex gap-8 mt-8">
                    {/* Quiz Form Tabs (User cannot change it) */}
                    <div className="flex-2 flex flex-col gap-4 max-w-40">
                        <div className="border-l-2 flex flex-col gap-1"> 
                            {formSections.map((section, index) => (
                            <p
                                key={section.name}
                                onClick={() => setFormProgress(index)}
                                className={`ml-2 pl-4 self px-4 py-2  rounded-lg font-semibold font-body cursor-pointer transition-colors duration-200
                                                    ${index === formProgress ? 'bg-blue-100 text-blue-700 border-blue-300' : 'text-gray-600 hover:bg-gray-100'}
                                                    ${index < formProgress ? 'text-green-700 font-bold' : ''}
                                                    ${index > formProgress ? 'text-gray-400' : ''}
                                                `}
                            >
                                {section.name}
                            </p>
                        ))}
                        </div>
                        
                    </div>

                    {/* Main Content */}
                    <div className="flex-6 px-34">
                        <div className="flex flex-col gap-2">
                            <h1 className="font-body font-bold text-3xl">{formProgress === 6 ? "Review your responses" : "Onboarding Questions"}</h1>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="spaec-y-8">
                                    {/* Form Fields - Conditionally Rendered */}
                                    <div className="min-h-[400px]">
                                        {formProgress === 0 && (
                                            <div className="flex flex-col gap-4 animate-fade-in">
                                                <FormField
                                                    control={form.control}
                                                    name="programmingExperienceLevel"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">How would you describe your programming experience?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <div className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                        <RadioGroupItem value="Complete beginner" id="programmingExperienceLevel-beginner" />
                                                                        <Label htmlFor="programmingExperienceLevel-beginner" className="cursor-pointer text-gray-700">Complete beginner</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                        <RadioGroupItem value="Some exposure" id="programmingExperienceLevel-exposure" />
                                                                        <Label htmlFor="programmingExperienceLevel-exposure" className="cursor-pointer text-gray-700">Some exposure</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                        <RadioGroupItem value="Intermediate" id="programmingExperienceLevel-intermediate" />
                                                                        <Label htmlFor="programmingExperienceLevel-intermediate" className="cursor-pointer text-gray-700">Intermediate</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                        <RadioGroupItem value="Advanced" id="programmingExperienceLevel-advanced" />
                                                                        <Label htmlFor="programmingExperienceLevel-advanced" className="cursor-pointer text-gray-700">Advanced</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="programmingLanguages"
                                                    render={() => (
                                                        <FormItem className="space-y-4">
                                                            <div className="mb-4">
                                                                <FormLabel className="text-lg font-semibold text-gray-800">Which programming languages are you familiar with?</FormLabel>
                                                                <FormDescription className="text-gray-600 text-sm">Select all that apply.</FormDescription>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {["JavaScript", "Python", "Java", "C#", "C++", "Ruby", "Go", "Swift", "Kotlin", "Rust", "TypeScript", "PHP", "SQL", "Other"].map((item) => (
                                                                    <FormField
                                                                        key={item}
                                                                        control={form.control}
                                                                        name="programmingLanguages"
                                                                        render={({ field }) => {
                                                                            return (
                                                                                <FormItem
                                                                                    key={item}
                                                                                    className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer"
                                                                                >
                                                                                    <FormControl>
                                                                                        <Checkbox
                                                                                            checked={field.value?.includes(item)}
                                                                                            onCheckedChange={(checked) => {
                                                                                                return checked
                                                                                                    ? field.onChange([...field.value, item])
                                                                                                    : field.onChange(
                                                                                                        field.value?.filter(
                                                                                                            (value) => value !== item
                                                                                                        )
                                                                                                    )
                                                                                            }}
                                                                                            className="mt-1"
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormLabel className="font-normal text-gray-700 cursor-pointer">
                                                                                        {item}
                                                                                    </FormLabel>
                                                                                </FormItem>
                                                                            )
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="programmingLanguagesOther"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">Other programming languages (if any)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. R, Assembly" {...field} className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" />
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {formProgress === 1 && (
                                            <div className="flex flex-col gap-4 animate-fade-in">
                                                <FormField
                                                    control={form.control}
                                                    name="learningContextAndGoals"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">What are your primary interests or goals for learning programming?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {["Web development (frontend)", "Backend development", "Full-stack development", "Data science/analytics", "Mobile app development", "Game development", "Other"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`learningContextAndGoals-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`learningContextAndGoals-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="learningContextAndGoalsOther"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">If "Other", please specify:</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. IoT, Machine Learning" {...field} className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" />
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="primaryLearningGoal"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">What is your primary learning goal?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {["Career change into tech", "Skill enhancement for current job", "Personal projects and hobbies", "Academic requirements", "Freelancing opportunities"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`primaryLearningGoal-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`primaryLearningGoal-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {formProgress === 2 && (
                                            <div className="flex flex-col gap-4 animate-fade-in">
                                                <FormField
                                                    control={form.control}
                                                    name="learningStyleAssessment"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">Which statement best describes your preferred learning style?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-3">
                                                                    {["Watch explanations first, then practice", "Jump into coding immediately with minimal theory", "Need lots of examples and repetition", "Prefer reading documentation and references", "Learn best through building real projects"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`learningStyleAssessment-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`learningStyleAssessment-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="stuckOnProblem"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">When you get stuck on a coding problem, what's your typical approach?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-3">
                                                                    {["Try to figure it out independently for a long time", "Look up solutions immediately", "Ask for help after trying for a few minutes", "Take breaks and come back with fresh perspective"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`stuckOnProblem-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`stuckOnProblem-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="frustrationHandling"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">How do you typically handle frustration when encountering difficult technical challenges?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-3">
                                                                    {["Take breaks and return later", "Systematically debug step by step", "Seek help from others immediately", "Get discouraged and stop", "Power through until it works"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`frustrationHandling-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`frustrationHandling-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {formProgress === 3 && (
                                            <div className="flex flex-col gap-4 animate-fade-in">
                                                <FormField
                                                    control={form.control}
                                                    name="timeCommitment"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">How much time are you willing to commit to learning each week?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {["1-3 hours (casual pace)", "4-8 hours (steady progress)", "9-15 hours (intensive learning)", "16+ hours (bootcamp pace)"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`timeCommitment-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`timeCommitment-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="preferredSessionLength"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">What is your preferred length for a single learning session?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {["15-30 minutes (short bursts)", "30-60 minutes (standard sessions)", "1-2 hours (deep focus)", "2+ hours (marathon sessions)"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`preferredSessionLength-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`preferredSessionLength-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {formProgress === 4 && (
                                            <div className="flex flex-col gap-4 animate-fade-in">
                                                <FormField
                                                    control={form.control}
                                                    name="developmentEnvironmentExperience"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">How familiar are you with different development environments (IDEs, code editors)?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-3">
                                                                    {["Never used a code editor", "Basic text editors (Notepad, TextEdit)", "Code editors (VS Code, Sublime Text)", "IDEs (WebStorm, PyCharm, Eclipse)", "Command line comfortable"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`developmentEnvironmentExperience-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`developmentEnvironmentExperience-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="installingSoftwareComfort"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">How comfortable are you with installing new software and tools on your computer?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {["Very", "Somewhat", "Not at all"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`installingSoftwareComfort-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`installingSoftwareComfort-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="terminalComfort"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">How comfortable are you using the terminal or command line?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {["Very", "Somewhat", "Not at all"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`terminalComfort-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`terminalComfort-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="managingFilesComfort"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">How comfortable are you with navigating and managing files and folders on your computer?</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {["Very", "Somewhat", "Not at all"].map((item) => (
                                                                        <div key={item} className="flex items-center space-x-2 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                                                                            <RadioGroupItem value={item} id={`managingFilesComfort-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} />
                                                                            <Label htmlFor={`managingFilesComfort-${item.replace(/\s|\(|\)/g, "").toLowerCase()}`} className="cursor-pointer text-gray-700">{item}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {formProgress === 5 && (
                                            <div className="flex flex-col gap-4 animate-fade-in">
                                                <FormField
                                                    control={form.control}
                                                    name="learningDifficulty"
                                                    render={() => (
                                                        <FormItem className="space-y-4">
                                                            <div className="mb-4">
                                                                <FormLabel className="text-lg font-semibold text-gray-800">What are some difficulties you've faced or anticipate facing in your learning journey?</FormLabel>
                                                                <FormDescription className="text-gray-600 text-sm">Select all that apply.</FormDescription>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {["Lack of time", "Difficulty understanding complex concepts", "Staying motivated", "Finding good resources", "Setting up development environment", "Debugging errors", "Lack of immediate feedback", "Balancing with other commitments", "Other"].map((item) => (
                                                                    <FormField
                                                                        key={item}
                                                                        control={form.control}
                                                                        name="learningDifficulty"
                                                                        render={({ field }) => {
                                                                            return (
                                                                                <FormItem
                                                                                    key={item}
                                                                                    className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer"
                                                                                >
                                                                                    <FormControl>
                                                                                        <Checkbox
                                                                                            checked={field.value?.includes(item)}
                                                                                            onCheckedChange={(checked) => {
                                                                                                return checked
                                                                                                    ? field.onChange([...field.value, item])
                                                                                                    : field.onChange(
                                                                                                        field.value?.filter(
                                                                                                            (value) => value !== item
                                                                                                        )
                                                                                                    )
                                                                                            }}
                                                                                            className="mt-1"
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormLabel className="font-normal text-gray-700 cursor-pointer">
                                                                                        {item}
                                                                                    </FormLabel>
                                                                                </FormItem>
                                                                            )
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="learningDifficultyOther"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold text-gray-800">If "Other", please specify:</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. time management" {...field} className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" />
                                                            </FormControl>
                                                            <FormMessage className="text-sm text-red-500" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {formProgress === 6 && (
                                            <div className="flex flex-col gap-5 px-0.5 py-6 rounded-lg bg-white animate-fade-in">
                                                {formSections.slice(0, totalSections - 1).map((section) => (
                                                    <div key={section.name} className="mb-5 p-5 border border-gray-100 rounded-lg bg-gray-50 transition-all duration-200 hover:shadow-md">
                                                        <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2 font-heading">{section.name}</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                                            {section.fields.map((fieldName) => {
                                                                const value = form.getValues(fieldName as keyof UserQuizFormInput);
                                                                const displayValue = Array.isArray(value) && value.length === 0
                                                                    ? "Not specified"
                                                                    : Array.isArray(value)
                                                                        ? value.join(", ")
                                                                        : String(value) || "Not specified";

                                                                return (
                                                                    <div key={fieldName} className="flex flex-col">
                                                                        <span className="font-medium text-gray-500 mb-0.5">{camelCaseToTitleCase(fieldName)}:</span>
                                                                        <span className="text-gray-800 font-normal break-words">{displayValue}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="sticky bottom-0 bg-white  pt-4 pb-6 flex justify-between mt-8 border-t border-gray-200">
                                        {formProgress > 0 && (
                                            <Button type="button" onClick={() => setFormProgress(prev => prev - 1)} variant="outline" className="px-6 py-2 cursor-pointer rounded-md transition-all duration-200 hover:bg-gray-100">Previous</Button>
                                        )}
                                        <div className={formProgress > 0 ? "ml-auto" : "w-full flex justify-end"}>
                                            {formProgress < totalSections - 1 && (
                                                <Button type="button" onClick={() => setFormProgress(prev => prev + 1)} className="cursor-pointer px-6 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition-all duration-200">Next</Button>
                                            )}
                                            {formProgress === totalSections - 1 && (
                                                <Button type="submit" className="px-6 py-2 cursor-pointer rounded-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200">Submit</Button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}