import { isNullOrEmpty } from "./Utils";

const canAccessUrl = [
  "milestone",
  "submission",
  "evaluation",
  "subject",
  "class",
  "class-list",
  "subject-manage",
  "subject-list",
  "evaluated-teams",
  "setting-list",
  "user-list",
  "dash-board",
  "profile",
  "requirements",
  "evaluating-sessions",
  "evaluating-councils",
  "requirement-details",
  "final-results",
  "nioicon",
];

export const canAccess = (role, path) => {
  if (!role) return false;
  if (role === "ADMIN") return true;

  if (role === "STUDENT") {
    const restrictedUrlsForStudent = [
      "class-list",
      "subject-manage",
      "subject-list",
      "evaluated-teams",
      "setting-list",
      "user-list",
      "final-results",
      "dash-board",
    ];
    return !restrictedUrlsForStudent.some((item) => path.indexOf(item) !== -1);
  }

  if (role === "MANAGER" || role === "TEACHER") {
    const restrictedUrlsForManagerAndTeacher = ["setting-list", "user-list"];
    if(role === "TEACHER"){
      restrictedUrlsForManagerAndTeacher.push("subject-manage");
    }
    return (
      !restrictedUrlsForManagerAndTeacher.some((item) => path.indexOf(item) !== -1) &&
      (path.includes("/dash-board") || canAccessUrl.some((item) => path.indexOf(item) !== -1))
    );
  }

  return canAccessUrl.some((item) => path.indexOf(item) !== -1);
};



export const canModify = (role, path, action) => {
  if (!role) return false;
  switch (path) {
    case "subject":
      return role === "ADMIN";
    case "assignment":
    case "evaluation-criteria":
    case "subject-setting":
    case "subject-teacher":
      return role === "ADMIN" || role === "MANAGER";
    case "class":
    case "milestone":
    case "team":
      return role !== "STUDENT";
    case "requirement":
      return role !== "STUDENT" || (role === "STUDENT" && action !== "delete" && action !== "import");
    case "evaluation":
      return role !== "STUDENT";
    default:
      return false;
  }
};

export const canEvaluate = (user, role, classes) => {
  if (!user || !role) return false;
  if (role !== "TEACHER") return false;
  return user.id === classes?.teacherId;
};

export const canModifyMilestone = (user, role, teacherId) => {
  if (role === "ADMIN" || role === "MANAGER") return true;
  if (user?.id === teacherId) return true;
  return false;
};

export const canChangeAssignee = (user, role, studentId) => {
  if (role === "STUDENT") {
    return isNullOrEmpty(studentId) || user.id === studentId;
  }
  return false;
};

export const canSubmitWork = (user, role, leaderId) => {
  return role === "STUDENT" && user.id === leaderId;
};

export const canModifySessionCouncil = (user, role) => {
  return role === "ADMIN" || role === "MANAGER";
};
