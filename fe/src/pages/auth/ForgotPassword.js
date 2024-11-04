import React, { useState } from "react";
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle, Button, PreviewCard } from "../../components/Component";
import { Spinner } from "reactstrap";

import { Link, useNavigate } from "react-router-dom";
import authApi from "../../utils/ApiAuth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(""); // Reset error message

    try {
      const response = await authApi.post("/auth/send-code-forgot-pass", { email });

      if (response.data.statusCode === 200) {
        localStorage.setItem("email_codeSent", email);
        localStorage.setItem("code_encrypted", response.data.data.code);
        navigate("/forgot-password-code");
      } else if (response.data.statusCode === 400) {
        setErrorMessage(response.data.data); // Set error message
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later."); // Set a generic error message
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
              <BlockTitle tag="h5">Forgot password</BlockTitle>
              <BlockDes>
                <p>If you forgot your password, we’ll email you instructions to reset your password.</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="default-01">
                  Email
                </label>
              </div>
              <input
                type="email"
                className={`form-control form-control-lg ${errorMessage ? "is-invalid" : ""}`}
                id="default-01"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}
            </div>
            <div className="form-group">
              <Button color="primary" size="lg" className="btn-block" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="sr-only">Sending...</span>
                  </>
                ) : (
                  "Get the code"
                )}
              </Button>
            </div>
          </form>
          <div className="form-note-s2 text-center pt-4">
            <Link to={`${process.env.PUBLIC_URL}/auth-login`}>
              <strong>Return to login</strong>
            </Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default ForgotPassword;
