import * as React from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridCellEditStopReasons,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
} from "../../components/Component";
import {
  convertToOptions,
  createExcelWithFormula,
  formatDate,
  generateTemplate,
  getValueByLabel,
  isNullOrEmpty,
  isNumber,
  shortenString,
} from "../../utils/Utils";
import { Input, Spinner } from "reactstrap";
import authApi from "../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";
import { Box, Checkbox, FormControlLabel, gridClasses, Menu, MenuItem, Popover } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { canEvaluate } from "../../utils/CheckPermissions";
import FormModal from "./FormModal";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import useAuthStore from "../../store/Userstore";
import FinalEvalModal from "./FinalEvalModal";
import ImportEvalModal from "./ImportEvalModal";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { evaluationTypes } from "../../data/ConstantData";

function createValueParser(min) {
  return (params) => {
    if (params < min) params = min;
    // if (params > max) params = max;
    return params;
  };
}

function CustomToolbar({
  evaluations,
  setEvaluations,
  complexities,
  qualities,
  columnVisibilityModel,
  setColumnVisibilityModel,
  columns,
  typeEvaluator,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [hideColumns, setHideColumns] = React.useState(columnVisibilityModel);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setColumnVisibilityModel(hideColumns);
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setHideColumns((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const filteredColumns = columns.filter((col) =>
    col.headerName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  return (
    <GridToolbarContainer>
      <div
        style={{
          color: "#1976d2",
          fontSize: "0.8125rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
        onClick={handleOpenMenu}
      >
        <ViewColumnIcon /> COLUMNS
      </div>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{ ".MuiPaper-root": { backgroundColor: "white", padding: 1 } }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {filteredColumns.map((col, index) => (
            <MenuItem key={index} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox checked={hideColumns[col.field] ?? true} onChange={handleCheckboxChange} name={col.field} />
                }
                label={col.headerName}
                sx={{ width: "100%", m: 0, p: 1 }}
              />
            </MenuItem>
          ))}
        </Box>
      </Popover>
      <GridToolbarFilterButton />
      <CustomImportExportButton
        evaluations={evaluations}
        setEvaluations={setEvaluations}
        complexities={complexities}
        qualities={qualities}
        typeEvaluator={typeEvaluator}
      />
    </GridToolbarContainer>
  );
}

function CustomImportExportButton({ evaluations, setEvaluations, complexities, qualities, typeEvaluator }) {
  const [loadings, setLoadings] = React.useState({
    export: false,
  });

  const exportEval = async () => {
    await generateTemplate(evaluations, complexities, qualities, typeEvaluator);
    setLoadings((prev) => ({
      ...prev,
      export: false,
    }));
  };

  return (
    <>
      <div
        style={{
          color: "#1976d2",
          fontSize: "0.8125rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
        onClick={() => {
          setLoadings((prev) => ({
            ...prev,
            export: true,
          }));
          exportEval();
        }}
      >
        {loadings.export ? (
          <Spinner />
        ) : (
          <>
            <FileDownloadIcon /> EXPORT
          </>
        )}
      </div>
    </>
  );
}

export default function RequirementEvaluations({
  evaluations,
  setEvaluations,
  milestone,
  filterForm,
  teams,
  complexities,
  qualities,
  role,
  user,
  loadings,
  classes,
  mileActive,
  typeEvaluator,
  setHaveChanged
}) {
  const [rows, setRows] = React.useState([]);
  const [columns, setColumns] = React.useState([]);
  const [columnsGroups, setColumnGroups] = React.useState([]);
  const [changedFields, setChangedFields] = React.useState([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [canEdit, setCanEdit] = React.useState(false);
  const [canEditModal, setCanEditModal] = React.useState(false);
  const [modal, setModal] = React.useState({
    evaluate: false,
    finalEval: false,
    importEval: false,
  });
  const [rowId, setRowId] = React.useState();
  const [evaluation, setEvaluation] = React.useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({
    id: false,
    status: false,
    reqTitle: true,
    teamTeamName: true,
    studentFullname: true,
    loc: true,
    update_loc: true,
    actions: true,
  });

  React.useEffect(() => {
    if (classes && user && role && filterForm?.milestone?.value) {
      setCanEdit(canEvaluate(user, role, classes) && mileActive === filterForm?.milestone?.value);
    }
  }, [classes, user, role, filterForm?.milestone?.value]);

  React.useEffect(() => {
    const createRows = () => {
      if (evaluations === undefined || evaluations === null || evaluations.length === 0) setRows([]);
      let customRows = evaluations.map((evaluation, index) => {
        return {
          id: evaluation.id,
          reqTitle: evaluation.reqTitle,
          teamTeamName: evaluation?.teamTeamName,
          milestoneTitle: evaluation?.milestoneTitle,
          studentFullname: evaluation?.studentFullname,
          status: evaluation?.status,
          loc: evaluation?.requirementEval?.grade,
          comment: evaluation?.requirementEval?.comment,
          complexity: complexities?.find((item) => item.id === evaluation?.requirementEval?.complexityId)?.name || "",
          quality: qualities?.find((item) => item.id === evaluation?.requirementEval?.qualityId)?.name || "",
          updated: evaluation?.updateTrackings,
          update_loc: evaluation?.updateRequirementEval?.grade,
          update_complexity:
            complexities?.find((item) => item.id === evaluation?.updateRequirementEval?.complexityId)?.name || "",
          update_quality:
            qualities?.find((item) => item.id === evaluation?.updateRequirementEval?.qualityId)?.name || "",
          update_comment: evaluation?.updateRequirementEval?.comment,
        };
      });
      console.log("custom row:", customRows);
      setRows(customRows);
    };
    createRows();
  }, [evaluations]);

  React.useEffect(() => {
    const createColumns = () => {
      if (evaluations === undefined || evaluations === null || evaluations.length === 0) setColumns([]);
      const baseColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
          field: "reqTitle",
          headerName: "Title",
          width: 200,
        },
        { field: `milestoneTitle`, headerName: "Milestone", width: 150 },
        { field: `teamTeamName`, headerName: "Team", width: 100 },
        {
          field: `studentFullname`,
          headerName: "In charge",
          width: 150,
        },
        {
          field: "status",
          headerName: "Status",
          width: 150,
          // editable: canEdit,
        },
        {
          field: "loc",
          headerName: "LOC",
          width: 90,
          // editable: canEdit,
          type: "number",
          valueParser: createValueParser(0),
        },
        {
          field: "update_loc",
          headerName: "Update LOC",
          width: 120,
          // editable: canEdit,
          type: "number",
          valueParser: createValueParser(0),
        },
        {
          field: "actions",
          type: "actions",
          headerName: "Actions",
          width: 200,
          cellClassName: "actions",
          getActions: ({ row }) => {
            let actions = [];
            let isEvaluated = row.status === "EVALUATED";
            let isCurrentMile = row?.milestoneTitle === milestone?.label;
            let isFinalEval = typeEvaluator === "Final";
            if (isFinalEval) {
              if (isCurrentMile) {
                actions = [
                  <GridActionsCellItem
                    icon={canEdit ? <DriveFileRenameOutlineIcon /> : <RemoveRedEyeOutlinedIcon />}
                    title={canEdit ? "Update Evaluation" : "View Result"}
                    className="textPrimary"
                    onClick={() => {
                      if(isEvaluated)
                        onFinalEvaluateClick(row.id);
                      else
                        onEvaluateClick(row.id, !isEvaluated);
                    }}
                    color="inherit"
                  />,
                ];
              } else {
                actions = [
                  <GridActionsCellItem
                    icon={canEdit ? <DriveFileRenameOutlineIcon /> : <RemoveRedEyeOutlinedIcon />}
                    title={canEdit ? "Update Evaluation" : "View Result"}
                    className="textPrimary"
                    onClick={() => {
                      onFinalEvaluateClick(row.id);
                    }}
                    color="inherit"
                  />,
                ];
              }
            } else {
              actions = [
                <GridActionsCellItem
                  icon={isEvaluated ? <RemoveRedEyeIcon /> : canEdit ? <EditIcon /> : <RemoveRedEyeIcon />}
                  title={isEvaluated ? "View Result" : canEdit ? "Evaluate" : "View Result"}
                  className="textPrimary"
                  onClick={() => {
                    onEvaluateClick(row.id, !isEvaluated);
                  }}
                  color="inherit"
                />,
              ];
            }

            return actions;
          },
        },
      ];
      setColumns([...baseColumns]);
    };

    createColumns();
  }, [evaluations]);

  const onEvaluateClick = (id, canEditModal) => {
    let foundEvaluation = evaluations.find((item) => item.id === id);
    if (foundEvaluation) {
      if (!foundEvaluation?.studentId) {
        toast.error(`The requirement must have assignee to evaluate!`, {
          position: toast.POSITION.TOP_CENTER,
        });
        return false;
      }
      setCanEditModal(canEditModal);
      setEvaluation(foundEvaluation);
      setModal({ evaluate: true });
      setRowId(id);
      setHaveChanged(true);
    }
  };

  const onFinalEvaluateClick = (id) => {
    let foundEvaluation = evaluations.find((item) => item.id === id);
    if (foundEvaluation) {
      if (!foundEvaluation?.studentId) {
        toast.error(`The requirement must have assignee to evaluate!`, {
          position: toast.POSITION.TOP_CENTER,
        });
        return false;
      }
      setEvaluation(foundEvaluation);
      setModal({ finalEval: true });
      setRowId(id);
      setHaveChanged(true);
    }
  };

  const processUpdateChanges = (
    reqId,
    complexityId,
    qualityId,
    comment,
    loc,
    isUpdateEval,
    isNeedUpdateLoc,
    newRow
  ) => {
    let updateChanges = [...changedFields];
    let index = updateChanges.findIndex((item) => item.reqId === reqId && item.isUpdateEval === isUpdateEval);
    let newLoc = isNeedUpdateLoc ? evaluateLoc(complexityId, qualityId, loc) : loc;
    newRow[`${isUpdateEval ? "update_" : ""}loc`] = newLoc;
    if (index !== -1) {
      updateChanges[index] = {
        ...updateChanges[index],
        complexityId: complexityId,
        qualityId: qualityId,
        comment: comment,
        grade: newLoc,
      };
    } else {
      let newChange = {
        reqId: reqId,
        isUpdateEval: isUpdateEval,
        complexityId: complexityId,
        qualityId: qualityId,
        comment: comment,
        grade: newLoc,
      };
      updateChanges.push(newChange);
    }
    return updateChanges;
  };

  const evaluateLoc = (complexityId, qualityId, oldLoc) => {
    let weight = qualities?.find((item) => item.id === qualityId)?.extValue;
    let loc = complexities?.find((item) => item.id === complexityId)?.extValue;

    if (!weight || !loc) return oldLoc;

    weight = parseInt(weight);
    loc = parseInt(loc);

    return parseFloat(((weight * loc) / 100).toFixed(0));
  };

  const handleProcessRowUpdate = (newRow, oldRow) => {
    console.log("changedFields", newRow);
    let isUpdateEval = false,
      isNeedUpdateLoc = false,
      field = null;
    Object.keys(newRow).forEach((key, index) => {
      if (newRow[key] !== oldRow[key]) {
        field = key;
        isUpdateEval = key.includes("update");
        isNeedUpdateLoc = key.includes("complexity") || key.includes("quality");
        return false;
      }
    });
    if (!field) {
      console.log("not found field!");
      return newRow;
    }
    let reqId = newRow["id"];
    let prevField = isUpdateEval === true ? "update_" : "";
    let complexityId = complexities?.find((item) => item.name === newRow[`${prevField}complexity`])?.id;
    let qualityId = qualities?.find((item) => item.name === newRow[`${prevField}quality`])?.id;
    let comment = newRow[`${prevField}comment`];
    let loc = newRow[`${prevField}loc`];
    let updateChanges = processUpdateChanges(
      reqId,
      complexityId,
      qualityId,
      comment,
      loc,
      isUpdateEval,
      isNeedUpdateLoc,
      newRow
    );
    setChangedFields(updateChanges);
    setRows((prevRows) => prevRows.map((row) => (row.id === newRow.id ? newRow : row)));
    return newRow;
  };

  const handleSaveChanges = async () => {
    // console.log("Save changes:", rows);
    let reqEvals = [];
    let complexityObj = {},
      qualityObj = {};
    complexities.forEach((c) => {
      complexityObj = {
        ...complexityObj,
        [`${c.name}`]: c.id,
      };
    });
    qualities.forEach((q) => {
      qualityObj = {
        ...qualityObj,
        [`${q.name}`]: q.id,
      };
    });
    rows.forEach((row) => {
      let updateLoc = isNumber(row[`update_loc`], "float");
      let loc = isNumber(row[`loc`], "float");
      let uReq = {
        reqId: row.id,
        grade: updateLoc,
        complexityId: complexityObj[`${row[`update_complexity`]}`],
        qualityId: qualityObj[`${row[`update_quality`]}`],
        comment: row[`update_comment`],
      };
      let req = {
        reqId: row.id,
        grade: loc,
        complexityId: complexityObj[`${row[`complexity`]}`],
        qualityId: qualityObj[`${row[`quality`]}`],
        comment: row[`comment`],
      };
      if (typeEvaluator === evaluationTypes[0].value) {
        reqEvals.push(req);
      } else if (typeEvaluator === evaluationTypes[1].value) {
        if (!isNullOrEmpty(uReq?.grade)) {
          reqEvals.push(uReq);
        } else if (!isNullOrEmpty(req?.grade)) {
          reqEvals.push(req);
        }
      }
    });
    if (!reqEvals || reqEvals.length === 0) {
      toast.info(`No data to evaluate!`, {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    console.log("req:", reqEvals);

    try {
      setIsFetching(true);
      const response = await authApi.post("/evaluation/evaluate-requirement/" + filterForm?.milestone?.value, reqEvals);
      if (response.data.statusCode === 200) {
        toast.success(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        setChangedFields([]);
        setHaveChanged(false);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error evaluating requirement:", error);
      toast.error("Error evaluating requirement", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const [anchorElSubmit, setAnchorElSubmit] = React.useState(null);
  const handlePopoverSubmitClose = () => {
    setAnchorElSubmit(null);
  };
  const openSubmit = Boolean(anchorElSubmit);
  const [isFetchingSubmit, setIsFetchingSubmit] = React.useState(false);
  const [submissions, setSubmissions] = React.useState([]);
  const fetchSubmissions = async (e) => {
    if (!filterForm?.team?.value || !filterForm?.milestone?.value) {
      setSubmissions([]);
      setIsFetchingSubmit(false);
      return;
    }
    try {
      setIsFetchingSubmit(true);
      const response = await authApi.post("/submission/search", {
        pageSize: 9999,
        pageIndex: 1,
        milestoneId: filterForm?.milestone?.value,
        teamId: filterForm?.team?.value,
        // title: filterForm?.title,
        // isCurrentRequirements: role === "STUDENT",
      });
      console.log("submissions:", response.data.data);
      if (response.data.statusCode === 200) {
        let submissions = response.data.data.submissionDTOS;
        setSubmissions(submissions);
        // setAnchorElSubmit(e.currentTarget);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search submissions!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetchingSubmit(false);
    }
  };

  const getFileNameFromURL = (url) => {
    if (isNullOrEmpty(url)) return "";
    return url.split("/").pop().split("?")[0];
  };

  return (
    <>
      <ToastContainer />
      <Head title="Student Evaluation" />
      {loadings ? (
        <div className="d-flex justify-content-center">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <Content style={{ marginTop: 100 }}>
          <div className="row mb-3" style={{ marginTop: "-20px" }}>
            <div className="col-md-3">
              <>
                <Button
                  color="primary"
                  onClick={(e) => {
                    fetchSubmissions(e);
                    setAnchorElSubmit(e.currentTarget);
                  }}
                >
                  View Submit
                </Button>
                <Popover
                  open={openSubmit}
                  anchorEl={anchorElSubmit}
                  onClose={handlePopoverSubmitClose}
                  anchorOrigin={{
                    vertical: "center",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "center",
                    horizontal: "left",
                  }}
                  PaperProps={{
                    style: {
                      maxWidth: "600px",
                      overflowX: "auto",
                    },
                  }}
                >
                  {isFetchingSubmit ? (
                    <div style={{ padding: "10px" }}>
                      <Spinner size="sm" />
                      <span> Loading... </span>
                    </div>
                  ) : (
                    <div style={{ padding: "20px" }}>
                      {(!submissions || submissions.length === 0) && <p>No submissions</p>}
                      {submissions.map((submission, index) => (
                        <div className="ms-3 mt-3" key={index}>
                          <p>Submit At: {formatDate(submission.submitAt)}</p>
                          {!isNullOrEmpty(submission.submitFile) && (
                            <p>
                              File:{" "}
                              <a href={submission.submitFile} download={getFileNameFromURL(submission.submitFile)}>
                                {shortenString(getFileNameFromURL(submission.submitFile), 50)}
                              </a>
                            </p>
                          )}
                          {!isNullOrEmpty(submission.submitLink) && (
                            <p>
                              Link:{" "}
                              <a href={submission.submitLink} target="_blank">
                                {shortenString(submission.submitLink, 50)}
                              </a>
                            </p>
                          )}
                          {!isNullOrEmpty(submission.note) && (
                            <p style={{maxWidth: '400px'}}>
                              Note:{" "}
                              <span>
                                {submission.note}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Popover>
              </>
            </div>
            <div className="col-md-3"></div>
            {canEdit && (
              <div className="col-md-6 d-flex justify-content-end align-items-center">
                <div style={{ marginRight: "20px" }}>
                  <Button
                    color="primary"
                    onClick={() => {
                      setModal({ importEval: true });
                    }}
                  >
                    Import
                  </Button>
                </div>
                <div>
                  {isFetching ? (
                    <Button disabled color="primary">
                      <Spinner size="sm" />
                      <span> Saving... </span>
                    </Button>
                  ) : (
                    <Button color="primary" onClick={() => handleSaveChanges()}>
                      Save changes
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* {canEdit && (
            <div className="mb-3 text-end">
              <Button
                className="me-3"
                color="primary"
                onClick={() => {
                  setModal({ importEval: true });
                }}
              >
                Import
              </Button>
              {isFetching ? (
                <Button disabled color="primary">
                  <Spinner size="sm" />
                  <span> Saving... </span>
                </Button>
              ) : (
                <Button color="primary" onClick={() => handleSaveChanges()}>
                  Save changes
                </Button>
              )}
            </div>
          )} */}
          <Block>
            <div style={{ height: 700, width: "100%" }}>
              <DataGrid
                columns={columns}
                rows={rows}
                // getEstimatedRowHeight={() => 100}
                columnVisibilityModel={columnVisibilityModel}
                pageSizeOptions={[]}
                getRowHeight={() => "auto"}
                sx={{
                  "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
                    py: 1,
                  },
                  "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
                    py: "15px",
                  },
                  "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
                    py: "22px",
                  },
                }}
                columnGroupingModel={columnsGroups}
                processRowUpdate={handleProcessRowUpdate}
                slots={{
                  toolbar: () => (
                    <CustomToolbar
                      evaluations={evaluations}
                      setEvaluations={setEvaluations}
                      complexities={complexities}
                      qualities={qualities}
                      columnVisibilityModel={columnVisibilityModel}
                      setColumnVisibilityModel={setColumnVisibilityModel}
                      columns={columns}
                      typeEvaluator={typeEvaluator}
                    />
                  ),
                }}
                // slotProps={{
                //   columnsManagement: {
                //     getTogglableColumns,
                //   },
                // }}
              />
            </div>
          </Block>
          {modal?.evaluate && (
            <FormModal
              id={rowId}
              setId={setRowId}
              modal={modal?.evaluate}
              setModal={setModal}
              evaluation={evaluation}
              complexities={complexities}
              qualities={qualities}
              evaluations={evaluations}
              setEvaluations={setEvaluations}
              changedFields={changedFields}
              setChangedFields={setChangedFields}
              role={role}
              canEdit={canEdit && canEditModal}
            />
          )}
          {modal?.finalEval && (
            <FinalEvalModal
              id={rowId}
              setId={setRowId}
              modal={modal?.finalEval}
              setModal={setModal}
              evaluation={evaluation}
              complexities={complexities}
              qualities={qualities}
              evaluations={evaluations}
              setEvaluations={setEvaluations}
              changedFields={changedFields}
              setChangedFields={setChangedFields}
              role={role}
              canEdit={canEdit}
            />
          )}
          {modal?.importEval && (
            <ImportEvalModal
              modal={modal.importEval}
              setModal={setModal}
              evaluations={evaluations}
              setEvaluations={setEvaluations}
              complexities={complexities}
              qualities={qualities}
              typeEvaluator={typeEvaluator}
              filterForm={filterForm}
            />
          )}
        </Content>
      )}
    </>
  );
}

const getFileNameFromURL = (url) => {
  return url.split("/").pop().split("?")[0];
};

const renderSubmission = (item) => {
  if (item.submitType === "file") {
    const fileName = getFileNameFromURL(item.submission);
    return (
      <a href={item.submission} download={item.submission}>
        Download {fileName}
      </a>
    );
  } else if (item.submitType === "link") {
    return (
      <a href={item.submission} target="_blank" rel="noopener noreferrer">
        link
      </a>
    );
  } else {
    return <span>No submission</span>;
  }
};