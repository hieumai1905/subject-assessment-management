import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../../components/Component";
import useAuthStore from "../../../store/Userstore";

const UserProfileAside = ({ updateSm, sm }) => {
  const { user } = useAuthStore(); 
  const [profileName, setProfileName] = useState(user.fullname);

  useEffect(() => {
    sm ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [sm]);

  return (
    <div className="card-inner-group">
      <div className="card-inner">
        <div className="user-card">
          <div
            className="user-avatar"
            style={{ width: "70px", height: "70px", borderRadius: "50%", overflow: "hidden" }}
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
            <span className="lead-text">{profileName}</span>
            <span className="sub-text">{user.email}</span>
          </div>
          <div className="user-action">
            {/* <UncontrolledDropdown>
              <DropdownToggle tag="a" className="btn btn-icon btn-trigger me-n2">
                <Icon name="more-v"></Icon>
              </DropdownToggle>
              <DropdownMenu end>
                <ul className="link-list-opt no-bdr">
                  <li>
                    <DropdownItem
                      tag="a"
                      href="#dropdownitem"
                      onClick={(ev) => {
                        ev.preventDefault();
                      }}
                    >
                      <Icon name="camera-fill"></Icon>
                      <span>Change Photo</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      href="#dropdownitem"
                      onClick={(ev) => {
                        ev.preventDefault();
                      }}
                    >
                      <Icon name="edit-fill"></Icon>
                      <span>Update Profile</span>
                    </DropdownItem>
                  </li>
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown> */}
          </div>
        </div>
      </div>
      <div className="card-inner">
        {/* <div className="user-account-info py-0">
          <h6 className="overline-title-alt">Nio Wallet Account</h6>
          <div className="user-balance">
            12.395769 <small className="currency currency-btc">BTC</small>
          </div>
          <div className="user-balance-sub">
            Locked{" "}
            <span>
              0.344939 <span className="currency currency-btc">BTC</span>
            </span>
          </div>
        </div> */}
      </div>
      <div className="card-inner p-0">
        <ul className="link-list-menu">
          <li onClick={() => updateSm(false)}>
            <Link
              to={`${process.env.PUBLIC_URL}/user-profile`}
              className={window.location.pathname === `${process.env.PUBLIC_URL}/user-profile` ? "active" : ""}
            >
              <Icon name="user-fill-c"></Icon>
              <span>Personal Information</span>
            </Link>
          </li>
          {/* <li onClick={() => updateSm(false)}>
            <Link
              to={`${process.env.PUBLIC_URL}/user-profile-notification`}
              className={
                window.location.pathname === `${process.env.PUBLIC_URL}/user-profile-notification` ? "active" : ""
              }
            >
              <Icon name="bell-fill"></Icon>
              <span>Notification</span>
            </Link>
          </li> */}
          {/* <li onClick={() => updateSm(false)}>
            <Link
              to={`${process.env.PUBLIC_URL}/user-profile-activity`}
              className={window.location.pathname === `${process.env.PUBLIC_URL}/user-profile-activity` ? "active" : ""}
            >
              <Icon name="activity-round-fill"></Icon>
              <span>Account Activity</span>
            </Link>
          </li> */}
          <li onClick={() => updateSm(false)}>
            <Link
              to={`${process.env.PUBLIC_URL}/user-profile-setting`}
              className={window.location.pathname === `${process.env.PUBLIC_URL}/user-profile-setting` ? "active" : ""}
            >
              <Icon name="lock-alt-fill"></Icon>
              <span>Security Setting</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfileAside;
