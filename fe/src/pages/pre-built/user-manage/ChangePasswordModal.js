import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import authApi from "../../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";

const ChangePasswordModal = ({ isOpen, toggle, userId }) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setError,
  } = useForm();
  const [loading, setLoading] = useState(false);

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authApi.put(`/user/change-password/${userId}`, {
        oldPass: data.oldPassword,
        newPass: data.newPassword,
        confirmPass: data.confirmPassword,
      });

      if (response.data.statusCode === 200) {
        toast.success("Change password successful!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTimeout(() => {
          toggle();
          reset();
        }, 1000);
      } else if (response.data.statusCode !== 200) {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      setError("oldPassword", { type: "manual", message: "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <ModalHeader toggle={toggle}>Change Password</ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <FormGroup>
            <Label for="oldPassword">Current Password</Label>
            <Controller
              name="oldPassword"
              control={control}
              defaultValue=""
              rules={{ required: "Current password is required" }}
              render={({ field }) => (
                <Input type="password" id="oldPassword" {...field} invalid={!!errors.oldPassword} />
              )}
            />
            {errors.oldPassword && <div className="invalid-feedback">{errors.oldPassword.message}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="newPassword">New Password</Label>
            <Controller
              name="newPassword"
              control={control}
              defaultValue=""
              rules={{ required: "New Password is required" }}
              render={({ field }) => (
                <Input type="password" id="newPassword" {...field} invalid={!!errors.newPassword} />
              )}
            />
            {errors.newPassword && <div className="invalid-feedback">{errors.newPassword.message}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="confirmPassword">Confirm New Password</Label>
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              rules={{
                required: "Please confirm your new password",
                validate: (value) => value === newPassword || "Passwords do not match",
              }}
              render={({ field }) => (
                <Input type="password" id="confirmPassword" {...field} invalid={!!errors.confirmPassword} />
              )}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
                  
          <Button color="secondary" onClick={toggle} disabled={loading}>
            Cancel
          </Button>
        </ModalFooter>
        <ToastContainer />
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
