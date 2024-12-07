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
import { toast, ToastContainer } from "react-toastify";
import { convertToOptions, formatDate } from "../../utils/Utils";
import authApi from "../../utils/ApiAuth";
import { Spinner } from "reactstrap";
import { evaluationTypes } from "../../data/ConstantData";
import CriteriaFormModal from "./CriteriaFormModal";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ViewDetailModal from "./ViewDetailModal";

const roles = ["Market", "Finance", "Development"];
const randomID = () => {
  return Math.floor(Math.random() * 1000000);
};

function EditToolbar(props) {
  const { setCriterias, setRowModesModel, setId, setModal } = props;

  const handleClick = () => {
    // const id = randomId();
    // setCriterias((oldRows) => [
    //   ...oldRows,
    //   { id, criteriaName: "", evalWeight: 0, locEvaluation: true, guides: "", active: true, isNew: true },
    // ]);
    // setRowModesModel((oldModel) => ({
    //   ...oldModel,
    //   [id]: { mode: GridRowModes.Edit, fieldToFocus: "criteriaName" },
    // }));
    const id = randomId();
    setId(id);
    setModal({ add: true });
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Thêm mới
      </Button>
    </GridToolbarContainer>
  );
}

export default function MilestoneCriterias({ classes }) {
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [criterias, setCriterias] = React.useState([]);
  const [milestone, setMilestone] = React.useState({});
  const [selectedParent, setSelectedParent] = React.useState({});
  const [isFetching, setIsFetching] = React.useState({
    milestone: true,
    criterias: true,
    updateCriterias: false,
  });
  const [reload, setReload] = React.useState(false);
  const [id, setId] = React.useState();
  const [updateData, setUpdateData] = React.useState({
    criteriaName: "",
    evalWeight: 1,
    locEvaluation: "Active",
    active: "Active",
    note: "",
  });
  const [modal, setModal] = React.useState({
    edit: false,
    add: false,
  });
  const [milestones, setMilestones] = React.useState([]);

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
      note: updateCriteria.note,
      active: updateCriteria.active ? "Active" : "InActive",
    });
    setModal({ edit: true });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Bạn có chắc chắn muốn xóa tiêu chí này?") === true)
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

  const onSubmit = async () => {
    let haveLocEval = 0;
    let updateCriterias = [...criterias];
    const submitForm = updateCriterias.map((criteria) => {
      if (criteria.locEvaluation) {
        haveLocEval++;
      }
      //  else{
      //   criteria.updatedDate = new Date();
      // }
      if (typeof criteria.id === "string") {
        return { ...criteria, id: null };
      }
      return criteria;
    });
    setIsFetching({ ...isFetching, updateCriterias: true });
    console.log("sData", submitForm);
    try {
      let url = "/milestone-criteria/update-list-milestone-criteria/" + milestone?.value;
      const response = await authApi.put(url, submitForm);
      console.log(`Update criterias:`, response.data.data);
      if (response.data.statusCode === 200) {
        toast.success(`Cập nhật tiêu chí thành công`, {
          position: toast.POSITION.TOP_CENTER,
        });
        setReload(!reload);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-undef
      console.error(`Error Update criterias:`, error);
      // eslint-disable-next-line no-undef
      toast.error(`Xảy ra lỗi khi cập nhật tiêu chí`, {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, updateCriterias: false });
    }
  };

  const handleDetailClick = (id) => {
    setId(id);
    let updateCriteria = criterias.find((item) => item.id === id);
    setUpdateData({
      id: id,
      criteriaName: updateCriteria.criteriaName,
      evalWeight: updateCriteria.evalWeight,
      locEvaluation: updateCriteria.locEvaluation ? "Active" : "InActive",
      note: updateCriteria.note,
      active: updateCriteria.active ? "Active" : "InActive",
    });
    setModal({ detail: true });
  };

  const columns = [
    { field: "criteriaName", headerName: "Tên tiêu chí", width: 280 },
    {
      field: "evalWeight",
      headerName: "Tỷ trọng (%)",
      type: "number",
      width: 80,
      align: "left",
      headerAlign: "left",
      // editable: true,
    },
    {
      field: "locEvaluation",
      headerName: "Đánh giá LOC",
      type: "boolean",
      width: 130,
      // editable: true,
    },
    {
      field: "updatedDate",
      headerName: "Cập nhật lần cuối",
      width: 180,
      valueFormatter: (params) => {
        return formatDate(params);
      },
    },
    // {
    //   field: "note",
    //   headerName: "Note",
    //   width: 320,
    //   editable: true,
    // },
    {
      field: "actions",
      type: "actions",
      headerName: "Hành động",
      width: 100,
      cellClassName: "actions",
      getActions: (params) => {
        let actions = [];
        let id = params.row.id;
        if (!params?.row?.locEvaluation && params?.row?.canEdit) {
          actions = [
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
          ];
        } else {
          actions = [
            <GridActionsCellItem
              icon={<AssignmentIcon title="Details" />}
              label="Details"
              onClick={() => handleDetailClick(id)}
              color="inherit"
            />,
          ];
        }
        return actions;
      },
    },
  ];

  React.useEffect(() => {
    const fetchMilestones = async () => {
      try {
        if (!classes) {
          setMilestones([]);
          setMilestone(null);
          setIsFetching({ ...isFetching, milestone: false });
          return false;
        }
        setIsFetching({ ...isFetching, milestone: true });
        const response = await authApi.post("/milestone/search", {
          pageSize: 9999,
          classId: classes?.id,
          pageIndex: 1,
          sortBy: "displayOrder",
          orderBy: "ASC",
          // active: true,
        });
        console.log("milestones:", response.data.data);
        if (response.data.statusCode === 200) {
          let rMilestone = response.data.data.milestoneResponses;
          rMilestone = rMilestone.filter((item) => item.evaluationType !== evaluationTypes[2].value);

          setMilestones(convertToOptions(rMilestone, "id", "title"));
          if (rMilestone.length > 0) {
            setMilestone({
              value: rMilestone[0]?.id,
              label: rMilestone[0]?.title,
            });
          } else {
            setMilestone(null);
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm cột mốc", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, milestone: false });
      }
    };
    fetchMilestones();
  }, [classes]);

  React.useEffect(() => {
    const fetchCriterias = async () => {
      try {
        if (!milestone?.value) {
          setCriterias([]);
          setIsFetching({ ...isFetching, criterias: false });
          return;
        }
        setIsFetching({ ...isFetching, criterias: true });
        const response = await authApi.post("/milestone-criteria/search", {
          pageSize: 9999,
          pageIndex: 1,
          milestoneId: milestone?.value,
          // active: true,
        });
        console.log("criterias:", response.data.data);
        if (response.data.statusCode === 200) {
          let rCriterias = response.data.data.milestoneCriterias;
          setCriterias(rCriterias);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm tiêu chí", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, criterias: false });
      }
    };
    fetchCriterias();
  }, [milestone]);

  return (
    <PreviewCard>
      <ToastContainer />
      <BlockHead size="sm">
        <div className="row">
          <div className="col-md-6">
            <BlockHeadContent>
              <div className="w-50">
                <span className="form-label">Cột mốc</span>
                <RSelect
                  options={milestones}
                  value={milestone}
                  onChange={(e) => {
                    setMilestone(e);
                  }}
                />
              </div>
            </BlockHeadContent>
          </div>
          <div className="col-md-6 text-end">
            <BlockHeadContent>
              {isFetching.updateCriterias ? (
                <Spinner color="primary" />
              ) : (
                <Button onClick={() => onSubmit()}>Lưu thay đổi</Button>
              )}
            </BlockHeadContent>
          </div>
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
        {isFetching?.criterias ? (
          <div className="d-flex justify-content-center">
            <Spinner style={{ width: "3rem", height: "3rem" }} />
          </div>
        ) : (
          <DataGrid
            rows={criterias}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            slots={{
              toolbar: EditToolbar,
            }}
            slotProps={{
              toolbar: { setCriterias, setRowModesModel, setId, setModal },
            }}
          />
        )}
      </Box>
      {modal?.add && (
        <CriteriaFormModal
          id={id}
          modal={modal.add}
          setModal={setModal}
          modalType="add"
          criterias={criterias}
          setCriterias={setCriterias}
        />
      )}
      {modal?.edit && (
        <CriteriaFormModal
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
