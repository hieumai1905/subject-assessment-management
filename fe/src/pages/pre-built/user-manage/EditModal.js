import React, { useEffect, useState } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button, RSelect } from "../../../components/Component";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../../utils/ApiAuth";

const EditModal = ({ modal, closeModal, onSubmit, filterRole, filterGender, editUserClick }) => {
  const [avatarUrl, setAvatarUrl] = useState("https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png");
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(editUserClick);
        const response = await authApi.get(`/user/get-detail/${editUserClick}`);
        if (response.data.statusCode === 200) {
          const userData = response.data.data;
          setFormData({
            username: userData.username,
            fullname: userData.fullname,
            email: userData.email,
            mobile: userData.mobile,
            note: userData.note,
            roleId: userData.roleId,
            gender: userData.gender,
          });
          if (userData.avatarUrl) {
            setAvatarUrl(userData.avatarUrl);
          }
        } else {
          toast.error("Failed to fetch user data.", {
            position: toast.POSITION.TOP_CENTER
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // toast.error("An error occurred while fetching user data. Please try again later.");
      }
    };

    fetchData();
  }, [editUserClick]);

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    password: "",
    email: "",
    mobile: "",
    note: "",
    roleId: "",
    gender: "",
  });
  const roleMap = {
    Admin: 1,
    Manager: 2,
    Teacher: 3,
    Student: 4,
  };
  const handleEditUser = async (data) => {
    try {
      data.avatarUrl = avatarUrl;
      data.roleId = formData.roleId;
      data.gender = formData.gender;

      const response = await authApi.put(`/user/update/${editUserClick}`, data);
      if (response.data.statusCode === 200) {
        await authApi.get("/user/get-all");
        toast.success("User edited successfully!");
        closeModal();
        reset();
        onSubmit();
      } else if (response.data.message === "success") {
        toast.error("Username is already in existence!");
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
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
          <h5 className="title">User's information</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(handleEditUser)}>
              {/* Your form inputs */}
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">User Name</label>
                  <input
                    className="form-control"
                    type="text"
                    disabled
                    {...register("username", { required: "This field is required" })}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter user name"
                  />
                  {errors.username && <span className="invalid">{errors.username.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    disabled
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
                    disabled
                    className="form-control"
                    type="text"
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
                  <label className="form-label">Phone Number</label>
                  <input
                    disabled
                    className="form-control"
                    type="text"
                    {...register("mobile", { required: "This field is required" })}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Enter phone number"
                  />
                  {errors.mobile && <span className="invalid">{errors.mobile.message}</span>}
                </div>
              </Col>

              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <input
                    className="form-control"
                    disabled
                    type="text"
                    {...register("note", { required: "This field is required" })}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Enter note"
                  />
                  {errors.note && <span className="invalid">{errors.note.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <div className="form-control-wrap">
                    <RSelect
                      options={filterRole}
                      value={{
                        label: Object.keys(roleMap).find((key) => roleMap[key] === formData.roleId),
                        value: formData.roleId,
                      }}
                      onChange={(selectedOption) => {
                        const roleId = roleMap[selectedOption.label];
                        setFormData({ ...formData, roleId });
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <div className="form-control-wrap">
                    <RSelect
                      options={filterGender}
                      
                      value={{
                        value: formData.gender, 
                        label: formData.gender, 
                      }}
                      onChange={(selectedOption) => setFormData({ ...formData, gender: selectedOption.value })} // Updated to set formData.gender
                    />
                  </div>
                </div>
              </Col>
              {/* <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      Save changes
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        closeModal();
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </a>
                  </li>
                </ul>
              </Col> */}
              <ToastContainer />
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default EditModal;
