import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { Modal, ModalBody, Form, Input, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import { isNullOrEmpty } from "../../utils/Utils";

const SubmitWorkModal = ({ modal, closeModal, formData, setFormData, data, setData }) => {
  useEffect(() => {
    reset(formData);
  }, [formData]);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isFetching, setIsFetching] = useState();

  const onSubmit = async (sData) => {
    const {requirements, file, link, submitType, note} = sData;
    const formData = new FormData();
    formData.append('submitType', submitType === "Submit file" ? "file" : "link");
    formData.append('link', link);
    formData.append('file', file);
    if(!isNullOrEmpty(note))
      formData.append('note', note);
    formData.append('requirementIds', requirements.map(item => item.id));
    try {
      setIsFetching(true);
      const response = await authApi.post('/requirements/submit-work', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('submit work:', response.data.data);
      if(response.data.statusCode === 200) {
        let updateData = [...data];
        response.data.data.forEach(element => {
          let index = updateData.findIndex(item => item.id === element.id);
          if(index !== -1){
            updateData[index] = element;
          }
        });
        setData(updateData);
        toast.success("Submit work successfully!", {
          position: toast.POSITION.TOP_CENTER
        });
        closeModal();
      }else{
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Fail to submit work", {
        position: toast.POSITION.TOP_CENTER
      });
    }finally{
      setIsFetching(false);
    }
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ToastContainer />
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            if (!isFetching) closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Submit Work</h5>
          <div className="mt-4">
            <div className="mb-3">
              <h4>Requirements:</h4>
              <ol className="ms-2">
                {formData.requirements.map((req, index) => (
                  <li key={`li-req-${index}`} style={{fontSize: '16px'}}>{index+1}. {req.reqTitle}</li>
                ))}
              </ol>
            </div>
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              {formData.submitType === "Submit link" ? (
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label">Link*</label>
                    <input
                      type="text"
                      {...register("link", { required: "This field is required" })}
                      value={formData.link}
                      placeholder="Enter link"
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="form-control"
                    />
                    {errors.link && <span className="invalid">{errors.link.message}</span>}
                  </div>
                </Col>
              ) : (
                <Col md="12">
                  <label className="form-label">Upload File*</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <Icon name="upload" />
                      </span>
                    </div>
                    <Input
                      type="file"
                      {...register("file", { required: "This field is required" })}
                      id="customFileSubmitWork"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const maxFileSize = 5 * 1024 * 1024;
                        if (file && file.size > maxFileSize) {
                          e.target.value = null;
                          toast.error("File size exceeds the maximum allowed size of 5MB.", {
                            position: toast.POSITION.TOP_CENTER,
                          });
                          return false;
                        }
                        setFormData({ ...formData, file: file });
                      }}
                      className="form-control"
                    />
                    {errors.file && <span className="invalid">{errors.file.message}</span>}
                  </div>
                </Col>
              )}
              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <textarea
                    value={formData.note}
                    placeholder="Your note"
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>

              <Col size="12">
                <ul className=" text-end">
                  <li>
                    {isFetching ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Submitting... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="submit">
                        Submit Work
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
export default SubmitWorkModal;
