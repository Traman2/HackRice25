import { useAuth0 } from "@auth0/auth0-react";

export default function LandingPage() {
    const { loginWithRedirect } = useAuth0();

    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0D8FF] to-[#FFE6DC] z-0 bg-landing opacity-30" />
            <div className=" absolute inset-0 z-10">
                <nav className="flex justify-between items-center mt-6 py-2 px-40">

                    <div className="flex items-center gap-2">
                        <img src="/CodeFlowLogo.svg" className="w-8" />
                        <h1 className="text-3xl font-brand pt-1.5">CodeFlow.AI</h1>
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
                <div className="px-40 mt-20 flex gap-2">
                    <div className="flex-1 flex flex-col gap-6">
                        <h1 className="font-hero text-6xl">
                            Learn by solving, not just watching
                        </h1>
                        <p className="font-body text-lg">
                            Turn videos into problem sets and start learning
                        </p>
                        <button className="self-start hover:rounded-xl hover:opacity-70 transition-all cursor-pointer bg-black text-white px-4 py-2 rounded-lg">
                            Get Started
                        </button>
                    </div>

                    <div className="flex-2">

                    </div>

                </div>
            </div>
        </>
    )
}