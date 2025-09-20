import { useAuth0 } from "@auth0/auth0-react";

export default function Dashboard() {
    const { user, logout } = useAuth0();
    

    return (
        <>
            Dashboard
            {user?.email}
            <button className="bg-black text-white px-4 py-2 hover:opacity-85 rounded-lg cursor-pointer" onClick={() => logout()}>Logout</button>
        </>
    )
}