import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatSecondsToMinutesAndSeconds } from "../../lib/utils";

export default function VideoWithAgent() {
    const { user, logout } = useAuth0();
    const { filename } = useParams<{ filename: string }>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [chatInput, setChatInput] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot'; content: string | React.ReactNode }>>([]);

    // Challenge state
    const [currentChallenge, setCurrentChallenge] = useState<any>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [isVideoPaused, setIsVideoPaused] = useState(false);
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
            setIsVideoPaused(true);
            setTriggeredChallenges(prev => new Set(prev).add(challengeEvent.timestamp));
            if (videoRef.current) {
                videoRef.current.pause();
            }
        }
    };

    const resumeVideo = () => {
        setCurrentChallenge(null);
        setIsVideoPaused(false);
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
        <div className="flex flex-col h-screen bg-gray-100 py-4 px-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <img src="/CodeFlowLogo.svg" className="w-8" />
                    <h1 className="text-3xl font-brand pt-1.5">CodeFlow.AI</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-lg">Welcome, {user?.email}</span>
                    <button onClick={() => logout()} className="bg-black text-white px-4 py-2 hover:opacity-85 rounded-lg cursor-pointer">
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex-grow flex space-x-4">
                {/* Video Frame */}
                <div className="w-3/4 bg-white rounded-md flex flex-col items-center shadow-lg p-4">
                    <video ref={videoRef} className="w-full rounded-md" controls onTimeUpdate={(e) => {
                        const currentTime = (e.target as HTMLVideoElement).currentTime;
                        const t = Math.floor(currentTime);
                        axios.post('http://localhost:3002/sync', { currentTime: t }).catch(() => { });
                        checkForChallenge(currentTime); // Use precise time for challenge detection
                    }}>
                        <source src={filename === "1LearnPython.mp4" ? "/1LearnPython.mp4" : `http://localhost:3000/api/videos/${filename}`} type="video/mp4" className="rounded-md" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="mt-3 flex gap-2">
                        <button className="border px-3 py-1 rounded" onClick={async()=>{
                            if (!tutorial) return;
                            const setup = tutorial.events.find((e:any)=>e.type==='project_setup')?.data || { working_directory: '~/learn_python_5', ide: 'vscode' };
                            await axios.post('http://localhost:3002/init-project', setup).catch(()=>{});
                            await axios.post('http://localhost:3002/events/load', { events: tutorial.events }).catch(()=>{});
                        }}>Start Bridge</button>
                        <button className="border px-3 py-1 rounded" onClick={()=>{
                            if (videoRef.current) videoRef.current.currentTime = 0;
                            axios.post('http://localhost:3002/seek', { time: 0 }).catch(()=>{});
                            setTriggeredChallenges(new Set()); // Clear triggered challenges on reset
                            setCurrentChallenge(null); // Clear any active challenge
                        }}>Reset</button>
                    </div>
                    {/* Challenge Overlay */}
                    {currentChallenge && (
                        <div className="mt-4 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-yellow-800">🎯 Challenge Time!</h3>
                                <button 
                                    onClick={resumeVideo}
                                    className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                                >
                                    Skip Challenge
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="font-semibold text-lg mb-2">{currentChallenge.title}</h4>
                                <p className="text-gray-700 mb-3">{currentChallenge.description}</p>
                                <p className="text-sm text-blue-600 mb-4">
                                    <strong>Concept learned:</strong> {currentChallenge.concept_learned}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Choose Difficulty:</label>
                                <div className="flex gap-2 mb-3">
                                    {['easy', 'medium', 'hard'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedDifficulty(level as any)}
                                            className={`px-4 py-2 rounded capitalize ${
                                                selectedDifficulty === level 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="bg-white p-4 rounded border">
                                    <h5 className="font-medium mb-2 capitalize">{selectedDifficulty} Challenge:</h5>
                                    <p className="text-gray-700">
                                        {currentChallenge.difficulty_levels?.[selectedDifficulty]}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="font-medium mb-2">💡 Hints:</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {currentChallenge.hints?.map((hint: string, idx: number) => (
                                        <li key={idx}>• {hint}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={testChallenge}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                                >
                                    🧪 Test Solution
                                </button>
                                <button
                                    onClick={resumeVideo}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                                >
                                    ▶️ Continue Learning
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                💾 Work on your solution in: <code className="bg-gray-100 px-1 rounded">{currentChallenge.challenge_file}</code>
                            </p>
                        </div>
                    )}
                </div>

                {/* Chatbot Frame */}
                <div className="w-1/4 bg-white rounded-md shadow-lg p-4 flex flex-col">
                    <div className="flex-grow overflow-y-auto mb-4 space-y-4 h-0 pr-2">
                        <p className="text-gray-600">Chatbot: Hello! How can I help you learn today?</p>
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={msg.type === 'user' ? 'text-right' : 'text-left'}>
                                <div className={`inline-block p-2 rounded-lg ${msg.type === 'user' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                                    {msg.type === 'user' ? msg.content : msg.content}
                                </div>
                            </div>
                        ))}

                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-black/80 cursor-pointer"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}