const getLinkForRole = (link, roles) => {
  if (link === "/") {
    if (roles.includes("ADMIN")) {
      return "/dash-board";
    } else if (roles.includes("MANAGER")) {
      return "/dash-board";
    }
  }
  return link;
};

const menu = [
  {
    icon: "dashlite",
    text: "Dashboard",
    link: getLinkForRole("/", ["ADMIN", "MANAGER"]),
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: "list-index",
    text: "My Classes",
    link: "/my-classes",
    roles: ["TEACHER", "STUDENT"],
  },
  {
    icon: "reload",
    text: "Ongoing Evaluation",
    subMenu: [
      {
        text: "Requirements",
        link: "/requirements",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Class Submissions",
        link: "/submissions",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Ongoing Evaluations",
        link: "/ongoing-evaluations",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Class List",
        link: "/class-list",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        text: "Milestones",
        link: "/milestone-list",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
    ],
    roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
  },

  // {
  //   icon: "list-index",
  //   text: "Class Management",
  //   subMenu: [
  //     {
  //       text: "Class List",
  //       link: "/class-list",
  //       roles: ["ADMIN", "MANAGER"],
  //     },
  //     {
  //       text: "Milestones",
  //       link: "/milestone-list",
  //       roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
  //     },
  //   ],
  //   roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
  // },

  {
    icon: "presentation",
    text: "Final Presentation",
    subMenu: [
      {
        text: "Evaluating Sessions",
        link: "/evaluating-sessions",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Evaluating Councils",
        link: "/evaluating-councils",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Evaluation Details",
        link: "/evaluation-details",
        roles: ["ADMIN", "MANAGER", "TEACHER"],
      },
      {
        text: "Evaluated Teams",
        link: "/evaluated-teams",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        text: "Final Results",
        link: "/final-results",
        roles: ["ADMIN", "MANAGER", "TEACHER"],
      },
    ],
    roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
  },
  {
    icon: "setting-alt",
    text: "System Administration",
    subMenu: [
      {
        text: "Training Subjects",
        link: "/subject-manage",
        roles: ["ADMIN"],
      },
      {
        text: "Training Subjects",
        link: "/subject-list",
        roles: ["MANAGER"],
      },
      {
        text: "System Settings",
        link: "/setting-list",
        roles: ["ADMIN"],
      },
      {
        text: "User Accounts",
        link: "/user-list",
        roles: ["ADMIN"],
      },
    ],
    roles: ["ADMIN", "MANAGER"],
  },
];

export default menu;
