import React, { useState } from "react";
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  Icon,
  PreviewCard,
} from "../../components/Component";
import { Form, Spinner, Alert } from "reactstrap";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../utils/ApiAuth";
import useAuthStore from "../../store/Userstore";
import GoogleLoginButton from "./GoogleSSO";
import utcLogo from "../../images/logo-utc.png";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

  const [errorVal, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onFormSubmit = async (formData) => {
    setLoading(true);
    const data = {
      username: formData.name,
      password: formData.passcode,
    };
    try {
      const response = await authApi.post("/auth/login", data);
      if (response.data.statusCode === 400) {
        setError(response.data.data);
        setLoading(false);
        return;
      } else if (response.data.statusCode !== 200) {
        setError(response.data.data);
        setLoading(false);
        return;
      }
      setLogin(response.data.data);
      let role = response.data.data?.role;
      if (role === "TEACHER" || role === "STUDENT") {
        navigate("/my-classes");
      } else if (role === "ADMIN") {
        navigate("/dash-board");
      } else {
        navigate("/dash-board");
      }
      localStorage.setItem("token", response.data.data.token);
    } catch (error) {
      setError("Cannot login with credentials");
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Login" />
      <Block className="nk-block-middle nk-auth-body wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Link to="/" className="logo-link">
            <img
              className="logo-light logo-img"
              src={utcLogo}
              alt="logo"
            />
            <img
              className="logo-dark logo-img"
              src={utcLogo}
              alt="logo"
            />
          </Link>
        </div>

        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h4">Sign-In</BlockTitle>
              {/* <BlockDes>
                <p>Access FPT Grading System using your email and password</p>
              </BlockDes> */}
            </BlockContent>
          </BlockHead>
          {errorVal && (
            <div className="mb-3">
              <Alert color="danger" className="alert-icon">
                <Icon name="alert-circle" /> {errorVal}{" "}
              </Alert>
            </div>
          )}
          <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="default-01">
                  Email or Username
                </label>
              </div>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="default-01"
                  {...register("name", { required: "This field is required" })}
                  placeholder="Enter your email address or username"
                  className="form-control-lg form-control"
                />
                {errors.name && <span className="invalid">{errors.name.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <Link className="link link-primary link-sm" to="/auth-reset">
                  Forgot password?
                </Link>
              </div>
              <div className="form-control-wrap">
                <a
                  href="#password"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setPassState(!passState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                >
                  <Icon name="eye" className="passcode-icon icon-show"></Icon>

                  <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                </a>
                <input
                  type={passState ? "text" : "password"}
                  id="password"
                  {...register("passcode", { required: "This field is required" })}
                  placeholder="Enter your password"
                  className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                />
                {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <Button size="lg" className="btn-block" type="submit" color="primary">
                {loading ? <Spinner size="sm" color="light" /> : "Sign in"}
              </Button>
            </div>
          </Form>
          {/* <div className="form-note-s2 text-center pt-4">
            <Link to={`${process.env.PUBLIC_URL}/auth-register`}>Register</Link>
          </div>
          <div className="text-center pt-4 pb-3">
            <h6 className="overline-title overline-title-sap">
              <span>OR</span>
            </h6>
          </div> */}
          {/* <ul className="nav justify-center gx-4">
            <li className="nav-item">
              <GoogleLoginButton />
            </li>
          </ul> */}
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default Login;
