import React, { Fragment } from "react";
import { observer } from "mobx-react";
import palette from "google-palette";
import { Doughnut } from "react-chartjs-2";

import peers from "../store/peers";

const MAX_COUNTRIES = 7;

export default observer(({ style }) => {
  const countries = peers.countries;
  if (countries.size < 1) return null;
  const entries = Object.entries(countries.toJSON());
  const sorted = entries.sort(([_c, a], [_d, b]) => b - a);
  const others = [
    "Others",
    sorted
      .slice(MAX_COUNTRIES)
      .reduce((count, [, subCount]) => count + subCount, 0)
  ];
  const greatest = sorted.slice(0, MAX_COUNTRIES);
  const slice =
    sorted.length > MAX_COUNTRIES ? [...greatest, others] : greatest;
  const countriesNames = slice.map(([name]) => name);
  const plt = palette("tol", slice.length);
  const data = {
    labels: countriesNames,
    datasets: [
      {
        label: "# of peers",
        data: slice.map(entry => entry[1]),
        backgroundColor: Array.isArray(plt) ? plt.map(str => `#${str}`) : []
      }
    ]
  };
  return (
    <Fragment>
      <h1>Distribution of peers</h1>
      <div>
        <Doughnut data={data} />
      </div>
    </Fragment>
  );
});
