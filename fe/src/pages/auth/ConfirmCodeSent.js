import React, { useState } from "react";
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle, Button, PreviewCard } from "../../components/Component";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../utils/ApiAuth";

const ForgotPasswordCode = () => {
  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State để lưu trữ thông tin lỗi
  const email = localStorage.getItem("email_codeSent");
  const sentCode = localStorage.getItem("code_encrypted");

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(""); // Reset error message

    try {
      const response = await authApi.post("/auth/check-input-code", { inputCode, email, sentCode });

      if (response.data.statusCode === 200) {
        navigate("/set-new-password");
      } else if (response.data.statusCode === 409) {
        setErrorMessage(response.data.data); // Hiển thị thông báo lỗi từ API
      } else if (response.data.statusCode === 400) {
        setErrorMessage("Invalid request. Please try again."); // Trường hợp lỗi khác
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later."); // Lỗi ngoại lệ
      console.error("Error sending reset link:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head title="Forgot-Password" />
      <Block className="nk-block-middle nk-auth-body wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Link to={process.env.PUBLIC_URL + "/"} className="logo-link">
            <img
              className="logo-light logo-img"
              src="https://fpteducationgroup.wordpress.com/wp-content/uploads/2015/03/cropped-logo-co-kem-3-sao-012.png"
              alt="logo"
              style={{ width: "200px", height: "auto" }}
            />
            <img
              className="logo-dark logo-img"
              src="https://fpteducationgroup.wordpress.com/wp-content/uploads/2015/03/cropped-logo-co-kem-3-sao-012.png"
              alt="logo"
              style={{ width: "200px", height: "auto" }}
            />
          </Link>
        </div>
        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h5">Confirm Code Sent</BlockTitle>
              <BlockDes>
                <p>Enter the code sent to your email</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="default-01">
                  Code
                </label>
              </div>
              <input
                type="text"
                className={`form-control form-control-lg ${errorMessage ? "is-invalid" : ""}`}
                id="default-01"
                placeholder="Enter your code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                required
              />
              {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}
            </div>
            <div className="form-group">
              <Button color="primary" size="lg" className="btn-block" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm"}
              </Button>
            </div>
          </form>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default ForgotPasswordCode;
