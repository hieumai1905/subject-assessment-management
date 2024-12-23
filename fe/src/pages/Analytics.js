import React, { useState } from "react";
import Content from "../layout/content/Content";
import Head from "../layout/head/Head";
import AudienceOverview from "../components/partials/analytics/audience-overview/AudienceOverview";
import ActiveUser from "../components/partials/analytics/active-user/ActiveUser";
import WebsitePerformance from "../components/partials/analytics/website-perfomance/WebsitePerfomance";
import TrafficChannel from "../components/partials/analytics/traffic-channel/Traffic";
import TrafficDougnut from "../components/partials/analytics/traffic-dougnut/TrafficDoughnut";
import UserMap from "../components/partials/analytics/user-map/UserMap";
import BrowserUser from "../components/partials/analytics/browser-users/BrowserUser";
import PageViewer from "../components/partials/analytics/page-view/PageView";
import SessionDevice from "../components/partials/analytics/session-devices/SessionDevice";
import { DropdownToggle, DropdownMenu, Card, UncontrolledDropdown, DropdownItem } from "reactstrap";
import {
  Block,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  Row,
  Col,
  PreviewAltCard,
} from "../components/Component";
import InvestPlan from "../components/partials/invest/invest-plan/InvestPlan";
import UserActivity from "../components/partials/crypto/user-activity/UserActivity";
import ThreeColChart from "./ThreeColChart";

const AnalyticsHomePage = () => {
  const [sm, updateSm] = useState(false);
  return (
    <>
      <Head title="Analytics Dashboard" />
      <Content>
        <BlockHead size="sm">
          <div className="nk-block-between">
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                Website Analytics
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Welcome to Analytics Dashboard.</p>
              </BlockDes>
            </BlockHeadContent>
          </div>
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
            <Row className="g-gs">
              <Col md="6" lg="6" xxl="4">
                <PreviewAltCard className="h-100">
                  <ThreeColChart />
                </PreviewAltCard>
              </Col>
            </Row>
            {/* <Col md="6" lg="6" xxl="6">
              <Card className="card-bordered h-100">
                <TrafficChannel />
              </Card>
            </Col> */}
            {/* <Col md="6" xxl="6">
              <PreviewAltCard className="h-100" bodyClass="h-100 stretch flex-column">
                <SessionDevice />
              </PreviewAltCard>
            </Col> */}
          </Row>
        </Block>
      </Content>
    </>
  );
};

export default AnalyticsHomePage;
