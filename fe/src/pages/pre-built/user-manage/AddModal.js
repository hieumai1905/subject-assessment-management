import React, { useState } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button, RSelect } from "../../../components/Component";
import { useForm } from "react-hook-form";
import authApi from "../../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";
import { Spinner } from "reactstrap";

const AddModal = ({ modal, closeModal, onSubmit, filterRole, filterGender, setTotalElements }) => {
  const [avatarUrl, setAvatarUrl] = useState("https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png");
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    roleId: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const roleMap = {
    Admin: 1,
    Manager: 2,
    Teacher: 3,
    Student: 4,
  };

  const handleAddUser = async (data) => {
    try {
      setLoading(true);
      data.avatarUrl = avatarUrl;
      data.roleId = formData.roleId;
      data.status = formData.status;

      const response = await authApi.post("/user/create", data);
      if (response.data.statusCode === 200) {
        toast.success("User added successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTotalElements((prev) => prev + 1);
        closeModal();
        reset();
        onSubmit();
      } else if (response.data.statusCode === 409 || response.data.statusCode === 400) {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      // console.error("Error adding user:", error);
      // toast.error("An error occurred while adding user. Please try again later.", {
      //   position: toast.POSITION.TOP_CENTER,
      // });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
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
          <h5 className="title">Create User</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(handleAddUser)}>
              {/* Your form inputs */}

              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("fullname", { required: "This field is required" })}
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    placeholder="Enter full name"
                  />
                  {errors.fullname && <span className="invalid">{errors.fullname.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    {...register("email", { required: "This field is required" })}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                  {errors.email && <span className="invalid">{errors.email.message}</span>}
                </div>
              </Col>

              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <div className="form-control-wrap">
                    <RSelect
                      options={filterRole}
                      onChange={(selectedOption) => {
                        const roleId = roleMap[selectedOption.label];
                        setFormData({ ...formData, roleId });
                      }}
                    />
                  </div>
                </div>
              </Col>
              {/* <Col md="6">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div className="form-control-wrap">
                    <RSelect
                      options={filterStatus}
                      value={{
                        value: formData.status,
                        label: formData.status,
                      }}
                      onChange={(selectedOption) => setFormData({ ...formData, status: selectedOption.value })}
                    />
                  </div>
                </div>
              </Col> */}
              <Col size="12">
                <div className="d-flex justify-content-end align-items-center">
                  {loading ? (
                    <Spinner size="sm" color="primary" />
                  ) : (
                    <>
                      {" "}
                      <Button
                        color="red"
                        size="md"
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          closeModal();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button color="primary" size="md" type="submit">
                        Create
                      </Button>
                      <div style={{ marginRight: "15px" }}></div>
                    </>
                  )}
                </div>
              </Col>

              <ToastContainer />
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AddModal;
