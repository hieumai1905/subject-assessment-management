import React, { useContext, useEffect, useState } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { Card, Modal, ModalBody, Badge } from "reactstrap";
import {
  Button,
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Col,
  Row,
  OverlineTitle,
  Sidebar,
  UserAvatar,
} from "../../../components/Component";
import { useNavigate, useParams } from "react-router-dom";
import { currentTime, findUpper, monthNames, todaysDate } from "../../../utils/Utils";
import { UserContext } from "./UserContext";
import { notes } from "./UserData";
import authApi from "../../../utils/ApiAuth";

const UserDetailsPage = () => {
  const { contextData } = useContext(UserContext);
  const [data] = contextData;
  const [sideBar, setSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const [noteData, setNoteData] = useState(notes);
  const [addNoteModal, setAddNoteModal] = useState(false);
  const [addNoteText, setAddNoteText] = useState("");
  const navigate = useNavigate();

  let { userId } = useParams();
  console.log(userId);

  useEffect(() => {
    authApi
      .get(`/user/get-detail/${userId}`)
      .then((response) => {
        const userData = response.data.data;
        setUser(userData);
      })
      .catch((error) => {
        console.error("Có lỗi xảy ra khi gọi API:", error);
      });
  }, [userId]);

  const toggle = () => {
    setSidebar(!sideBar);
  };
  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return "Admin";
      case 2:
        return "Manager";
      case 3:
        return "Teacher";
      case 4:
        return "Student";
      default:
        return "unknown";
    }
  };
  useEffect(() => {
    sideBar ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [sideBar]);


  const submitNote = () => {
    let submitData = {
      id: Math.random(),
      text: addNoteText,
      date: `${monthNames[todaysDate.getMonth()]} ${todaysDate.getDate()}, ${todaysDate.getFullYear()}`,
      time: `${currentTime()}`,
      company: "Softnio",
    };
    setNoteData([...noteData, submitData]);
    setAddNoteModal(false);
    setAddNoteText("");
  };

  return (
    <>
      <Head title="User Details - Regular"></Head>
      {user && (
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page>
                  Users / <strong className="text-primary small">{user.fullname}</strong>
                </BlockTitle>
                <BlockDes className="text-soft">
                  <ul className="list-inline">
                    <li>
                      User ID: <span className="text-base">{user.id}</span>
                    </li>
                  </ul>
                </BlockDes>
              </BlockHeadContent>
              <BlockHeadContent>
                <Button color="light" outline className="bg-white d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                  <Icon name="arrow-left"></Icon>
                  <span>Back</span>
                </Button>
                <a
                  href="#back"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(-1);
                  }}
                  className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                >
                  <Icon name="arrow-left"></Icon>
                </a>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <Block>
            <Card className="card-bordered">
              <div className="card-aside-wrap" id="user-detail-block">
                <div className="card-content">
                  <ul className="nav nav-tabs nav-tabs-mb-icon nav-tabs-card">
                    <li className="nav-item">
                      <a
                        className="nav-link active"
                        href="#personal"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                      >
                        <Icon name="user-circle"></Icon>
                        <span>Personal</span>
                      </a>
                    </li>
                    {/* <li className="nav-item">
                      <a
                        className="nav-link disabled"
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                      >
                        <Icon name="repeat"></Icon>
                        <span>Transactions</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link disabled"
                        href="#documents"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                      >
                        <Icon name="file-text"></Icon>
                        <span>Documents</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link disabled"
                        href="#notifications"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                      >
                        <Icon name="bell"></Icon>
                        <span>Notifications</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link disabled"
                        href="#activities"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                      >
                        <Icon name="activity"></Icon>
                        <span>Activities</span>
                      </a>
                    </li> */}
                    <li className="nav-item nav-item-trigger d-xxl-none">
                      <Button className={`toggle btn-icon btn-trigger ${sideBar && "active"}`} onClick={toggle}>
                        <Icon name="user-list-fill"></Icon>
                      </Button>
                    </li>
                  </ul>

                  <div className="card-inner">
                    <Block>
                      <BlockHead>
                        <BlockTitle tag="h5">Personal Information</BlockTitle>
                        <p>Basic info, like your name and address, that you use on Nio Platform.</p>
                      </BlockHead>
                      <div className="profile-ud-list">
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">User name</span>
                            <span className="profile-ud-value">{user.username}</span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Full Name</span>
                            <span className="profile-ud-value">{user.fullname}</span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Email Address</span>
                            <span className="profile-ud-value">{user.email}</span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Phone number</span>
                            <span className="profile-ud-value">{user.mobile}</span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Role</span>
                            <span className="profile-ud-value">{getRoleName(user.roleId)}</span>
                          </div>
                        </div>
                      </div>
                    </Block>

                    <div className="nk-divider divider md"></div>

                    <Block>
                      <BlockHead size="sm">
                        <BlockBetween>
                          <BlockTitle tag="h5">Admin Note</BlockTitle>
                          {/* <a
                            href="#addnote"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setAddNoteModal(true);
                            }}
                            className="link link-sm"
                          >
                            + Add Note
                          </a> */}
                        </BlockBetween>
                      </BlockHead>
                      <div className="bq-note">
                        {user.note && (
                          <div className="bq-note-item">
                            <div className="bq-note-text">
                              <p>{user.note}</p>
                            </div>
                            <div className="bq-note-meta">
                              {/* <span className="bq-note-added">
                                Added on <span className="date">{todaysDate.toLocaleDateString()}</span> at{" "}
                                <span className="time">{currentTime()} PM</span>
                              </span>
                              <span className="bq-note-sep sep">|</span>
                              <span className="bq-note-by">
                                By <span>Softnio</span>
                              </span> */}
                              {/* <a
                                href="#deletenote"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  // Xử lý xóa note ở đây nếu cần
                                }}
                                className="link link-sm link-danger"
                              >
                                Delete Note
                              </a> */}
                            </div>
                          </div>
                        )}
                      </div>
                    </Block>
                  </div>
                </div>

                <Modal
                  isOpen={addNoteModal}
                  toggle={() => setAddNoteModal(false)}
                  className="modal-dialog-centered"
                  size="lg"
                >
                  <ModalBody>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setAddNoteModal(false);
                        setAddNoteText("");
                      }}
                      className="close"
                    >
                      <Icon name="cross-sm"></Icon>
                    </a>
                    <div className="p-2">
                      <h5 className="title">Add Admin Note</h5>
                      <div className="mt-4 mb-4">
                        <textarea
                          value={addNoteText}
                          className="form-control no-resize"
                          onChange={(e) => setAddNoteText(e.target.value)}
                        />
                      </div>
                      <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                        <li>
                          <Button color="primary" size="md" type="submit" onClick={submitNote}>
                            Add Note
                          </Button>
                        </li>
                        <li>
                          <Button onClick={() => setAddNoteModal(false)} className="link link-light">
                            Cancel
                          </Button>
                        </li>
                      </ul>
                    </div>
                  </ModalBody>
                </Modal>

                <Sidebar toggleState={sideBar}>
                  <div className="card-inner">
                    <div className="user-card user-card-s2 mt-5 mt-xxl-0">
                      <div
                        className="user-avatar"
                        style={{ width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden" }}
                      >
                        <img
                          src={user.avatar_url || "https://picsum.photos/100"}
                          alt="User Avatar"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <div className="user-info">
                        <Badge color="outline-light" pill className="ucap">
                          <span className="profile-ud-value">{getRoleName(user.roleId)}</span>
                        </Badge>
                        <h5>{user.fullname}</h5>
                        <span className="sub-text">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-inner card-inner-sm">
                    <ul className="btn-toolbar justify-center gx-1">
                      <li>
                        <Button
                          href="#tool"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                          className="btn-trigger btn-icon"
                        >
                          <Icon name="shield-off"></Icon>
                        </Button>
                      </li>
                      <li>
                        <Button
                          href="#mail"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                          className="btn-trigger btn-icon"
                        >
                          <Icon name="mail"></Icon>
                        </Button>
                      </li>
                      <li>
                        <Button
                          href="#download"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                          className="btn-trigger btn-icon"
                        >
                          <Icon name="download-cloud"></Icon>
                        </Button>
                      </li>
                      <li>
                        <Button
                          href="#bookmark"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                          className="btn-trigger btn-icon"
                        >
                          <Icon name="bookmark"></Icon>
                        </Button>
                      </li>
                      <li>
                        <Button
                          href="#cancel"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                          className="btn-trigger btn-icon text-danger"
                        >
                          <Icon name="na"></Icon>
                        </Button>
                      </li>
                    </ul>
                  </div>
                  {/* <div className="card-inner">
                    <div className="overline-title-alt mb-2">In Account</div>
                    <div className="profile-balance">
                      <div className="profile-balance-group gx-4">
                        <div className="profile-balance-sub">
                          <div className="profile-balance-amount">
                            <div className="number">
                              2,500.00 <small className="currency currency-usd">USD</small>
                            </div>
                          </div>
                          <div className="profile-balance-subtitle">Invested Amount</div>
                        </div>
                        <div className="profile-balance-sub">
                          <span className="profile-balance-plus text-soft">
                            <Icon className="ni-plus"></Icon>
                          </span>
                          <div className="profile-balance-amount">
                            <div className="number">1,643.76</div>
                          </div>
                          <div className="profile-balance-subtitle">Profit Earned</div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  {/* <div className="card-inner">
                    <Row className="text-center">
                      <Col size="4">
                        <div className="profile-stats">
                          <span className="amount">10</span>
                          <span className="sub-text">Total Order</span>
                        </div>
                      </Col>
                      <Col size="4">
                        <div className="profile-stats">
                          <span className="amount">5</span>
                          <span className="sub-text">Complete</span>
                        </div>
                      </Col>
                      <Col size="4">
                        <div className="profile-stats">
                          <span className="amount">2</span>
                          <span className="sub-text">Progress</span>
                        </div>
                      </Col>
                    </Row>
                  </div> */}
                  <div className="card-inner">
                    <h6 className="overline-title-alt mb-2">Additional</h6>
                    <Row className="g-3">
                      <Col size="6">
                        <span className="sub-text">User ID:</span>
                        <span>{user.id}</span>
                      </Col>
                      <Col size="6">
                        <span className="sub-text">Status:</span>
                        <span
                          className={`lead-text text-${
                            user.status === "success"
                              ? "success"
                              : user.status === "pending"
                              ? "info"
                              : user.status === "warning"
                              ? "warning"
                              : "secondary"
                          }`}
                        >
                          {user.status?.toUpperCase()}
                        </span>
                      </Col>
                      {/* <Col size="6">
                        <span className="sub-text">Register At:</span>
                        <span>Nov 24, 2019</span>
                      </Col> */}
                    </Row>
                  </div>
                  {/* <div className="card-inner">
                    <OverlineTitle tag="h6" className="mb-3">
                      Groups
                    </OverlineTitle>
                    <ul className="g-1">
                      <li className="btn-group">
                        <Button
                          color="light"
                          size="xs"
                          className="btn-dim"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                        >
                          investor
                        </Button>
                        <Button
                          color="light"
                          size="xs"
                          className="btn-icon btn-dim"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                        >
                          <Icon className="ni-cross"></Icon>
                        </Button>
                      </li>
                      <li className="btn-group">
                        <Button
                          color="light"
                          size="xs"
                          className="btn-dim"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                        >
                          support
                        </Button>
                        <Button
                          color="light"
                          size="xs"
                          className="btn-icon btn-dim"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                        >
                          <Icon className="ni-cross"></Icon>
                        </Button>
                      </li>
                      <li className="btn-group">
                        <Button
                          color="light"
                          size="xs"
                          className="btn-dim"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                        >
                          another tag
                        </Button>
                        <Button
                          color="light"
                          size="xs"
                          className="btn-icon btn-dim"
                          onClick={(ev) => {
                            ev.preventDefault();
                          }}
                        >
                          <Icon className="ni-cross"></Icon>
                        </Button>
                      </li>
                    </ul>
                  </div> */}
                </Sidebar>
                {sideBar && <div className="toggle-overlay" onClick={() => toggle()}></div>}
              </div>
            </Card>
          </Block>
        </Content>
      )}
    </>
  );
};
export default UserDetailsPage;
