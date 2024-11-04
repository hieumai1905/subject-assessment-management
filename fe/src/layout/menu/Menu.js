import React, { useEffect, useState } from "react";
import menu from "./MenuData";
import Icon from "../../components/icon/Icon";
import classNames from "classnames";
import { NavLink, Link } from "react-router-dom";
import useAuthStore from "../../store/Userstore";

const MenuItem = ({ icon, link, text, sub, newTab, sidebarToggle, mobileView, badge, ...props }) => {
  const { role } = useAuthStore((state) => state);

  let dashboardLink =
    text === "Dashboard" && (role === "ADMIN" || role === "MANAGER")
      ? "/dash-board"
      : sub && sub.length > 0
      ? sub[0].link
      : link;

  if ((text === "System Configs" || text === "Training Subjects") && role === "MANAGER") {
    dashboardLink = "/subject-list";
  }

  if (text === "Training Subjects" && role === "ADMIN") {
    dashboardLink = "/subject-manage";
  }

  let currentUrl;
  const toggleActionSidebar = (e) => {
    if (!sub && !newTab && mobileView) {
      sidebarToggle(e);
    }
  };

  if (window.location.pathname !== undefined) {
    currentUrl = window.location.pathname;
  } else {
    currentUrl = null;
  }

  useEffect(() => {
    var element = document.getElementsByClassName("nk-menu-item active current-page");
    var arrayElement = [...element];

    arrayElement.forEach((dom) => {
      if (dom.parentElement.parentElement.parentElement.classList[0] === "nk-menu-item") {
        dom.parentElement.parentElement.parentElement.classList.add("active");
        dom.parentElement.parentElement.style.height = "auto"; // Set height to auto
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const menuItemClass = classNames({
    "nk-menu-item": true,
    "has-sub": sub,
    "active current-page": currentUrl === dashboardLink,
  });

  return (
    <li className={menuItemClass} onClick={(e) => toggleActionSidebar(e)}>
      {newTab ? (
        <Link to={`${dashboardLink}`} target="_blank" rel="noopener noreferrer" className="nk-menu-link">
          {icon ? (
            <span className="nk-menu-icon">
              <Icon name={icon} />
            </span>
          ) : null}
          <span className="nk-menu-text">{text}</span>
        </Link>
      ) : (
        <NavLink to={`${dashboardLink}`} className={`nk-menu-link`}>
          {icon ? (
            <span className="nk-menu-icon">
              <Icon name={icon} />
            </span>
          ) : null}
          <span className="nk-menu-text">{text}</span>
          {badge && <span className="nk-menu-badge">{badge}</span>}
        </NavLink>
      )}
      {sub ? (
        <div className="nk-menu-wrap" style={{ height: "auto" }}>
          <MenuSub sub={sub} sidebarToggle={sidebarToggle} mobileView={mobileView} />
        </div>
      ) : null}
    </li>
  );
};

const MenuSub = ({ sub, sidebarToggle, mobileView }) => {
  const { role } = useAuthStore((state) => state);

  const filteredSubItems = sub.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <ul className="nk-menu-sub">
      {filteredSubItems.map((item) => (
        <MenuItem
          key={item.text}
          link={item.link}
          icon={item.icon}
          text={item.text}
          sub={item.subMenu}
          newTab={item.newTab}
          badge={item.badge}
          sidebarToggle={sidebarToggle}
          mobileView={mobileView}
        />
      ))}
    </ul>
  );
};

const Menu = ({ sidebarToggle, mobileView }) => {
  const { role } = useAuthStore((state) => state);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (role) {
      setMenuItems(menu.filter((item) => !item.heading && (!item.roles || item.roles.includes(role))));
    }
  }, [role]);

  return (
    <ul className="nk-menu">
      {menuItems.map((item) => (
        <MenuItem
          key={item.text}
          link={item.link}
          icon={item.icon}
          text={item.text}
          sub={item.subMenu}
          badge={item.badge}
          sidebarToggle={sidebarToggle}
          mobileView={mobileView}
        />
      ))}
    </ul>
  );
};

export default Menu;
