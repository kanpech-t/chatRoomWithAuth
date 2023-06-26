import { useNavigate } from "react-router-dom";
import { MdSend } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
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

  const mockupRoom = ["1234", "6392", "0834", "8239", "0347"];

  // ====================== Stage ======================

  const [selectedImage, setSelectedImage] = useState(null);

  const [filterRoom, setFilterRoom] = useState(mockupRoom);

  const [currentUser, setCurrentUser] = useState("");
  const [currentRoom, setCurrentRoom] = useState("1234");
  const [currentSocket, setCurrentSocket] = useState(null);

  const [allMessage, setAllMessage] = useState([]);

  // ====================== useEffect ======================

  useEffect(() => {
    const authCheck = async () => {
      try {
        const chatHistory = await axios.get(`http://localhost:4000/auth`, {
          headers: {
            Authorization: `${cookies.token}`,
          },
        });
      } catch (err) {
        console.log("unauth");
        navigate("/login");
      }
    };
    authCheck();
  });

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
      mockupRoom.filter((data) => data.includes(searchValue))
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

  return (
    <>
      <div className="flex  min-h-[720px]  ">
        {/* left block */}
        <div className="w-[350px]  h-[100vh] border-r p-[24px]">
          {" "}
          <button
            className="cursor-pointer flex items-center text-[16px] font-semibold"
            onClick={() => {
              removeCookie("token", { path: "/", domain: "localhost" });
              navigate(-1);
            }}
          >
            <BiArrowBack className="mr-[3px]" /> Logout
          </button>
          <div className="mt-[10px] flex gap-[20px]">
            <h1 className="text-[16px] font-semibold">Current user</h1>
            <span>{currentUser}</span>
          </div>
          <div className="border-t mt-[15px]">
            {/* search input */}
            <div className="flex items-center">
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
            <div className="mt-[15px] border-t">
              {filterRoom.length === 0 && (
                <div className="flex justify-center text-[16px] font-semibold mt-[50px]">
                  No data
                </div>
              )}
              {filterRoom.map((roomId, index) => (
                <div
                  className={`border-b h-[80px] hover:bg-blue-100 cursor-pointer flex items-center font-semibold ${
                    currentRoom === roomId ? "bg-blue-100" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    setCurrentRoom(roomId);
                  }}
                >
                  RoomId {roomId}
                </div>
              ))}
            </div>
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
