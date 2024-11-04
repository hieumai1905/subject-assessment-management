import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
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
import { BlockBetween, BlockDes, BlockHead, BlockHeadContent, PreviewCard } from "../../components/Component";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";
import { formatDate } from "../../utils/Utils";
import FormModal from "./FormModal";
import { evaluationTypes } from "../../data/ConstantData";
import AssignmentIcon from '@mui/icons-material/Assignment';
import ViewDetailModal from "./ViewDetailModal";

const roles = ["Market", "Finance", "Development"];
const randomID = () => {
  return Math.floor(Math.random() * 1000000);
};

function EditToolbar(props) {
  const { setAssignments, setRowModesModel, modal, setModal, setId } = props;

  const handleClick = () => {
    const id = randomId();
    setModal({ add: true });
    setId(id);
    // setAssignments((oldRows) => [
    //   ...oldRows,
    //   { id, title: "", evalWeight: 0, expectedLoc: 0, note: "", active: true, isNew: true },
    // ]);
    // setRowModesModel((oldModel) => ({
    //   ...oldModel,
    //   [id]: { mode: GridRowModes.Edit, fieldToFocus: "title" },
    // }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add Assignment
      </Button>
    </GridToolbarContainer>
  );
}

export default function AssignmentsDatagrid({ assignments, setAssignments, onSubmit, isFetching }) {
  const [rowModesModel, setRowModesModel] = React.useState({});
  const { role } = useAuthStore((state) => state);
  const [id, setId] = React.useState();
  const [updateData, setUpdateData] = React.useState({
    title: "",
    evalWeight: 1,
    expectedLoc: 1,
    typeEvaluator: null,
    displayOrder: 1,
    active: "Active",
    note: "",
  });
  const [modal, setModal] = React.useState({
    edit: false,
    add: false,
  });

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    // setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    setId(id);
    let updateAsm = assignments.find((item) => item.id === id);
    setUpdateData({
      id: id,
      title: updateAsm.title,
      evalWeight: updateAsm.evalWeight,
      expectedLoc: updateAsm.expectedLoc,
      typeEvaluator: evaluationTypes.find(item => item.value === updateAsm.typeEvaluator),
      displayOrder: updateAsm.displayOrder,
      active: updateAsm.active ? "Active" : "InActive",
      note: updateAsm.note,
      updatedDate: updateAsm?.updatedDate,
    });
    setModal({ edit: true });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to delete this criteria?") === true)
      setAssignments(assignments.filter((row) => row.id !== id));
  };

  const handleDetailClick = (id) => {
    if (typeof id === "string") {
      toast.info("This assignemnt is not added to system!", { position: "top-center" });
      return false;
    }
    setId(id);
    let updateAsm = assignments.find((item) => item.id === id);
    setUpdateData({
      id: id,
      title: updateAsm.title,
      evalWeight: updateAsm.evalWeight,
      expectedLoc: updateAsm.expectedLoc,
      typeEvaluator: evaluationTypes.find(item => item.value === updateAsm.typeEvaluator),
      displayOrder: updateAsm.displayOrder,
      active: updateAsm.active ? "Active" : "InActive",
      note: updateAsm.note,
      updatedDate: updateAsm?.updatedDate,
    });
    setModal({ detail: true });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = assignments.find((row) => row.id === id);
    if (editedRow.isNew) {
      setAssignments(assignments.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setAssignments(assignments.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: "title", headerName: "Title", width: 170, editable: false },
    {
      field: "evalWeight",
      headerName: "Weight (%)",
      type: "number",
      width: 80,
      align: "right",
      headerAlign: "left",
      editable: false,
    },
    {
      field: "expectedLoc",
      headerName: "Expected LOC",
      type: "number",
      width: 160,
      editable: false,
    },
    {
      field: "typeEvaluator",
      headerName: "Type",
      width: 180,
      editable: false,
    },
    // {
    //   field: "displayOrder",
    //   headerName: "Priority",
    //   type: "number",
    //   width: 80,
    //   editable: false,
    // },
    {
      field: "active",
      headerName: "Active",
      width: 80,
      editable: false,
      type: "boolean",
    },
    // {
    //   field: "note",
    //   headerName: "Note",
    //   width: 320,
    //   editable: false,
    // },
    {
      field: "updatedDate",
      headerName: "Last Update",
      width: 140,
      valueFormatter: (params) => {
        return formatDate(params);
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
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
        let actions = canModify(role, "assignment", "crud")
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
      <BlockHead size="sm">
        {canModify(role, "assignment", "crud") && (
          <BlockBetween>
            <BlockHeadContent>
              <BlockDes className="text-warning fw-bold">
                {/* All changes will only be saved to the system when you click the Save Changes button. */}
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              {isFetching.updateList ? (
                <Spinner color="primary" />
              ) : (
                <Button onClick={() => onSubmit()}>Save Changes</Button>
              )}
            </BlockHeadContent>
          </BlockBetween>
        )}
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
          rows={assignments}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          pageSizeOptions={[]}
          // slots={{
          //   toolbar: EditToolbar,
          // }}
          slots={canModify(role, "assignment", "crud") ? { toolbar: EditToolbar } : {}}
          slotProps={
            canModify(role, "assignment", "crud")
              ? { toolbar: { setAssignments, setRowModesModel, modal, setModal, setId } }
              : {}
          }
          // slotProps={{
          //   toolbar: { setAssignments, setRowModesModel },
          // }}
        />
      </Box>
      <FormModal
        id={id}
        modal={modal.add}
        setModal={setModal}
        modalType="add"
        assignments={assignments}
        setAssignments={setAssignments}
      />
      {modal?.edit && (
        <FormModal
          id={id}
          modal={modal.edit}
          setModal={setModal}
          modalType="edit"
          assignments={assignments}
          setAssignments={setAssignments}
          updateData={updateData}
        />
      )}
      {modal?.detail && (
        <ViewDetailModal
          modal={modal.detail}
          setModal={setModal}
          updateData={updateData}
        />
      )}
    </PreviewCard>
  );
}
