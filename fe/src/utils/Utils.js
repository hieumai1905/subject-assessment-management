import { Icon } from "../components/Component";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import excelJs from "exceljs";
//url for production
export var url = "/";
// if (process.env.NODE_ENV === "development") {
//   url = "";
// } else {
//   url = window.location.host.split("/")[1];
//   if (url) {
//     url = `/${window.location.host.split("/")[1]}`;
//   } else url = process.env.PUBLIC_URL; /// ADD YOUR CPANEL SUB-URL
// }

//Function to validate and return errors for a form
export const checkForm = (formData) => {
  let errorState = {};
  Object.keys(formData).forEach((item) => {
    if (formData[item] === null || formData[item] === "") {
      errorState[item] = "This field is required";
    }
  });
  return errorState;
};

//Function that returns the first or first two letters from a name
export const findUpper = (string) => {
  let extractedString = [];

  for (var i = 0; i < string.length; i++) {
    if (string.charAt(i) === string.charAt(i).toUpperCase() && string.charAt(i) !== " ") {
      extractedString.push(string.charAt(i));
    }
  }
  if (extractedString.length > 1) {
    return extractedString[0] + extractedString[1];
  } else {
    return extractedString[0];
  }
};

//Function that calculates the from current date
export const setDeadline = (days) => {
  let todayDate = new Date();
  var newDate = new Date(todayDate);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// Function to structure date ex : Jun 4, 2011;
export const getDateStructured = (date) => {
  let d = date.getDate();
  let m = date.getMonth();
  let y = date.getFullYear();
  let final = monthNames[m] + " " + d + ", " + y;
  return final;
};

// Function to structure date ex: YYYY-MM-DD
export const setDateForPicker = (rdate) => {
  let d = rdate.getDate();
  d < 10 && (d = "0" + d);
  let m = rdate.getMonth() + 1;
  m < 10 && (m = "0" + m);
  let y = rdate.getFullYear();
  rdate = y + "-" + m + "-" + d;

  return rdate;
};

// Set deadlines for projects
export const setDeadlineDays = (deadline) => {
  var currentDate = new Date();
  var difference = deadline.getTime() - currentDate.getTime();
  var days = Math.ceil(difference / (1000 * 3600 * 24));
  return days;
};

//Date formatter function Example : 10-02-2004
export const dateFormatterAlt = (date, reverse) => {
  let d = date.getDate();
  let m = date.getMonth();
  let y = date.getFullYear();
  reverse ? (date = m + "-" + d + "-" + y) : (date = y + "-" + d + "-" + m);
  return date;
};

//Date formatter function
export const dateFormatter = (date, reverse, string) => {
  var dateformat = date.split("-");
  //var date = dateformat[1]+"-"+dateformat[2]+"-"+dateformat[0];
  reverse
    ? (date = dateformat[2] + "-" + dateformat[0] + "-" + dateformat[1])
    : (date = dateformat[1] + "-" + dateformat[2] + "-" + dateformat[0]);

  return date;
};

//todays Date
export const todaysDate = new Date();

//current Time
export const currentTime = () => {
  var hours = todaysDate.getHours();
  var minutes = todaysDate.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

//Percentage calculation
export const calcPercentage = (str1, str2) => {
  let result = Number(str2) / Number(str1);
  result = result * 100;
  return Math.floor(result);
};

export const truncate = (str, n) => {
  return str.length > n ? str.substr(0, n - 1) + " " + truncate(str.substr(n - 1, str.length), n) : str;
};

// returns upload url
export const getUploadParams = () => {
  return { url: "https://httpbin.org/post" };
};

export const bulkActionOptions = [
  { value: "suspend", label: "Suspend User" },
  { value: "delete", label: "Delete User" },
];

// Converts KB to MB
export const bytesToMegaBytes = (bytes) => {
  let result = bytes / (1024 * 1024);
  return result.toFixed(2);
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function addFirstAndDeleteLast(arr, elementToAdd, itemPerPage) {
  if (!arr) {
    arr = [];
  }
  arr.unshift(elementToAdd);
  if (itemPerPage < arr.length) arr.pop();
  return arr;
}

export function isNullOrEmpty(obj) {
  return obj === null || obj === undefined || obj === "";
}

export const upDownArrow = (orderBy) => {
  if (orderBy === "")
    return (
      <>
        {/* <Icon name="arrow-long-up"></Icon>
        <Icon name="arrow-long-down"></Icon> */}
      </>
    );
  return orderBy === "asc" ? (
    <Icon name="arrow-long-up" style={{ color: "#6576ff" }}></Icon>
  ) : (
    <Icon name="arrow-long-down" style={{ color: "#6576ff" }}></Icon>
  );
};

export function transformToOptions(managers) {
  if (managers === null || managers === undefined) return null;
  return managers.map((manager) => ({
    value: manager.id,
    label: `${manager.fullname} (${manager.username})`,
  }));
}

export function transformToOptionsWithEmail(arr) {
  if (arr === null || arr === undefined) return null;
  return arr.map((element) => ({
    value: element.id,
    label: `${element?.fullname} ${element?.email ? `(${element.email})` : ""}`,
  }));
}

export function convertToOptions(arr, idField, labelField) {
  if (arr === null || arr === undefined) return null;
  return arr.map((object) => ({
    value: object[idField],
    label: object[labelField],
  }));
}

export function formatDate(dateString) {
  if (dateString === null || dateString === undefined) return "";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export const getItemByValue = (list, value) => {
  return list.find((item) => item.value === value);
};

export const getValueByLabel = (list, label) => {
  return list.find((item) => item.label === label)?.value;
};

export const generateExcel = (students) => {
  // Tạo workbook mới
  const wb = XLSX.utils.book_new();

  // Tạo mảng dữ liệu ban đầu với tiêu đề
  const data = [["Mã học sinh", "Họ và Tên", "Email"]];

  // Thêm dữ liệu của students vào mảng data
  students.forEach((student) => {
    data.push([student.code, student.fullname, student.email]);
  });

  // Tạo worksheet từ mảng data
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Định dạng tiêu đề (header)
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "FFFF00" } },
    alignment: { horizontal: "center" },
  };

  // Áp dụng định dạng cho dòng tiêu đề
  ["A1", "B1", "C1"].forEach((cell) => {
    if (ws[cell]) {
      ws[cell].s = headerStyle;
    }
  });

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Chuyển đổi workbook thành định dạng binary
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

  // Hàm chuyển đổi chuỗi sang mảng buffer
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  // Tạo blob từ dữ liệu workbook
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

  // Tải file về máy
  saveAs(blob, "template.xlsx");
};


const s2ab = (s) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
};

export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
};

// const findTeamByName = (teams, teamName) => {
//   return teams.find(team => team.teamName === teamName);
// }

// export const convertExcelTeamToRequest = (sData) => {
//   let teams = [];
//   for (let item of sData) {
//     if (!isNullOrEmpty(item.teamName)) {
//       let team = findTeamByName(teams, item.teamName);
//       let isExist = true;
//       if (!team) {
//         team = { ...team, teamName: item.teamName };
//         isExist = false;
//       }
//       if (!isNullOrEmpty(item.topicName)) team = { ...team, topicName: item.topicName };
//       if (!isNullOrEmpty(item.isLeader)) team = { ...team, leaderId: item.id };
//       if (team.memberIds) team.memberIds.push(item.id);
//       else team = { ...team, memberIds: [item.id] };
//       if (isExist) teams = teams.map((t) => (t.teamName === team.teamName ? team : t));
//       else teams.push(team);
//     }
//   }
//   return teams;
// };

const findTeamByName = (teamsMap, teamName) => {
  return teamsMap.get(teamName);
};

export const convertExcelTeamToRequest = (sData) => {
  let teamsMap = new Map();

  for (let item of sData) {
    if (!isNullOrEmpty(item.teamName)) {
      let team = findTeamByName(teamsMap, item.teamName);

      if (!team) {
        team = { teamName: item.teamName, memberCodes: [] };
        teamsMap.set(item.teamName, team);
      }

      if (!isNullOrEmpty(item.topicName)) {
        team.topicName = item.topicName;
      }

      if (!isNullOrEmpty(item.isLeader)) {
        team.leaderId = item.code;
      }

      team.memberCodes.push(item.code);
    }
  }

  return Array.from(teamsMap.values());
};

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const divideIntoTeams = (array, teamSize) => {
  teamSize = Number(teamSize);
  let teams = [];
  let teamCounter = 1;

  for (let i = 0; i < array.length; i += teamSize) {
    let team = array.slice(i, i + teamSize).map((member) => ({
      ...member,
      teamName: `Nhóm ${teamCounter}`,
    }));
    teams.push(...team);
    console.log("slicett", i, i + teamSize, array.slice(i, i + teamSize));
    teamCounter++;
  }

  return teams;
};

export const getBadgeColor = (level) => {
  if (level === null || level === undefined || level === "") {
    return null;
  }

  switch (level.toLowerCase()) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "hard":
      return "danger";
    default:
      return null;
  }
};

export const getAllOptions = (label) => {
  return {
    value: null,
    label: label,
  };
};

export const generateTemplate = async (sampleData, complexities, qualities, typeEvaluator) => {
  const workbook = new excelJs.Workbook();
  const ws = workbook.addWorksheet("Requirement Evaluation");
  const totalRows = sampleData.length + 1;
  const options2 = [];
  const options3 = [];
  const opt2Values = [];
  const opt3Values = [];
  if (complexities && complexities.length > 0) {
    complexities.forEach((item) => {
      let loc = parseInt(item.extValue);
      options2.push(item.name);
      opt2Values.push(loc);
    });
  }
  if (qualities && qualities.length > 0) {
    qualities.forEach((item) => {
      let weight = parseFloat(item.extValue);
      weight = weight / 100;
      options3.push(item.name);
      opt3Values.push(weight);
    });
  }
  let headers = ["ID", "Title", "Team", "In charge", "Complexity", "Quality", "LOC", "Comment"];
  if (typeEvaluator === "Final") {
    headers.push(...["Update complexity", "Update quality", "Update LOC", "Update comment"]);
  }
  ws.addRow(headers);

  ws.dataValidations.add(`E2:E${totalRows}`, {
    type: "list",
    allowBlank: false,
    formulae: [`"${options2.join(",")}"`],
  });

  ws.dataValidations.add(`F2:F${totalRows}`, {
    type: "list",
    allowBlank: false,
    formulae: [`"${options3.join(",")}"`],
  });
  if (typeEvaluator === "Final") {
    ws.dataValidations.add(`I2:I${totalRows}`, {
      type: "list",
      allowBlank: false,
      formulae: [`"${options2.join(",")}"`],
    });

    ws.dataValidations.add(`J2:J${totalRows}`, {
      type: "list",
      allowBlank: false,
      formulae: [`"${options3.join(",")}"`],
    });
  }

  // Style header row
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFADD8E6" },
  };

  ws.getRow(1).eachCell((cell) => {
    cell.font = {
      name: "Inter",
      size: 12,
    };
    cell.alignment = {
      horizontal: "center",
    };
  });

  sampleData.forEach((data, index) => {
    const row = ws.addRow();
    row.getCell(1).value = data.id;
    row.getCell(1).protection = { locked: true };
    row.getCell(2).value = data.reqTitle;
    row.getCell(3).value = data.teamTeamName;
    row.getCell(4).value = data.studentFullname;
    row.getCell(5).value = complexities?.find((item) => item.id === data?.requirementEval?.complexityId)?.name || "";
    row.getCell(6).value = qualities?.find((item) => item.id === data?.requirementEval?.qualityId)?.name || "";
    row.getCell(8).value = data?.requirementEval?.comment;
    if (typeEvaluator === "Final") {
      row.getCell(9).value =
        complexities?.find((item) => item.id === data?.updateRequirementEval?.complexityId)?.name || "";
      row.getCell(10).value = qualities?.find((item) => item.id === data?.updateRequirementEval?.qualityId)?.name || "";
      row.getCell(12).value = data?.updateRequirementEval?.comment;
      row.getCell(9).protection = { locked: false };
      row.getCell(10).protection = { locked: false };
      row.getCell(11).protection = { locked: false };
      row.getCell(12).protection = { locked: false };
    }

    row.getCell(2).protection = { locked: false };
    row.getCell(3).protection = { locked: false };
    row.getCell(4).protection = { locked: false };
    row.getCell(5).protection = { locked: false };
    row.getCell(6).protection = { locked: false };
    row.getCell(7).protection = { locked: false };
    row.getCell(8).protection = { locked: false };

    const rowIndex = index + 2;
    let locFormula = "",
      weightFormula = "",
      locFormula2 = "",
      weightFormula2 = "";
    if (opt2Values && opt2Values.length > 0) {
      opt2Values.forEach((item, idx) => {
        locFormula += `IF(E${rowIndex}="${options2[idx]}", ${opt2Values[idx]},`;
        locFormula2 += `IF(I${rowIndex}="${options2[idx]}", ${opt2Values[idx]},`;
      });
      locFormula += `"" ${")".repeat(opt2Values.length)}`;
      locFormula2 += `"" ${")".repeat(opt2Values.length)}`;
    }
    if (opt3Values && opt3Values.length > 0) {
      opt3Values.forEach((item, idx) => {
        weightFormula += `IF(F${rowIndex}="${options3[idx]}", ${opt3Values[idx]},`;
        weightFormula2 += `IF(J${rowIndex}="${options3[idx]}", ${opt3Values[idx]},`;
      });
      weightFormula += `"" ${")".repeat(opt3Values.length)}`;
      weightFormula2 += `"" ${")".repeat(opt3Values.length)}`;
    }

    row.getCell(7).value = {
      formula: `=IFERROR(ROUND(${locFormula} * ${weightFormula}, 0), "")`,
      result: `${data?.requirementEval?.grade}`,
    };
    if (typeEvaluator === "Final") {
      row.getCell(11).value = {
        formula: `=IFERROR(ROUND(${locFormula2} * ${weightFormula2}, 0), "")`,
        result: `${data?.updateRequirementEval?.grade}`,
      };
    }
  });

  ws.protect("your-password", {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatColumns: true,
    formatRows: true,
  });

  const excelBlob = await workbook.xlsx.writeBuffer();
  const excelUrl = URL.createObjectURL(
    new Blob([excelBlob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );

  const link = document.createElement("a");
  link.href = excelUrl;
  link.download = "requirement_evaluation_template.xlsx";
  document.body.appendChild(link);
  link.click();

  URL.revokeObjectURL(excelUrl);
  document.body.removeChild(link);
};

export const isNumber = (value, type = "int") => {
  if (value !== null && value !== undefined) {
    let number;
    if (type === "int") {
      number = parseInt(value);
    } else if (type === "float") {
      number = parseFloat(value);
    } else {
      return undefined;
    }

    if (!isNaN(number)) {
      return number;
    }
  }
  return undefined;
};

export const isEqual = (value, other) => {
  return (isNullOrEmpty(value) && isNullOrEmpty(other)) || value === other;
};

const getNextColumnName = (col, distance) => {
  let nextCol = "";
  let carry = distance;

  for (let i = col.length - 1; i >= 0; i--) {
    const charCode = col.charCodeAt(i) - "A".charCodeAt(0) + carry;
    carry = Math.floor(charCode / 26);
    nextCol = String.fromCharCode((charCode % 26) + "A".charCodeAt(0)) + nextCol;
  }

  while (carry > 0) {
    nextCol = String.fromCharCode(((carry - 1) % 26) + "A".charCodeAt(0)) + nextCol;
    carry = Math.floor((carry - 1) / 26);
  }

  return nextCol;
};

export const generateTemplateStudentEval = async (sampleData) => {
  const workbook = new excelJs.Workbook();
  const ws = workbook.addWorksheet("Student Evaluation");
  const totalRows = sampleData.length + 1;
  let header = ["FullName", "Email", "Team", "LOC -> Grade"];

  if (!isNullOrEmpty(sampleData[0]?.milestone?.name)) {
    header.push(`${sampleData[0]?.milestone?.name} (${sampleData[0]?.milestone?.weight}%)`);
    header.push("Comment");
    if (sampleData[0]?.criteriaNames && sampleData[0]?.criteriaNames.length > 0) {
      sampleData[0].criteriaNames.forEach((criteria) => {
        header.push(`${criteria.name} (${criteria?.weight}% of ${sampleData[0]?.milestone?.name})`);
        header.push("Comment");
      });
    }
  }

  ws.addRow(header);

  // Style header row
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFADD8E6" },
  };

  ws.getRow(1).eachCell((cell) => {
    cell.font = {
      name: "Inter",
      size: 12,
    };
    cell.alignment = {
      horizontal: "center",
    };
  });

  let cellValidation = {
    type: "decimal",
    operator: "between",
    formula1: 0,
    formula2: 10,
    showErrorMessage: true,
    errorTitle: "Invalid grade",
    error: "Grade must be in range 0 to 10",
  };

  sampleData.forEach((evaluation, idx) => {
    const row = ws.addRow();
    row.getCell(1).value = isNullOrEmpty(evaluation.fullname) ? "" : evaluation.fullname;
    row.getCell(2).value = isNullOrEmpty(evaluation.email) ? "" : evaluation.email;
    row.getCell(3).value = isNullOrEmpty(evaluation.team?.name) ? "" : evaluation.team?.name;
    row.getCell(4).value = isNullOrEmpty(evaluation?.totalLoc)
      ? 0
      : parseFloat(((evaluation.totalLoc * 10) / sampleData[0]?.milestone?.expectedLoc).toFixed(2));
    row.getCell(5).value = isNullOrEmpty(evaluation.evalGrade) ? "" : evaluation.evalGrade;
    row.getCell(6).value = isNullOrEmpty(evaluation.comment) ? "" : evaluation.comment;

    row.getCell(1).protection = { locked: true };
    row.getCell(2).protection = { locked: true };
    row.getCell(3).protection = { locked: true };
    row.getCell(4).protection = { locked: true };
    row.getCell(5).protection = { locked: false };
    row.getCell(6).protection = { locked: false };
    let mileFormula = "";
    if (evaluation.criteriaNames && evaluation.criteriaNames.length > 0) {
      let columnsName = "G",
        colNum = 7;
      evaluation.criteriaNames.forEach((criteria, index) => {
        row.getCell(colNum + index).value = isNullOrEmpty(evaluation.evalGrades[index])
          ? ""
          : evaluation.evalGrades[index];
        row.getCell(colNum + index + 1).value = isNullOrEmpty(evaluation.comments[index])
          ? ""
          : evaluation.comments[index];

        row.getCell(colNum + index).protection = { locked: false };
        row.getCell(colNum + index + 1).protection = { locked: false };
        row.getCell(colNum + index).dataValidation = cellValidation;
        mileFormula += `${columnsName}${idx + 2}*${criteria?.weight / 100}+`;
        columnsName = getNextColumnName(columnsName, 2);
        colNum++;
      });
      mileFormula = mileFormula.slice(0, -1);
    }
    if (!isNullOrEmpty(mileFormula)) {
      row.getCell(5).value = {
        formula: `=IFERROR(ROUND(${mileFormula}, 2), "")`,
        result: isNullOrEmpty(evaluation.evalGrade) ? "" : evaluation.evalGrade,
      };
    }

    row.getCell(5).dataValidation = cellValidation;
  });

  ws.protect("your-password", {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatColumns: true,
    formatRows: true,
  });

  const excelBlob = await workbook.xlsx.writeBuffer();
  const excelUrl = URL.createObjectURL(
    new Blob([excelBlob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );

  const link = document.createElement("a");
  link.href = excelUrl;
  link.download = "template_student_evaluation.xlsx";
  document.body.appendChild(link);
  link.click();

  URL.revokeObjectURL(excelUrl);
  document.body.removeChild(link);
};

export const generateTemplateAllMileEval = async (rows, columns, columnsGroups, evaluations) => {
  const rowData = [];
  const headers = ["Full Name", "Email", "Final Result", "Status"];
  let sortedEval = [];

  if (rows && rows.length > 0) {
    if (evaluations && evaluations.length > 0 && evaluations[0]?.milestones && evaluations[0]?.milestones.length > 0) {
      sortedEval = evaluations[0].milestones.sort((a, b) => a.displayOrder - b.displayOrder);
      sortedEval.forEach((mile, idx) => {
        headers.push(`${mile.name} (${mile.weight}%)`);
        headers.push(`Comment ${idx + 1}`);
      });
    }

    rows.forEach((row) => {
      let customRow = {
        "Full Name": row.fullname,
        Email: row.email,
        "Final Result": row.final_grade ?? "",
        Status: row.status,
      };

      sortedEval.forEach((mile, idx) => {
        let grade = row[`${mile.id}_evalGrade`];
        let comment = row[`${mile.id}_comment`];
        customRow[`${mile.name} (${mile.weight}%)`] = grade ?? "";
        customRow[`Comment ${idx + 1}`] = comment ?? "";
      });

      rowData.push(customRow);
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rowData);

  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "All Milestones Evaluations");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "Evaluations.xlsx");
};

export const shortenString = (str, maxLength) => {
  if (isNullOrEmpty(str)) return "";
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + "...";
  }
  return str;
};

export const getOnlyDate = (date) => {
  if (isNullOrEmpty(date)) return '';
  const [year, month, day] = date.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

export const getOnlyDate2 = (date) => {
  if (isNullOrEmpty(date)) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export const formatDateToDDMMYYYY = (date) => {
  if (isNullOrEmpty(date)) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const findItemValue = (arr, findByKey, resultKey, target) => {
  try {
    const foundItem = arr.find(item => item[findByKey] === target);
    return foundItem ? foundItem[resultKey] || "" : "";
  } catch (error) {
    console.error("Error while finding item:", error);
    return "";
  }
}

