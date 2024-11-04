import React, { useState } from "react";
import Content from "../layout/content/Content";
import Head from "../layout/head/Head";
import TrafficDougnut from "../components/partials/analytics/traffic-dougnut/TrafficDoughnut";
import {
  Block,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Row,
  Col,
  PreviewAltCard,
  RSelect,
} from "../components/Component";
import InvestPlan from "../components/partials/invest/invest-plan/InvestPlan";
import UserActivity from "../components/partials/crypto/user-activity/UserActivity";
import ThreeColChart from "./ThreeColChart";

const AnalyticsHomePage = () => {
  return (
    <>
      <Head title="Analytics Dashboard" />
      <Content>
        <BlockHead size="sm">
          <BlockHeadContent>
            <BlockTitle page tag="h3">
              SWP Evaluation System
            </BlockTitle>
            <BlockDes className="text-soft">
              <p>Welcome to SES Dashboard.</p>
            </BlockDes>
            {/* Grouped selects in a card or container */}
            <div
              className="select-container"
              style={{
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#f5f6fa",
                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                marginTop: "20px",
              }}
            >
              <Row className="g-3">
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <RSelect />
                  </div>
                </Col>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <RSelect />
                  </div>
                </Col>
              </Row>
            </div>
          </BlockHeadContent>
        </BlockHead>

        <Block>
          <Row className="g-gs">
            <Col lg="5" xxl="4">
              <PreviewAltCard className="h-100">
                <TrafficDougnut />
              </PreviewAltCard>
            </Col>
            <Col lg="7" xxl="4">
              <InvestPlan />
            </Col>
            <Col md="6" lg="6" xxl="4">
              <PreviewAltCard className="h-100">
                <UserActivity />
              </PreviewAltCard>
            </Col>
            <Col md="6" lg="6" xxl="4">
              <PreviewAltCard className="h-100">
                <ThreeColChart />
              </PreviewAltCard>
            </Col>
          </Row>
        </Block>
      </Content>
    </>
  );
};

export default AnalyticsHomePage;
