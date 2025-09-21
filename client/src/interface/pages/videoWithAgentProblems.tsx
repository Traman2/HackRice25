import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function VideoWithAgent() {
    const { user, logout } = useAuth0();
    const [tutorial, setTutorial] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [messages, setMessages] = useState<{role:'user'|'assistant', content:string, hits?:any[]}[]>([]);
    const [input, setInput] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Challenge state
    const [currentChallenge, setCurrentChallenge] = useState<any>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy'|'medium'|'hard'>('easy');
    const [isVideoPaused, setIsVideoPaused] = useState(false);
    const [triggeredChallenges, setTriggeredChallenges] = useState<Set<number>>(new Set());

    useEffect(() => {
        // Always load the first tutorial for the demo
        axios.get(`http://localhost:3000/api/tutorials/python-10-minutes-beginner`).then(r => setTutorial(r.data));
        axios.post(`http://localhost:3000/api/tl/session/init`, { tutorialId: 'python-10-minutes-beginner' }).then(r => setSession(r.data));
        // local bridge
        axios.post('http://localhost:3002/connect').catch(()=>{});
    }, []);

    const ask = async () => {
        if (!session) return;
        const q = input.trim();
        if (!q) return;
        setMessages(m => [...m, { role:'user', content:q }]);
        setInput("");
        
        // Detect what type of request this is
        let requestType = 'search';
        if (q.toLowerCase().includes('highlight') || q.toLowerCase().includes('moment') || q.toLowerCase().includes('show me')) {
            requestType = 'highlight';
        } else if (q.toLowerCase().includes('summarize') || q.toLowerCase().includes('summary') || q.toLowerCase().includes('overview')) {
            requestType = 'summarize';
        } else if (q.toLowerCase().includes('gist') || q.toLowerCase().includes('main points') || q.toLowerCase().includes('key topics')) {
            requestType = 'gist';
        }

        const res = await axios.post(`http://localhost:3000/api/tl/ask`, {
            tutorialId: 'python-10-minutes-beginner',
            sessionId: session.sessionId,
            query: q,
            indexId: import.meta.env.VITE_TL_INDEX_ID,
            videoId: import.meta.env.VITE_TL_VIDEO_ID,
            type: requestType
        });
        
        // Handle different response types
        let responseData = res.data;
        if (responseData.summary) {
            setMessages(m => [...m, { role:'assistant', content: responseData.summary, hits: responseData.hits }]);
        } else if (responseData.gist) {
            let content = responseData.gist;
            if (responseData.topics?.length) {
                content += '\n\nKey topics: ' + responseData.topics.join(', ');
            }
            setMessages(m => [...m, { role:'assistant', content: content, hits: responseData.hits }]);
        } else {
            setMessages(m => [...m, { role:'assistant', content: responseData.answer, hits: responseData.hits || responseData.highlights }]);
        }
    };


    const jumpTo = (t:number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = t;
            videoRef.current.play();
        }
    };

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

    return (
        <>
            <div className="flex items-center justify-between px-6 py-3">
                <div className="text-sm text-zinc-600">{user?.email}</div>
                <button onClick={() => logout()} className="self-start bg-black text-white px-4 py-2 hover:opacity-85 rounded-lg cursor-pointer">Logout</button>
            </div>
            <div className="grid gap-6 md:grid-cols-[1fr_360px] px-6 pb-10">
                <div className="rounded-xl border bg-white p-4">
                    <h2 className="font-semibold mb-2">{tutorial?.title || 'Loading tutorial...'}</h2>
                    <video width="100%" controls ref={videoRef} onTimeUpdate={(e)=>{
                        const currentTime = (e.target as HTMLVideoElement).currentTime;
                        const t = Math.floor(currentTime);
                        axios.post('http://localhost:3002/sync', { currentTime: t }).catch(()=>{});
                        checkForChallenge(currentTime); // Use precise time for challenge detection
                    }}>
                        <source src={tutorial?.videoUrl || '/1LearnPython.mp4'} type="video/mp4" />
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
                <div className="rounded-xl border bg-white p-4 flex flex-col">
                    <h3 className="font-semibold mb-2">Assistant</h3>
                    <div className="flex-1 overflow-auto space-y-3 border rounded p-2 mb-3 max-h-[60vh]">
                        {messages.map((m, i) => (
                            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                                <div className={`inline-block px-3 py-2 rounded-lg ${m.role==='user'?'bg-blue-600 text-white':'bg-zinc-100'}`}>{m.content}</div>
                                {m.hits?.length ? (
                                    <div className="mt-2 space-y-1">
                                        {m.hits.map((h:any, idx:number) => (
                                            <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                                <button onClick={() => jumpTo(h.timestamp)} className="text-blue-600 underline font-medium">
                                                    {Math.floor(h.timestamp/60)}:{(h.timestamp%60).toString().padStart(2,'0')}
                                                    {h.endTime ? ` - ${Math.floor(h.endTime/60)}:${(h.endTime%60).toString().padStart(2,'0')}` : ''}
                                                </button>
                                                {h.label && <div className="text-gray-600 mt-1">{h.label}</div>}
                                                {h.confidence && <div className="text-gray-400">Confidence: {Math.round(h.confidence * 100)}%</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask about this video..." className="flex-1 border rounded px-3 py-2" />
                        <button onClick={ask} className="bg-black text-white rounded px-4">Ask</button>
                    </div>
                </div>
            </div>
        </>
    )
}