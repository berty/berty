import React from "react";
import { Doughnut } from "react-chartjs-2";

const makeUnit = suffix => [
  suffix,
  ...[..."kMGTPEZY"].map(prefix => prefix + suffix)
];

const BYTE_UNITS = makeUnit("B");
const BIT_UNITS = makeUnit("b");
const MIBYTE_UNITS = makeUnit("iB");

const bytesToPrettyBits = val => {
  let nameIndex = 0;
  val *= 8;
  const FACTOR = 1000;
  while (val > FACTOR) {
    nameIndex++;
    val /= FACTOR;
  }
  return `${val.toFixed(1)} ${BIT_UNITS[nameIndex]}`;
};

const bytesToPrettyMibytes = val => {
  let nameIndex = 0;
  const FACTOR = 1024;
  while (val > FACTOR) {
    nameIndex++;
    val /= FACTOR;
  }
  return `${val.toFixed(1)} ${MIBYTE_UNITS[nameIndex]}`;
};

const bytesToPrettyBytes = val => {
  let nameIndex = 0;
  const FACTOR = 1000;
  while (val > FACTOR) {
    nameIndex++;
    val /= FACTOR;
  }
  return `${val.toFixed(1)} ${BYTE_UNITS[nameIndex]}`;
};

const DEFAULT_DISPLAY = "bits";

const DISPLAY_FUNCS = {
  bytes: bytesToPrettyBytes,
  mibytes: bytesToPrettyMibytes,
  bits: bytesToPrettyBits
};

export const prettyNetworkRate = bytes =>
  `${DISPLAY_FUNCS[DEFAULT_DISPLAY](bytes)}/s`;

export default ({
  value,
  max,
  label,
  color,
  style,
  display = DEFAULT_DISPLAY
}) => {
  const CIRCLE = 2.0 * Math.PI;
  const circumference = (2.0 / 3.0) * CIRCLE;
  const valPercent = (value / max) * 100;
  return (
    <div style={style}>
      <div style={{ textAlign: "center" }}>{label}</div>
      <div style={{ textAlign: "center", margin: "auto" }}>
        <Doughnut
          data={{
            datasets: [
              {
                label,
                data: [valPercent, 100 - valPercent],
                borderWidth: [0, 0],
                backgroundColor: [color, "#ccc"]
              }
            ]
          }}
          options={{
            tooltips: {
              enabled: false
            },
            circumference,
            rotation: (-1 / 2) * Math.PI - circumference / 2.0
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px"
        }}
      >
        <div>{prettyNetworkRate(value)}</div>
        <div>{prettyNetworkRate(max)}</div>
      </div>
    </div>
  );
};
