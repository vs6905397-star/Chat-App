import { supabase } from "../lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login(){

    const [email, setEmail] = useState("");
    const[password, setPasword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            alert("login successful!");
            navigate("/Chat");
        }
    };


    return (
        <div  className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">

            <div className="w-[350px] p-8  rounded-2xl bg-white/10  backdrop-blur-lg shadow-2xlborder border-white/20">
            
            <h2 className="text-center text-white text-lg mb-2 font-semibold  "> React  Chat App</h2>

            <h1 className="text-center  text-3xl  font-bold text-white mb-6">Login</h1>

            <div className="mb-4">
                <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4  py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none border  border-white/20 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="mb-4 relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPasword(e.target.value)} className="w-full px-4  py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none border  border-white/20 focus:ring-2 focus:ring-blue-500"/>

                <span onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer text-gray-300">👁️</span>
            </div>

            <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition">
                Login
            </button>

            <p className="text-center text-gray-300 mt-5 text-sm">
                Don't have an account?
                <span onClick={() => navigate("/signup") } className="text-blue-400 cursor-pointer hover:underline">
                    Sing Up
                </span>
            </p>

            </div>
        </div>
    );
}

export default Login;