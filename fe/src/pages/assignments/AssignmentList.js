import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockBetween,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Icon,
  Button,
  PaginationComponent,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Row,
  Col,
  RSelect,
} from "../../components/Component";
import FormModal from "./FormModal";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useQueryAssignment from "../../hooks/UseQueryAssignment";
import { Link, useNavigate } from "react-router-dom";
import AssignmentsDatagrid from "./AssignmentsDatagrid";
import useAuthStore from "../../store/Userstore";
import { Spinner } from "reactstrap";
import { evaluationTypes } from "../../data/ConstantData";

export const AssignmentList = ({ subject }) => {
  const [sm, updateSm] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const navigate = useNavigate();
  const { role } = useAuthStore((state) => state);
  const [editId, setEditedId] = useState();
  const [reload, setReload] = useState(false);
  const [isFetching, setIsFetching] = useState({
    updateList: false,
  });
  const [loadings, setLoadings] = useState(false);
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [search, setSearch] = useState({});
  const [filterForm, setFilterForm] = useState({
    title: "",
    minExpectedLoc: null,
    maxExpectedLoc: null,
    active: null,
  });
  const [assignments, setAssignments] = useState([]);
  const { subjectSettingResponse, loading, error } = useQueryAssignment({
    currentPage,
    itemPerPage,
    setTotalElements,
    search,
    subjectId: subject?.id,
    sortBy,
    orderBy,
    reload,
    setAssignments,
  });
  useEffect(() => {
    if (error) {
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }, [error]);

  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    expectedLoc: "",
    evalWeight: "",
    note: "",
    active: "Active",
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    expectedLoc: "",
    evalWeight: "",
    note: "",
    active: "",
  });

  // function to reset the form
  const resetForm = () => {
    setFormData({
      title: "",
      expectedLoc: "",
      evalWeight: "",
      note: "",
      active: "Active",
    });
    setFormErrors({});
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ edit: false });
    resetForm();
  };

  // submit function to add a new item
  const onFormSubmit = async (sData) => {
    setIsFetching({ ...isFetching, updateList: true });
    let normal = 0, final = 0, grandFinal = 0;
    const updatedAssignmentsForm = assignments.map((assignment) => {
      if(assignment.typeEvaluator === evaluationTypes[0].value)
        normal++;
      else if(assignment.typeEvaluator === evaluationTypes[1].value)
        final++;
      else if(assignment.typeEvaluator === evaluationTypes[2].value)
        grandFinal++;
      if (typeof assignment.id === "string") {
        return { ...assignment, id: null };
      }
      return assignment;
    });
    if(grandFinal === 0 || final === 0 || normal === 0){
      toast.error(`Assignment type must have one Grand Final, one Final and at least one Normal`, {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching({ ...isFetching, updateList: false });
      return;
    }
    console.log(updatedAssignmentsForm);
    try {
      const response = await authApi.put("/assignment/update-list", {
        subjectId: subject?.id,
        assignmentList: updatedAssignmentsForm,
      });
      console.log("update assignments:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Update assignments successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setReload(!reload);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
      setIsFetching({ ...isFetching, updateList: false });
    } catch (error) {
      console.error("Error updating assignments:", error);
      toast.error("Error updating assignments!", {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching({ ...isFetching, updateList: false });
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { title, expectedLoc, evalWeight, active, note } = sData;
    try {
      const response = await authApi.put("/assignment/update/" + editId, {
        id: editId,
        title: title,
        expectedLoc: expectedLoc,
        evalWeight: evalWeight,
        active: active === "Active",
        note: note,
        subjectId: subject?.id,
      });
      console.log("edit assignment: ", response.data);
      if (response.data.statusCode === 200) {
        toast.success("Update assignment successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData;
        assignments.forEach((item) => {
          if (item.id === editId) {
            submittedData = {
              id: editId,
              title: title,
              expectedLoc: expectedLoc,
              evalWeight: evalWeight,
              active: active === "Active",
              note: note,
            };
          }
        });
        let index = assignments.findIndex((item) => item.id === editId);
        assignments[index] = submittedData;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error update assignment:", error);
      toast.error("Error update assignment!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    assignments.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          title: item.title,
          expectedLoc: item.expectedLoc,
          evalWeight: item.evalWeight,
          active: item.active ? "Active" : "InActive",
          note: item.note,
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  // function to delete selected item
  const onDeleteClick = (id) => {
    let newData = [...data];
    let index = newData.findIndex((item) => item.id === id);
    if (index !== -1) {
      newData.splice(index, 1);
      setData(newData);
    }
  };

  const handleFilter = () => setSearch(filterForm);

  const handleSort = (sortField) => {
    setSortBy(sortField);
    setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <>
      {(loading || loadings) && (
        <div className="d-flex justify-content-center">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      )}
      <Head title="Assignment List"></Head>
      <Content>
        <Block>
          <AssignmentsDatagrid
            assignments={assignments}
            setAssignments={setAssignments}
            onSubmit={onFormSubmit}
            isFetching={isFetching}
          />
        </Block>
      </Content>
    </>
  );
};

export default AssignmentList;
