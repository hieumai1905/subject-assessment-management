import React, { useEffect, useState } from "react";
import { Icon, Button, Col, Row } from "../../components/Component";
import { Modal, ModalBody, Form, Input, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import { toast } from "react-toastify";

const AddStudentModal = ({
  modal,
  closeModal,
  formData,
  setFormData,
  modalType,
  setUsers,
  users,
  isFetching,
  setIsFetching,
}) => {
  useEffect(() => {
    reset(users);
  }, [users]);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      createUserRequest: {
        ...prevData.createUserRequest,
        [name]: value,
      },
    }));
  };

  const onFormSubmit = async () => {
    try {
      setIsFetching({ ...isFetching, addStudent: true });
      const response = await authApi.post("/class/import-student", formData);
      console.log('rr', response);
      if (response.data.statusCode === 200) {
        toast.success("Add student successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });

        const newUser = {
          id: response.data.data.id,
          userId: response.data.data.userId,
          fullname: response.data.data.fullname, // Use the gender from formData
          email: response.data.data.email,
          roleId: 4,
        };

        setUsers((prevUsers) => {
          const userIds = new Set(prevUsers.map((user) => user.id));
          if (!userIds.has(newUser.id)) {
            return [...prevUsers, newUser];
          }
          return prevUsers;
        });

        closeModal();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
      setIsFetching({ ...isFetching, addStudent: false });
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Error adding student!", {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching({ ...isFetching, addStudent: false });
    }
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            if (!isFetching.addStudent) closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">{modalType === "add" && "Add Student"}</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onFormSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullname"
                    {...register("fullname")}
                    value={formData.createUserRequest?.fullname || ""}
                    placeholder="Enter full name"
                    onChange={handleChange}
                    className="form-control"
                  />
                  {errors.fullname && <span className="invalid">{errors.fullname.message}</span>}
                </div>
              </Col>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    {...register("email")}
                    value={formData.createUserRequest?.email || ""}
                    placeholder="Enter email"
                    onChange={handleChange}
                    className="form-control"
                  />
                  {errors.email && <span className="invalid">{errors.email.message}</span>}
                </div>
              </Col>
              {/* <Col md="6">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={formData.createUserRequest?.gender || ""}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </Col> */}
              <Col size="12">
                <ul className="text-end">
                  <li>
                    {isFetching.addStudent ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Adding... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="submit">
                        {modalType === "add" && "Add Student"}
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

export default AddStudentModal;
