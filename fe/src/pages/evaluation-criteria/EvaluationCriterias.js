import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { randomCreatedDate, randomTraderName, randomId, randomArrayItem } from "@mui/x-data-grid-generator";
import { BlockBetween, BlockHead, BlockHeadContent, PreviewCard, RSelect } from "../../components/Component";
import { Spinner } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import { convertToOptions } from "../../utils/Utils";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";
import FormModal from "./FormModal";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ViewDetailModal from "./ViewDetailModal";

const roles = ["Market", "Finance", "Development"];
const randomID = () => {
  return Math.floor(Math.random() * 1000000);
};

function EditToolbar(props) {
  const { setCriterias, setRowModesModel, setId, setModal } = props;

  const handleClick = () => {
    const id = randomId();
    setId(id);
    setModal({ add: true });
    // setCriterias((oldRows) => [
    //   ...oldRows,
    //   { id, criteriaName: "", evalWeight: 0, locEvaluation: true, guides: "", active: true, isNew: true },
    // ]);
    // setRowModesModel((oldModel) => ({
    //   ...oldModel,
    //   [id]: { mode: GridRowModes.Edit, fieldToFocus: "criteriaName" },
    // }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Thêm mới
      </Button>
    </GridToolbarContainer>
  );
}
//{ criterias, setCriterias, onSubmit, isFetching, subjectId }
export default function CriteriaListDatagrid({ subject }) {
  const [criterias, setCriterias] = React.useState([]);
  const [assignments, setAssignments] = React.useState([]);
  const [selectedAssignment, setSelectedAssignment] = React.useState(null);
  const [reload, setReload] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState({
    assignments: true,
    criterias: false,
  });
  const { role } = useAuthStore((state) => state);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [loadings, setLoadings] = React.useState(false);
  const [id, setId] = React.useState();
  const [updateData, setUpdateData] = React.useState({
    criteriaName: "",
    evalWeight: 1,
    locEvaluation: "Active",
    active: "Active",
    guides: "",
  });
  const [modal, setModal] = React.useState({
    edit: false,
    add: false,
  });

  React.useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsFetching({ ...isFetching, assignments: true });
        const response = await authApi.post("/assignment/search", {
          pageSize: 9999,
          pageIndex: 1,
          sortBy: "displayOrder",
          orderBy: "ASC",
          subjectId: subject?.id,
          title: "",
        });
        console.log("assignments:", response.data.data);
        if (response.data.statusCode === 200) {
          setAssignments(convertToOptions(response.data.data.assignmentDTOS, "id", "title"));
          if (response.data.data.assignmentDTOS.length > 0) {
            setSelectedAssignment({
              value: response.data.data.assignmentDTOS[0]?.id,
              label: response.data.data.assignmentDTOS[0]?.title,
            });
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm bài kiểm tra:", error);
        toast.error("Lỗi khi tìm kiếm bài kiểm tra!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, assignments: false });
      }
    };
    fetchAssignments();
  }, [subject]);

  React.useEffect(() => {
    const fetchCriterias = async () => {
      try {
        if (selectedAssignment === null) return false;
        setLoadings(true);
        const response = await authApi.post("/evaluation-criteria/search", {
          pageSize: 9999,
          pageIndex: 1,
          assignmentId: selectedAssignment?.value,
        });
        console.log("criterias:", response.data.data);
        if (response.data.statusCode === 200) {
          setCriterias(response.data.data.evaluationCriteriaDTOS);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm tiêu chí đánh giá:", error);
        toast.error("Lỗi khi tìm kiếm tiêu chí đánh giá!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setLoadings(false);
      }
    };
    fetchCriterias();
  }, [selectedAssignment, reload]);

  const onSubmit = async () => {
    let haveLocEval = 0;
    const submitForm = {
      assignmentId: selectedAssignment?.value,
      listEvaluationCriteria: criterias.map((criteria) => {
        // if (criteria.locEvaluation) {
        //   haveLocEval++;
        // }
        if (typeof criteria.id === "string") {
          return { ...criteria, id: null };
        }
        return criteria;
      }),
    };
    // if (haveLocEval === 0) {
    //   toast.error(`Tiêu chí đánh giá cần bao gồm một mục để đánh giá LOC!`, {
    //     position: toast.POSITION.TOP_CENTER,
    //   });
    //   return;
    // }
    // if (haveLocEval > 1) {
    //   toast.error(`Tiêu chí đánh giá chỉ cần một mục để đánh giá LOC!`, {
    //     position: toast.POSITION.TOP_CENTER,
    //   });
    //   return;
    // }
    setIsFetching({ ...isFetching, criterias: true });
    console.log("sData", submitForm);
    try {
      let action = "Cập nhật";
      let url = "/evaluation-criteria/update-evaluation-criteria";
      const response = await authApi.put(url, submitForm);
      console.log(`${action} tiêu chí:`, response.data.data);
      if (response.data.statusCode === 200) {
        toast.success(`${action} tiêu chí thành công!`, {
          position: toast.POSITION.TOP_CENTER,
        });
        setReload(!reload);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
      setIsFetching({ ...isFetching, criterias: false });
    } catch (error) {
      console.error(`Lỗi khi ${action} tiêu chí:`, error);
      toast.error(`Lỗi khi ${action} tiêu chí!`, {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching({ ...isFetching, criterias: false });
    }
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    // setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    setId(id);
    let updateCriteria = criterias.find((item) => item.id === id);
    setUpdateData({
      id: id,
      criteriaName: updateCriteria.criteriaName,
      evalWeight: updateCriteria.evalWeight,
      locEvaluation: updateCriteria.locEvaluation ? "Active" : "InActive",
      guides: updateCriteria.guides,
      active: updateCriteria.active ? "Active" : "InActive",
    });
    setModal({ edit: true });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to delete this criteria?") === true)
      setCriterias(criterias.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = criterias.find((row) => row.id === id);
    if (editedRow.isNew) {
      setCriterias(criterias.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setCriterias(criterias.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleDetailClick = (id) => {
    setId(id);
    let updateCriteria = criterias.find((item) => item.id === id);
    setUpdateData({
      id: id,
      criteriaName: updateCriteria.criteriaName,
      evalWeight: updateCriteria.evalWeight,
      locEvaluation: updateCriteria.locEvaluation ? "Active" : "InActive",
      guides: updateCriteria.guides,
      active: updateCriteria.active ? "Active" : "InActive",
    });
    setModal({ detail: true });
  };

  const columns = [
    { field: "criteriaName", headerName: "Tên tiêu chí", width: 280, editable: false },
    {
      field: "evalWeight",
      headerName: "Trọng số(%)",
      type: "number",
      width: 140,
      align: "left",
      headerAlign: "left",
      editable: false,
    },
    {
      field: "locEvaluation",
      headerName: "Đánh giá LOC",
      type: "boolean",
      width: 180,
      editable: false,
    },
    {
      field: "active",
      headerName: "Trạng thái",
      width: 80,
      editable: false,
      type: "boolean",
    },
    // {
    //   field: "guides",
    //   headerName: "Guides",
    //   width: 320,
    //   editable: true,
    // },
    {
      field: "actions",
      type: "actions",
      headerName: "Hành động",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          // return [
          //   <GridActionsCellItem
          //     icon={<SaveIcon />}
          //     label="Save"
          //     sx={{
          //       color: "primary.main",
          //     }}
          //     onClick={handleSaveClick(id)}
          //   />,
          //   <GridActionsCellItem
          //     icon={<CancelIcon />}
          //     label="Cancel"
          //     className="textPrimary"
          //     onClick={handleCancelClick(id)}
          //     color="inherit"
          //   />,
          // ];
        }

        let actions = canModify(role, "evaluation-criteria", "crud")
          ? [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                className="textPrimary"
                onClick={handleEditClick(id)}
                color="inherit"
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
                color="inherit"
              />,
            ]
          : [
              <GridActionsCellItem
                icon={<AssignmentIcon title="Details" />}
                label="Details"
                onClick={() => handleDetailClick(id)}
                color="inherit"
              />,
            ];
        return actions;
      },
    },
  ];

  return (
    <PreviewCard>
      <ToastContainer />
      <BlockHead size="sm">
        <div className="row">
          <div className="col-md-9">
            <div className="form-group w-50">
              {isFetching.assignments ? (
                <Spinner style={{ width: "3rem", height: "3rem" }} />
              ) : (
                <RSelect
                  options={assignments}
                  value={selectedAssignment}
                  onChange={(e) => {
                    setSelectedAssignment(e);
                  }}
                />
              )}
            </div>
          </div>
          {canModify(role, "evaluation-criteria", "crud") && (
            <React.Fragment>
              {/* <div className="col-md-7 text-warning fw-bold">
                All changes will only be saved to the system when you click the Save Changes button.
              </div> */}
              <div className="col-md-2 ms-5 text-end">
                {isFetching.criterias ? (
                  <Spinner color="primary" />
                ) : (
                  <Button onClick={() => onSubmit()}>Lưu thay đổi</Button>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      </BlockHead>
      <Box
        sx={{
          height: 500,
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        {!loadings ? (
          <DataGrid
            rows={criterias}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            pageSizeOptions={[]}
            slots={canModify(role, "evaluation-criteria", "crud") ? { toolbar: EditToolbar } : {}}
            slotProps={{
              toolbar: { setCriterias, setRowModesModel, setId, setModal },
            }}
          />
        ) : (
          <div className="d-flex justify-content-center">
            <Spinner style={{ width: "3rem", height: "3rem" }} />
          </div>
        )}
      </Box>
      {modal?.add && (
        <FormModal
          id={id}
          modal={modal.add}
          setModal={setModal}
          modalType="add"
          criterias={criterias}
          setCriterias={setCriterias}
        />
      )}
      {modal?.edit && (
        <FormModal
          id={id}
          modal={modal.edit}
          setModal={setModal}
          modalType="edit"
          criterias={criterias}
          setCriterias={setCriterias}
          updateData={updateData}
        />
      )}
      {modal?.detail && <ViewDetailModal modal={modal.detail} setModal={setModal} updateData={updateData} />}
    </PreviewCard>
  );
}
