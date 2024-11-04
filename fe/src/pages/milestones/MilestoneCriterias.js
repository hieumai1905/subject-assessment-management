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
import { convertToOptions } from "../../utils/Utils";
import authApi from "../../utils/ApiAuth";
import { Spinner } from "reactstrap";

const roles = ["Market", "Finance", "Development"];
const randomID = () => {
  return Math.floor(Math.random() * 1000000);
};

function EditToolbar(props) {
  const { setCriterias, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setCriterias((oldRows) => [
      ...oldRows,
      { id, criteriaName: "", evalWeight: 0, locEvaluation: true, guides: "", active: true, isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "criteriaName" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

export default function MilestoneCriterias({
  criterias,
  setCriterias,
  milestone,
  selectedParent,
  setSelectedParent,
  onSubmit,
  reload,
  isFetching,
}) {
  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
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

  const columns = [
    { field: "criteriaName", headerName: "Name", width: 280, editable: true },
    {
      field: "evalWeight",
      headerName: "Evaluation Weight (%)",
      type: "number",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    // {
    //   field: "locEvaluation",
    //   headerName: "Loc Evaluation",
    //   type: "boolean",
    //   width: 180,
    //   editable: true,
    // },
    // {
    //   field: "active",
    //   headerName: "Active",
    //   width: 80,
    //   editable: true,
    //   type: "boolean",
    // },
    {
      field: "note",
      headerName: "Note",
      width: 320,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} color="inherit" />,
        ];
      },
    },
  ];

  const [parentCriterias, setParentCriterias] = React.useState([]);
  const [isFetchParent, setIsFetchParent] = React.useState(true);
  React.useEffect(() => {
    const fetchParentCriterias = async () => {
      try {
        if (!milestone?.id) return;
        const response = await authApi.post("/milestone-criteria/search", {
          pageSize: 9999,
          milestoneId: milestone?.id,
          active: true,
        });
        console.log("parent criterias:", response.data.data);
        if (response.data.statusCode === 200) {
          let parentCriterias = response.data.data.milestoneCriterias.filter((item) => item.parentCriteriaId === null);
          setParentCriterias(convertToOptions(parentCriterias, "id", "criteriaName"));
          if (parentCriterias.length > 0) {
            setSelectedParent({
              value: parentCriterias[0].id,
              label: parentCriterias[0].criteriaName,
            });
          }
          setIsFetchParent(false);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error search parent criterias!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };
    fetchParentCriterias();
  }, [milestone]);

  React.useEffect(() => {
    const fetchCriterias = async () => {
      try {
        if (!selectedParent?.value) return;
        const response = await authApi.post("/milestone-criteria/search", {
          pageSize: 9999,
          milestoneId: milestone?.id,
          parentCriteriaId: selectedParent?.value,
          active: true,
        });
        console.log("criterias:", response.data.data);
        if (response.data.statusCode === 200) {
          setCriterias(response.data.data.milestoneCriterias);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error search criterias!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };
    fetchCriterias();
  }, [selectedParent, reload]);

  return (
    <PreviewCard>
      <ToastContainer />
      <BlockHead size="sm">
        <div className="row">
          <div className="col-md-6">
            <BlockHeadContent>
              <div className="w-50">
                <span className="form-label">Parent Criteria</span>
                <RSelect
                  options={parentCriterias}
                  value={selectedParent}
                  onChange={(e) => {
                    setSelectedParent(e);
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
                <Button onClick={() => onSubmit()}>Save Changes</Button>
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
            toolbar: { setCriterias, setRowModesModel },
          }}
        />
      </Box>
    </PreviewCard>
  );
}
