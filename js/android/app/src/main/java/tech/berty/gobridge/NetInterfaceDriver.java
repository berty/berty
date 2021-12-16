package tech.berty.gobridge;

import org.json.JSONArray;

import java.net.InterfaceAddress;
import java.net.NetworkInterface;

import java.util.Collections;

import bertybridge.NativeNetInterfaceDriver;

public class NetInterfaceDriver implements NativeNetInterfaceDriver {
    public String get() {
        JSONArray jsonArray = new JSONArray();

        try {
            for (NetworkInterface nif : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                try {
                    for (InterfaceAddress ia : nif.getInterfaceAddresses()) {
                        String[] parts = ia.toString().split("/", 0);
                        if (parts.length > 1) {
                            jsonArray.put(parts[1]);
                        }
                    }
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}

        return jsonArray.toString();
    }
}
