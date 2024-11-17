import React from "react";
import { Link } from "react-router-dom";
import utcLogo from "../../images/logo-utc.png";

const Logo = () => {
  return (
    <Link to={`${process.env.PUBLIC_URL}/`} className="logo-link">
      <img
        className="logo-light logo-img"
        src={utcLogo}
        alt="UTC logo"
      />
      <img
        className="logo-dark logo-img"
        src={utcLogo}
        alt="UTC logo"
      />
    </Link>
  );
};

export default Logo;
