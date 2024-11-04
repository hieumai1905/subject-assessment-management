import React from "react";
import Content from "../../layout/content/Content";
import { Card, CardHeader, CardBody, Row, Col, Button, Badge } from "reactstrap";
import { isNullOrEmpty } from "../../utils/Utils";
import { useNavigate } from "react-router-dom";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Icon } from "../../components/Component";
import useAuthStore from "../../store/Userstore";

const ClassDetail = ({ classes }) => {
  const navigate = useNavigate();

  return (
    <Content>
      <BlockHead size="sm">
        <BlockBetween>
          <BlockHeadContent>
            <BlockTitle tag="h3" page></BlockTitle>
          </BlockHeadContent>
          <BlockHeadContent>
          
            <a
              href="#back"
              onClick={(ev) => {
                ev.preventDefault();
                navigate(-1);
              }}
              className="btn btn-icon btn-outline-primary d-inline-flex d-sm-none"
            >
              <Icon name="arrow-left"></Icon>
            </a>
          </BlockHeadContent>
        </BlockBetween>
      </BlockHead>

      <Block>
        <Card className="card-bordered shadow-sm">
          <CardHeader className="bg-primary text-white">
            <BlockTitle tag="h5" className="mb-0">
              Class Information{" "}
              <Badge color={classes?.active ? "success" : "danger"} className="ms-2">
                {classes?.active ? "Active" : "Inactive"}
              </Badge>
            </BlockTitle>
          </CardHeader>
          <CardBody>
            <Row className="gy-4">
              <Col md="6" className="profile-ud-item">
                <div className="profile-ud wider">
                  <span className="profile-ud-label text-muted">Class Code</span>
                  <span className="profile-ud-value text-dark fw-bold">{classes?.classCode}</span>
                </div>
              </Col>
              <Col md="6" className="profile-ud-item">
                <div className="profile-ud wider">
                  <span className="profile-ud-label text-muted">Class Name</span>
                  <span className="profile-ud-value text-dark fw-bold">{classes?.name}</span>
                </div>
              </Col>
              <Col md="6" className="profile-ud-item">
                <div className="profile-ud wider">
                  <span className="profile-ud-label text-muted">Teacher</span>
                  <span className="profile-ud-value">
                    {isNullOrEmpty(classes?.teacherName) ? "No teacher available" : classes?.teacherName}
                  </span>
                </div>
              </Col>
              <Col md="6" className="profile-ud-item">
                <div className="profile-ud wider">
                  <span className="profile-ud-label text-muted">Semester</span>
                  <span className="profile-ud-value">
                    {isNullOrEmpty(classes?.semesterName) ? "No semester available" : classes?.semesterName}
                  </span>
                </div>
              </Col>
              <Col md="6" className="profile-ud-item">
                <div className="profile-ud wider">
                  <span className="profile-ud-label text-muted">Subject</span>
                  <span className="profile-ud-value">
                    {isNullOrEmpty(classes?.subjectName) ? "No subject available" : classes?.subjectName}
                  </span>
                </div>
              </Col>
              <Col md="12" className="profile-ud-item">
                <div className="profile-ud wider">
                  <span className="profile-ud-label text-muted">Description</span>
                  <span className="profile-ud-value border rounded bg-light p-3 d-block">
                    {isNullOrEmpty(classes.description) ? "No description available" : classes.description}
                  </span>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Block>
    </Content>
  );
};

export default ClassDetail;
