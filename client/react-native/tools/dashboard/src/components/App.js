import React, { Fragment } from "react";
import { inject, observer } from "mobx-react";
import { Layout, Row, Col } from "antd";

import "antd/dist/antd.css";
import "./App.css";

import Map from "./Map";
import Countries from "./Countries";
import InstantBandwidth from "./InstantBandwidth";
import Node from "./Node";
import BandwidthOverTime from "./BandwidthOverTime";

const { Content } = Layout;

const AppView = ({ node: { id } }) => (
  <Content>
    {id ? (
      <Fragment>
        <Row>
          <Col span={16}>
            <Node />
          </Col>
          <Col span={8}>
            <InstantBandwidth />
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <BandwidthOverTime />
          </Col>
          <Col span={8}>
            <Countries />
          </Col>
        </Row>
        <Row>
          <Map />
        </Row>
      </Fragment>
    ) : (
      <div style={{ height: "100vh" }}>
        <h1
          style={{
            textAlign: "center",
            width: "100%",
            position: "relative",
            top: "50%",
            transform: "translateY(-50%)"
          }}
        >
          No connection
        </h1>
      </div>
    )}
  </Content>
);

export default inject("node")(observer(AppView));
