export const subjectSettingData = [
  {
    id: 1,
    name: "a",
    extValue: "x",
    displayOrder: 1,
    note: "vcx",
    settingType: "type 2",
    active: true,
    subjectId: 1,
  },
  {
    id: 2,
    name: "gfhfh",
    extValue: "vxcvxcv",
    displayOrder: 1,
    note: "vcx",
    settingType: "type 1",
    active: false,
    subjectId: 1,
  },
  {
    id: 3,
    name: "vvsd",
    extValue: "x",
    displayOrder: 1,
    note: "vcx",
    settingType: "type 2",
    active: true,
    subjectId: 1,
  },
];

export const settingTypeData = [
  {
    value: "Complexity",
    label: "Độ phức tạp",
  },
  {
    value: "Quality",
    label: "Mức độ hoàn thiện",
  },
  {
    value: "Round",
    label: "Lần chấm",
  },
];

export const statusList = [
  {
    value: true,
    label: "Hoạt Động",
  },
  {
    value: false,
    label: "Không hoạt động",
  },
];

export const requirementStatuses = [
  {
    value: "TO DO",
    label: "Chưa làm",
  },
  {
    value: "DOING",
    label: "Đang làm",
  },
  // {
  //   value: "SUBMITTED",
  //   label: "Submitted",
  // },
  // {
  //   value: "EVALUATED",
  //   label: "Evaluated",
  // },
  // {
  //   value: "WAITING FOR APPROVAL",
  //   label: "Wating for approval",
  // },
];

export const fullRequirementStatuses = [
  {
    value: "TO DO",
    label: "Chưa làm",
  },
  {
    value: "DOING",
    label: "Đang làm",
  },
  {
    value: "SUBMITTED",
    label: "Đã nộp",
  },
  {
    value: "EVALUATED",
    label: "Đã đánh giá",
  },
  {
    value: "WAITING FOR APPROVAL",
    label: "Đợi để được chấp nhận",
  },
  {
    value: "SUBMIT LATE",
    label: "Nộp muộn",
  },
];


export const requiremntLevels = [
  {
    value: "Easy",
    label: "Dễ",
  },
  {
    value: "Medium",
    label: "Trung bình",
  },
  {
    value: "Hard",
    label: "Khó",
  },
];

export const bulkActionOptions = [
  { value: "edit", label: "Edit" },
  { value: "delete", label: "Delete" },
];

export const evaluationTypes = [
  { value: "Normal", label: "Thông thường"},
  { value: "Final", label: "Cuối kỳ"},
  { value: "Grand Final", label: "Hội đồng"},
]

export const roleArr = [
  { value: "STUDENT", label: "Sinh viên"},
  { value: "TEACHER", label: "Giảng viên"},
  { value: "MANAGER", label: "Quản lý"},
  { value: "ADMIN", label: "Quản trị viên"}
]