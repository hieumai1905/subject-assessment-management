import React from "react";
import Content from "../../layout/content/Content";
import { Card, CardHeader, CardBody, Row, Col, ListGroup, ListGroupItem, Badge, Spinner } from "reactstrap";
import { isNullOrEmpty } from "../../utils/Utils";
import { useNavigate } from "react-router-dom";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Icon } from "../../components/Component";

const SubjectDetail = ({ subject, loadings }) => {
  const navigate = useNavigate();

  return (
    <Content>
      {loadings && (
        <div className="d-flex justify-content-center py-5">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      )}
      {!loadings && (
        <>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page>
                  {/* <Icon name="book" className="me-2" /> Subject Details */}
                </BlockTitle>
              </BlockHeadContent>
              <BlockHeadContent>
                {/* <Button color="primary" outline className="d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                  <Icon name="arrow-left"></Icon>
                  <span>Back</span>
                </Button> */}
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
              <CardHeader>
                <BlockTitle tag="h5">
                  Information - <strong className="text-primary small">{subject?.subjectName}</strong>
                </BlockTitle>
              </CardHeader>
              <CardBody>
                <Row className="gy-4">
                  <Col md="6" className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label text-muted">Subject Code</span>
                      <span className="profile-ud-value text-dark fw-bold">{subject?.subjectCode}</span>
                    </div>
                  </Col>
                  <Col md="6" className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label text-muted">Subject Name</span>
                      <span className="profile-ud-value text-dark fw-bold">{subject?.subjectName}</span>
                    </div>
                  </Col>

                  <Col md="6" className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label text-muted">Description</span>
                      <span className="profile-ud-value border rounded bg-light p-2 d-block">
                        {isNullOrEmpty(subject.description) ? <em>No description available</em> : subject.description}
                      </span>
                    </div>
                  </Col>
                  {/* Status Col */}
                  <Col md="6" className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label text-muted">Status</span>
                      <span className="profile-ud-value">
                        <Badge color={subject?.active ? "success" : "danger"}>
                          {subject?.active ? "Active" : "Inactive"}
                        </Badge>
                      </span>
                    </div>
                  </Col>
                  <Col md="6" className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label text-muted">Managers</span>
                      <span className="profile-ud-value">
                        {subject?.managers && subject.managers.length > 0 ? (
                          <ListGroup className="list-unstyled mb-0">
                            {subject.managers.map((manager) => (
                              <ListGroupItem key={manager.id} className="d-flex align-items-center">
                                <Icon name="user" className="me-2" />
                                {manager.fullname}{" "}
                                <Badge color="light" pill className="ms-2">
                                  {manager.username}
                                </Badge>
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        ) : (
                          <em className="text-muted">No manager available</em>
                        )}
                      </span>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Block>
        </>
      )}
    </Content>
  );
};

export default SubjectDetail;
