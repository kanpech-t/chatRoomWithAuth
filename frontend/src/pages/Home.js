import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

function Home() {
  const [roomId, setRoomId] = useState("123");
  const [arrayData, setArrayData] = useState([]);

  const getdata = async () => {
    try {
      const result = await axios("http://localhost:4000/products/");
      console.log(result.data);
      setArrayData(result.data);
    } catch (err) {
      console.log(err);
    }
  };

  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdProce] = useState(0);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const postData = async () => {
    try {
      const post = await axios.post("http://localhost:4000/products/", {
        prod_name: prodName,
        prod_desc: prodDesc,
        prod_price: prodPrice,
      });
      getdata();
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = () => {};

  return (
    <div>
      Home
      <div>
        roomID
        <div
          onClick={() => {
            setRoomId("123");
          }}
        >
          123
        </div>
        <div
          onClick={() => {
            setRoomId("456");
          }}
        >
          456
        </div>
      </div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={getdata} className="bg-slate-500 w-[120px] h-[60px]">
        refetch some data
      </button>
      <div className="w-[300px] h-[300px] bg-blue-500">
        <h1>form input</h1>
        <div className="flex flex-col gap-[5px]">
          <input
            onChange={(e) => setProdName(e.target.value)}
            placeholder="prod_name"
          ></input>
          <input
            placeholder="prod_desc"
            onChange={(e) => setProdDesc(e.target.value)}
          ></input>
          <input
            placeholder="prod_price"
            type="number"
            onChange={(e) => setProdProce(e.target.value)}
          ></input>
          <div
            className="w-[100px] h-[50px] cursor-pointer active:opacity-25 bg-orange-200"
            onClick={postData}
          >
            Save
          </div>
        </div>
      </div>
      <div className="bg-orange-200 w-[300px] h-[200px]">
        <h1 className="text-[30px] ">all data</h1>
        {arrayData.map((data, index) => (
          <div key={index} className="mt-[10px] bg-slate-400">
            prodName {data.prod_name}
            <br />
            prodDesc {data.prod_desc}
            <br />
            prodPrice {data.prod_price}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
