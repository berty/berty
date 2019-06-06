import {observable, action} from "mobx";
import geoip from "geoip-nano";
import {memoize} from "lodash";

const localisableAddr = ipfsAddr => {
  if (typeof ipfsAddr !== "string") return null;
  const addrParts = ipfsAddr.split("/");
  if (addrParts.length < 3) return null;
  return addrParts[2];
};

export const lookup = memoize(ipfsAddr => {
  const addr = localisableAddr(ipfsAddr);
  return geoip.lookup(addr);
});

const call = name => thing => thing[name]();

class Peers {
  @observable connected = new Map();
  @observable addresses = new Map();
  @observable locations = new Map();
  @observable countries = new Map();
  @observable protocols = new Map();

  @action.bound addConnected(peer) {
    const {connected, addAddress, removeConnected} = this;
    const {id, addrs} = peer;

    removeConnected(id);
    connected.set(id, peer);
    addrs.forEach(addAddress);
  }

  @action.bound removeConnected(id) {
    const {connected, removeAddress} = this;

    const peer = connected.get(id);
    if (peer) {
      connected.delete(id);
      peer.addrs.forEach(removeAddress);
    }
  }

  @action.bound addLocation(location) {
    const {locations, addCountry} = this;

    const key = JSON.stringify(location);
    const count = locations.get(key) || 0;
    locations.set(key, count + 1);
    //console.log("location", location);
    if (count === 0) addCountry(location.country);
  }

  @action.bound removeLocation(location) {
    const {locations, removeCountry} = this;

    const key = JSON.stringify(location);
    const count = locations.get(key) || 0;
    if (count < 2) {
      removeCountry(location.country);
      locations.delete(key);
    } else {
      locations.set(key, count - 1);
    }
  }

  @action.bound addAddress(address) {
    const {addresses, addLocation} = this;

    const existing = addresses.get(address) || {
      count: 0,
      location: lookup(address)
    };
    existing.count += 1;
    const {count, location} = existing;

    if (count === 1) {
      addresses.set(address, existing);
      if (location) addLocation(location);
    }
  }

  @action.bound removeAddress(address) {
    const {addresses, removeLocation} = this;

    const existing = addresses.get(address);
    if (existing) {
      const {count, location} = existing;

      if (count > 1) {
        existing.count -= 1;
      } else {
        if (location) removeLocation(location);
        addresses.delete(address);
      }
    }
  }

  @action.bound addCountry(country) {
    const {countries} = this;

    const count = countries.get(country) || 0;
    countries.set(country, count + 1);
  }

  @action.bound removeCountry(country) {
    const {countries} = this;

    const count = countries.get(country) || 0;
    if (count < 2) countries.delete(country);
    else countries.set(country, count - 1);
  }

  @action.bound async reset(api) {
    console.log("PEERS RESET");
    const {
      addConnected,
      removeConnected,
      addresses,
      countries,
      locations,
      connected
    } = this;

    [connected, addresses, countries, locations].forEach(call("clear"));

    // TODO: fetch and process an api.Peers({}) batch first

    // TODO: close previous stream on subsequent calls
    if (api) {
      (await api.monitorPeers({})).onData(peer =>
        (peer.connection === 1 ? addConnected : removeConnected)(peer)
      );
    }

    // TODO: auto retry when node is down + auto reconnect
  }
}

const peers = new Peers();

export default peers;
