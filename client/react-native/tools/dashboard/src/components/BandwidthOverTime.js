import React, { Fragment } from "react";
import { inject, observer } from "mobx-react";
import { Line } from "react-chartjs-2";

import { prettyNetworkRate } from "./Gauge";
import { IN_COLOR, OUT_COLOR } from "./InstantBandwidth";

const BandwidthOverTimeView = ({ style, node }) => {
  const data = node.rateInOverTime.slice();
  const now = Date.now();
  return (
    <Fragment>
      <h1>Bandwidth over time</h1>
      <Line
        data={{
          labels: data.map((_, index) => {
            const date = new Date(now);
            date.setSeconds(date.getSeconds() - (data.length - (index + 1)));
            return date;
          }),
          datasets: [
            {
              label: "Incoming",
              data,
              backgroundColor: IN_COLOR
            },
            {
              label: "Outgoing",
              data: node.rateOutOverTime.slice(),
              backgroundColor: OUT_COLOR
            }
          ]
        }}
        options={{
          scales: {
            xAxes: [
              {
                type: "time",
                distribution: "series"
              }
            ],
            yAxes: [
              {
                ticks: { callback: prettyNetworkRate },
                stacked: true
              }
            ]
          },
          animation: {
            duration: 0 // general animation time
          },
          hover: {
            animationDuration: 0 // duration of animations when hovering an item
          },
          responsiveAnimationDuration: 0 // animation duration after a resize
        }}
      />
    </Fragment>
  );
};

export default inject("node")(observer(BandwidthOverTimeView));
