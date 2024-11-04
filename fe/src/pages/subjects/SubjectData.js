import TeamImg from "../../images/avatar/b-sm.jpg";
import TeamImg2 from "../../images/avatar/c-sm.jpg";
import TeamImg3 from "../../images/avatar/a-sm.jpg";
import TeamImg4 from "../../images/avatar/d-sm.jpg";

import { setDeadline } from "../../utils/Utils";

export const subjectData = [
  {
    id: 1,
    name: "mln",
    code: "MLN123",
    manager: {
      id: 1,
      name: "manager 1",
    },
    description: "sdgsdvsa",
    isActive: false,
  },
  {
    id: 2,
    name: "prn3",
    code: "PRN231",
    manager: {
      id: 2,
      name: "manager 2",
    },
    description: "wewe",
    isActive: true,
  },
  {
    id: 3,
    name: "swd391",
    code: "SWD391",
    manager: {
      id: 1,
      name: "manager 1",
    },
    description: "sdgsdvsa",
    isActive: true,
  },
  {
    id: 4,
    name: "sep490",
    code: "SEP490",
    manager: {
      id: 2,
      name: "Nguyen Van A",
    },
    description: "sdgsdvsa",
    isActive: true,
  },
];

export const managerList = [
  { id: 1, name: "manager 1"},
  { id: 2, name: "manager 2"},
  { id: 3, name: "manager 3"},
];

export const teamList = [
  { value: "Abu Bin", label: "Abu Bin", theme: "purple" },
  { value: "Newman John", label: "Newman John", theme: "primary" },
  { value: "Milagros Betts", label: "Milagros Betts", theme: "purple" },
  { value: "Joshua Wilson", label: "Joshua Wilson", theme: "pink" },
  { value: "Ryu Duke", label: "Ryu Duke", theme: "orange" },
  { value: "Aliah Pitts", label: "Aliah Pitts", theme: "blue" },
];
export const typeList = [
  { value: "ROLE", label: "ROLE", theme: "purple" },
  { value: "DOMAIN EMAIL", label: "DOMAIN EMAIL", theme: "primary" },
  { value: "SEMESTER", label: "SEMESTER", theme: "purple" },
];
export const statusList = [
  { value: "Active", label: "Active", theme: "purple" },
  { value: "InActive", label: "InActive", theme: "primary" },
];