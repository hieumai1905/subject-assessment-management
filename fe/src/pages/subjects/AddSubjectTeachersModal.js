import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import {
  Icon,
  Button,
  Col,
  RSelect,
  Block,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
} from "../../components/Component";
import { typeList, statusList, managerList } from "./SubjectData";
import { Modal, ModalBody, Form, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import useQueryUser from "../../hooks/UseQuerryUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import { transformToOptions } from "../../utils/Utils";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    width: 100,
  },
  {
    field: "fullname",
    width: 200,
  },
  {
    field: "email",
    width: 200,
  },
];

const AddSubjectTeachersModal = ({ modal, closeModal, onSubmit, formData, setFormData, isFetching, data }) => {
  useEffect(() => {
    reset(formData);
  }, [formData]);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [rowSelectionModel, setRowSelectionModel] = React.useState([]);

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Add Subject Teachers</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Block>
                <div style={{ height: 400, width: "100%" }}>
                  <DataGrid
                    checkboxSelection
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                      setRowSelectionModel(newRowSelectionModel);
                      setFormData(newRowSelectionModel);
                    }}
                    rowSelectionModel={rowSelectionModel}
                    rows={data}
                    columns={columns}
                  />
                </div>
              </Block>
              <Col size="12">
                <ul className="text-end">
                  <li>
                    {isFetching ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Adding... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="button" onClick={() => onSubmit("add")}>
                        Add Subject Teachers
                      </Button>
                    )}
                  </li>
                </ul>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default AddSubjectTeachersModal;
