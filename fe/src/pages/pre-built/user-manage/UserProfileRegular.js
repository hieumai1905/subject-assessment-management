import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import { Card } from "reactstrap";
import Head from "../../../layout/head/Head";
import { Modal, ModalBody } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Row,
  Col,
  Button,
} from "../../../components/Component";
import UserProfileAside from "./UserProfileAside";
import useAuthStore from "../../../store/Userstore";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../../utils/ApiAuth";

const UserProfileRegularPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [modalTab, setModalTab] = useState("1");
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    mobile: "",
    note: "",
    email: "",
    roleId: "",
    gender: "",
  });
  const [modalFormData, setModalFormData] = useState({
    username: "",
    fullname: "",
    mobile: "",
    note: "",
    email: "",
    roleId: "",
    gender: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useAuthStore();
  const userId = user.id;
  const { role: userRole } = useAuthStore();

  const fetchData = async (userId) => {
    const response = await authApi.get(`/user/get-detail/${userId}`);
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
      setModalFormData({
        username: userData.username,
        fullname: userData.fullname,
        email: userData.email,
        mobile: userData.mobile,
        note: userData.note,
        roleId: userData.roleId,
        gender: userData.gender,
      });
    } else {
      toast.error("Failed to fetch user data.");
    }
  };

  useEffect(() => {
    fetchData(userId);
  }, [userId]);

  const submitForm = async () => {
    try {
      const dataToSend = {
        ...modalFormData,
      };
      const response = await authApi.put(`/user/update/${userId}`, dataToSend);

      if (response.data.statusCode === 200) {
        setFormData(modalFormData);
        setModal(false);
        toast.success("Updated successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else if (response.data.statusCode !== 200) {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("An error occurred while updating user data.");
    }
  };
  const onInputChange = (e) => {
    const { name, value } = e.target;
    setModalFormData({
      ...modalFormData,
      [name]: value,
    });
  };

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const submitAvatarChange = async () => {
    if (!avatarFile) {
      toast.error("Please choose an avatar file.");
      return;
    }

    setIsLoading(true); // Bắt đầu loading

    const formData = new FormData();
    formData.append("file", avatarFile);

    try {
      const response = await authApi.put(`/user/change-avatar/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.statusCode === 200) {
        const updatedUser = response.data.data;

        const authstore = JSON.parse(localStorage.getItem("authstore"));

        authstore.state.user.avatar_url = updatedUser.avatar_url;

        localStorage.setItem("authstore", JSON.stringify(authstore));

        toast.success("Avatar updated successfully.", {
          position: toast.POSITION.TOP_CENTER,
        });

        setModal(false);
        window.location.reload();
      } else {
        toast.error("Failed to update avatar.");
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("An error occurred while updating avatar.");
    } finally {
      setIsLoading(false); // Dừng loading sau khi API hoàn thành
    }
  };

  // function to change the design view under 990 px
  const viewChange = () => {
    if (window.innerWidth < 990) {
      setMobileView(true);
    } else {
      setMobileView(false);
      updateSm(false);
    }
  };

  useEffect(() => {
    viewChange();
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    document.getElementsByClassName("nk-header")[0].addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  return (
    <React.Fragment>
      <Head title="User List - Profile"></Head>
      <Content>
        <Card className="card-bordered">
          <div className="card-aside-wrap">
            <div
              className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${
                sm ? "content-active" : ""
              }`}
            >
              <UserProfileAside updateSm={updateSm} sm={sm} />
            </div>
            <div className="card-inner card-inner-lg">
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Personal Information</BlockTitle>
                    <BlockDes></BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r"></Icon>
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <h6 className="overline-title">Basics</h6>
                  </div>
                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">User Name</span>
                      <span className="data-value">{formData.username}</span>
                    </div>
                  </div>
                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">Full Name</span>
                      <span className="data-value">{formData.fullname}</span>
                    </div>
                  </div>
                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">Email</span>
                      <span className="data-value">{formData.email}</span>
                    </div>
                  </div>
                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">Phone Number</span>
                      <span className="data-value text-soft">{formData.mobile}</span>
                    </div>
                  </div>

                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">Role</span>
                      <span className="data-value text-soft">{userRole}</span>
                    </div>
                  </div>
                </div>
              </Block>

              <Block className="d-flex justify-content-end">
                <Button color="primary" onClick={() => setModal(true)}>
                  <Icon name="edit" className="me-2"></Icon>
                  Update Profile
                </Button>
              </Block>

              <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={() => setModal(false)}>
                <a
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setModal(false);
                  }}
                  className="close"
                >
                  <Icon name="cross-sm"></Icon>
                </a>
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title">Update Profile</h5>
                    <ul className="nk-nav nav nav-tabs">
                      <li className="nav-item">
                        <a
                          className={`nav-link ${modalTab === "1" && "active"}`}
                          onClick={(ev) => {
                            ev.preventDefault();
                            setModalTab("1");
                          }}
                          href="#personal"
                        >
                          Personal
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${modalTab === "2" && "active"}`}
                          onClick={(ev) => {
                            ev.preventDefault();
                            setModalTab("2");
                          }}
                          href="#avatar"
                        >
                          Change Avatar
                        </a>
                      </li>
                    </ul>
                    <div className="tab-content">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <Row className="gy-4">
                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="username">
                                User Name
                              </label>
                              <input
                                type="text"
                                id="username"
                                disabled
                                className="form-control"
                                name="username"
                                // eslint-disable-next-line no-undef
                                onChange={(e) => onInputChange(e)}
                                value={modalFormData.username}
                                placeholder="Enter User name"
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="fullname">
                                Full Name
                              </label>
                              <input
                                type="text"
                                id="fullname"
                                className="form-control"
                                name="fullname"
                                // eslint-disable-next-line no-undef
                                onChange={(e) => onInputChange(e)}
                                value={modalFormData.fullname}
                                placeholder="Enter Full name"
                              />
                            </div>
                          </Col>

                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="mobile">
                                Phone Number
                              </label>
                              <input
                                type="number"
                                id="mobile"
                                className="form-control"
                                name="mobile"
                                // eslint-disable-next-line no-undef
                                onChange={(e) => onInputChange(e)}
                                value={modalFormData.mobile}
                                placeholder="Phone Number"
                              />
                            </div>
                          </Col>

                          <Col size="12" className="text-end me-auto">
                            <div className="d-flex justify-content-end">
                              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                <li>
                                  <Button
                                    color="primary"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      submitForm();
                                    }}
                                  >
                                    Update Profile
                                  </Button>
                                </li>
                                <li>
                                  <Button
                                    color="danger"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      setModal(false); // Close the modal when clicking "Cancel"
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </li>
                              </ul>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <div className={`tab-pane ${modalTab === "2" ? "active" : ""}`} id="avatar">
                        <Row className="gy-4">
                          <Col md="12">
                            <div className="form-group">
                              <label className="form-label" htmlFor="avatar">
                                Upload New Avatar
                              </label>
                              <input
                                type="file"
                                id="avatar"
                                className="form-control"
                                name="avatar"
                                onChange={handleAvatarChange}
                                placeholder="Choose an image"
                              />
                            </div>
                          </Col>
                          <Col size="12" className="text-end me-auto">
                            <div className="d-flex justify-content-end">
                              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                <li>
                                  <Button
                                    color="primary"
                                    size="lg"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      submitAvatarChange();
                                    }}
                                    disabled={isLoading} // Disable nút khi loading
                                  >
                                    {isLoading ? "Updating..." : "Update Avatar"} {/* Hiển thị loading */}
                                  </Button>
                                </li>
                                <li>
                                  <a
                                    href="#dropdownitem"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      setModal(false);
                                    }}
                                    className="link link-light"
                                  >
                                    Cancel
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </Modal>
            </div>
            <ToastContainer />
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default UserProfileRegularPage;
