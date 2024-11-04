import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/Userstore";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

const handleGoogleLoginSuccess = async (response) => {
  const decoded = jwtDecode(response.credential);
  const userInfo = {
    email: decoded.email,
    email_verified: decoded.email_verified,
    family_name: decoded.family_name,
    given_name: decoded.given_name,
    iss: decoded.iss,
    name: decoded.name,
    picture: decoded.picture,
  };

  try {
    const loginResponse = await authApi.post("/auth/login-by-google", userInfo);
    console.log("Backend response:", loginResponse.data.data);

    if (loginResponse.data.data === false && loginResponse.data.statusCode === 200) {
      navigate("/auth-register", { state: { userInfo } });
      setTimeout(() => {
        toast.info("Your email has to be registered in the system. Please complete your registration!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }, 1000);
      return;
    } else if (loginResponse.data.statusCode !== 200) {
      // Display the data field in the toast message
      toast.error(loginResponse.data.data, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setLogin(loginResponse.data.data);
      localStorage.setItem("token", loginResponse.data.data.token);
      let role = loginResponse.data.data?.role;

      if (role === "TEACHER" || role === "STUDENT") {
        navigate("/my-classes");
      } else if (role === "ADMIN") {
        navigate("/user-list");
      } else {
        navigate("/subject-list");
      }
    }
  } catch (error) {
    // Check if error response is available
    if (error.response) {
      // Display the data field from the error response
      toast.error(error.response.data.data, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      toast.error("An unexpected error occurred.", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }
};



  const handleGoogleLoginFailure = (error) => {
    console.error("Google login failed", error);
  };

  return (
    <div>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure} />
        <ToastContainer />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleLoginButton;
