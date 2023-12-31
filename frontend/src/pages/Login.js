import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { HiX } from "react-icons/hi";

import axios from "axios";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();

  // ====================== const ======================

  const API_BASE_URL = "http://localhost:4000";

  // const API_BASE_URL = "http://192.168.3.68:4000";

  // ====================== useRef ======================

  const username = useRef();
  const password = useRef();

  const registerUsername = useRef();
  const registerPassword = useRef();
  const registerConfirmPassword = useRef();

  // ====================== state ======================

  const [displayRegister, setDisplayRegister] = useState(false);
  const [displayPassword, setDisplayPassword] = useState(false);
  const [displayToast, setDisplayToast] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ====================== function  ======================

  const handleLogin = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      if (username.current.value === "" || password.current.value === "") {
        setErrorMessage("please enter all fields");
      } else {
        const post = await axios.post(
          `${API_BASE_URL}/login`,
          {
            username: username.current.value,
            password: password.current.value,
          },
          {
            withCredentials: true,
          }
        );
        username.current.value = "";
        password.current.value = "";
        navigate("/chatroom");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage(error.response.data.error);
      } else {
        setDisplayToast(true);
      }
    }
  };

  const handleRegister = async (e) => {
    try {
      e.preventDefault();
      if (
        registerPassword.current.value === "" ||
        registerConfirmPassword.current.value === "" ||
        registerUsername.current.value === ""
      ) {
        setErrorMessage("please enter all fields");
      } else if (
        registerPassword.current.value === registerConfirmPassword.current.value
      ) {
        const post = await axios.post(`${API_BASE_URL}/register/`, {
          username: registerUsername.current.value,
          password: registerPassword.current.value,
        });

        registerUsername.current.value = "";
        registerPassword.current.value = "";
        registerConfirmPassword.current.value = "";
        setDisplayRegister(false);
      } else {
        setErrorMessage("password didn't match");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage(error.response.data.error);
      } else {
        setDisplayToast(true);
      }
    }
  };

  // ====================== supComponent  ======================

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
      {displayToast && toast()}
      <div className="flex flex-col gap-[20px] justify-center items-center w-[100%] h-[100vh]">
        {!displayRegister ? (
          // login
          <div className="relative w-[600px] p-[24px] gap-[10px] h-[330px] shadow-xl rounded-lg flex flex-col">
            <div className="text-[24px] font-bold">Login</div>
            <form>
              <input
                onChange={() => setErrorMessage("")}
                ref={username}
                placeholder="username"
                className="border-b w-[100%] px-[10px] py-[3px] outline-none"
              ></input>
              <div className="relative  h-[80px]">
                <input
                  onChange={() => setErrorMessage("")}
                  type={displayPassword ? "" : "password"}
                  ref={password}
                  placeholder="password"
                  className=" border-b  px-[10px] py-[3px] outline-none w-[100%]"
                ></input>

                {displayPassword ? (
                  <AiFillEye
                    className="absolute right-[15px] top-[8px] cursor-pointer"
                    onClick={() => setDisplayPassword(!displayPassword)}
                  />
                ) : (
                  <AiFillEyeInvisible
                    className="absolute right-[15px] top-[8px] cursor-pointer"
                    onClick={() => setDisplayPassword(!displayPassword)}
                  />
                )}
                <span className="text-red-500">
                  {" "}
                  {errorMessage !== "" && errorMessage}
                </span>
              </div>
              <button
                className="text-[24px] mt-[35px] w-[100%] font-semibold  "
                onClick={(e) => handleLogin(e)}
              >
                Login
              </button>
            </form>
            <span className="self-center">
              Not a member?
              <span
                className="text-blue-400 cursor-pointer"
                onClick={() => {
                  setDisplayRegister(true);
                  setErrorMessage("");
                  username.current.value = "";
                }}
              >
                {" "}
                signup
              </span>
            </span>
          </div>
        ) : (
          // register
          <div className="w-[600px] p-[24px] gap-[10px] h-[330px] shadow-xl rounded-lg flex flex-col">
            <div className="text-[24px] font-bold"> Register</div>
            <form>
              <input
                onChange={() => setErrorMessage("")}
                ref={registerUsername}
                placeholder="username"
                className="border-b  px-[10px] py-[3px] outline-none w-[100%]"
              ></input>
              <input
                onChange={() => setErrorMessage("")}
                type="password"
                ref={registerPassword}
                placeholder="password"
                className="border-b   px-[10px] py-[3px] outline-none w-[100%]"
              ></input>
              <input
                onChange={() => setErrorMessage("")}
                type="password"
                ref={registerConfirmPassword}
                placeholder="confirm password"
                className="border-b   px-[10px] py-[3px] outline-none w-[100%]"
              ></input>
              <div className="h-[40px] text-red-500">
                {" "}
                {errorMessage !== "" && errorMessage}
              </div>
              <button
                className="text-[24px] w-[100%] font-semibold"
                onClick={(e) => handleRegister(e)}
              >
                Register
              </button>
            </form>
            <span className="self-center">
              Already member ?
              <span
                className="text-blue-400 cursor-pointer"
                onClick={() => {
                  setDisplayRegister(false);
                  setErrorMessage("");
                  registerUsername.current.value = "";
                }}
              >
                {" "}
                login form
              </span>
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
