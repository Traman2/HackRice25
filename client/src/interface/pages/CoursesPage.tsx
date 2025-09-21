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
    IconPlayerPlay,
    IconClock,
    IconBookmark,
} from "@tabler/icons-react"

import { useNavigate } from "react-router-dom";

interface AgenticDashboardData {
    uid: string;
    title: string;
    description: string;
    videosFileName: string[];
}

// Utility function to format video titles
const formatVideoTitle = (fileName: string): string => {
    let title = fileName.replace(/\.(mp4|avi|mov|mkv|webm)$/i, '');
    
    if (/^\d+/.test(title)) {
        title = title.replace(/^\d+/, '').trim();
    }
    
    title = title
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    if (title.toLowerCase().includes('python')) {
        if (title.toLowerCase().includes('learn')) {
            return 'Introduction to Python Programming';
        }
        return title.replace(/python/i, 'Python');
    }
    
    return title || fileName;
};

// Utility function to estimate video duration (placeholder)
const getVideoDuration = (fileName: string): string => {
    // This would typically come from video metadata
    if (fileName.includes('python') || fileName.includes('Python')) {
        return '12 min';
    }
    return '8 min';
};

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
        <div className="min-h-screen bg-gray-50">
            {/* Clean Header */}
            <header className="bg-white border-b border-gray-200">
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

            {/* Hero Section */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
                            {dashboardData?.title || 'Your Learning Journey'}
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            {dashboardData?.description || 'Master programming concepts with our curated video tutorials.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Content</h2>
                    <p className="text-gray-600">{dashboardData?.videosFileName?.length || 0} lessons</p>
                </div>

                <div className="grid gap-4">
                    {dashboardData?.videosFileName.map((fileName, index) => (
                        <div
                            key={fileName}
                            className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                        >
                            <div 
                                className="p-6 cursor-pointer"
                                onClick={() => setActiveVideoCard(activeVideoCard === fileName ? null : fileName)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                {formatVideoTitle(fileName)}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <IconClock className="w-4 h-4" />
                                                    <span>{getVideoDuration(fileName)}</span>
                                                </div>
                                                <span>•</span>
                                                <span>Lesson {index + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <IconBookmark className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                        <IconPlayerPlay className={`w-5 h-5 ${activeVideoCard === fileName ? 'text-gray-900' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            </div>
                            
                            {activeVideoCard === fileName && (
                                <div className="border-t border-gray-200 p-6 bg-gray-50">
                                    <div className="mb-4">
                                        <video 
                                            width="100%" 
                                            autoPlay={false} 
                                            key={fileName} 
                                            preload="metadata" 
                                            ref={videoRef} 
                                            className="w-full rounded-lg shadow-sm" 
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <source 
                                                src={fileName === "1LearnPython.mp4" ? "/1LearnPython.mp4" : `http://localhost:3000/api/videos/${fileName}`} 
                                                type="video/mp4"
                                            />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                    <button 
                                        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors" 
                                        onClick={(e) => {e.stopPropagation(); navigate(`/video/${fileName}`)}}
                                    >
                                        <IconPlayerPlay className="w-4 h-4 mr-2" />
                                        Continue Learning
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}