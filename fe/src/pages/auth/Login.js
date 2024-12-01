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
      setError("Xảy ra lỗi khi đăng nhập");
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Đăng nhập" />
      <Block className="nk-block-middle nk-auth-body wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Link to="/" className="logo-link">
            <img className="logo-light logo-img" src={utcLogo} alt="logo" />
            <img className="logo-dark logo-img" src={utcLogo} alt="logo" />
          </Link>
        </div>

        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h4">Đăng Nhập</BlockTitle>
              {/* <BlockDes>
          <p>Truy cập Hệ Thống Chấm Điểm FPT bằng email và mật khẩu của bạn</p>
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
                  Email hoặc Tên Người Dùng
                </label>
              </div>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="default-01"
                  {...register("name", { required: "Trường này là bắt buộc" })}
                  placeholder="Nhập email hoặc tên người dùng của bạn"
                  className="form-control-lg form-control"
                />
                {errors.name && <span className="invalid">{errors.name.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Mật Khẩu
                </label>
                {/* <Link className="link link-primary link-sm" to="/auth-reset">
                  Quên mật khẩu?
                </Link> */}
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
                  {...register("passcode", { required: "Trường này là bắt buộc" })}
                  placeholder="Nhập mật khẩu của bạn"
                  className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                />
                {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <Button size="lg" className="btn-block" type="submit" color="primary">
                {loading ? <Spinner size="sm" color="light" /> : "Đăng Nhập"}
              </Button>
            </div>
          </Form>
        </PreviewCard>
      </Block>

      <AuthFooter />
    </>
  );
};

export default Login;
