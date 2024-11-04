import React, { useState } from "react";
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle, Button, PreviewCard } from "../../components/Component";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";

const SetNewPassword = () => {
  const [pass, setNewPassword] = useState("");
  const [confirmPass, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = localStorage.getItem("email_codeSent");
  const navigate = useNavigate();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await authApi.post("auth/new-pass-after-forgot", {
        pass,
        confirmPass,
        email,
      });

      if (response.data.statusCode === 200) {
        navigate("/auth-login");
      } else {
        toast.error(response.data.data);
      }
    } catch (error) {
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
            <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
            <img className="logo-dark logo-img logo-img-lg" src={LogoDark} alt="logo-dark" />
          </Link>
        </div>
        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h5">Set New Password</BlockTitle>
              <BlockDes>
                <p>Change your password here</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="default-01">
                  New Password
                </label>
              </div>
              <input
                type="password"
                className="form-control form-control-lg"
                id="default-01"
                placeholder="Enter new password"
                value={pass}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="form-label-group">
                <label className="form-label" htmlFor="default-01">
                  Confirm Password
                </label>
              </div>
              <input
                type="password"
                className="form-control form-control-lg"
                id="default-01"
                placeholder="Enter confirm password"
                value={confirmPass}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <Button color="primary" size="lg" className="btn-block" type="submit">
                Save changes
              </Button>
            </div>
            <ToastContainer />
          </form>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default SetNewPassword;
