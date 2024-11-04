import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Button, Icon } from "../../components/Component";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import ClassDetail from "./ClassDetails";
import StudentInClass from "./StudentInClass";
import { canModify } from "../../utils/CheckPermissions";
import useAuthStore from "../../store/Userstore";
import MilestoneCriterias from "./MilestoneCriterias";

export default function ClassDetailTabs() {
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    teacher: true,
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [classes, setClasses] = useState({});
  const { role } = useAuthStore((state) => state);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    const fetchClassById = async () => {
      try {
        const response = await authApi.get("/class/get-by-id/" + id);
        console.log(response);
        if (response.data.statusCode === 200) {
          setClasses(response.data.data);
          setError(null); // Clear any previous errors
        } else {
          setError(response.data.data);
        }
      } catch (error) {
        setError("Error while getting class");
      }
    };
    fetchClassById();
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <>
      <Head title="Class Detail"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Class Details</BlockTitle>
              <p>Details about the class and its attributes.</p>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="primary" outline className="d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                <Icon name="arrow-left"></Icon>
                <span>Back</span>
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Nav tabs>
            <NavItem>
              <NavLink
                tag="a"
                href="#tab"
                className={classnames({ active: activeTab === "1" })}
                onClick={(ev) => {
                  ev.preventDefault();
                  toggle("1");
                }}
              >
                <Icon name="dashboard-fill" className="me-1"></Icon>
                General
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag="a"
                href="#tab"
                className={classnames({ active: activeTab === "2" })}
                onClick={(ev) => {
                  ev.preventDefault();
                  toggle("2");
                }}
              >
                <Icon name="users-fill" className="me-1"></Icon>
                Students
              </NavLink>
            </NavItem>
            {role !== "STUDENT" && (
              <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={classnames({ active: activeTab === "3" })}
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle("3");
                  }}
                >
                  <Icon name="note-add-fill" className="me-1"></Icon>
                  Milestone Criteria
                </NavLink>
              </NavItem>
            )}
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">{activeTab === "1" ? <ClassDetail classes={classes} /> : <></>}</TabPane>
            <TabPane tabId="2">
              {activeTab === "2" && <StudentInClass classes={classes} users={users} setUsers={setUsers} />}
            </TabPane>
            <TabPane tabId="3">
              {activeTab === "3" && <MilestoneCriterias classes={classes} users={users} setUsers={setUsers} />}
            </TabPane>
          </TabContent>
        </Block>
      </Content>
      <ToastContainer />
    </>
  );
}
