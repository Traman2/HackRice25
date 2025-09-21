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

    useEffect(() => {
        // Always load the first tutorial for the demo
        axios.get(`http://localhost:3000/api/tutorials/python-10-minutes-beginner`).then(r => setTutorial(r.data));
        axios.post(`http://localhost:3000/api/tl/session/init`, { tutorialId: 'python-10-minutes-beginner' }).then(r => setSession(r.data));
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

    return (
        <>
            <div className="flex items-center justify-between px-6 py-3">
                <div className="text-sm text-zinc-600">{user?.email}</div>
                <button onClick={() => logout()} className="self-start bg-black text-white px-4 py-2 hover:opacity-85 rounded-lg cursor-pointer">Logout</button>
            </div>
            <div className="grid gap-6 md:grid-cols-[1fr_360px] px-6 pb-10">
                <div className="rounded-xl border bg-white p-4">
                    <h2 className="font-semibold mb-2">{tutorial?.title || 'Loading tutorial...'}</h2>
                    <video width="100%" controls ref={videoRef}>
                        <source src={tutorial?.videoUrl || '/1LearnPython.mp4'} type="video/mp4" />
                    </video>
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