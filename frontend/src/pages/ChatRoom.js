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

  const API_BASE_URL = "http://localhost:4000";

  // const API_BASE_URL = "http://192.168.3.68:4000";

  // ====================== stage ======================

  const [selectedImage, setSelectedImage] = useState(null);

  const [defaultRoom, setDefaultRoom] = useState([]);
  const [filterRoom, setFilterRoom] = useState([]);

  const [currentUser, setCurrentUser] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [currentSocket, setCurrentSocket] = useState(null);

  const [allMessage, setAllMessage] = useState([]);

  // display stage

  const [displayMenu, setDisplayMenu] = useState(false);
  const [displayMenuChatRoom, setDisplayMenuChatRoom] = useState(false);

  const [displayCreateRoom, setDisplayCreateRoom] = useState(false);
  const [displayCreateRoomLoading, setDisplayCreateRoomLoading] =
    useState(false);

  const [displaySidebarLoading, setDisplaySidebarLoading] = useState(false);

  const [displayJoinRoom, setDisplayJoinRoom] = useState(false);
  const [displayJoinRoomLoading, setDisplayJoinRoomLoading] = useState(false);

  const [displayChatLoading, setDisplayChatLoading] = useState(false);

  const [displayToast, setDisplayToast] = useState(false);
  // ========================

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
    setDisplayChatLoading(true);
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const getChatHistory = async () => {
      try {
        setSelectedImage(null);
        setAllMessage([]);
        const chatHistory = await axios.get(
          `${API_BASE_URL}/chatroom/${currentRoom}`,
          {
            cancelToken: source.token,
            headers: {
              Authorization: `${cookies.token}`,
            },
          }
        );
        setDisplayChatLoading(false);
        setAllMessage(chatHistory.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          setDisplayChatLoading(false);
          setDisplayToast(true);
        }
      }
    };

    if (currentRoom !== "") {
      const socket = io(API_BASE_URL, {
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
        source.cancel(
          "Request canceled due to component unmount or effect re-trigger"
        );

        socket.disconnect();
      };
    }
  }, [currentRoom]);

  // ====================== function ======================

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
      currentSocket.emit(
        "messageControl",
        {
          type: "image",
          room: currentRoom,
          user: currentUser,
          message: selectedImage,
        },
        (error) => {
          if (error) {
            setDisplayToast(true);
            console.log("sent message fail");
          }
        }
      );
      messageInput.current.value = "";
      setSelectedImage(null);
    } else {
      if (messageInput.current.value.length > 1000) {
        setDisplayToast(true);
        messageInput.current.value = "";
      } else {
        const messageValue = messageInput.current.value;
        messageInput.current.value = "";
        currentSocket.emit(
          "messageControl",
          {
            type: "chat",
            user: currentUser,
            room: currentRoom,
            message: messageValue,
          },
          (error) => {
            if (error) {
              console.log("sent message fail");
            }
          }
        );
      }
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
          `${API_BASE_URL}/chatroom/create`,
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

      err.response.data.message || setDisplayToast(true);
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
          `${API_BASE_URL}/chatroom/join`,
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

      err.response.data.message || setDisplayToast(true);

      console.log(err);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      setDisplayMenuChatRoom(false);
      setDisplayChatLoading(true);
      const leaveRoom = await axios.delete(`${API_BASE_URL}/chatroom/leave`, {
        headers: {
          Authorization: `${cookies.token}`,
        },
        data: { roomId: currentRoom },
      });

      getAllRoom();
    } catch (err) {
      setDisplayToast(true);
      setDisplayChatLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      setDisplayMenuChatRoom(false);
      setDisplayChatLoading(true);
      const deleteRoom = await axios.delete(`${API_BASE_URL}/chatroom/delete`, {
        headers: {
          Authorization: `${cookies.token}`,
        },
        data: { roomId: currentRoom },
      });
      getAllRoom();
    } catch (err) {
      setDisplayToast(true);
      setDisplayChatLoading(false);
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

  const authCheck = async () => {
    try {
      const chatHistory = await axios.get(`${API_BASE_URL}/auth`, {
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
      setAllMessage([]);
      setCurrentRoom("");
      setDisplaySidebarLoading(true);
      const getRoom = await axios.get(`${API_BASE_URL}/chatroom/`, {
        headers: {
          Authorization: `${cookies.token}`,
        },
      });

      setFilterRoom(getRoom.data);
      setDefaultRoom(getRoom.data);
      setDisplaySidebarLoading(false);
      if (getRoom.data[0]) {
        setCurrentRoom(getRoom.data[0].roomId);
      } else {
        setDisplayChatLoading(false);
      }
    } catch (err) {
      setDisplaySidebarLoading(false);
      setDisplayToast(true);
    }
  };

  // ====================== supComponent ======================

  const createRoom = () => {
    return (
      <div className="z-[100] w-[300px] h-[180px] p-[24px] bg-white rounded-lg absolute top-[50%] flex  flex-col left-[50%] translate-y-[-50%] translate-x-[-50%] shadow-2xl ">
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
        <div className="z-[100] w-[300px] h-[130px] p-[24px] bg-white rounded-lg absolute top-[50%] flex  flex-col left-[50%] translate-y-[-50%] translate-x-[-50%] shadow-2xl ">
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

  const toast = () => {
    return (
      <>
        <div className="w-[600px] flex px-[24px] items-center h-[50px] bg-white rounded-lg border-red-500 border text-red-500 absolute left-[50%] top-[50px] translate-x-[-50%] justify-between">
          something went wrong please try again
          <HiX
            className="text-black cursor-pointer"
            onClick={() => setDisplayToast(false)}
          />
        </div>
      </>
    );
  };

  return (
    <>
      {/* display toast when error */}
      {displayToast && toast()}
      {displayCreateRoom && createRoom()}
      {displayJoinRoom && joinRoom()}
      <div className="flex  min-h-[720px]  ">
        {/* left block */}
        <div className=" w-[350px]  min-w-[350px] h-[100vh] border-r pt-[24px] overflow-y-auto flex flex-col">
          <div className="mt-[10px] flex gap-[20px] px-[24px]">
            <h1 className="text-[16px] font-semibold">Current user</h1>
            <span>{currentUser}</span>
          </div>
          <div className="border-t mt-[15px] flex flex-col grow">
            {/* search input */}
            <div className="flex items-center px-[24px]">
              <form className="border-b">
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
              <div className="flex justify-center relative h-[400px] grow ">
                <AiOutlineLoading3Quarters className="relative top-[200px] text-[60px] animate-spin" />
              </div>
            ) : (
              <div className="mt-[15px] border-t h-[100%]">
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
          <div className="h-[90px]">
            {/* menudetail */}
            {displayMenu && (
              <div className="absolute bottom-[75px] py-[16px] w-[200px] left-[24px] rounded-lg shadow-2xl h-[160px] bg-white px-[12px]">
                <div
                  className="flex items-center px-[16px] mt-[6px] h-[32px] rounded-lg text-[16px] hover:bg-blue-100 cursor-pointer font-semibold "
                  onClick={() => {
                    setDisplayMenu(false);
                    setDisplayCreateRoom(true);
                    setDisplayJoinRoom(false);
                  }}
                >
                  Create room
                </div>
                <div
                  className="flex items-center px-[16px] text-[16px] h-[32px] rounded-lg mt-[10px]  hover:bg-blue-100 cursor-pointer font-semibold "
                  onClick={() => {
                    setDisplayMenu(false);
                    setDisplayCreateRoom(false);
                    setDisplayJoinRoom(true);
                  }}
                >
                  Join room
                </div>
                <div
                  className="cursor-pointer flex h-[32px] rounded-lg hover:bg-blue-100 mt-[10px] items-center text-[16px] px-[16px] font-semibold text-red-500"
                  onClick={() => {
                    removeCookie("token", { path: "/", domain: "localhost" });
                    navigate("/login");
                  }}
                >
                  Logout
                </div>
              </div>
            )}
            {/* // menu icon */}
            <div
              className="flex border-t items-center px-[24px]   h-[75px]  cursor-pointer left-[24px] bg-white"
              onClick={() => setDisplayMenu(!displayMenu)}
            >
              <AiOutlineMenu className="text-[30px]" />
            </div>
          </div>
        </div>
        {/* chat room  */}
        {displayChatLoading ? (
          <div className=" grow flex justify-center items-center">
            <AiOutlineLoading3Quarters className="animate-spin text-[80px]" />
          </div>
        ) : (
          <>
            {currentRoom !== "" ? (
              <div className=" h-[100vh] overflow-y-auto grow flex flex-col">
                {/* header */}
                <div className="border-b p-[24px] text-[24px] font-semibold flex justify-between items-center">
                  <h1>Room {currentRoom}</h1>
                  <div className="">
                    <AiOutlineMenu
                      className="cursor-pointer active:opacity-50"
                      onClick={() => {
                        setDisplayMenuChatRoom(!displayMenuChatRoom);
                      }}
                    />
                    {/* chatMenu */}
                    {displayMenuChatRoom && (
                      <div className=" absolute right-[25px] top-[55px] w-[200px] h-[114px] bg-white drop-shadow-lg rounded-md py-[16px] px-[12px]">
                        <div
                          className="text-[16px] h-[32px] rounded-lg flex px-[16px] items-center hover:bg-blue-100 cursor-pointer"
                          onClick={handleLeaveRoom}
                        >
                          leave chat
                        </div>
                        <div
                          className="text-[16px] h-[32px] rounded-lg flex px-[16px] items-center hover:bg-blue-100 mt-[10px] cursor-pointer text-red-500"
                          onClick={handleDeleteRoom}
                        >
                          delete chat
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* chat */}
                <div className="px-[24px] pb-[24px] flex flex-col grow">
                  <div className="grow pt-[10px]">
                    {allMessage.map((data, index) => {
                      if (data.type === "inform") {
                        return (
                          <div className="flex justify-center">
                            {data.content}
                          </div>
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
                  <form className="flex items-center border-t min-h-[50px] h-auto pt-[16px]">
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
                      <label
                        for="file-input"
                        className="cursor-pointer mr-[15px]"
                      >
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
                        // max file size 4Mb depend on Max socket buffer
                        if (event.target.files[0].size > 4 * 1024 * 1024) {
                          setDisplayToast(true);
                        } else {
                          try {
                            const base64Data = await fileToBase64(file);
                            setSelectedImage(base64Data);
                          } catch (error) {
                            console.error(
                              "Error converting file to base64:",
                              error
                            );
                          }
                        }
                      }}
                    />
                    <button onClick={(e) => handleSentMessage(e)}>
                      <MdSend />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[100vh] text-[24px] font-semibold w-[100%]">
                No room
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ChatRoom;
