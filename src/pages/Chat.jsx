import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Await } from "react-router-dom";
import { data } from "autoprefixer";


function Chat() {

  
//yes
const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);
const [user, setUser] = useState(null);
const [currentUser, setCurrentUser] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);
const [users, setUsers] = useState([]);
const [typingUser, setTypingUser] = useState(null);
const [isTyping, setIsTyping] = useState(false);
const messagesEndRef = useRef(null);
const typingTimeout = useRef(null);
const [selectProfile, setSelectProfile] = useState(null);
const [editMode, setEditMode] = useState(false);
const editRef = useRef(false);
const [name, setName] = useState("");
const [bio, setBio] = useState("");
const [imageFile, setImageFile] = useState(null);
const [profileImage, setProfileImage] = useState(null);
const [showShidebar, setShowSidebar] = useState(true);
const [profileOpen, setProfileOpen] = useState(true);
const [mode, setMode] = useState(true);
const [search, setSearch] = useState("");


useEffect(()=>{
    if(!currentUser) return;

    const setOnline = async () => {
        await supabase
    .from("users")
    .update({is_online:true})
    .eq("id", currentUser.id);
    };
    setOnline();
    
},[currentUser]);

const getLastMessage = (userId) => {
    const userMessages = messages.filter(
        (msg) =>
        (msg.user_id === currentUser.id && msg.receiver_id === userId) || 
        (msg.user_id === userId && msg.receiver_id === currentUser.id)
    
    );

    return userMessages[userMessages.length - 1];
};

const handleLogout = async () => {


    await supabase
    .from("users")
    .update({is_online:false, last_seen:new Date(),})
    .eq("id", currentUser.id);

    await supabase.auth.signOut();

    const {error} = await
    supabase.auth.signOut();

    if(error){
        console.log(error);
    } else {
        window.location.href = "/";
    }
};

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
};

useEffect(() => {
    scrollToBottom();
},[messages]);


const handleUserClick = async (user) => {
    setSelectedUser(user);
    setShowSidebar(false);
    markAsDelivered(user.id);
    markAsSeen(user.id);

    const {data, error} = await supabase
    .from("messages")
    .select("*")
    .or(
        `and(sender.eq.$
        {currentUser.id},recevier.eq.${user.id}),
        and(sender.eq.$
        {user.id},receiver.eq.${currentUser.id})`
    )
    .order("created_at", {ascending:true})

    if(!error) {
        setMessages(data)
    }
}

useEffect(() => {
    const fetchUsers = async () => {
        const {data, error} = await
        supabase.from("users")
        .select("*");
        
       
    if(error) {
        console.log(error);
    } else {
        setUsers(data.users);
    }
    };
    fetchUsers();
   
},[]);

useEffect(() => {
    const getUsers = async () => {
        const {data, error} = await
        supabase.from("users")
        .select("*");

        if(error) {
            console.log(error);
        } else {
            setUsers(data);
        }
    };
    getUsers();
},[]);
//yes
useEffect(() => {
    getUser();
    
},[]);

useEffect(() => {
    if(!selectedUser && !currentUser) return;

        fetchMessages();
    
}, [selectedUser, currentUser]);
//yes
const getUser = async () => {
    const{ data: {user} } = await
    supabase.auth.getUser();

    if(user){
        const {data: profileData, error} = await
        supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

        if(!error) {
            setCurrentUser(profileData);
        }
    }
    
    
};
//yes
const fetchMessages = async () => {
  if (!currentUser || !selectedUser) return;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(user_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(user_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.log("ERROR:", error);
  } else {
    setMessages(data);
    markAsDelivered(selectedUser.id);
  }
};


const markAsDelivered = async (senderId) => {

    const{data,error} = await supabase
    .from("messages")
    .update({ status: "delivered" })
    .eq("receiver_id", currentUser.id)
    .eq("user_id", senderId)
    .select();

};

const markAsSeen = async (senderId) => {
    if(!senderId || !currentUser) return;

    const {data, error} = await supabase
    .from("messages")
    .update({ status: "seen" })
    .eq("receiver_id", currentUser.id)
    .eq("user_id", senderId)
    .select();

};


//yes
const  sendMessage = async () => {

    if ( !currentUser || !selectedUser )
        return;

    if(!message?.trim() && !imageFile)
        return;

    let imageUrl = null;

    if (imageFile) {
     const fileName = `${Date.now()}-${imageFile.name}`;

    const {data: uploadData, error:uploadError} = await
    supabase.storage
    .from("chat-images")
    .upload(fileName, imageFile);

    if(uploadError) {
        console.log("image upload error", uploadError);
        return;
    }

    const { data } =
    supabase.storage
    .from("chat-images")
    .getPublicUrl(fileName);

    imageUrl = data.publicUrl;

}

    const newMsg = {
        id: Date.now(),
        message: message?.trim() || null,
        image_url: imageUrl || null,
        user_id: currentUser.id,
        receiver_id: selectedUser.id,
        status: "sent",
        created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);

    setMessage("");
    setImageFile(null);

    const {data, error} = await supabase
    .from("messages")
    .insert([
        {
            text: newMsg.message,
            image_url: newMsg.image_url,
            user_id: newMsg.user_id,
            receiver_id: newMsg.receiver_id,
            status: "sent",
    },
  ])
  .select();

  if(error){
console.log("ERROR",error);
  } else {
        setMessages((prev) =>
            prev.map((msg) =>
            msg.id === newMsg.id ? data[0] :
    msg
)
        );
  }
 
};


//yes

const handleTyping = async (e) => {

    setMessage(e.target.value);

    await supabase
    .from("users")
    .update({is_typing: true})
    .eq("id", currentUser.id);

    if(typingTimeout.current) {
         clearTimeout(typingTimeout.current);
    }
   
    typingTimeout.current = setTimeout(async () => {
        await supabase
        .from("users")
        .update({is_typing: false})
        .eq("id", currentUser.id);
    }, 3000);
};

useEffect(() => {
    if(!selectedUser) return;

    const channel = supabase
    .channel("typing-status")
    .on(
        "postgres_changes",
        {
            event: "UPDATE",
            schema: "public",
            table: "users",        
        },
        (payload) => {
            const typingUserId = payload.new.id;
            
            if(typingUserId === selectedUser?.id){

                setIsTyping(payload.new.is_typing);
        }
    }
    )
    .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}, [selectedUser]);

const openProfile = (user) => {
    setSelectProfile(user);
};

const updateProfile = async () => {
    let avatarUrl = selectProfile?.avatar_url || null;

    if(profileImage) {
        const fileName = `${Date.now()}-${profileImage.name}`;

        const { error: uploadError } = await
        supabase.storage
        .from("profile-images")
        .upload(fileName, profileImage);

        if(uploadError) {
            console.log(uploadError);
            return;
        }

        const {data} = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

        avatarUrl = data.publicUrl;
    }

    const { data: updatedData, error } = await supabase
    .from("users")
    .update({
        name,
        bio,
        avatar_url: avatarUrl,
    })
    .eq("id", currentUser.id)
    .select();

    if(!error) {
        const { data: updatedUser } = await
        supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .single();

        setSelectProfile(updatedUser);
        setCurrentUser(updatedUser);

        setUsers(
            users.map((u) => 
            u.id === currentUser.id
        ? {
            ...u,
            name,
            bio,
            avatar_url: avatarUrl,
        }: u
    )
        );

        setEditMode(false);
        setProfileImage(null);

    } else {
        console.log(error);
    }
};

const closeProfile = () => {
    setSelectProfile(null);
    setProfileOpen(false)
    setEditMode(false);
};

const deleteMessage = async (id) => {
    const {error} = await supabase
    .from("messages")
    .update({ text: "this message was deleted", image_url:null})
    .eq("id", id);

    if(error) console.log(error);
};

useEffect(() => {
  const channel = supabase
    .channel("chat-room")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        

        if (payload.eventType === "INSERT") {
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }

        if (payload.eventType === "UPDATE") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? payload.new : msg
            )
          );
        }

        if (payload.eventType === "DELETE") {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== payload.old.id)
          );
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

useEffect(() => {
    if(editRef.current) {
        setEditMode(true);
    }
},[selectProfile]);

const handleSidebar = ()=>{
    if(showShidebar){
        setShowSidebar(false);
        setSelectedUser(null)
    }else{
        setShowSidebar(true);
    };
};


const theme = mode ? {
    bg:"bg-[#0f172a]",
    card: "bg-[#111827]",
    sidebar: "bg-[#111827]",
    topbar: "bg-[#0b1220]",
    border: "border-[#1f2937]",
    text: "text-white",
    subtext: "text-gray-400",
    input: "bg-[#1e293b]",
    hover: "hover:bg-[#1e293b]",
    selected: "bg-gradient-to-r from-cyan-500 to-blue-600",
    myMsg: "bg-gradient-to-r from-cyan-500 to-blue-600",
    otherMsg: "bg-[#1e293b]",
    button: "bg-gradient-to-r from-cyan-500 to-blue-600",
    buttonred: "bg-gradient-to-r from-rose-500 to-red-600",
    shadow: "shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    chatbg: "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%)]",
} : {
    
  bg: "bg-gradient-to-br from-[#dbeafe] via-[#eff6ff] to-[#bfdbfe]",

  card: "bg-white/70 backdrop-blur-xl",

  sidebar: "bg-white/60 backdrop-blur-xl",

  topbar: "bg-white/70 backdrop-blur-xl",

  border: "border-white/40",

  text: "text-gray-900",

  subtext: "text-gray-600",

  input: "bg-white/80",

  hover: "hover:bg-blue-100/70",

  selected:
    "bg-gradient-to-r from-cyan-400 to-blue-500 text-white",
    buttonred: "bg-gradient-to-r from-red-300 to-red-600",

  myMsg:
    "bg-gradient-to-r from-cyan-400 to-blue-500 text-white",

  otherMsg:
    "bg-white text-gray-900",

  button:
    "bg-gradient-to-r from-cyan-500 to-blue-500",
    buttonred: "bg-gradient-to-r from-rose-500 to-red-600",

  shadow:
    "shadow-[0_8px_30px_rgba(59,130,246,0.18)]",
    chatbg: "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_40%)]"
}


    return(
       
      <div className={`h-screen flex flex-col ${theme.bg} ${theme.text} transition-all duration-300   `}>

{/*//top bar.....*/}

            <div className={`fixed top-0 left-0 w-full h-[50px]  flex items-center justify-between px-3 z-50 border-b ${theme.topbar} ${theme.border} ${theme.shadow} backdrop-blur-xl`}>
                <button onClick={handleSidebar} className="md:hidden">🔙</button>
                <p className="text-3xl font-bold mb-4">Chat App</p>
                <button onClick={()=> setMode(!mode)} className={`px-3 py-1 rounded-full cursor-pointer ${theme.button} text-white font-semibold shadow-lg`}>{mode ? "🌞" :"🌙"}</button>
            </div>

{/*//main body*/}

            <div className="flex flex-1 pt-[50px] overflow-hidden">

{/*// sidebar  */} 
             <div className={`${showShidebar ? "flex" : "hidden md:flex"} w-full md:w-[280px] ${theme.sidebar} border-r ${theme.border} ${theme.shadow} transition-all duration-300 flex flex-col shrink-0`}>

{/*//userid*/}
                {currentUser && (
                    <div onClick={() => openProfile(currentUser)} className="flex items-center gap-2 p-2 border-b border-gray-600 cursor-pointer">
                        <img src={currentUser.avatar_url || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full" />
                        <p>{currentUser.name || currentUser.email}</p>
                    </div>
                )}  

{/*//sidebarSearch   */}

                   
                    <input type="text" placeholder="search user..." value={search} onChange={(e) => setSearch(e.target.value)} className={`w-full p-2 mt-3 rounded ${theme.input} border outline-none ${theme.border} focus:ring-2 focus:ring-cyan-400`} />

                    <h3 className={`font-bold text-3xl m-2 ${theme.border} ${theme.shadow}`}>chat with</h3>


{/*//userlist*/}

                    <div className="flex-1 overflow-y-auto pr-1 custom-scroll backdrop-blur-lg border border-white/10">
                    
                       {users
                       ?.filter((u) => u.id !== currentUser.id)
                       ?.filter((u) => 
                        (u.name || u.email)
                         .toLowerCase()
                        .includes(search.toLowerCase()))
                       .map((user) =>{
                        const lastMsg = getLastMessage(user.id);
                        return(
                        <div key={user.id} onClick={() => handleUserClick(user)} className={`p-2 rounded cursor-pointer transition-all duration-300 mb-2 ${selectedUser?.id === user.id ? `${theme.selected} shadow-lg scale-[1.02]` : `${theme.hover}`} ${theme.border} ${theme.shadow} backdrop-blur-lg border border-white/10`}>
                            <img src={user.avatar_url || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full" />
                            <h3>{user.email}</h3>
                            <p className="text-sm text-gray-400">{lastMsg ? lastMsg.text : "no messages yet"}</p>
                            <span className="text-xs text-gray-500">{lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString() : "" }</span>

                            <button onClick={(e) => {
                                e.stopPropagation();
                                openProfile(user);
                            }}>👤</button>

                         
                            {user.is_online ? (
                                <span className="text-green-600 text-xs ">online</span>
                            ) : (
                                <span className="text-gray-400 text-xs">last seen {user.last_seen ? new Date(user.last_seen).toLocaleTimeString() : ""}</span>
                            )
                        }
                        </div>
                        );
                   })}        
                   </div> 

{/*//bootom button*/}
                   <div className="pt-3 flex w-full border-t border-gray-700 m-10 gap-5">
                     <button onClick={() => openProfile(currentUser)} className={`px-3 py-2 ${theme.button} rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}>My Profile</button>
                    <button onClick={handleLogout} className={`px-5 py-2 ${theme.buttonred} rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}>Logout</button>
                   </div>
            </div> 
                  

{/*//chat area*/}
              <div className={`${selectedUser ? "flex" : "hidden md:flex" }  flex-1 w-0 flex-col min-h-0 ${theme.card} ${theme.chatbg} backdrop-blur-[2px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]`} >

{/*//header*/}
                <div className={`p-3  border-b ${theme.border} ${theme.shadow} backdrop-blur-lg`}>
                    <h2 className="font-semibold"> {selectedUser ? selectedUser.email : "Select a user"}</h2>
                    
                    {isTyping && (
                        <p style={{ color:"green", font:"12px"}}> typing.....</p>
                    )}
                </div>

{/*//messages*/}
                <div  className="flex-1 p-3 space-y-2 overflow-y-auto custom-scroll min-h-0 shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                
                 {messages
                  .filter(
                    (msg) => {
                        if(!msg) return false;

                    return (
                             (msg.user_id === currentUser?.id &&
                        msg.receiver_id === selectedUser?.id
                    ) ||
                    (msg.user_id === selectedUser?.id &&
                        msg.receiver_id === currentUser?.id)
                    );
                })
                    .map((msg) => (
                        <div key={msg.id} className={`flex ${msg.user_id === currentUser.id? "justify-end " : "justify-start  "}`}>

                            <div className={`p-3 rounded-2xl transition-all px-8 py-3 rounded-2xl leading-relaxed duration-200 hover-scale-[1.01] max-w-[70%] shadow-md ${msg.user_id === currentUser.id? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white" : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"}`}>

                                {msg.text === "this message was deleted" ? (
                                    <i>Message deleted</i>
                                ) : (
                                    <p>{msg.text}</p>
                                )}

                                 {msg.image_url && (
                                <img src={msg.image_url} width="150" />
                              )}

                                {msg.user_id === currentUser.id && (
                                    <button onClick={() => deleteMessage(msg.id)}>🚽</button>
                                )}


                                <span style={{fontSize:"10px", color:"darkblack"}}>
                                    {new
                                    Date(msg.created_at).toLocaleTimeString([],
                                        {
                                            hour:"2-digit",
                                            minute:"2-digit",
                                        }
                                    )}
                                </span>

                                <span className="ml-3">
                                    {msg.status === "sent" && "✓"}
                                    {msg.status === "delivered" && "✓✓"}
                                    {msg.status === "seen" && "✓✓"}
                                </span>

                               
                            </div>
                        </div>
                    ))
                }

                   <div ref={messagesEndRef} />
                </div>
             
{/*//inputt*/}
                <div className={`p-2 border-t ${theme.border} flex flex-wrap gap-2 ${theme.card} backdrop-blur-lg`}>
                    <input 
                    value={message}
                    onChange={handleTyping}
                     placeholder="type a message......" 
                     className={`flex-1 p-2 border rounded-xl ${theme.input} ${theme.border} outline-none focus:ring-2 focus:ring-cyan-400  backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,0,0,0.08)]`} 
                    onKeyDown={(e) => {
                        if(e.key === "Enter" && !e.shiftKey)
                            {
                            e.preventDefault();
                            sendMessage();
                        }
                    }} 
                    />
                    <input type="file"  onChange={(e) => setImageFile(e.target.files[0])} className={`flex-1 p-2 border rounded-xl ${theme.input} ${theme.border} outline-none focus:ring-2 focus:ring-cyan-400 `}/>
                    <button onClick={sendMessage} className={`px-5 py-2 ${theme.button} cursor-pointer rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300`}> Send</button>                 
                </div>

              </div>
              </div> 

  {/*}  //profile panel*/}
                  {selectProfile && (
                  <div
                   className={`fixed  top-[50px] right-0 h-[calc(100vh-50px)] w-full md:w-[300px] ${theme.sidebar} z-50 p-4 border-1 ${theme.border} ${theme.shadow} transition-all duration-300 overflow-y-auto backdrop-blur-xl ${mode ? "border-white/10" :" border-gray-200"} shadow-[-10_0px_30px_rgba(0,0,0,0.08)]`}
                >
                    <button onClick={closeProfile}  style={{position:"absolute",  top:"5px", right:"5px", cursor:"pointer", border:"none", background:"transparent", fontSize:"18px"
                    }}>❌</button>
    
                  <img
                  className="mt-4"
                     src={selectProfile?.avatar_url || "https://via.placeholder.com/100"}
                     width="250"
                  />

                <h3 className="mt-4 text-3xl">{selectProfile.name || "No Name"}</h3>
                <p className="mt-4 text-2xl">{selectProfile.email}</p>
                <p className="mt-4 text-sm">{selectProfile.bio || "No bio"}</p>

               
               {selectProfile?.id  === currentUser?.id && (
                <button className={`px-3 py-2 ${theme.button} mt-5 cursor-pointer rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300`} onClick={() => {                   
                    setEditMode(true);
                    setName(selectProfile?.name || "");
                    setBio(selectProfile?.bio || "");
                    
                }}>Edit Profile</button>
               )}

                </div>
               )}

               {editMode && (
             <div className="fixed inset-0 bg-black/70 items-center justify-center z-[100] ">
            <div className="w-full md:w-[400px] bg-[#111827] border border-cyan-400/40 md:ml-95 md:mt-30 mt-25 rounded-2xl p-6 shadow-[0_0_3px_rgba(34,211,238,0.250)]">
                <h2 className="text-2xl font-bold text-cyan-300 mb-5">Edit Profile</h2>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full mb-4 p-3 rounded-xl bg-[#1e293b] border border-cyan-400/20 text-white outline-none focus:border-cyan-400" />
                <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" className="w-full mb-4 p-3 rounded-xl bg-[#1e293b] border border-cyan-400/20 text-white outline-none focus:border-cyan-400"/>
                <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} placeholder="update pofile photo"  className="w-full mb-5 p-3 text-white bg-[#1e293b] border border-cyan-400/20 focus:border-cyan-400 rounded-2xl"/>

                  <div className="flax gap-3 justify-center items-center ml-8">
                    <button onClick={updateProfile} className={`flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold  rounded-xl ${theme.button} px-3 py-2 mr-3 shadow-lg hover:scale-105 transition-all duration-300`}>Save</button>
                     <button onClick={() => setEditMode(false)}  className={`flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-2 rounded-xl mr-3 shadow-lg hover:scale-105 transition-all duration-300 ${theme.button}`}>Cancel</button>
                  </div>
            </div>

            </div>

             )}
              </div>
       
    );
}

export default Chat;