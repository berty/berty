import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "mobx-react";

import "./index.css";
import * as serviceWorker from "./serviceWorker";

import peers from "./store/peers";
import node from "./store/node";

import App from "./components/App";

ReactDOM.render(
  <Provider
    {...{
      node,
      locations: peers.locations
    }}
  >
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
