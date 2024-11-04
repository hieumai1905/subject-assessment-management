import React from "react";
import {Link} from "react-router-dom";

const Logo = () => {
  return (
    <Link to={`${process.env.PUBLIC_URL}/`} className="logo-link">
      <img
        className="logo-light logo-img"
        src="https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111jlW/logo-truong-dai-hoc-fpt-university_043152077.png"
        alt="logo"
      />
      <img
        className="logo-dark logo-img"
        src="https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111jlW/logo-truong-dai-hoc-fpt-university_043152077.png"
        alt="logo"
      />
    </Link>
  );
};

export default Logo;
