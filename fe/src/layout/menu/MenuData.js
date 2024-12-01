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
    text: "Thống kê",
    link: getLinkForRole("/", ["ADMIN", "MANAGER"]),
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: "list-index",
    text: "Lớp học của tôi",
    link: "/my-classes",
    roles: ["TEACHER", "STUDENT"],
  },
  {
    icon: "reload",
    text: "Đánh giá quá trình",
    subMenu: [
      {
        text: "Danh sách yêu cầu",
        link: "/requirements",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Danh sách bài nộp",
        link: "/submissions",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Đánh giá quá trình",
        link: "/ongoing-evaluations",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Quản lý lớp học",
        link: "/class-list",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        text: "Danh sách cột mốc",
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
    text: "Đánh giá hội đồng",
    subMenu: [
      {
        text: "Phiên đánh giá",
        link: "/evaluating-sessions",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Hội đồng đánh giá",
        link: "/evaluating-councils",
        roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
      },
      {
        text: "Chi tiết đánh giá",
        link: "/evaluation-details",
        roles: ["ADMIN", "MANAGER", "TEACHER"],
      },
      {
        text: "Phân công hội đồng",
        link: "/evaluated-teams",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        text: "Kết quả đánh giá",
        link: "/final-results",
        roles: ["ADMIN", "MANAGER", "TEACHER"],
      },
    ],
    roles: ["ADMIN", "MANAGER", "TEACHER", "STUDENT"],
  },
  {
    icon: "setting-alt",
    text: "Quản trị hệ thống",
    subMenu: [
      {
        text: "Quản lý môn học",
        link: "/subject-manage",
        roles: ["ADMIN", "MANAGER"],
      },
      // {
      //   text: "Quản lý môn học",
      //   link: "/subject-list",
      //   roles: ["MANAGER"],
      // },
      {
        text: "Cấu hình hệ thống",
        link: "/setting-list",
        roles: ["ADMIN"],
      },
      {
        text: "Quản lý sinh viên",
        link: "/manage-student",
        roles: ["ADMIN"],
      },
      {
        text: "Quản lý giảng viên",
        link: "/manage-teacher",
        roles: ["ADMIN"],
      },
    ],
    roles: ["ADMIN", "MANAGER"],
  },
];

export default menu;
