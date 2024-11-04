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
import CriteriaList from "../evaluation-criteria/CriteriaList";
import AssignmentDetail from "./AssignmentDetail";
import CriteriaListDatagrid from "../evaluation-criteria/EvaluationCriterias";
import { convertToOptions } from "../../utils/Utils";

export default function AssignmentDetailTabs() {
  const [activeTab, setActiveTab] = useState("2");
  const navigate = useNavigate();

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [isFetching, setIsFetching] = useState({
    assignment: true,
    subjects: true,
    criterias: false,
  });

  const { id } = useParams();
  const [assignment, setAssignment] = useState({active: true});
  const [criterias, setCriterias] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return false;
      try {
        const response = await authApi.get("/assignment/get-by-id/" + id);
        console.log(response);
        if (response.data.statusCode === 200) {
          setAssignment(response.data.data);
          setCriterias(response.data.data.evaluationCriterias);
          setIsFetching({...isFetching, assignment: false});
        } else {
          toast.error(response.data.data);
        }
      } catch {
        toast.error("Error while getting assignment");
      }
    };
    fetchAssignment();
  }, [id, reload]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if(isFetching.assignment && id !== undefined) return false;
      try {
        const response = await authApi.post("/subjects/search", {
          pageSize: 9999,
          pageIndex: 1,
          active: true,
        });
        console.log("subject:", response.data.data);
        if (response.data.statusCode === 200) {
          setSubjects(convertToOptions(response.data.data.subjects, "id", "subjectCode"));
          let subject = response.data.data.subjects.find((item) => item.id === assignment.subjectId);
          if(subject) {
            setSelectedSubject({
              value: subject.id,
              label: subject.subjectCode,
            });
          }else if(id === undefined && response.data.data.subjects.length > 0) {
            setSelectedSubject({
              value: response.data.data.subjects[0]?.id,
              label: response.data.data.subjects[0]?.subjectCode  
            });
            setAssignment({...assignment, subjectId: response.data.data.subjects[0]?.id});   
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error search subject!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };
    fetchSubjects();
  }, [isFetching.assignment]);

  const onSubmit = async (sData) => {
    setIsFetching({...isFetching, criterias: true});
    const submitForm = {
      assignmentId: assignment?.id,
      listEvaluationCriteria: criterias.map(criteria => {
        if (typeof criteria.id === 'string') {
            return { ...criteria, id: null };
        }
        return criteria;
      }),
    };
    console.log("sData", submitForm);
    try {
      let action = "Update";
      let url = "/evaluation-criteria/update-evaluation-criteria";
      const response = await authApi.put(url, submitForm);
      console.log(`${action} criterias:`, response.data.data);
      if (response.data.statusCode === 200) {
        toast.success(`${action} criterias successfully!`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
      setReload(!reload);
      setIsFetching({...isFetching, criterias: false});
    } catch (error) {
      console.error(`Error ${action} criterias:`, error);
      toast.error(`Error ${action} criterias!`, {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching({...isFetching, criterias: false});
    }
  };

  return (
    <>
      <Head title="Assignment Detail"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>{assignment?.id === undefined ? "Add new assignment" : assignment.title}</BlockTitle>
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
                  // navigate("/subject-list");
                }}
                className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
              >
                <Icon name="arrow-left"></Icon>
              </a>
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
                Evaluation Criteria
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              {activeTab === "1" ? (
                <AssignmentDetail 
                assignment={assignment} 
                setAssignment={setAssignment} 
                subjects={subjects}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                onSubmit={onSubmit} />
              ) : (
                <></>
              )}
            </TabPane>
            <TabPane tabId="2">
              {activeTab === "2" ? <CriteriaListDatagrid criterias={criterias} setCriterias={setCriterias} onSubmit={onSubmit} isFetching={isFetching} /> : <></>}
            </TabPane>
          </TabContent>
        </Block>
      </Content>
      <ToastContainer />
    </>
  );
}
