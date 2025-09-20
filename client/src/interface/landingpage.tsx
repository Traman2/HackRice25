import { useAuth0 } from "@auth0/auth0-react";

export default function LandingPage() {
    const { loginWithRedirect } = useAuth0();

    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0D8FF] to-[#FFE6DC] z-0" />
            <div className=" absolute inset-0 z-10">
                <nav className="flex justify-between items-center mt-2 py-2 px-30">
                    <div className="text-3xl font-brand">
                        CodeFlow.AI
                    </div>

                    <div className="flex gap-4 ">
                        <button onClick={() => loginWithRedirect()} className="hover:rounded-xl hover:bg-gray-200 transition-all cursor-pointer border-2 border-black/50 px-4 py-2 rounded-lg">
                            Login
                        </button>

                        <button className="hover:rounded-xl hover:opacity-70 transition-all cursor-pointer bg-black text-white px-4 py-2 rounded-lg">
                            Signup
                        </button>
                    </div>
                </nav>
                <div className="px-30 mt-26 flex flex-col gap-8 items-center justify-center">
                    <h1 className="font-body font-semibold text-5xl w-140 text-center">
                        Learn by Solving, Not Just Watching.
                    </h1>
                    <p className="font-body text-lg w-160 text-center">
                        Our app turns educational videos into instant problem sets, helping students actively practice instead of just passively watching.
                    </p>
                </div>
            </div>
        </>
    )
}