import { useAuth0 } from "@auth0/auth0-react";
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
import { useEffect, useState } from "react";
import Dashboard from "./dashboard";

interface Props {
    pages: String;
}

export default function SidebarSocket({pages} : Props) {
    const { user, logout } = useAuth0();
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState(pages);

    useEffect(() => {
        setActivePage(pages);
    }, [pages])


    function render() {
        switch(activePage) {
            case "dashboard":
                return <Dashboard/>

            default:
                return <Dashboard/>
        }
    } 

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
                                onClick={() => logout}
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
                    {/* Sidebar */}
                    <div className="flex-1 flex flex-col">
                        Sidebar socket buttons goes here
                    </div>

                    {/* Main Content */}
                    <div className="flex-6 flex flex-col">
                        {render()}
                    </div>
                </div>
            </div>

        </>
    )
}