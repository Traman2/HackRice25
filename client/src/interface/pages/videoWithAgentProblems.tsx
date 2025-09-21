import { useAuth0 } from "@auth0/auth0-react";

export default function VideoWithAgent() {
    const { user, logout } = useAuth0();

    return (
        <>
            Dashboard
            {user?.email}
            <button onClick={() => logout()} className="self-start bg-black text-white px-4 py-2 hover:opacity-85 rounded-lg cursor-pointer">Logout</button>
            <video width="720" controls>
                <source src="/1LearnPython.mp4" type="video/mp4" />
            </video>
        </>
    )
}