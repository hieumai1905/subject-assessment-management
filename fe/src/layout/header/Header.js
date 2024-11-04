import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import Toggle from "../sidebar/Toggle";
import Logo from "../logo/Logo";
import User from "./dropdown/user/User";
import Notification from "./dropdown/notification/Notification";
import { useTheme, useThemeUpdate } from "../provider/Theme";
import useAuthStore from "../../store/Userstore";
import authApi from "../../utils/ApiAuth";

const Header = ({ fixed, className, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, subjectId, milestoneId } = useParams();
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const isAuth = useAuthStore((state) => state.isAuth);

  const [classCode, setClassCode] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [milestoneTitle, setMilestoneTitle] = useState("");

  useEffect(() => {
    const fetchClassById = async () => {
      try {
        const response = await authApi.get(`/class/get-by-id/${id}`);
        if (response.data.statusCode === 200) {
          setClassCode(response.data.data.classCode);
          setClassId(response.data.data.id);
        }
      } catch (error) {
        console.error("Failed to fetch class details:", error);
      }
    };

    const fetchSubjectById = async () => {
      try {
        const response = await authApi.get(`/subjects/get-by-id/${subjectId}`);
        if (response.data.statusCode === 200) {
          setSubjectCode(response.data.data.subjectCode);
        }
      } catch (error) {
        console.error("Failed to fetch subject details:", error);
      }
    };

    const fetchMilestoneById = async () => {
      try {
        const response = await authApi.get(`/milestone/get-by-id/${milestoneId}`);
        if (response.data.statusCode === 200) {
          setMilestoneTitle(response.data.data.milestone.title);
        }
      } catch (error) {
        console.error("Failed to fetch milestone details:", error);
      }
    };

    if (id) {
      fetchClassById();
    } else if (subjectId) {
      fetchSubjectById();
    } else if (milestoneId) {
      fetchMilestoneById();
    }
  }, [id, subjectId, milestoneId]);

  const headerClass = classNames({
    "nk-header": true,
    "nk-header-fixed": fixed,
    [`is-light`]: theme.header === "white",
    [`is-${theme.header}`]: theme.header !== "white" && theme.header !== "light",
    [`${className}`]: className,
  });

  const navigateToLogin = () => {
    navigate("/auth-login");
  };
  const navigateToRegister = () => {
    navigate("/auth-register");
  };

  const breadcrumbNameMap = {
    "class-list": "Class List",
    "my-classes": "My Classes",
    "subject-list": "Subject List",
    "milestone-list": "Milestone List",
    "subject-detail": subjectCode || "Subject Detail",
    "milestone-details": milestoneTitle || "Milestone Detail",
    "class-detail": classCode || "Class Detail",
  };
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((item) => item);

    return (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          {pathnames.map((value, index) => {
            let to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            let breadcrumbName;
            if (index === 1 && value === "class-list") {
              breadcrumbName = "Class List";
            } else if (index === 2 && pathnames[index - 1] === "class-list") {
              breadcrumbName = classCode || "Detail"; // Use classCode if available
            } else if (index === 2 && pathnames[index - 1] === "subject-list") {
              breadcrumbName = subjectCode;
            } else if (index === 3 && pathnames[index - 2] === "class-list") {
              breadcrumbName = classCode || "Detail";
            } else if (index === 3 && pathnames[index - 2] === "user-list") {
              breadcrumbName = breadcrumbNameMap["user-detail"];
            } else if (index === 2 && pathnames[index - 1] === "milestone-list") {
              breadcrumbName = milestoneTitle || "Detail";
              if (value === "milestone-details" && milestoneId) {
                to = `/milestone-list/milestone-details/${milestoneId}`;
              }
            } else if (value === "get-by-id") {
              breadcrumbName = "Detail";
            } else {
              breadcrumbName = value;
            }

            const isClassDetail = index === 2 && pathnames[index - 1] === "class-list";

            // Trường hợp DETAIL không thể nhấp vào
            if (breadcrumbName === "Detail") {
              return (
                <li key={to} className="breadcrumb-item active" aria-current="page">
                  {breadcrumbName}
                </li>
              );
            }

            return isLast || value.includes("detail") || isClassDetail ? (
              <li key={to} className="breadcrumb-item active" aria-current="page">
                {breadcrumbName}
              </li>
            ) : (
              <li key={to} className="breadcrumb-item">
                <Link
                  to={to}
                  onClick={(e) => {
                    if (to === location.pathname) {
                      e.preventDefault();
                      window.location.reload();
                    }
                  }}
                >
                  {breadcrumbName}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };

  return (
    <div className={headerClass}>
      <div className="container-fluid">
        <div className="nk-header-wrap d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="nk-menu-trigger d-xl-none ms-n1">
              <Toggle
                className="nk-nav-toggle nk-quick-nav-icon d-xl-none ms-n1"
                icon="menu"
                click={themeUpdate.sidebarVisibility}
              />
            </div>
            <div className="nk-header-brand d-xl-none">
              <Logo />
            </div>

            <div className="breadcrumb-container ms-3">{isAuth && generateBreadcrumbs()}</div>
          </div>
          <div className="nk-header-tools">
            {isAuth ? (
              <ul className="nk-quick-nav">
                <li className="user-dropdown">
                  <User />
                </li>
              </ul>
            ) : (
              <div>
                <button className="btn btn-primary me-3" onClick={navigateToLogin}>
                  Sign In
                </button>
                <button className="btn btn-success" onClick={navigateToRegister}>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
