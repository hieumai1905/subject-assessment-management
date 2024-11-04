import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Button, Icon } from "../../components/Component";
import { Nav, NavItem, NavLink, Spinner, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import SubjectDetail from "./SubjectDetail";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import SubjectSettingList from "../subject-setting/SubjectSettingList";
import AssignmentList from "../assignments/AssignmentList";
import CriteriaListDatagrid from "../evaluation-criteria/EvaluationCriterias";
import SubjectTeachersTable from "./SubjectTeachersTable";
import useAuthStore from "../../store/Userstore";

export default function SubjectDetailTabs() {
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const { role } = useAuthStore((state) => state);

  const { id } = useParams();
  const [subject, setSubject] = useState({});
  const [loadings, setLoadings] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoadings(true);
        const response = await authApi.get("/subjects/get-by-id/" + id);
        if (response.data.statusCode === 200) {
          setSubject(response.data.data);
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch {
        toast.error("Error while getting subject", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setLoadings(false);
      }
    };
    fetchSubject();
  }, [id]);

  const handleBackClick = () => {
    if (role === "ADMIN") {
      navigate("/subject-manage");
    } else if (role === "MANAGER") {
      navigate("/subject-list");
    } else {
      navigate("/"); // Đường dẫn mặc định hoặc tùy chọn khác nếu cần
    }
  };

  return (
    <>
      <Head title="Subject Detail"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Subject Details</BlockTitle>
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
                Assignment
              </NavLink>
            </NavItem>
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
                Evaluation Criteria
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag="a"
                href="#tab"
                className={classnames({ active: activeTab === "4" })}
                onClick={(ev) => {
                  ev.preventDefault();
                  toggle("4");
                }}
              >
                Setting
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag="a"
                href="#tab"
                className={classnames({ active: activeTab === "5" })}
                onClick={(ev) => {
                  ev.preventDefault();
                  toggle("5");
                }}
              >
                Teachers
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              {activeTab === "1" ? <SubjectDetail subject={subject} loadings={loadings} /> : <></>}
            </TabPane>
            <TabPane tabId="2">{activeTab === "2" ? <AssignmentList subject={subject} /> : <></>}</TabPane>
            <TabPane tabId="3">{activeTab === "3" ? <CriteriaListDatagrid subject={subject} /> : <></>}</TabPane>
            <TabPane tabId="4">{activeTab === "4" ? <SubjectSettingList subject={subject} /> : <></>}</TabPane>
            <TabPane tabId="5">{activeTab === "5" ? <SubjectTeachersTable subject={subject} /> : <></>}</TabPane>
          </TabContent>
        </Block>
      </Content>
      <ToastContainer />
    </>
  );
}
