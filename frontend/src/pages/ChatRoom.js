import { useNavigate } from "react-router-dom";

import { MdSend } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
import { AiOutlineMenu, AiOutlineLoading3Quarters } from "react-icons/ai";
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
  const [displayCreateRoomLoading, setDisplayCreateRoomLoading] =
    useState(false);
  const [displaySidebarLoading, setDisplaySidebarLoading] = useState(false);
  const [displayJoinRoom, setDisplayJoinRoom] = useState(false);
  const [displayJoinRoomLoading, setDisplayJoinRoomLoading] = useState(false);
  const [displayChatLoding, setDisplatChatLoading] = useState(false);

  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomNameInput, setRoomNameInput] = useState("");
  const [roomIdJoinInput, setRoomIdJoinInput] = useState("");

  const [errorCreateMessage, setErrorCreateMessage] = useState("");
  const [errorJoinMessage, setErrorJoinMessage] = useState("");

  // ====================== useEffect ======================

  // check auth and get all userRoom

  useEffect(() => {
    authCheck().then(getAllRoom());
  }, []);

  //   handle when room change

  useEffect(() => {
    setDisplatChatLoading(true);
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
      currentSocket.emit("messageControl", {
        type: "image",
        room: currentRoom,
        user: currentUser,
        message: selectedImage,
      });
      messageInput.current.value = "";
      setSelectedImage(null);
    } else {
      const messageValue = messageInput.current.value;
      messageInput.current.value = "";
      currentSocket.emit("messageControl", {
        type: "chat",
        user: currentUser,
        room: currentRoom,
        message: messageValue,
      });
    }
  };

  const handleCreateRoom = async (e) => {
    try {
      e.preventDefault();
      setDisplayCreateRoomLoading(true);
      if (roomIdInput === "" || roomNameInput === "") {
        setErrorCreateMessage("please enter all information");
        setDisplayCreateRoomLoading(false);
      } else {
        const createRoom = await axios.post(
          "http://localhost:4000/chatroom/create",
          { roomId: roomIdInput, roomName: roomNameInput },
          {
            headers: {
              Authorization: `${cookies.token}`,
            },
          }
        );
        setDisplayCreateRoom(false);
        setRoomIdInput("");
        setRoomNameInput("");
        // refetch room
        setDisplayCreateRoomLoading(false);
        getAllRoom();
      }
    } catch (err) {
      setErrorCreateMessage(err.response.data.message);
      setDisplayCreateRoomLoading(false);
      console.log("handleCreateRoomError", err);
    }
  };

  const handleJoinRoom = async (e) => {
    try {
      e.preventDefault();
      setDisplayJoinRoomLoading(true);
      if (roomIdJoinInput === "") {
        setErrorJoinMessage("please enter all information");
      } else {
        const joinRoom = await axios.post(
          "http://localhost:4000/chatroom/join",
          { roomId: roomIdJoinInput },
          {
            headers: {
              Authorization: `${cookies.token}`,
            },
          }
        );
        setRoomIdJoinInput("");
        setDisplayJoinRoom(false);

        getAllRoom();
      }
      setDisplayJoinRoomLoading(false);
    } catch (err) {
      setErrorJoinMessage(err.response.data.message);
      setDisplayJoinRoomLoading(false);
      console.log(err);
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
    setDisplatChatLoading(false);
    setAllMessage(chatHistory.data);
  };

  const authCheck = async () => {
    try {
      const chatHistory = await axios.get(`http://localhost:4000/auth`, {
        headers: {
          Authorization: `${cookies.token}`,
        },
      });
      setCurrentUser(chatHistory.data.username);
    } catch (err) {
      navigate("/login");
    }
  };

  const getAllRoom = async () => {
    try {
      setDisplaySidebarLoading(true);
      const getRoom = await axios.get(`http://localhost:4000/chatroom/`, {
        headers: {
          Authorization: `${cookies.token}`,
        },
      });

      setFilterRoom(getRoom.data);
      setDefaultRoom(getRoom.data);
      setDisplaySidebarLoading(false);
      if (getRoom.data[0]) {
        setCurrentRoom(getRoom.data[0].roomId);
      }
    } catch (err) {
      setDisplaySidebarLoading(false);
    }
  };

  // ====================== SupComponent ======================

  const createRoom = () => {
    return (
      <div className="w-[300px] h-[180px] p-[24px] bg-white rounded-lg absolute top-[50%] flex  flex-col left-[50%] translate-y-[-50%] translate-x-[-50%] shadow-2xl ">
        <HiX
          onClick={() => setDisplayCreateRoom(false)}
          className="absolute top-[16px] right-[16px] cursor-pointer "
        />
        <input
          placeholder="roomId"
          className="border-b w-[100%] outline-none mt-[8px]"
          onChange={(e) => {
            setErrorCreateMessage("");
            setRoomIdInput(e.target.value);
          }}
          value={roomIdInput}
        ></input>
        <input
          placeholder="roomName"
          className="border-b mt-[10px] w-[100%] outline-none"
          onChange={(e) => {
            setErrorCreateMessage("");
            setRoomNameInput(e.target.value);
          }}
          value={roomNameInput}
        ></input>
        {/* err message */}
        {errorCreateMessage !== "" && (
          <span className="text-red-500 absolute top-[95px]">
            {errorCreateMessage}
          </span>
        )}
        {displayCreateRoomLoading ? (
          <div className="mt-[25px] flex justify-center">
            <AiOutlineLoading3Quarters className="text-[24px] animate-spin" />
          </div>
        ) : (
          <button
            className="mt-[25px] text-[16px] font-semibold active:opacity-50"
            onClick={handleCreateRoom}
          >
            create room
          </button>
        )}
      </div>
    );
  };

  const joinRoom = () => {
    return (
      <>
        <div className="w-[300px] h-[130px] p-[24px] bg-white rounded-lg absolute top-[50%] flex  flex-col left-[50%] translate-y-[-50%] translate-x-[-50%] shadow-2xl ">
          <HiX
            onClick={() => setDisplayJoinRoom(false)}
            className="absolute top-[16px] right-[16px] cursor-pointer "
          />
          <input
            placeholder="roomId"
            className="border-b outline-none mt-[8px]"
            onChange={(e) => {
              setRoomIdJoinInput(e.target.value);
              setErrorJoinMessage("");
            }}
          ></input>
          {errorJoinMessage !== "" && (
            <span className="text-red-500 absolute top-[60px]">
              {errorJoinMessage}
            </span>
          )}
          {displayJoinRoomLoading ? (
            <div className="mt-[25px] flex justify-center">
              <AiOutlineLoading3Quarters className="text-[24px] animate-spin" />
            </div>
          ) : (
            <button
              className="mt-[25px] text-[16px] font-semibold active:opacity-50"
              onClick={handleJoinRoom}
            >
              join room
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {displayCreateRoom && createRoom()}
      {displayJoinRoom && joinRoom()}
      <div className="flex  min-h-[720px]  ">
        {/* left block */}
        <div className=" w-[350px]  h-[100vh] border-r py-[24px] overflow-y-auto">
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
          <div className="border-t mt-[15px] flex flex-col ">
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
            {displaySidebarLoading ? (
              <div className="flex justify-center relative h-[400px] ">
                <AiOutlineLoading3Quarters className="relative top-[200px] text-[60px] animate-spin" />
              </div>
            ) : (
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
            )}
          </div>
          <div>
            {/* menudetail */}
            {displayMenu ? (
              <div className="absolute bottom-[24px] py-[24px] w-[150px] left-[24px] rounded-lg shadow-2xl h-[200px] bg-white">
                <HiX
                  className="absolute right-[10px] top-[8px] cursor-pointer"
                  onClick={() => setDisplayMenu(!displayMenu)}
                />
                <div
                  className="p-[16px] text-[16px] hover:bg-blue-100 cursor-pointer font-semibold "
                  onClick={() => {
                    setDisplayMenu(false);
                    setDisplayCreateRoom(true);
                    setDisplayJoinRoom(false);
                  }}
                >
                  create room
                </div>
                <div
                  className="p-[16px] text-[16px] hover:bg-blue-100 cursor-pointer font-semibold "
                  onClick={() => {
                    setDisplayMenu(false);
                    setDisplayCreateRoom(false);
                    setDisplayJoinRoom(true);
                  }}
                >
                  join room
                </div>
              </div>
            ) : (
              // menu icon
              <div
                className="flex justify-center items-center absolute bottom-[24px]   shadow-2xl w-[75px] h-[75px] rounded-full active:opacity-50 cursor-pointer left-[24px] bg-white"
                onClick={() => setDisplayMenu(!displayMenu)}
              >
                <AiOutlineMenu className="text-[30px]" />
              </div>
            )}
          </div>
        </div>
        {/* chat room  */}
        {displayChatLoding ? (
          <div className=" grow flex justify-center items-center">
            <AiOutlineLoading3Quarters className="animate-spin text-[80px]" />
          </div>
        ) : (
          <div className=" h-[100vh] overflow-y-auto grow flex flex-col">
            <div className="border-b p-[24px] text-[24px] font-semibold flex justify-between items-center">
              <h1>Room {currentRoom}</h1>
              <div className="">
                {/* <AiOutlineMenu className="cursor-pointer active:opacity-50" /> */}
                {/* <div className=" absolute right-[100px] top-[100px] w-[200px] h-[200px] bg-black"></div> */}
              </div>
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
        )}
      </div>
    </>
  );
};

export default ChatRoom;
