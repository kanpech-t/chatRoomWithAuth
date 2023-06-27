import { useNavigate } from "react-router-dom";

import { MdSend } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
import { AiOutlineMenu } from "react-icons/ai";
import { HiX } from "react-icons/hi";

import { useState, useRef, useEffect } from "react";
import { useCookies } from "react-cookie";

import axios from "axios";

import { io } from "socket.io-client";

const ChatRoom = () => {
  const navigate = useNavigate();

  const [cookies, removeCookie] = useCookies(["token"]);

  // ====================== useRef ======================

  const searchInput = useRef();
  const messageInput = useRef();

  // ====================== const ======================

  // ====================== Stage ======================

  const [selectedImage, setSelectedImage] = useState(null);

  const [defaultRoom, setDefaultRoom] = useState([]);
  const [filterRoom, setFilterRoom] = useState([]);

  const [currentUser, setCurrentUser] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [currentSocket, setCurrentSocket] = useState(null);

  const [allMessage, setAllMessage] = useState([]);

  const [displayMenu, setDisplayMenu] = useState(false);
  const [displayCreateRoom, setDisplayCreateRoom] = useState(false);

  // ====================== useEffect ======================

  // check auth

  useEffect(() => {
    authCheck();
    getAllRoom();
  }, []);

  //   handle when room change

  useEffect(() => {
    if (currentRoom !== "") {
      const socket = io("http://localhost:4000", {
        query: `auth_token=${cookies.token}`,
      });

      setCurrentSocket(socket);
      let username = "";
      socket.on("success", async (data) => {
        console.log(data);
        setCurrentUser(data.username);
        username = data.username;
        await getChatHistory();
        socket.emit("joinRoom", { room: currentRoom, user: data.username });
      });

      socket.on("messageControl", (data) => {
        setAllMessage((allMessage) => [...allMessage, data]);
      });

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      return () => {
        socket.emit("leftRoom", {
          room: currentRoom,
          type: "inform",
          message: `${username} has left the chat`,
          from: username,
        });
        socket.disconnect();
      };
    }
  }, [currentRoom]);

  // ====================== Function ======================

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = searchInput.current.value;
    searchInput.current.value = "";

    setFilterRoom(() =>
      defaultRoom.filter((data) => data.roomId.includes(searchValue))
    );
  };

  const handleSentMessage = (e) => {
    e.preventDefault();

    if (selectedImage) {
      currentSocket.emit("image", {
        room: currentRoom,
        user: currentUser,
        img: selectedImage,
      });
      messageInput.current.value = "";
      setSelectedImage(null);
    } else {
      const messageValue = messageInput.current.value;
      messageInput.current.value = "";
      currentSocket.emit("messageControl", {
        user: currentUser,
        room: currentRoom,
        message: messageValue,
        img: selectedImage ? selectedImage : null,
      });
    }
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  const getChatHistory = async () => {
    setAllMessage([]);
    const chatHistory = await axios.get(
      `http://localhost:4000/chatroom/${currentRoom}`,
      {
        headers: {
          Authorization: `${cookies.token}`,
        },
      }
    );

    setAllMessage(chatHistory.data);
  };

  const authCheck = async () => {
    try {
      const chatHistory = await axios.get(`http://localhost:4000/auth`, {
        headers: {
          Authorization: `${cookies.token}`,
        },
      });
    } catch (err) {
      navigate("/login");
    }
  };

  const getAllRoom = async () => {
    try {
      const getRoom = await axios.get(`http://localhost:4000/chatroom/`, {
        headers: {
          Authorization: `${cookies.token}`,
        },
      });
      setFilterRoom(getRoom.data);
      setDefaultRoom(getRoom.data);
    } catch (err) {}
  };

  // ====================== SupComponent ======================

  const createRoom = () => {
    return (
      <div className="w-[300px] h-[150px] p-[24px] bg-white rounded-lg absolute top-[50%] flex justify-center flex-col left-[50%] translate-y-[-50%] translate-x-[-50%] shadow-2xl ">
        <HiX
          onClick={() => setDisplayCreateRoom(false)}
          className="absolute top-[16px] right-[16px] cursor-pointer "
        />
        <input
          placeholder="roomId"
          className="border-b w-[100%] outline-none"
        ></input>
        <input
          placeholder="roomName"
          className="border-b mt-[10px] w-[100%] outline-none"
        ></input>
        <button className="mt-[10px] text-[16px] font-semibold ">
          create room
        </button>
      </div>
    );
  };

  return (
    <>
      {displayCreateRoom && createRoom()}
      <div className="flex  min-h-[720px]  ">
        {/* left block */}
        <div className="w-[350px]  h-[100vh] border-r py-[24px]">
          {" "}
          <button
            className="cursor-pointer flex items-center text-[16px] px-[24px] font-semibold"
            onClick={() => {
              removeCookie("token", { path: "/", domain: "localhost" });
              navigate(-1);
            }}
          >
            <BiArrowBack className="mr-[3px]" /> Logout
          </button>
          <div className="mt-[10px] flex gap-[20px] px-[24px]">
            <h1 className="text-[16px] font-semibold">Current user</h1>
            <span>{currentUser}</span>
          </div>
          <div className="border-t mt-[15px] ">
            {/* search input */}
            <div className="flex items-center px-[24px]">
              <form>
                <input
                  ref={searchInput}
                  placeholder="search by roomId"
                  className={`outline-none mt-[10px] border-b`}
                ></input>
                <button
                  className="ml-[10px] cursor-pointer active:text-blue-400 "
                  onClick={(e) => handleSearch(e)}
                >
                  search
                </button>
              </form>
            </div>
            {/* room */}
            <div className="mt-[15px] border-t ">
              {filterRoom.length === 0 && (
                <div className="flex justify-center text-[16px] font-semibold mt-[50px]">
                  No data
                </div>
              )}
              {filterRoom.map((data, index) => (
                <div
                  className={`px-[24px] border-b h-[80px] hover:bg-blue-100 cursor-pointer flex items-center font-semibold ${
                    currentRoom === data.roomId ? "bg-blue-100" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    setCurrentRoom(data.roomId);
                  }}
                >
                  {data.roomName} Id {data.roomId}
                </div>
              ))}
            </div>
          </div>
          <div>
            {/* menudetail */}
            {displayMenu ? (
              <div className="absolute bottom-[24px] py-[24px] w-[150px] left-[24px] rounded-lg shadow-2xl h-[200px] ">
                <HiX
                  className="absolute right-[10px] top-[8px] cursor-pointer"
                  onClick={() => setDisplayMenu(!displayMenu)}
                />
                <div
                  className="p-[16px] text-[16px] hover:bg-blue-100 cursor-pointer font-semibold"
                  onClick={() => setDisplayCreateRoom(true)}
                >
                  create room
                </div>
                <div className="p-[16px] text-[16px] hover:bg-blue-100 cursor-pointer font-semibold">
                  join room
                </div>
              </div>
            ) : (
              // menu icon
              <div
                className="flex justify-center items-center absolute bottom-[24px]   shadow-2xl w-[75px] h-[75px] rounded-full active:opacity-50 cursor-pointer left-[24px]"
                onClick={() => setDisplayMenu(!displayMenu)}
              >
                <AiOutlineMenu className="text-[30px]" />
              </div>
            )}
          </div>
        </div>
        {/* chat room  */}
        <div className=" h-[100vh] overflow-y-auto grow flex flex-col">
          <div className="border-b p-[24px] text-[24px] font-semibold">
            <h1>Room {currentRoom}</h1>
          </div>
          <div className="p-[24px] flex flex-col grow">
            <div className="grow ">
              {allMessage.map((data, index) => {
                if (data.type === "inform") {
                  return (
                    <div className="flex justify-center">{data.content}</div>
                  );
                }
                if (data.from !== currentUser) {
                  return (
                    <div
                      key={index}
                      className="min-h-[75px] bg-blue-100 mb-[10px] w-[150px] rounded-md p-[5px]"
                    >
                      <h1 className=" text-[16px] font-semibold">
                        {data.from}
                      </h1>
                      {data.type === "image" ? (
                        <img
                          key={index}
                          src={data.content}
                          alt="Base64 Image"
                        />
                      ) : (
                        <div className="break-words w-[140px]">
                          {data.content}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="flex justify-end">
                      <div
                        key={index}
                        className="min-h-[75px] bg-blue-200 mb-[10px] w-[150px] rounded-md p-[5px] "
                      >
                        <h1 className=" text-[16px] font-semibold">
                          {data.from}
                        </h1>
                        {data.type === "image" ? (
                          <img
                            key={index}
                            src={data.content}
                            alt="Base64 Image"
                          />
                        ) : (
                          <div className="break-words w-[140px]">
                            {data.content}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            <form className="flex items-center ">
              <input
                ref={messageInput}
                className="outline-none grow border-b mr-[20px]"
                placeholder="send a message"
              ></input>
              {selectedImage ? (
                <img
                  src={selectedImage}
                  className="w-[150px] mr-[15px]"
                  alt="Base64 Image"
                />
              ) : (
                <label for="file-input" className="cursor-pointer mr-[15px]">
                  Choose File
                </label>
              )}

              <input
                id="file-input"
                type="file"
                className="hidden"
                name="myImage"
                onChange={async (event) => {
                  const file = event.target.files[0];

                  try {
                    const base64Data = await fileToBase64(file);
                    setSelectedImage(base64Data);
                  } catch (error) {
                    console.error("Error converting file to base64:", error);
                  }
                }}
              />
              <button onClick={(e) => handleSentMessage(e)}>
                <MdSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
