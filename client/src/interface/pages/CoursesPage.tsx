import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useRef } from "react";
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

interface AgenticDashboardData {
    uid: string;
    title: string;
    description: string;
    videosFileName: string[];
}


export default function CoursesPage() {
    const { user, logout } = useAuth0();
    const [dashboardData, setDashboardData] = useState<AgenticDashboardData | null>(null);
    const navigate = useNavigate();
    const [activeVideoCard, setActiveVideoCard] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);


    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:3000/api/users/dashboard/${user.sub}`)
                .then(response => {
                    setDashboardData(response.data);
                })
                .catch(error => {
                    console.error("Error fetching dashboard data:", error);
                });
        }
    }, [user]);

    useEffect(() => {
        if (activeVideoCard && videoRef.current) {
            videoRef.current.currentTime = 2; // Set video to start at 2 seconds
        }
    }, [activeVideoCard]);

    return (
        <div className="bg-black/20 pb-20">
            <nav className="flex justify-between items-center px-32 py-3 bg-gray-400">
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
            </nav>
            <div className="px-32 h-100 py-14 bg-gray-200 rounded-b-2xl shadow-lg">
                <div className="flex flex-col gap-6">
                    <h1 className="font-body font-semibold text-5xl w-140">{dashboardData?.title}</h1>
                    <p className="font-body text-lg  w-170">{dashboardData?.description}</p>
                </div>
            </div>
            <div className="px-32 mt-10 flex gap-2">
                <div className="border-2 p-4 border-dashed rounded-lg border-black flex-4 flex flex-col gap-2">
                   {
                    dashboardData?.videosFileName.map((fileName) => (
                        <div
                            key={fileName}
                            className="p-4 border rounded-lg shadow-md cursor-pointer hover:bg-gray-300 transition-all"
                            onClick={() => setActiveVideoCard(activeVideoCard === fileName ? null : fileName)}
                        >
                            <p className="text-xl font-semibold">Topic: {fileName}</p>
                            {activeVideoCard === fileName && (
                                <div className="mt-4">
                                    <video width="100%" autoPlay={false} key={fileName} preload="metadata" ref={videoRef} className="w-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                                        <source src={fileName === "1LearnPython.mp4" ? "/1LearnPython.mp4" : `http://localhost:3000/api/videos/${fileName}`} type="video/mp4"/>
                                        Your browser does not support the video tag.
                                    </video>
                                    <button className="self-start mt-2 hover:rounded-xl hover:bg-gray-200 transition-all cursor-pointer border-2 border-black/50 px-4 py-2 rounded-lg" onClick={(e) => e.stopPropagation()}>Watch Now</button>
                                </div>
                            )}
                        </div>
                    ))
                } 
                </div>
                <div className="flex-2">
                    {/* Removed the separate video display area */}
                </div>
                
            </div>
        </div>
    )
}