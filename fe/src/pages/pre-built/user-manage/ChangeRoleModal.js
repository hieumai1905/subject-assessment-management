import React, { useEffect, useState } from "react";
import { Modal, ModalBody, Form, Col, Button } from "reactstrap";
import { Icon, RSelect } from "../../../components/Component";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../../utils/ApiAuth";
import "react-toastify/dist/ReactToastify.css";

const ChangeRoleModal = ({ modal, closeChangeRoleModal, userId, onChangeRole, editFormData }) => {
  const {
    reset,
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = useForm();
  const [userData, setUserData] = useState(null);

  const roleMap = {
    1: "Admin",
    2: "Manager",
    3: "Teacher",
    4: "Student",
  };

  const roleOptions = Object.keys(roleMap).map((key) => ({
    label: roleMap[key],
    value: parseInt(key),
  }));

  useEffect(() => {
    if (modal && userId) {
      setUserData(editFormData);
      reset({
        note: editFormData.note,
        roleId: editFormData.roleId,
        active: editFormData.active, // Add active status here
      });

      setValue("roleId", {
        label: roleMap[editFormData.roleId],
        value: editFormData.roleId,
      });
    }
  }, [modal, userId, reset, editFormData, setValue]);

  const onSubmit = async (data) => {
    try {
      const roleIdToSend = data.roleId.value || userData.roleId;

      const updatedData = {
        roleId: roleIdToSend,
        note: data.note,
        active: userData.active, // Include active status in the payload
      };

      const response = await authApi.put(`/user/update-by-admin/${userId}`, updatedData);

      if (response.status === 200) {
        toast.success("User role updated successfully", {
          position: toast.POSITION.TOP_CENTER,
        });
        onChangeRole(userId, roleIdToSend);
        closeChangeRoleModal();
      }
    } catch (error) {
      toast.error("Failed to update user role", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  return (
    <Modal isOpen={modal} toggle={closeChangeRoleModal} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeChangeRoleModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Update User</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <div className="form-control-wrap">
                    <RSelect
                      options={roleOptions}
                      defaultValue={roleOptions.find((option) => option.value === editFormData.roleId)}
                      onChange={(selectedOption) => {
                        setValue("roleId", selectedOption);
                      }}
                    />
                  </div>
                  {errors.roleId && <span className="invalid">{errors.roleId.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <input
                    className="form-control"
                    type="text"
                    defaultValue={editFormData.note}
                    {...register("note", { required: "This field is required" })}
                    placeholder="Enter note"
                  />
                  {errors.note && <span className="invalid">{errors.note.message}</span>}
                </div>
              </Col>
              <div className="form-group text-end">
                <Button color="primary" type="submit">
                  Save changes
                </Button>
              </div>
              <ToastContainer />
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ChangeRoleModal;
