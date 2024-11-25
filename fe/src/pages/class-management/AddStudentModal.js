import React, { useEffect, useState } from "react";
import { Icon, Button, Col, Row, Block } from "../../components/Component";
import { Modal, ModalBody, Form, Input, Spinner, ButtonGroup } from "reactstrap";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "code",
    headerName: "Mã học sinh",
    width: 180,
  },
  {
    field: "fullname",
    headerName: "Họ và tên",
    width: 260,
  },
  {
    field: "email",
    headerName: "Email",
    width: 270,
  },
];

const AddStudentModal = ({
  modal,
  closeModal,
  formData,
  setFormData,
  modalType,
  setUsers,
  users,
  isFetching,
  setIsFetching,
  classes,
}) => {
  useEffect(() => {
    reset(users);
  }, [users]);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      createUserRequest: {
        ...prevData.createUserRequest,
        [name]: value,
      },
    }));
  };

  const onFormSubmit = async () => {
    try {
      setIsFetching({ ...isFetching, addStudent: true });
      let studentCodes = [];
      formData.forEach((idx) => {
        if (students[idx] && students[idx].code) {
          studentCodes.push({
            code: students[idx].code,
          });
        }
      });
      if (studentCodes.length <= 0) {
        toast.error(`Vui lòng chọn ít nhất một học sinh để thêm`, {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }
      console.log("xaa", studentCodes);
      const response = await authApi.post("/class/import-student-list", {
        classId: classes.id,
        list: studentCodes,
      });
      console.log("rr", response);
      if (response.data.statusCode === 200) {
        toast.success("Thêm học sinh thành công", {
          position: toast.POSITION.TOP_CENTER,
        });
        let res = response.data.data.classUserSuccess;
        setUsers([...users, ...res]);
        closeModal();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Xảy ra lỗi khi thêm học sinh!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, addStudent: false });
    }
  };

  const [students, setStudents] = useState([]);
  const [rowSelectionModel, setRowSelectionModel] = React.useState([]);
  const [year, setYear] = useState();
  const [isLoading, setIsLoading] = useState({
    users: false,
  });

  const fetchUsers = async () => {
    try {
      setIsLoading({ ...isLoading, users: true });
      const response = await authApi.post("/class/search-students-has-no-class", {
        pageSize: 9999,
        classId: classes.id,
        year: year,
      });
      if (response.data.statusCode === 200) {
        const data = response.data.data.classUserSuccessDTOS;
        const rows = data.map((row, index) => ({ ...row, id: index }));
        setStudents(rows);
      }
    } catch (error) {
      console.error("fetch users:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm học sinh!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsLoading({ ...isLoading, users: false });
    }
  };

  useEffect(() => {
    if (classes.id) {
      fetchUsers();
    }
  }, [classes.id]);

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            if (!isFetching.addStudent) closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">{modalType === "add" && "Thêm học sinh"}</h5>
          <div className="mt-4">
            <div className="mb-4">
              <ButtonGroup style={{ maxWidth: "400px", width: "100%" }}>
                <input
                  type="text"
                  placeholder="Nhập năm học..."
                  className="form-control w-100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ paddingLeft: "15px", borderRadius: "5px 0 0 5px" }}
                />
                {isLoading.users ? (
                  <Button disabled color="primary">
                    <Spinner size="sm" />
                  </Button>
                ) : (
                  <Button
                    className="bg-primary"
                    onClick={() => {
                      if (year && year.length > 0) fetchUsers();
                    }}
                    style={{ borderRadius: "0 5px 5px 0" }}
                  >
                    <Icon className="text-white" name="search"></Icon>
                  </Button>
                )}
              </ButtonGroup>
            </div>
            <Form className="row gy-4" onSubmit={handleSubmit(onFormSubmit)}>
              <Block>
                <div style={{ height: 400, width: "100%" }}>
                  <DataGrid
                  
                    checkboxSelection
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                      setRowSelectionModel(newRowSelectionModel);
                      setFormData(newRowSelectionModel);
                    }}
                    rowSelectionModel={rowSelectionModel}
                    rows={students}
                    columns={columns}
                  />
                </div>
              </Block>
              <Col size="12">
                <ul className="text-end">
                  <li>
                    {isFetching.addStudent ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Đang lưu... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="submit">
                        {modalType === "add" && "Thêm học sinh"}
                      </Button>
                    )}
                  </li>
                </ul>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AddStudentModal;
