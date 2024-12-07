import * as React from "react";
import {
  DataGrid,
  GridCellEditStopReasons,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
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
  Col,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  Row,
  RSelect,
} from "../../components/Component";
import {
  formatDate,
  generateTemplateStudentEval,
  getValueByLabel,
  isEqual,
  isNullOrEmpty,
  isNumber,
  shortenString,
} from "../../utils/Utils";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Spinner,
  Toast,
  ToastBody,
  ToastHeader,
  UncontrolledDropdown,
} from "reactstrap";
import authApi from "../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";
import { canEvaluate, canModify } from "../../utils/CheckPermissions";
import CommentIcon from "@mui/icons-material/Comment";
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  TextareaAutosize,
  Tooltip,
} from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ImportStudentEvalModal from "./ImportStudentEvalModal";

function createValueParser(min, max) {
  return (params) => {
    if (params < min) params = min;
    if (params > max) params = max;
    return params;
  };
}

const centeredHeaderStyle = {
  "& .MuiDataGrid-columnHeaderTitle": {
    display: "flex",
    justifyContent: "center",
  },
};

function CustomToolbar({ evaluations, columnVisibilityModel, setColumnVisibilityModel, columns }) {
  const [loadings, setLoadings] = React.useState({
    export: false,
  });
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

  const exportEval = async () => {
    try {
      await generateTemplateStudentEval(evaluations);
    } catch (error) {
      console.log("err export:", error);
      toast.error(`Xảy ra lỗi khi xuất file`, {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setLoadings((prev) => ({
        ...prev,
        export: false,
      }));
    }
  };

  return (
    <GridToolbarContainer>
      {/* <GridToolbarColumnsButton /> */}
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
    </GridToolbarContainer>
  );
}

export default function StudentEvaluations({
  evaluations,
  setEvaluations,
  milestone,
  filterForm,
  teams,
  role,
  user,
  classes,
  typeEvaluator,
  loadings,
  mileActive,
  setHaveChanged
}) {
  const [rows, setRows] = React.useState([]);
  const [columns, setColumns] = React.useState([]);
  const [columnsGroups, setColumnGroups] = React.useState([]);
  const [changedFields, setChangedFields] = React.useState([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isFetchingSubmit, setIsFetchingSubmit] = React.useState(false);
  const [isCustome, setIsCustome] = React.useState({
    row: true,
    column: true,
  });
  const [canEdit, setCanEdit] = React.useState(false);
  const [locEvaluation, setLocEvaluation] = React.useState([]);
  const [teamEvaluation, setTeamEvaluation] = React.useState({
    isChange: false,
    teamName: "",
    grade: 0,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [comment, setComment] = React.useState("");
  const [rowComment, setRowComment] = React.useState({
    row: null,
    milestoneId: null,
    criteriaId: undefined,
    isMilestoneComment: false,
  });
  const [studentComment, setStudentComment] = React.useState({
    fullname: "",
    title: "",
  });
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({
    fullname: false,
  });
  const [modal, setModal] = React.useState({
    importEval: false,
  });
  const [submissions, setSubmissions] = React.useState([]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSave = () => {
    let updatedChanged = [...changedFields];
    let teamId = null;
    if (isNullOrEmpty(rowComment?.row?.email)) {
      teamId = getValueByLabel(teams, rowComment?.row?.teamName);
    }
    let changeIndex = updatedChanged.findIndex(
      (item) =>
        item.milestoneId === rowComment?.milestoneId &&
        isEqual(item.email, rowComment?.row?.email) &&
        isEqual(item.criteriaId, rowComment?.criteriaId) &&
        isEqual(item.teamId, teamId)
    );
    if (changeIndex !== -1) {
      updatedChanged[changeIndex].comment = comment;
    } else {
      updatedChanged.push({
        teamId: teamId,
        milestoneId: rowComment?.milestoneId,
        criteriaId: rowComment?.criteriaId,
        email: rowComment?.row?.email,
        comment: comment,
        evalGrade: rowComment?.isMilestoneComment
          ? rowComment?.row?.milestoneEvalGrade
          : rowComment?.row[`${rowComment?.criteriaId}_evalGrade`],
      });
    }

    let updateRow = {
      ...rowComment?.row,
      id: rowComment?.row?.id,
      [rowComment?.isMilestoneComment ? "milestoneComment" : `${rowComment?.criteriaId}_comment`]: comment,
    };
    let updatedRows = rows.map((item) => {
      if (item.id === rowComment?.row?.id) {
        return { ...item, ...updateRow };
      }
      return item;
    });

    setRows(updatedRows);
    console.log("update comment", updatedChanged);
    setChangedFields(updatedChanged);
    setHaveChanged(true);
    handleClose();
  };

  const handleCommentChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= 750) {
      setComment(newValue);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  React.useEffect(() => {
    if (classes && user && role && filterForm?.milestone?.value) {
      setCanEdit(canEvaluate(user, role, classes) && mileActive === filterForm?.milestone?.value);
    }
  }, [classes, user, role, filterForm?.milestone?.value]);

  React.useEffect(() => {
    const createRows = () => {
      setIsCustome({ ...isCustome, row: true });
      if (evaluations === undefined || evaluations === null || evaluations.length === 0) setRows([]);
      let customRows = evaluations.map((evaluation, index) => {
        const criteriaMap = {};

        if (evaluation.criteriaNames) {
          evaluation.criteriaNames.forEach((criteria, index) => {
            criteriaMap[`${criteria.id}_evalGrade`] = evaluation.evalGrades[index];
            criteriaMap[`${criteria.id}_comment`] = evaluation.comments[index];
          });
        }

        return {
          id: index,
          fullname: evaluation.fullname,
          email: evaluation.email,
          [`teamName`]: evaluation.team?.name,
          totalLoc: evaluation?.totalLoc,
          [`milestoneTitle`]: evaluation.milestone?.name,
          milestoneEvalGrade: evaluation.evalGrade,
          milestoneComment: evaluation.comment,
          ...criteriaMap,
        };
      });
      console.log("custom row:", customRows);
      setRows(customRows);
      setIsCustome({ ...isCustome, row: false });
    };
    createRows();
  }, [evaluations]);

  React.useEffect(() => {
    const createColumns = () => {
      if (isCustome.row) return;
      setIsCustome({ ...isCustome, column: true });
      if (evaluations === undefined || evaluations === null || evaluations.length === 0) setColumns([]);
      let hasCriterias = evaluations[0]?.criteriaNames && evaluations[0]?.criteriaNames.length > 0;
      const baseColumns = [
        { field: "fullname", headerName: "Họ và Tên", width: 150 },
        {
          field: "email",
          headerName: "Email",
          width: hasCriterias ? undefined : 240,
          flex: hasCriterias ? 1 : undefined,
        },
        { field: `teamName`, headerName: "Nhóm", width: 150 },
        {
          field: "milestoneEvalGrade",
          headerName: isNullOrEmpty(evaluations[0]?.milestone?.name)
            ? "N/A"
            : `${evaluations[0]?.milestone?.name} (${evaluations[0]?.milestone?.weight}%)`,
          width: hasCriterias ? undefined : 240,
          flex: hasCriterias ? 1 : undefined,
          editable: canEdit,
          type: "number",
          valueParser: createValueParser(0, 10),
          renderCell: (params) => (
            <input
              disabled={!canEdit}
              type="number"
              value={params.value || ""}
              placeholder="Nhập điểm"
              onChange={(e) =>
                params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value })
              }
              style={{ width: "100%", border: "none", background: "transparent", outline: "none", textAlign: "right" }}
            />
          ),
        },
        {
          field: "milestoneComment",
          headerName: "Nhận xét",
          width: 20,
          renderHeader: () => (
            <span title="Nhận xét">
              <CommentIcon />
            </span>
          ),
          renderCell: (params) => (
            <>
              <AddCommentIcon
                tabIndex={0}
                onClick={(event) => onCommentClick(event, params.row, true, undefined, undefined)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onCommentClick(event, params.row, true, undefined, undefined);
                  }
                }}
              />
            </>
          ),
        },
      ];

      const criteriaColumns = [];
      let locEval = [];
      if (evaluations[0]?.criteriaNames && evaluations[0]?.criteriaNames.length > 0) {
        evaluations[0].criteriaNames.forEach((criteria) => {
          if (criteria.locEvaluation) {
            criteriaColumns.push({ field: `totalLoc`, headerName: `LOC`, width: 70 });
          }
          criteriaColumns.push({
            field: `${criteria.id}_evalGrade`,
            headerName: `${criteria.name} (${criteria?.weight}% của ${evaluations[0]?.milestone?.name})`,
            // width: 100,
            flex: 1,
            editable: canEdit,
            type: "number",
            valueParser: createValueParser(0, 10),
            renderHeader: (params) => (
              <Tooltip title={`${criteria.name} (${criteria?.weight}% của ${evaluations[0]?.milestone?.name})`}>
                <span className="fw-bold">{criteria.name}</span>
              </Tooltip>
            ),
            renderCell: (params) => (
              <input
                disabled={!canEdit}
                type="number"
                value={params.value || ""}
                placeholder="Nhập điểm"
                onChange={(e) =>
                  params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value })
                }
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  textAlign: "right",
                }}
              />
            ),
          });
          criteriaColumns.push({
            field: `${criteria.id}_comment`,
            headerName: "Nhận xét",
            width: 20,
            renderHeader: () => (
              <span title="Nhận xét">
                <CommentIcon />
              </span>
            ),
            renderCell: (params) => (
              <>
                <AddCommentIcon
                  onClick={(event) => onCommentClick(event, params.row, false, criteria.id, criteria.name)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onCommentClick(event, params.row, false, criteria.id, criteria.name);
                    }
                  }}
                />
              </>
            ),
          });
          if (criteria.locEvaluation) {
            locEval.push({
              column: `${criteria.id}_evalGrade`,
              label: `${criteria.name}`,
            });
          }
        });
      }
      if (locEval.length === 0) {
        locEval.push({
          column: `milestoneEvalGrade`,
          label: `${evaluations[0]?.milestone?.name}`,
        });
      }
      setLocEvaluation(locEval);

      console.log("custom column", [...baseColumns, ...criteriaColumns]);
      setColumns([...baseColumns, ...criteriaColumns]);
      // setColumnGroups(colGroup);
      setIsCustome({ ...isCustome, column: false });
    };

    createColumns();
  }, [evaluations, isCustome.row]);

  const onCommentClick = (event, row, isMilestoneComment, criteriaId, criteriaName) => {
    setAnchorEl(event.currentTarget);
    let fullname = isNullOrEmpty(row.email) ? row.teamName : row.fullname;
    let title = isMilestoneComment ? evaluations[0]?.milestone?.name : criteriaName;
    setStudentComment({
      fullname: fullname,
      title: title,
    });
    setRowComment({
      row: row,
      isMilestoneComment: isMilestoneComment,
      criteriaId: criteriaId,
      milestoneId: evaluations[0]?.milestone?.id,
    });
    if (!isMilestoneComment && row[`${criteriaId}_comment`]) {
      setComment(row[`${criteriaId}_comment`]);
    } else if (row?.milestoneComment && isMilestoneComment) {
      setComment(row?.milestoneComment);
    } else {
      setComment("");
    }
  };

  const handleSaveChanges = async () => {
    console.log("Save changes:", changedFields);
    try {
      setIsFetching(true);
      const response = await authApi.post("/evaluation/evaluate-student", changedFields);
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
      console.error("Error evaluating student:", error);
      toast.error("Error evaluating student", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleProcessRowUpdate = (newRow, oldRow) => {
    const {
      newRow: updatedRow,
      updateChanges,
      teamId,
      gradeIdx,
      commentIdx,
      criteriaId,
      isChangeGrade,
    } = processRowUpdate(newRow, oldRow);
    let nRows = [...rows];
    nRows = nRows.map((row) => (row.id === updatedRow.id ? updatedRow : row));
    let nUpdateChanges = [...updateChanges];
    //clone grade team to each member
    if (teamId !== null && isChangeGrade) {
      nRows.forEach((row, index) => {
        if (row.teamName === newRow.teamName && isNullOrEmpty(row[gradeIdx]) && !isNullOrEmpty(row.email)) {
          nRows[index] = {
            ...row,
            [gradeIdx]: newRow[gradeIdx],
          };
          nUpdateChanges = processUpdateChanges(
            nUpdateChanges,
            newRow[gradeIdx],
            row[commentIdx],
            criteriaId,
            milestone,
            null,
            row.email
          );
          if (!isNullOrEmpty(criteriaId)) {
            let total = 0,
              nRow = nRows[index];
            Object.keys(nRow).forEach((key, idx) => {
              if (key.includes("_evalGrade") && nRow[key] !== null) {
                let val = isNumber(nRow[key], "float");
                if (val) total += getCriteriaWeight(key) * val;
              }
            });
            total = parseFloat(total.toFixed(2));
            nRows[index] = {
              ...nRows[index],
              [`milestoneEvalGrade`]: total,
            };
            nUpdateChanges = processUpdateChanges(
              nUpdateChanges,
              total,
              nRow["milestoneComment"],
              null,
              milestone,
              null,
              row.email
            );
          }
        }
      });
    }
    setHaveChanged(true);
    setChangedFields(nUpdateChanges);
    setRows(nRows);
    return updatedRow;
  };

  const processRowUpdate = (newRow, oldRow) => {
    let gradeIdx = null,
      commentIdx = null,
      criteriaId = null,
      total = 0,
      isChangeGrade = false;

    Object.keys(newRow).forEach((key, index) => {
      if (key.includes("_evalGrade") && newRow[key] !== null) {
        let val = isNumber(newRow[key], "float");
        if (val) total += getCriteriaWeight(key) * val;
      }
      if (newRow[key] !== oldRow[key]) {
        if (key.toLowerCase().includes("eval")) {
          gradeIdx = key;
          commentIdx = Object.keys(newRow)[index + 1];
          isChangeGrade = true;
        } else if (key.toLowerCase().includes("comment")) {
          gradeIdx = Object.keys(newRow)[index - 1];
          commentIdx = key;
        }
        if (key.includes("_")) {
          const parts = key.split("_");
          if (parts.length > 0) {
            criteriaId = parseInt(parts[0], 10);
          }
        }
      }
    });

    if (!gradeIdx || !commentIdx) {
      console.log("Field not found!", gradeIdx, commentIdx);
      return { newRow, updateChanges: [] };
    }

    let teamId = null;
    let email = newRow?.email;
    if (email === undefined || email === null) {
      teamId = getValueByLabel(teams, newRow?.teamName);
    }

    let updateChanges = [...changedFields];

    updateChanges = processUpdateChanges(
      updateChanges,
      newRow[gradeIdx],
      newRow[commentIdx],
      criteriaId,
      milestone,
      teamId,
      email
    );

    if (criteriaId !== null && isChangeGrade) {
      total = parseFloat(total.toFixed(2));
      newRow["milestoneEvalGrade"] = total;
      updateChanges = processUpdateChanges(
        updateChanges,
        total,
        newRow["milestoneComment"],
        null,
        milestone,
        teamId,
        email
      );
    }

    return { newRow, updateChanges, teamId, gradeIdx, commentIdx, criteriaId, isChangeGrade };
  };
  const processUpdateChanges = (updateChanges, grade, comment, criteriaId, milestone, teamId, email) => {
    const existChangeIdx = updateChanges.findIndex(
      (item) =>
        item.milestoneId === milestone?.value &&
        isEqual(item.teamId, teamId) &&
        isEqual(item.email, email) &&
        isEqual(item.criteriaId, criteriaId)
    );

    if (existChangeIdx !== -1) {
      updateChanges[existChangeIdx] = {
        ...updateChanges[existChangeIdx],
        comment: comment,
        evalGrade: grade,
      };
    } else {
      let newChange = {
        teamId: teamId,
        milestoneId: milestone?.value,
        criteriaId: criteriaId,
        email: email,
        comment: comment,
        evalGrade: grade,
      };
      updateChanges.push(newChange);
    }
    console.log("change", updateChanges);
    return updateChanges;
  };
  const getCriteriaWeight = (key) => {
    let id = parseInt(key.split("_")[0], 10);
    let criteria = evaluations[0]?.criteriaNames?.find((item) => item.id === id);
    if (!criteria) {
      return 0;
    }
    return criteria.weight / 100;
  };

  const handleCopyLocGrade = (dstField) => {
    if (!evaluations || evaluations.length === 0) return;

    let updateRows = [...rows];
    let allUpdateChanges = [...changedFields];

    updateRows.forEach((row) => {
      if (!row.email) return false;

      let newGrade = parseFloat(((row.totalLoc * 10) / evaluations[0]?.milestone?.expectedLoc).toFixed(2));
      newGrade = Math.min(10, newGrade);
      let newRow = {
        ...row,
        [`${dstField}`]: newGrade,
      };

      const { newRow: updatedRow, updateChanges } = processRowUpdate(newRow, row);
      allUpdateChanges = [...allUpdateChanges, ...updateChanges];
      updateRows = updateRows.map((r) => (r.id === updatedRow.id ? updatedRow : r));
    });

    setChangedFields(allUpdateChanges);
    setRows(updateRows);
  };
  const [anchorElSubmit, setAnchorElSubmit] = React.useState(null);
  const handlePopoverSubmitClose = () => {
    setAnchorElSubmit(null);
  };
  const openSubmit = Boolean(anchorElSubmit);
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
      toast.error("Xảy ra lỗi khi tìm kiếm bài nộp", { position: toast.POSITION.TOP_CENTER });
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
      <Head title="Đánh giá theo cột mốc" />
      {loadings || isCustome?.row || isCustome?.column ? (
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
                  Xem bài nộp
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
                      overflowX: "auto", // Adds horizontal scrollbar if content overflows
                    },
                  }}
                >
                  {isFetchingSubmit ? (
                    <div style={{ padding: "10px" }}>
                      <Spinner size="sm" />
                      <span> Đang tải... </span>
                    </div>
                  ) : (
                    <div style={{ padding: "20px" }}>
                      {(!submissions || submissions.length === 0) && <p>Không có bài nộp</p>}
                      {submissions.map((submission, index) => (
                        <div className="ms-3 mt-3" key={index}>
                          <p>Nộp lúc: {formatDate(submission.submitAt)}</p>
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
                              Đường dẫn:{" "}
                              <a href={submission.submitLink} target="_blank">
                                {shortenString(submission.submitLink, 50)}
                              </a>
                            </p>
                          )}
                          {!isNullOrEmpty(submission.note) && (
                            <p style={{maxWidth: '400px'}}>
                              Ghi chú:{" "}
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
                    Nhập đánh giá
                  </Button>
                </div>
                <div>
                  {isFetching ? (
                    <Button disabled color="primary">
                      <Spinner size="sm" />
                      <span> Đang lưu... </span>
                    </Button>
                  ) : (
                    <Button color="primary" onClick={() => handleSaveChanges()}>
                      Lưu thay đổi
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Block>
            <div style={{ height: 700, width: "100%" }}>
              <DataGrid
                columns={columns}
                rows={rows}
                // columnGroupingModel={columnsGroups}
                columnVisibilityModel={columnVisibilityModel}
                processRowUpdate={handleProcessRowUpdate}
                pageSizeOptions={[]}
                slots={{
                  toolbar: () => (
                    <CustomToolbar
                      evaluations={evaluations}
                      columnVisibilityModel={columnVisibilityModel}
                      setColumnVisibilityModel={setColumnVisibilityModel}
                      columns={columns}
                    />
                  ),
                }}
              />
            </div>
          </Block>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "center",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "left",
            }}
          >
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="fw-bold">
                Nhận xét cho {studentComment?.fullname} trong {studentComment?.title}
              </p>
              <TextareaAutosize
                readOnly={!canEdit}
                minRows={3}
                maxRows={5}
                placeholder="Nhập nội dung"
                style={{ width: 370, overflow: "auto" }}
                value={comment}
                onChange={handleCommentChange}
              />
              <div className="d-flex justify-content-end">
                {canEdit && (
                  <Button variant="contained" color="primary" onClick={handleSave}>
                    Lưu
                  </Button>
                )}
              </div>
            </div>
          </Popover>
          {modal.importEval && (
            <ImportStudentEvalModal
              rows={rows}
              setRows={setRows}
              modal={modal.importEval}
              setModal={setModal}
              evaluations={evaluations}
              teams={teams}
            />
          )}
        </Content>
      )}
    </>
  );
}
