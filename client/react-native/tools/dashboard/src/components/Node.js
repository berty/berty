import React from "react";
import {observer} from "mobx-react";

import peers from "../store/peers";
import node from "../store/node";

const CountriesCount = observer(() => `${peers.countries.size} countries`);

const ConnectedCount = observer(() => `${peers.connected.size} connected`);

const AddressesCount = observer(() => `${peers.addresses.size} addresses`);

const LocalisablesCount = observer(
  () => `${peers.locations.size} localisables`
);

export default observer(({style}) => (
  <div style={style}>
    <h1>Node info</h1>
    <p>ID: {node.id}</p>
    <p>{node.prettyDeviceInfos}</p>
    <p>{node.prettyVersion}</p>
    <p>
      Peers: <ConnectedCount /> | <AddressesCount /> | <LocalisablesCount /> |{" "}
      <CountriesCount />
    </p>
  </div>
));
