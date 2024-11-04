import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  BackTo,
  PreviewCard,
  Icon,
  BlockBetween,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
} from "../../components/Component";
import CustomReactDualList from "../components/CustomRDualList";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import { transformToOptions } from "../../utils/Utils";
import Swal from "sweetalert2";
import { Spinner } from "reactstrap";
import AddSubjectTeachersModal from "./AddSubjectTeachersModal";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";

export default function SubjectTeachersTable({ subject }) {
  const [tablesm, updateTableSm] = useState(false);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const toggle = () => setonSearch(!onSearch);
  const [isFetching, setIsFetching] = useState({
    allTeachers: true,
    existedTeachers: true,
    delete: false,
    add: false,
  });
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [formData, setFormData] = useState([]);
  const [reload, setReload] = useState(false);
  const { role } = useAuthStore((state) => state);

  const fetchExistedTeachers = async () => {
    try {
      setIsFetching({ ...isFetching, existedTeachers: true });
      const response = await authApi.post("/subjects/search-subject-teachers", {
        pageSize: 9999,
        subjectId: subject?.id,
        type: "added",
      });
      console.log("selected teachers: ", response.data.data);
      if (response.data.statusCode === 200) {
        let newData = response.data.data.map((item) => ({
          ...item,
          checked: false,
        }));
        setData(newData);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("fetch selected teachers:", error);
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, existedTeachers: false });
    }
  };

  const fetchUsers = async () => {
    if (isFetching.existedTeachers) return;
    try {
      setIsFetching({ ...isFetching, allTeachers: true });
      const response = await authApi.post("/user/search", {
        pageSize: 9999,
        roleName: "teacher",
        keyWord: filterText,
      });
      console.log("teachers: ", response.data.data);
      if (response.data.statusCode === 200) {
        let teachers = response.data.data.users.filter((item) => data.findIndex((a) => a.id === item.id) === -1);
        setUsers(teachers);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("fetch teachers:", error);
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, allTeachers: false });
    }
  };

  useEffect(() => {
    fetchExistedTeachers();
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [isFetching.existedTeachers, reload]);

  const [selected, setSelected] = useState([]);
  const [filterText, setFilterText] = useState("");

  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].checked = e.currentTarget.checked;
    setData([...newData]);
  };

  const selectorCheck = (e) => {
    let newData;
    newData = data.map((item) => {
      item.checked = e.currentTarget.checked;
      return item;
    });
    setData([...newData]);
  };

  const handleSaveChanges = async (action) => {
    if (action === "delete") {
      let selectedTeachers = data.filter((item) => item.checked === true);
      if (!selectedTeachers || selectedTeachers.length === 0) {
        toast.info("Please select at least a teacher to " + action, {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }
      Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete teachers?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          let ids = data.filter((item) => item.checked === false || item.checked === undefined).map((item) => item.id);
          handleUpdateTeachers(action, ids);
        }
      });
    } else if (action === "add") {
      if (!formData || formData.length === 0) {
        toast.info("Please select at least a teacher to " + action, {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }
      let ids = [...data, ...users.filter((item) => formData.includes(item.id))].map((item) => item.id);
      handleUpdateTeachers(action, ids);
    }
  };

  const handleUpdateTeachers = async (action, ids) => {
    try {
      if (action === "add") {
        setIsFetching({ ...isFetching, add: true });
      } else if (action === "delete") {
        setIsFetching({ ...isFetching, delete: true });
      }
      const response = await authApi.put("/subjects/update-subject-teacher", {
        subjectId: subject?.id,
        teacherIds: ids,
      });
      console.log("update teachers: ", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success(`${action} subject teacher successfully!`, {
          position: toast.POSITION.TOP_CENTER,
        });
        if (action === "delete") {
          setData((prev) => prev.filter((item) => item.checked === false || item.checked === undefined));
          setReload(!reload);
        } else if (action === "add") {
          let newData = [...data, ...users.filter((item) => ids.includes(item.id))];
          setData(newData);
          setReload(!reload);
          closeModal();
        }
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("update teachers:", error);
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      if (action === "add") {
        setIsFetching({ ...isFetching, add: false });
      } else if (action === "delete") {
        setIsFetching({ ...isFetching, delete: false });
      }
    }
  };

  const handleFilter = () => {
    fetchUsers();
  };

  const closeModal = () => {
    setModal({ add: false });
    setFormData([]);
  };

  return (
    <>
      <Head title="Teachers" />
      {isFetching.allTeachers || isFetching.existedTeachers ? (
        <div className="d-flex justify-content-center">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <Content>
          <Block>
            <DataTable className="card-stretch">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools">
                    <div className="form-inline flex-nowrap gx-3"></div>
                  </div>
                  <div className="card-tools me-n1">
                    <ul className="btn-toolbar gx-1">
                      {canModify(role, "subject-teacher", "crud") && (
                        <>
                          <li>
                            <Button color="primary" onClick={() => setModal({ add: true })}>
                              Add New Teachers
                            </Button>
                          </li>
                          <li>
                            {isFetching.delete ? (
                              <Button disabled color="danger">
                                <Spinner size="sm" />
                                <span> Deleting... </span>
                              </Button>
                            ) : (
                              <Button color="danger" onClick={() => handleSaveChanges("delete")}>
                                Delete Teachers
                              </Button>
                            )}
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              <DataTableBody compact>
                <DataTableHead>
                  {canModify(role, "subject-teacher", "crud") && (
                    <DataTableRow className="nk-tb-col-check">
                      <div className="custom-control custom-control-sm custom-checkbox notext">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          onChange={(e) => selectorCheck(e)}
                          id="uid"
                        />
                        <label className="custom-control-label" htmlFor="uid"></label>
                      </div>
                    </DataTableRow>
                  )}
                  <DataTableRow>
                    <span className="sub-text">ID</span>
                  </DataTableRow>
                  <DataTableRow size="lg">
                    <span className="sub-text">FullName</span>
                  </DataTableRow>
                  <DataTableRow size="lg">
                    <span className="sub-text">Email</span>
                  </DataTableRow>
                </DataTableHead>
                {data.length > 0
                  ? data.map((item) => {
                      return (
                        <DataTableItem key={item.id}>
                          {canModify(role, "subject-teacher", "crud") && (
                            <DataTableRow className="nk-tb-col-check">
                              <div className="custom-control custom-control-sm custom-checkbox notext">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  defaultChecked={item.checked}
                                  id={item.id + "uid1"}
                                  key={Math.random()}
                                  onChange={(e) => onSelectChange(e, item.id)}
                                />
                                <label className="custom-control-label" htmlFor={item.id + "uid1"}></label>
                              </div>
                            </DataTableRow>
                          )}
                          <DataTableRow>
                            <span>{item.id}</span>
                          </DataTableRow>
                          <DataTableRow size="lg">
                            <span style={{ cursor: "pointer" }}>{item.fullname}</span>
                          </DataTableRow>
                          <DataTableRow size="lg">
                            <span>{item.email}</span>
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })
                  : null}
              </DataTableBody>
              <div className="card-inner">
                {data.length === 0 && (
                  <div className="text-center">
                    <span className="text-silent">No data found</span>
                  </div>
                )}
              </div>
            </DataTable>
          </Block>
          <ToastContainer />
          <AddSubjectTeachersModal
            modal={modal.add}
            closeModal={closeModal}
            data={users}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSaveChanges}
            isFetching={isFetching.add}
          />
        </Content>
      )}
    </>
  );
}
