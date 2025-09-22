import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatSecondsToMinutesAndSeconds } from "../../lib/utils";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

import {
    IconSettings,
    IconLogout,
    IconHome,
} from "@tabler/icons-react"

export default function VideoWithAgent() {
    const { user, logout } = useAuth0();
    const { filename } = useParams<{ filename: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [chatInput, setChatInput] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot'; content: string | React.ReactNode }>>([]);

    // Challenge state
    const [currentChallenge, setCurrentChallenge] = useState<any>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [triggeredChallenges, setTriggeredChallenges] = useState<Set<number>>(new Set());
    const [tutorial, setTutorial] = useState<any>(null);

    useEffect(() => {
        // Always load the first tutorial for the demo
        axios.get(`http://localhost:3000/api/tutorials/python-10-minutes-beginner`).then(r => setTutorial(r.data));
        // local bridge
        axios.post('http://localhost:3002/connect').catch(() => { });
    }, []);

    const checkForChallenge = (currentTime: number) => {
        if (!tutorial?.events) return;

        // Find challenge event at current time (check if we've passed the timestamp)
        const challengeEvent = tutorial.events.find((event: any) =>
            event.type === 'challenge' &&
            event.timestamp <= currentTime &&
            event.timestamp >= currentTime - 3 && // Within last 3 seconds
            event.data?.pause_video === true &&
            !triggeredChallenges.has(event.timestamp) // Not already triggered
        );

        if (challengeEvent && !currentChallenge) {
            console.log('🎯 PAUSING VIDEO FOR CHALLENGE:', challengeEvent.data.title);
            setCurrentChallenge(challengeEvent.data);
            setTriggeredChallenges(prev => new Set(prev).add(challengeEvent.timestamp));
            if (videoRef.current) {
                videoRef.current.pause();
            }
        }
    };

    const resumeVideo = () => {
        setCurrentChallenge(null);
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    const testChallenge = async () => {
        if (!currentChallenge?.challenge_file) return;

        try {
            const result = await axios.post('http://localhost:3002/test-challenge', {
                challengeFile: currentChallenge.challenge_file,
                workingDirectory: '~/learn_python_5'
            });

            alert(`Test Results:\n${result.data.output || 'Command executed - check Warp for output!'}`);
        } catch (error) {
            console.error('Challenge test failed:', error);
            alert('Test failed - check console');
        }
    };



    const seekToTime = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seconds;
            videoRef.current.play();
        }
    };

    const handleChatSubmit = async () => {
        if (chatInput.trim() === '') return;

        const userMessage = chatInput;
        setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
        setChatInput('');

        axios.post('http://localhost:3000/api/twelvelabs/query', { query: userMessage })
            .then(response => {
                const dataPayload = response.data;

                let botContent: React.ReactNode;
                if (dataPayload.type === 'summary') {
                    botContent = (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{dataPayload.summaryOutput}</p>
                            </CardContent>
                        </Card>
                    );
                } else if (dataPayload.type === 'chapter') {
                    botContent = (
                        <div className="mt-4 space-y-4">
                            {dataPayload.chapterOutput.map((chapter: any, index: number) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle>{chapter.chapterTitle}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{chapter.chapterSummary}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    );
                } else if (dataPayload.type === 'highlight') {
                    botContent = (
                        <div className="mt-4 space-y-4">
                            {dataPayload.highlightOutput.map((highlight: any, index: number) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle className="flex flex-wrap items-center text-lg leading-relaxed">Highlight: {highlight.highlight} from <span onClick={() => seekToTime(highlight.startSec)} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-blue-200 transition-colors duration-200 text-sm mr-1"> {formatSecondsToMinutesAndSeconds(highlight.startSec)}</span> to <span onClick={() => seekToTime(highlight.endSec)} className="ml-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-blue-200 transition-colors duration-200 text-sm">{formatSecondsToMinutesAndSeconds(highlight.endSec)}</span></CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{highlight.highlightSummary}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    );
                } else {
                    botContent = JSON.stringify(dataPayload);
                }

                setChatHistory(prev => [...prev, { type: 'bot', content: botContent }]);
            })
            .catch(error => {
                console.error("Error sending message to chatbot:", error);
                setChatHistory(prev => [...prev, { type: 'bot', content: "Error: Could not get a response." }]);
            });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Clean Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <img src="/CodeFlowLogo.svg" className="w-7" />
                            <h1 className="text-2xl font-brand pt-1.5">CodeFlow.AI</h1>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 hover:rounded-xl bg-blue-300 hover:bg-blue-200 transition-all cursor-pointer px-4 py-1 rounded-lg">
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
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-12 gap-8 h-[calc(100vh-140px)]">
                    {/* Video Section */}
                    <div className="col-span-8 space-y-4">
                        <div className="bg-black rounded-xl overflow-hidden">
                            <video 
                                ref={videoRef} 
                                className="w-full aspect-video" 
                                controls 
                                onTimeUpdate={(e) => {
                                    const currentTime = (e.target as HTMLVideoElement).currentTime;
                                    const t = Math.floor(currentTime);
                                    axios.post('http://localhost:3002/sync', { currentTime: t }).catch(() => { });
                                    checkForChallenge(currentTime);
                                }}
                            >
                                <source 
                                    src={filename === "1LearnPython.mp4" ? "/1LearnPython.mp4" : `http://localhost:3000/api/videos/${filename}`} 
                                    type="video/mp4" 
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        
                        {/* Control Buttons */}
                        <div className="flex gap-3">
                            <button 
                                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors" 
                                onClick={async()=>{
                                    if (!tutorial) return;
                                    const setup = tutorial.events.find((e:any)=>e.type==='project_setup')?.data || { working_directory: '~/learn_python_5', ide: 'vscode' };
                                    await axios.post('http://localhost:3002/init-project', setup).catch(()=>{});
                                    await axios.post('http://localhost:3002/events/load', { events: tutorial.events }).catch(()=>{});
                                }}
                            >
                                Start Bridge
                            </button>
                            <button 
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors" 
                                onClick={()=>{
                                    if (videoRef.current) videoRef.current.currentTime = 0;
                                    axios.post('http://localhost:3002/seek', { time: 0 }).catch(()=>{});
                                    setTriggeredChallenges(new Set());
                                    setCurrentChallenge(null);
                                }}
                            >
                                Reset
                            </button>
                        </div>

                        {/* Challenge Overlay */}
                        {currentChallenge && (
                            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Challenge</h3>
                                    <button 
                                        onClick={resumeVideo}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Skip
                                    </button>
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className="font-medium text-lg mb-2">{currentChallenge.title}</h4>
                                    <p className="text-gray-600 mb-3">{currentChallenge.description}</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        <strong>Concept:</strong> {currentChallenge.concept_learned}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Difficulty:</label>
                                    <div className="flex gap-2 mb-3">
                                        {['easy', 'medium', 'hard'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setSelectedDifficulty(level as any)}
                                                className={`px-3 py-1 text-sm rounded-lg capitalize transition-colors ${
                                                    selectedDifficulty === level 
                                                    ? 'bg-gray-900 text-white' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <p className="text-gray-700 text-sm">
                                            {currentChallenge.difficulty_levels?.[selectedDifficulty]}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h5 className="font-medium mb-2 text-gray-700">Hints:</h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {currentChallenge.hints?.map((hint: string, idx: number) => (
                                            <li key={idx}>• {hint}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={testChallenge}
                                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Test Solution
                                    </button>
                                    <button
                                        onClick={resumeVideo}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Continue
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-3">
                                    File: <code className="bg-gray-100 px-1 rounded text-xs">{currentChallenge.challenge_file}</code>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Chat Section */}
                    <div className="col-span-4 flex flex-col border border-gray-200 rounded-xl overflow-hidden">
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                    <img src="/CodeFlowLogo.svg" className="w-5 h-5 invert" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">CodeFlow Assistant</h3>
                                    <p className="text-xs text-gray-500">Ask questions about the video</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Initial Message */}
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                    <img src="/CodeFlowLogo.svg" className="w-3 h-3 invert" />
                                </div>
                                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[85%]">
                                    <p className="text-sm text-gray-700">Hello! How can I help you learn today?</p>
                                </div>
                            </div>

                            {/* Chat History */}
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex items-start space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    {msg.type === 'bot' && (
                                        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                            <img src="/CodeFlowLogo.svg" className="w-3 h-3 invert" />
                                        </div>
                                    )}
                                    {msg.type === 'user' && (
                                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-medium text-gray-700">
                                                {user?.given_name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`rounded-lg px-3 py-2 max-w-[85%] ${
                                        msg.type === 'user' 
                                        ? 'bg-gray-900 text-white' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        <div className="text-sm">
                                            {typeof msg.content === 'string' ? msg.content : msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    placeholder="Ask a question..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleChatSubmit();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleChatSubmit}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}