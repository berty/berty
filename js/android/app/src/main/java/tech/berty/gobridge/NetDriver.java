package tech.berty.gobridge;

import static bertybridge.Bertybridge.*;

import org.json.JSONArray;

import java.net.InterfaceAddress;
import java.net.NetworkInterface;

import java.util.Collections;

import bertybridge.NativeNetDriver;
import bertybridge.NetAddrs;
import bertybridge.NetInterface;
import bertybridge.NetInterfaces;

public class NetDriver implements NativeNetDriver {
    public NetAddrs interfaceAddrs() throws Exception {
        NetAddrs netaddrs = new NetAddrs();

        for (NetworkInterface nif : Collections.list(NetworkInterface.getNetworkInterfaces())) {
            try {
                for (InterfaceAddress ia : nif.getInterfaceAddresses()) {
                    String[] parts = ia.toString().split("/", 0);
                    if (parts.length > 1) {
                        netaddrs.appendAddr(parts[1]);
                    }
                }
            } catch (Exception ignored) {}
        }

        return netaddrs;
    }

    public NetInterfaces interfaces() throws Exception {
        NetInterfaces ifaces = new NetInterfaces();

        for (NetworkInterface nif : Collections.list(NetworkInterface.getNetworkInterfaces())) {
            NetInterface iface = new NetInterface();
            try {
                iface.copyHardwareAddr(nif.getHardwareAddress());
            } catch (Exception ignored) {}

            iface.setIndex(nif.getIndex());
            iface.setMTU(nif.getMTU());
            iface.setName(nif.getName());
            if (nif.isLoopback()) {
                iface.addFlag(NetFlagLoopback);
            }

            if (nif.isPointToPoint()) {
                iface.addFlag(NetFlagPointToPoint);
            }

            if (nif.isUp()) {
                iface.addFlag(NetFlagUp);
            }

            if (nif.isVirtual()) {
                // iface.addFlag(Net);
            }

            if (nif.supportsMulticast()) {
                iface.addFlag(NetFlagMulticast);
            }

            ifaces.append(iface);
        }

        return ifaces;
    }
}
