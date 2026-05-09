import { supabase } from "../lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup(){

    const [email, setEmail] = useState("");
    const[password, setPasword] = useState("");

    const handleSignup = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if ( error ) {
            alert(error.message);

        } else {
            alert("signup successful!");
            if(data?.user){

                 await supabase.from("users").insert([
             {
                id: data.user.id,
                email: data.user.email,
            },
        ]);
            }
           
            navigate("/chat");
        }
    };



    const [showPassword, setShowPasword] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">

            <div className="w-[250px] p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20">
            
             <h2 className="text-center text-white text-lg mb-2 font-semibold">React Chat App</h2>

             <h1 className="text-center text-3xl font-bold text-white mb-6">Sign Up</h1>

             <input type="email" placeholder="Email"  value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 mb-4 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none border border-white/20 focus:right-2 focus:ring-blue-500" />

             <div className="relative mb-4">

                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPasword(e.target.value)} className="w-full px-4 py-3 mb-4 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none border border-white/20 focus:right-2 focus:ring-blue-500"/>

                <span onClick={()=>setShowPasword(!showPassword)}  className="absolute right-3 top-3 cursor-pointer text-gray-300">👁️</span>

                </div>

                <button onClick={handleSignup} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition">
                Sing Up
                </button>

                <p className="text-center text-gray-300 mt-5 text-sm">
                Don't have an account?
                <span onClick={() => navigate("/") }  className="text-blue-400 cursor-pointer hover:underline">
                    Login
                </span>
               </p>

             
            </div>
        </div>
    );
}

export default Signup;