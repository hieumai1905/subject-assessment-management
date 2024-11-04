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
import { Modal, ModalBody, Form, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import useQueryUser from "../../hooks/UseQuerryUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import { transformToOptions } from "../../utils/Utils";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
import { GridToolbar } from "@mui/x-data-grid";

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

function CustomToolbar() {
 
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

const CouncilModal = ({
  id,
  modal,
  setModal,
  modalType,
  closeModal,
  data,
  formData,
  setFormData,
  councils,
  setCouncils,
  filterForm,
  rCouncils,
  setRCouncils,
}) => {
  // useEffect(() => {
  //   reset(formData);
  // }, [formData]);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [rowSelectionModel, setRowSelectionModel] = React.useState([]);
  const [isFetching, setIsFetching] = React.useState(false);

  // React.useEffect(() => {
  //   if(formData && formData.length > 0) {
  //     let selectedItem = [];
  //     data.forEach(item => {
  //       if(formData.includes(item.id)) {
  //         selectedItem.push(item);
  //       }
  //     });
  //   }
  // }, [formData]);

  useEffect(() => {
    if(modalType === 'edit'){
      setRowSelectionModel(formData);
    }
  }, [modalType]);

  const onSubmit = async () => {
    if(!formData || formData.length < 2){
      toast.info("Please select at least two teachers!", {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    if (modalType === "add") {
      try {
        setIsFetching(true);
        const response = await authApi.post("/councils/create", {
          semesterId: filterForm?.semester?.value,
          subjectSettingId: filterForm?.round?.value,
          councilMembers: formData.map((id) => ({
            id: id,
          })),
        });
        console.log("add council:", response.data.data);
        if (response.data.statusCode === 200) {
          toast.success("Create council successfully!", {
            position: toast.POSITION.TOP_CENTER,
          });
          let updateCouncils = [...councils];
          let newCouncil = response.data.data;
          updateCouncils.push(newCouncil);
          if(updateCouncils[0].councilName === 'Wish List'){
            updateCouncils[0].councilMembers = updateCouncils[0].councilMembers
              .filter(item => {
                let index = newCouncil.councilMembers.findIndex(c => c.id === item.id);
                return index === -1;
              });
            if(updateCouncils[0].councilMembers.length === 0){
              updateCouncils.splice(0, 1);
            }
          }
          setCouncils(updateCouncils);

          updateCouncils = [...rCouncils];
          updateCouncils.push(newCouncil);
          if(updateCouncils[0].councilName === 'Wish List'){
            updateCouncils[0].councilMembers = updateCouncils[0].councilMembers
              .filter(item => {
                let index = newCouncil.councilMembers.findIndex(c => c.id === item.id);
                return index === -1;
              });
            if(updateCouncils[0].councilMembers.length === 0){
              updateCouncils.splice(0, 1);
            }
          }
          setRCouncils(updateCouncils);
          closeModal();
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error creating council:", error);
        toast.error("Error creating council!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching(false);
      }
    } else if (modalType === 'edit'){
      try {
        setIsFetching(true);
        const response = await authApi.put(`/councils/update/${id}`, {
          id: id,
          semesterId: filterForm?.semester?.value,
          subjectSettingId: filterForm?.round?.value,
          councilMembers: formData.map((id) => ({
            id: id,
          })),
        });
        console.log("update council:", response.data.data);
        if (response.data.statusCode === 200) {
          toast.success("Update council successfully!", {
            position: toast.POSITION.TOP_CENTER,
          });
          let updateCouncils = [...councils];
          let uCouncil = response.data.data;
          let index = updateCouncils.findIndex(item => item.id === id);
          if(index !== -1) {
            updateCouncils[index] = uCouncil;
          }
          if(updateCouncils[0].councilName === 'Wish List'){
            updateCouncils[0].councilMembers = updateCouncils[0].councilMembers
              .filter(item => {
                let index = uCouncil.councilMembers.findIndex(c => c.id === item.id);
                return index === -1;
              });
            if(updateCouncils[0].councilMembers.length === 0){
              updateCouncils.splice(0, 1);
            }
          }
          setCouncils(updateCouncils);

          updateCouncils = [...rCouncils];
          index = updateCouncils.findIndex(item => item.id === id);
          if(index !== -1) {
            updateCouncils[index] = uCouncil;
          }
          if(updateCouncils[0].councilName === 'Wish List'){
            updateCouncils[0].councilMembers = updateCouncils[0].councilMembers
              .filter(item => {
                let index = uCouncil.councilMembers.findIndex(c => c.id === item.id);
                return index === -1;
              });
            if(updateCouncils[0].councilMembers.length === 0){
              updateCouncils.splice(0, 1);
            }
          }
          setRCouncils(updateCouncils);
          closeModal();
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error updating council:", error);
        toast.error("Error updating council!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
    setFormData(newRowSelectionModel);
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
      <ToastContainer />
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
          <h5 className="title">Council Detail</h5>
          <div className="mt-4">
            <Block className="mb-5">
              <div className="mb-3">
                <span className="fw-bold me-2">Semester: {filterForm?.semester?.label}</span>
                <span className="fw-bold me-2">Round: {filterForm?.round?.label}</span>
              </div>
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  checkboxSelection
                  onRowSelectionModelChange={handleRowSelectionModelChange}
                  rowSelectionModel={rowSelectionModel}
                  rows={data}
                  columns={columns}
                  slots={{
                    toolbar: () => (
                      <CustomToolbar/>
                    ),
                  }}
                />
              </div>
            </Block>
            <Col size="12">
              <ul className="text-end">
                <li>
                  {isFetching ? (
                    <Button disabled color="primary">
                      <Spinner size="sm" />
                      <span> Submitting... </span>
                    </Button>
                  ) : (
                    <Button color="primary" size="md" type="button" onClick={() => onSubmit()}>
                      Submit
                    </Button>
                  )}
                </li>
              </ul>
            </Col>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default CouncilModal;
