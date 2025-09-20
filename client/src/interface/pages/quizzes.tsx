import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import axios from "axios";
import QuizForm from "../components/QuizForm";

export default function Quizzes() {
    const { user, logout } = useAuth0();
    useEffect(() => {
        const sendUserData = async () => {
            if (user) {
                try {
                    const userData = {
                        uid: user.sub,
                        userName: user.name,
                        email: user.email
                    };
                    await axios.post('http://localhost:3001/api/users', userData); // Assuming your backend is at http://localhost:3001
                    console.log("User data sent to backend");
                } catch (error) {
                    console.error("Error sending user data to backend:", error);
                }
            }
        };
        sendUserData();
    }, [user]);

    return (
        <>
            <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-zinc-600">{user?.email}</div>
                <button className="bg-black text-white px-4 py-2 hover:opacity-85 rounded-lg cursor-pointer" onClick={() => logout()}>Logout</button>
            </div>
            <QuizForm />
        </>
    )
}