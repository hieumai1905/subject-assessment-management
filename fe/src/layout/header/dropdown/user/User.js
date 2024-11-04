import React, { useState } from "react";
import UserAvatar from "../../../../components/user/UserAvatar";
import { DropdownToggle, DropdownMenu, Dropdown } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { LinkList, LinkItem } from "../../../../components/links/Links";
import { useTheme, useThemeUpdate } from "../../../provider/Theme";
import useAuthStore from "../../../../store/Userstore";

const User = () => {
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prevState) => !prevState);
  const { setLogout } = useAuthStore();
  const { user } = useAuthStore();
  const { role } = useAuthStore();
  const handleSignOut = () => {
    // setLogout();
    localStorage.clear();
    window.location.href = "/auth-login";
  };

  return (
    <Dropdown isOpen={open} className="user-dropdown" toggle={toggle}>
      <DropdownToggle
        tag="a"
        href="#toggle"
        className="dropdown-toggle"
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        <div className="user-toggle">
          <div
            className="user-avatar"
            style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden" }}
          >
            <img
              src={user.avatar_url}
              alt="User Avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div className="user-info d-none d-md-block">
            <div className="user-status">
              {(() => {
                switch (role) {
                  case "ADMIN":
                    return "Administrator";
                  case "TEACHER":
                    return "Teacher";
                  case "STUDENT":
                    return "Student";
                  case "MANAGER":
                    return "Manager";
                  default:
                    return "Unknown Role";
                }
              })()}
            </div>
            <div className="user-name dropdown-indicator">{user.username}</div>
          </div>
        </div>
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md dropdown-menu-s1">
        <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
          <div className="user-card sm">
            <div
              className="user-avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden" }}
            >
              <img
                src={user.avatar_url}
                alt="User Avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="user-info">
              <span className="lead-text">{user.fullname}</span>
              <span className="sub-text">{user.email}</span>
            </div>
          </div>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <LinkItem link="/user-profile" icon="user-alt" onClick={toggle}>
              View Profile
            </LinkItem>
            <LinkItem link="/user-profile-setting" icon="setting-alt" onClick={toggle}>
              Account Setting
            </LinkItem>

            <li>
              <a
                className={`dark-switch ${theme.skin === "dark" ? "active" : ""}`}
                href="#"
                onClick={(ev) => {
                  ev.preventDefault();
                  themeUpdate.skin(theme.skin === "dark" ? "light" : "dark");
                }}
              >
                {theme.skin === "dark" ? (
                  <>
                    <em className="icon ni ni-sun"></em>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <em className="icon ni ni-moon"></em>
                    <span>Dark Mode</span>
                  </>
                )}
              </a>
            </li>
          </LinkList>
        </div>
        <div className="dropdown-inner" onClick={handleSignOut}>
          <LinkList>
            <a href="/auth-login">
              <Icon name="signout"></Icon>
              <span>Sign Out</span>
            </a>
          </LinkList>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default User;
