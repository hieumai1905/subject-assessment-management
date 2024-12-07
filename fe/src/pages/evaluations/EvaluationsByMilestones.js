import * as React from "react";
import {
  DataGrid,
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
  Icon,
} from "../../components/Component";
import { generateTemplateAllMileEval, getValueByLabel, isNullOrEmpty } from "../../utils/Utils";
import { DropdownItem, DropdownMenu, DropdownToggle, Input, Spinner, UncontrolledDropdown } from "reactstrap";
import authApi from "../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";
import AddCommentIcon from "@mui/icons-material/AddComment";
import CommentIcon from "@mui/icons-material/Comment";
import { Popover, TextareaAutosize, Tooltip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const centeredHeaderStyle = {
  "& .MuiDataGrid-columnHeaderTitle": {
    display: "flex",
    justifyContent: "center",
  },
};

function CustomToolbar({ rows, columns, columnsGroups, evaluations }) {
  const [loadings, setLoadings] = React.useState({
    export: false,
  });
  const exportEval = async () => {
    try {
      await generateTemplateAllMileEval(rows, columns, columnsGroups, evaluations);
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
      <GridToolbarColumnsButton />
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
            <FileDownloadIcon /> Export File
          </>
        )}
      </div>
    </GridToolbarContainer>
  );
}

export default function EvaluationsByMilestones({ evaluations, setEvaluations, loadings }) {
  const [rows, setRows] = React.useState([]);
  const [columns, setColumns] = React.useState([]);
  const [columnsGroups, setColumnGroups] = React.useState([]);
  const [changedFields, setChangedFields] = React.useState([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [comment, setComment] = React.useState("");
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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  React.useEffect(() => {
    const createRows = () => {
      if (evaluations === undefined || evaluations === null || evaluations.length === 0) setRows([]);
      let customRows = evaluations.map((evaluation, index) => {
        const criteriaMap = {};
        let total = 0,
          isPass = true;
        if (evaluation.milestones) {
          evaluation.milestones.forEach((criteria, index) => {
            let grade = evaluation.evalGrades[index];
            if (isNullOrEmpty(grade) || grade === 0) {
              isPass = false;
            }
            total += (grade * criteria.weight) / 100;
            criteriaMap[`${criteria.id}_evalGrade`] = evaluation.evalGrades[index];
            criteriaMap[`${criteria.id}_comment`] = evaluation.comments[index];
          });
        }
        total = total.toFixed(2);
        return {
          id: index,
          fullname: evaluation.fullname,
          email: evaluation.email,
          final_grade: total,
          status: isPass && total >= 5 ? "Pass" : "Not Pass",
          ...criteriaMap,
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
        { field: "fullname", headerName: "Họ và tên", width: 150 },
        { field: "email", headerName: "Email", width: 260 },
      ];

      const colGroup = [];
      const criteriaColumns = [];
      if (evaluations[0]?.milestones && evaluations[0]?.milestones.length > 0) {
        criteriaColumns.push({
          field: `final_grade`,
          headerName: `OG`,
          width: 70,
          type: "number",
          renderHeader: (params) => (
            <Tooltip title={`Điểm quá trình`}>
              <span className="fw-bold">OG</span>
            </Tooltip>
          ),
        });
        // criteriaColumns.push({
        //   field: `status`,
        //   headerName: `status`,
        //   width: 90,
        //   type: "text",
        // });
        // colGroup.push({
        //   groupId: `Final Result`,
        //   children: [
        //     { field: `final_grade`, headerAlign: "center", sx: centeredHeaderStyle },
        //     { field: `status`, headerAlign: "center", sx: centeredHeaderStyle },
        //   ],
        //   headerAlign: "center",
        //   sx: centeredHeaderStyle,
        // });
        evaluations[0].milestones
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .forEach((criteria) => {
            criteriaColumns.push({
              field: `${criteria.id}_evalGrade`,
              headerName: `grade`,
              width: 120,
              type: "number",
              renderHeader: (params) => (
                <Tooltip title={`${criteria.name} (${criteria?.weight}%)`}>
                  <span className="fw-bold">{criteria.name}</span>
                </Tooltip>
              ),
              renderCell: (params) => (
                <>
                  <input
                    disabled={true}
                    type="number"
                    value={params.value || ""}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      textAlign: "right",
                    }}
                    title={`${params.row[`${criteria.id}_comment`] || 'No comment'}`}
                    // onMouseEnter={(event) => {
                    //   console.log('e', event);
                      
                    //   onCommentClick(event, params.row, criteria.name, criteria.id)
                    // }}
                  />
                  {/* <AddCommentIcon onClick={(event) => onCommentClick(event, params.row, criteria.name, criteria.id)} /> */}
                </>
              ),
            });
          });
      }

      console.log("custom column", [...baseColumns, ...criteriaColumns]);
      setColumns([...baseColumns, ...criteriaColumns]);
      setColumnGroups(colGroup);
    };

    createColumns();
  }, [evaluations]);

  const onCommentClick = (event, row, title, mileId) => {
    setAnchorEl(event.currentTarget);
    let fullname = isNullOrEmpty(row.email) ? row.teamName : row.fullname;
    let comment = row[`${mileId}_comment`];
    setStudentComment({
      fullname: fullname,
      title: title,
    });
    setComment(isNullOrEmpty(comment) ? "" : comment);
  };

  return (
    <>
      <ToastContainer />
      <Head title="Danh sách điểm đánh giá" />
      {loadings ? (
        <div className="d-flex justify-content-center">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <Content style={{ marginTop: 100 }}>
          <Block>
            <div style={{ height: 700, width: "100%" }}>
              <DataGrid
                columns={columns}
                rows={rows}
                // columnGroupingModel={columnsGroups}
                pageSizeOptions={[]}
                slots={{
                  toolbar: () => (
                    <CustomToolbar
                      rows={rows}
                      columns={columns}
                      columnsGroups={columnsGroups}
                      evaluations={evaluations}
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
                readOnly={true}
                minRows={3}
                maxRows={5}
                placeholder="Any comment"
                style={{ width: 370, overflow: "auto" }}
                value={comment}
              />
              <div className="d-flex justify-content-end"></div>
            </div>
          </Popover>
        </Content>
      )}
    </>
  );
}
