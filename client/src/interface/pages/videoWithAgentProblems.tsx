import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatSecondsToMinutesAndSeconds } from "../../lib/utils";

export default function VideoWithAgent() {
    const { user, logout } = useAuth0();
    const { filename } = useParams<{ filename: string }>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [chatInput, setChatInput] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot'; content: string | React.ReactNode }>>([]);

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
                                        <CardTitle>Highlight: {highlight.highlight} (from {formatSecondsToMinutesAndSeconds(highlight.startSec)} to {formatSecondsToMinutesAndSeconds(highlight.endSec)})</CardTitle>
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
                <div className="w-3/4 bg-white rounded-md flex items-center shadow-lg p-4">
                    <video ref={videoRef} className="w-full rounded-md" controls>
                        <source src={filename === "1LearnPython.mp4" ? "/1LearnPython.mp4" : `http://localhost:3000/api/videos/${filename}`} type="video/mp4" className="rounded-md" />
                        Your browser does not support the video tag.
                    </video>
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