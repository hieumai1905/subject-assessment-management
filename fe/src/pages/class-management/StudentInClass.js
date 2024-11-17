import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import {
  Block,
  BlockHead,
  Icon,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
} from "../../components/Component";
import { addFirstAndDeleteLast, upDownArrow } from "../../utils/Utils";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddStudentModal from "./AddStudentModal";
import ClassFormModal from "./ClassFormModal";
import "react-confirm-alert/src/react-confirm-alert.css";
import useAuthStore from "../../store/Userstore";
import Swal from "sweetalert2";
import { canModify } from "../../utils/CheckPermissions";
import {
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Form,
  Input,
  Label,
  ButtonGroup,
  Badge,
} from "reactstrap";

export const StudentInClass = ({ classes, users, setUsers }) => {
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    import: false,
    view: false,
  });
  const [isFetching, setIsFetching] = useState({
    addStudent: false,
    import: false,
  });
  const [editId, setEditedId] = useState();
  const [viewStudent, setViewStudent] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [totalElements, setTotalElements] = useState(0);
  const [filterFormData, setFilterFormData] = useState({
    nameOrCode: "",
    managerId: null,
    status: null,
  });

  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [subjects, setSubjects] = useState([]);
  const [importFormData, setImportFormData] = useState([]);
  const [errImportList, setErrImportList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useAuthStore((state) => state);

  useEffect(() => {
    if (classes.id) {
      const fetchUsers = async () => {
        try {
          const response = await authApi.post("/class/search-students", {
            pageSize: 9999,
            classId: classes.id,
            roleId: 4,
          });
          if (response.data.statusCode === 200) {
            setUsers(response.data.data.classUserSuccessDTOS);
          }
        } catch (error) {
          console.error("fetch users:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [classes.id]);

  const [formData, setFormData] = useState({
    classId: classes.id,
    createUserRequest: {
      fullname: "",
      gender: "",
      email: "",
      roleId: 4,
    },
  });

  const resetForm = () => {
    setFormData({
      classId: classes.id,
      createUserRequest: {
        fullname: "",
        gender: "",
        email: "",
        roleId: 4,
      },
    });
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ edit: false });
    resetForm();
  };

  const closeImportModal = () => {
    setModal({ import: false });
    setImportFormData([]);
    setErrImportList([]);
  };

  const closeViewModal = () => {
    setModal({ view: false });
    setViewStudent({});
  };

  const onFormSubmit = async (sData) => {
    const { name, code, managerIds, description, isActive } = sData;
    const submittedData = {
      subjectName: name,
      subjectCode: code,
      managers: managerIds?.map((manager) => ({ id: manager.value })),
      description: description,
      active: isActive === "Active",
    };

    try {
      const response = await authApi.post("/class/import-student", submittedData);
      if (response.data.statusCode === 200) {
        toast.success("Create subject successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTotalElements(totalElements + 1);
        setSubjects(addFirstAndDeleteLast(subjects, response.data.data, itemPerPage));
        resetForm();
        setModal({ add: false });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      toast.error("Error creating subject!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const onImportSubmit = async (sData) => {
    setIsFetching({ ...isFetching, import: true });
    if (sData.length === 0) {
      toast.info(`No student to import!`, {
        position: "top-center",
      });
      setIsFetching({ ...isFetching, import: false });
      return false;
    }
    const importForm = {
      classId: classes.id,
      list: sData.map((item) => ({
        ...item,
        roleId: 4,
      })),
    };
    try {
      const response = await authApi.post("/class/import-student-list", importForm);
      if (response.data.data.classUserError && response.data.data.classUserError.length === 0) {
        toast.success("Import students successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setModal({ import: false });
        setImportFormData([]);
        setUsers([...response.data.data.classUserSuccess]);
      } else if (response.data.data.classUserError && response.data.data.classUserError.length > 0) {
        setErrImportList(response.data.data.classUserError);
        setImportFormData([]);
        setUsers([...response.data.data.classUserSuccess]);
      } else {
        toast.error(`${response.data.data.classUserError}`, {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error import student:", error);
      toast.error("Error import student!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, import: false });
    }
  };

  const onDeleteClick = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "If you delete this student, all related information like evaluations, tracking updates will be removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.delete("/class/delete-student", {
            data: {
              classId: classes.id,
              studentId: id,
            },
          });
          if (response.data.statusCode === 200) {
            toast.success("Delete student successfully!", {
              position: toast.POSITION.TOP_CENTER,
            });
            let newData = [...users];
            let index = newData.findIndex((item) => item.userId === id);
            if (index !== -1) {
              newData.splice(index, 1);
              setUsers(newData);
              setTotalElements((prev) => prev - 1);
            }
          } else {
            toast.error(`${response.data.data}`, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error("Error delete student:", error);
          toast.error("Error delete student!", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } else {
        let newData = users.map((item) => {
          item.checked = false;
          return item;
        });
        setUsers([...newData]);
      }
    });
  };

  const onViewClick = (student) => {
    setViewStudent(student);
    setModal({ view: true });
  };

  const handleSort = (sortField) => {
    setSortBy(sortField);
    setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    setCurrentPage(1);
  }, [filterFormData]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchStudents = async (keyword) => {
    try {
      console.log("Keyword:", keyword || searchKeyword);

      const response = await authApi.post("/class/search-students", {
        pageSize: 9999,
        classId: classes.id,
        roleId: 4,
        keyWord: keyword || searchKeyword,
      });
      if (response.data.statusCode === 200) {
        setUsers(response.data.data.classUserSuccessDTOS);
      }
    } catch (error) {
      console.error("fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchStudents(searchKeyword);
    }
  };

  return (
    <>
      <Head title="Subject List"></Head>
      <Content>
        <BlockHead size="sm">
          <div className="d-flex justify-content-between align-items-center">
            <ButtonGroup style={{ maxWidth: "400px", width: "100%" }}>
              <input
                type="text"
                placeholder="Enter student's email address..."
                className="form-control w-100"
                value={searchKeyword}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                style={{ paddingLeft: "15px", borderRadius: "5px 0 0 5px" }}
              />
              <Button
                className="bg-primary"
                onClick={() => {
                  fetchStudents(searchKeyword);
                }}
                style={{ borderRadius: "0 5px 5px 0" }}
              >
                <Icon className="text-white" name="search"></Icon>
              </Button>
            </ButtonGroup>

            {canModify(role, "class", "crud") && (
              <div className="d-flex">
                <Button color="primary" className="me-2 custom-button" onClick={() => setModal({ add: true })}>
                  <Icon name="plus" className="me-1" />
                  Add Student
                </Button>
                <Button color="success" className="custom-button" onClick={() => setModal({ import: true })}>
                  <Icon name="upload-cloud" className="me-1" />
                  Import Students
                </Button>
              </div>
            )}
          </div>
        </BlockHead>

        <Block>
          {isLoading ? (
            <div className="text-center">
              <Spinner color="primary" />
            </div>
          ) : (
            <DataTable className="card-stretch">
              <DataTableBody>
                <DataTableHead className="nk-tb-item nk-tb-head">
                  <DataTableRow>
                    <span onClick={() => handleSort("id")} className="sub-text">
                      ID {upDownArrow(sortBy === "id" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow>
                    <span onClick={() => handleSort("fullname")} className="sub-text">
                      Full Name {upDownArrow(sortBy === "subjectName" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow size="mb">Email</DataTableRow>
                </DataTableHead>

                {users?.length > 0 ? (
                  users?.map((item) => {
                    return (
                      <DataTableItem key={item.id}>
                        <DataTableRow>
                          <span>{item.id}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span>{item.fullname}</span>
                        </DataTableRow>

                        <DataTableRow size="mb">
                          <span>{item.email}</span>
                        </DataTableRow>

                        <DataTableRow className="nk-tb-col-tools text-end">
                          <ul className="nk-tb-actions gx-1">
                            <li>
                              <Icon
                                name="eye"
                                className="text-primary"
                                style={{ cursor: "pointer", fontSize: "20px", marginRight: "7px" }}
                                onClick={() => onViewClick(item)}
                              />
                            </li>
                            {canModify(role, "class", "crud") && (
                              <li>
                                <Icon
                                  name="delete"
                                  className="text-danger"
                                  style={{ cursor: "pointer", fontSize: "20px" }}
                                  onClick={() => onDeleteClick(item?.userId)}
                                />
                              </li>
                            )}
                          </ul>
                        </DataTableRow>
                      </DataTableItem>
                    );
                  })
                ) : (
                  <DataTableRow>
                    <span className="text-center w-100">No students available.</span>
                  </DataTableRow>
                )}
              </DataTableBody>
            </DataTable>
          )}
        </Block>

        <AddStudentModal
          modal={modal.add}
          modalType="add"
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
          users={users}
          setUsers={setUsers}
          isFetching={isFetching}
          setIsFetching={setIsFetching}
        />

        <ClassFormModal
          modal={modal.import}
          modalType="import"
          formData={importFormData}
          setFormData={setImportFormData}
          closeModal={closeImportModal}
          onSubmit={onImportSubmit}
          errImportList={errImportList}
          isFetching={isFetching.import}
        />

        <Modal isOpen={modal.view} toggle={closeViewModal}>
          <ModalHeader toggle={closeViewModal}>Student Details</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="fullName">Full name</Label>
                <Input type="text" id="fullName" value={viewStudent.fullname || ""} readOnly />
              </FormGroup>

              <FormGroup>
                <Label for="email">Email</Label>
                <Input type="email" id="email" value={viewStudent.email || ""} readOnly />
              </FormGroup>

              <FormGroup className="d-flex align-items-center">
                <Label className="me-2 mb-0">Status:</Label>
                <Badge color={viewStudent.active ? "success" : "danger"} className="h6 mb-0">
                  {viewStudent.active ? "Active" : "Inactive"}
                </Badge>
              </FormGroup>

              <FormGroup>
                <Label for="description">Description</Label>
                <Input type="textarea" id="description" value={viewStudent.description || "No description"} readOnly />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter className="d-flex justify-content-end">
            <Button color="secondary" onClick={closeViewModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>

        <ToastContainer />
      </Content>
    </>
  );
};

export default StudentInClass;