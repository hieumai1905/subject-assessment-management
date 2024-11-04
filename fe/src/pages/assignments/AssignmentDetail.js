import React, { useEffect, useState } from "react";
import { Block, Button, Col, Icon, PreviewCard, Row, RSelect } from "../../components/Component";
import { useParams } from "react-router-dom";
import authApi from "../../utils/ApiAuth";
import { isNullOrEmpty } from "../../utils/Utils";
import { Form } from "reactstrap";
import { useForm } from "react-hook-form";

export default function AssignmentDetail({
  assignment,
  setAssignment,
  subjects,
  selectedSubject,
  setSelectedSubject,
  onSubmit,
}) {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <>
      <PreviewCard>
        <div className="mt-3">
          <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
            <Col size="6">
              <div className="form-group">
                <label className="form-label">Title*</label>
                <input
                  disabled
                  type="text"
                  {...register("title", { required: "This field is required" })}
                  value={isNullOrEmpty(assignment.title) ? "" : assignment.title}
                  placeholder="Enter title"
                  onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                  className="form-control"
                />
                {errors.title && <span className="invalid">{errors.title.message}</span>}
              </div>
            </Col>
            <Col md="6">
              <div className="form-group">
                <label className="form-label">Evaluation Weight* (%)</label>
                <input
                  disabled
                  type="number"
                  {...register("evalWeight", { required: "This field is required" })}
                  value={isNullOrEmpty(assignment.evalWeight) ? 0 : assignment.evalWeight}
                  placeholder="Enter evaluation weight"
                  onChange={(e) => setAssignment({ ...assignment, evalWeight: e.target.value })}
                  className="form-control"
                />
                {errors.evalWeight && <span className="invalid">{errors.evalWeight.message}</span>}
              </div>
            </Col>
            <Col md="6">
              <div className="form-group">
                <label className="form-label">Subject*</label>
                <RSelect
                  isDisabled={true} 
                  options={subjects}
                  value={selectedSubject}
                  onChange={(e) => {
                    setAssignment({
                      ...assignment,
                      subjectId: e.value,
                    });
                    setSelectedSubject(e);
                  }}
                />
              </div>
            </Col>
            <Col md="6">
              <div className="form-group">
                <label className="form-label">Expected Loc</label>
                <input
                  type="number"
                  value={isNullOrEmpty(assignment.expectedLoc) ? 0 : assignment.expectedLoc}
                  placeholder="Enter expected loc"
                  disabled
                  onChange={(e) => setAssignment({ ...assignment, expectedLoc: e.target.value })}
                  className="form-control"
                />
              </div>
            </Col>
            <Col md="6">
              <label className="form-label">Status</label>
              <br />
              <ul className="custom-control-group">
                <li>
                  <div
                    style={{ height: 40 }}
                    className="custom-control custom-control-sm custom-radio custom-control-pro checked"
                  >
                    <input
                      type="radio"
                      className="custom-control-input"
                      name="btnRadioControl"
                      id="btnActiveAss"
                      disabled
                      defaultChecked={assignment.active || assignment?.id === undefined}
                      value={"Active"}
                      onClick={(e) => setAssignment({ ...assignment, active: true })}
                    />
                    <label className="custom-control-label" htmlFor="btnActiveAss">
                      Active
                    </label>
                  </div>
                </li>
                <li>
                  <div
                    style={{ height: 40 }}
                    className="custom-control custom-control-sm custom-radio custom-control-pro"
                  >
                    <input
                      type="radio"
                      disabled
                      className="custom-control-input"
                      name="btnRadioControl"
                      id="btnInActiveAss"
                      defaultChecked={assignment.active === false}
                      value={"InActive"}
                      onClick={(e) => setAssignment({ ...assignment, active: false })}
                    />
                    <label className="custom-control-label" htmlFor="btnInActiveAss">
                      InActive
                    </label>
                  </div>
                </li>
              </ul>
            </Col>
            <Col size="12">
              <div className="form-group">
                <label className="form-label">Note</label>
                <textarea
                  disabled
                  value={isNullOrEmpty(assignment.note) ? "" : assignment.note}
                  placeholder="Your note"
                  onChange={(e) => setAssignment({ ...assignment, note: e.target.value })}
                  className="form-control-xl form-control no-resize"
                />
              </div>
            </Col>
            <Col size="12">
              <ul className=" text-end">
                <li>
                  <Button color="primary" size="md" type="submit">
                    {assignment?.id === undefined ? "Add Assignment" : "Update Assignment"}
                  </Button>
                </li>
              </ul>
            </Col>
          </Form>
        </div>
      </PreviewCard>
    </>
  );
}
