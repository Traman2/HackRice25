import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";

const CodeAnimation = () => {
    const [displayedCode, setDisplayedCode] = useState('');
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);

    const codeLines = [
        "# Analyzing video content...",
        "def generate_problems():",
        "    video_content = analyze_video()",
        "    concepts = extract_concepts(video_content)",
        "    ",
        "    for concept in concepts:",
        "        problem = create_problem(concept)",
        "        add_to_problem_set(problem)",
        "    ",
        "    return problem_set",
        "",
        "# Generated problems ready!",
        "✓ 5 coding challenges created",
        "✓ Interactive examples prepared",
        "✓ Ready for learning!"
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentLineIndex < codeLines.length) {
                const currentLine = codeLines[currentLineIndex];
                
                if (currentCharIndex < currentLine.length) {
                    setDisplayedCode(prev => prev + currentLine[currentCharIndex]);
                    setCurrentCharIndex(prev => prev + 1);
                } else {
                    setDisplayedCode(prev => prev + '\n');
                    setCurrentLineIndex(prev => prev + 1);
                    setCurrentCharIndex(0);
                }
            } else {
                // Reset animation after a pause
                setTimeout(() => {
                    setDisplayedCode('');
                    setCurrentLineIndex(0);
                    setCurrentCharIndex(0);
                }, 2000);
            }
        }, currentLineIndex === 0 && currentCharIndex === 0 ? 1000 : 
           (codeLines[currentLineIndex]?.[currentCharIndex] === ' ' ? 30 : 80));

        return () => clearTimeout(timer);
    }, [currentLineIndex, currentCharIndex, codeLines]);

    return (
        <div className="relative w-[500px]">
            {/* VS Code-like window */}
            <div className="bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden border border-gray-700 w-full">
                {/* Title bar */}
                <div className="bg-[#323233] px-6 py-3 flex items-center gap-3">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-300 text-sm ml-4">problem_generator.py</span>
                </div>
                
                {/* Code area */}
                <div className="p-6 font-mono text-base h-96 overflow-hidden w-full">
                    <pre className="text-gray-300 whitespace-pre-wrap min-h-full">
                        {displayedCode}
                        <span className="animate-pulse bg-gray-300 inline-block w-2 h-6 ml-1"></span>
                    </pre>
                </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm animate-bounce">
                AI Powered
            </div>
            <div className="absolute -bottom-6 -left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm animate-pulse">
                Real-time Generation
            </div>
        </div>
    );
};

export default function LandingPage() {
    const { loginWithRedirect } = useAuth0();

    return (
        <>
            {/* Simplified background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-0" />
            <div className="absolute inset-0 z-10">
                <nav className="flex justify-between items-center mt-6 py-2 px-40">
                    <div className="flex items-center gap-2">
                        <img src="/CodeFlowLogo.svg" className="w-8" />
                        <h1 className="text-3xl font-brand pt-1.5">CodeFlow.AI</h1>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => loginWithRedirect()} className="hover:rounded-xl hover:bg-gray-200 transition-all cursor-pointer border-2 border-black/50 px-4 py-2 rounded-lg">
                            Login
                        </button>

                        <button className="hover:rounded-xl hover:opacity-70 transition-all cursor-pointer bg-black text-white px-4 py-2 rounded-lg">
                            Signup
                        </button>
                    </div>
                </nav>
                
                <div className="px-40 mt-32 flex gap-16 items-center">
                    <div className="flex-1 flex flex-col gap-6">
                        <h1 className="font-hero text-6xl">
                            Learn by solving, not just watching
                        </h1>
                        <p className="font-body text-lg text-gray-600">
                            Turn videos into problem sets and start learning with AI-generated coding challenges
                        </p>
                        <button className="self-start hover:rounded-xl hover:opacity-70 transition-all cursor-pointer bg-black text-white px-6 py-3 rounded-lg font-medium">
                            Get Started
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <CodeAnimation />
                    </div>
                </div>
            </div>
        </>
    )
}