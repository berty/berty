import React from "react";
import {inject, observer} from "mobx-react";
import palette from "google-palette";
import Gauge from "./Gauge";

const colors = palette("tol", 2).map(c => "#" + c);

export const IN_COLOR = colors[0];
export const OUT_COLOR = colors[1];

const InstantBandwidthView = ({style, node}) => {
  const gaugeStyle = {
    display: "inline-block",
    width: "50%"
  };
  return (
    <div style={style}>
      <h1>Network traffic</h1>
      <div style={gaugeStyle}>
        <Gauge
          value={node.rateIn}
          max={node.maxRateIn}
          label="Incoming"
          color={IN_COLOR}
        />
      </div>
      <div style={gaugeStyle}>
        <Gauge
          value={node.rateOut}
          max={node.maxRateOut}
          label="Outgoing"
          color={OUT_COLOR}
        />
      </div>
    </div>
  );
};

export default inject("node")(observer(InstantBandwidthView));
