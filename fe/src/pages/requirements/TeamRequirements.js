import React from "react";
import {
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
} from "../../components/Component";

export default function TeamRequirements({ teamRequirements, setTeamRequirements }) {
  return (
    <>
      <Button className="mb-2" color="primary">
        Save changes
      </Button>
      <DataTable className="card-stretch">
        <DataTableBody>
          <DataTableHead className="nk-tb-item nk-tb-head">
            <DataTableRow>
              <span className="sub-text">Team Name</span>
            </DataTableRow>
            <DataTableRow>
              <span className="sub-text">Assignee</span>
            </DataTableRow>
            <DataTableRow>
              <span className="sub-text">Status</span>
            </DataTableRow>
            <DataTableRow>
              <span className="sub-text">Submission </span>
            </DataTableRow>
            <DataTableRow>
              <span className="sub-text">Grade</span>
            </DataTableRow>
            <DataTableRow>
              <span className="sub-text">Comment</span>
            </DataTableRow>
          </DataTableHead>
          {teamRequirements &&
            teamRequirements.map((item) => (
              <DataTableItem key={item.id}>
                <DataTableRow>
                  <span>{item?.teamName}</span>
                </DataTableRow>
                <DataTableRow>
                  <span>{item?.assignee?.fullname}</span>
                </DataTableRow>
                <DataTableRow>
                  <span>{item.status}</span>
                </DataTableRow>
                <DataTableRow>
                  {item?.submission && (
                    <a
                      href={item.submission}
                      {...(item.submitType === "file"
                        ? { download: `work_result_${item.teamName}_${item?.assignee?.fullname}` }
                        : { target: "_blank" })}
                    >
                      Work result
                    </a>
                  )}
                </DataTableRow>
                <DataTableRow>
                  {item?.submission && (
                    <input
                      type="number"
                      style={{ width: "115px" }}
                      placeholder="Enter grade"
                      className="form-control"
                    />
                  )}
                </DataTableRow>
                <DataTableRow>
                  {item?.submission && (
                    <input
                      type="text"
                      style={{ width: "175px" }}
                      placeholder="Enter comment"
                      className="form-control"
                    />
                  )}
                </DataTableRow>
              </DataTableItem>
            ))}
        </DataTableBody>
        <div className="card-inner">
          {teamRequirements?.length > 0 ? (
            <></>
          ) : (
            <div className="text-center">
              <span className="text-silent">No settings found</span>
            </div>
          )}
        </div>
      </DataTable>
    </>
  );
}
