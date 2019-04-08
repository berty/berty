package chat.berty.core;

import android.os.Build;
import android.annotation.TargetApi;

import com.facebook.react.bridge.ReactApplicationContext;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import org.json.JSONException;
import org.json.JSONObject;

import android.bluetooth.BluetoothAdapter;

import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.telephony.TelephonyManager;
import android.util.Log;

import core.Core;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class ConnectivityUpdateHandler extends BroadcastReceiver {
    private static String TAG = "connectivity_update_handler";

    ConnectivityUpdateHandler(ReactApplicationContext reactContext) {
        super();

        reactContext.registerReceiver(this, new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION));
        reactContext.registerReceiver(this, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));

        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (mBluetoothAdapter != null) {
            updateBLE(mBluetoothAdapter.getState());
        } else {
            updateBLE(BluetoothAdapter.STATE_OFF);
        }
    }

    private static BluetoothAdapter mBluetoothAdapter;

    @Override
    public void onReceive(Context context, Intent intent) {
        if(BluetoothAdapter.ACTION_STATE_CHANGED.equals(intent.getAction())) {
            updateBLE(intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, -1));
        } else if (ConnectivityManager.CONNECTIVITY_ACTION.equals(intent.getAction())) {
            updateConnectivity(context);
        }
    }

    private static final void updateConnectivity(Context context) {
        final short
                STATE_ON      = 1,
                STATE_OFF     = 2;

        ConnectivityManager connMgr = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        Network currentNet;
        NetworkCapabilities currentNetCap;

        JSONObject connectivityState = new JSONObject();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            currentNet = connMgr.getActiveNetwork();
        } else {
            currentNet = connMgr.getProcessDefaultNetwork();
        }

        if (currentNet == null) {
            try {
                connectivityState.put("internet", STATE_OFF);
                connectivityState.put("vpn", STATE_OFF);
                connectivityState.put("metered", STATE_OFF);
                connectivityState.put("roaming", STATE_OFF);
                connectivityState.put("trusted", STATE_OFF);
                connectivityState.put("network", NetworkType.TYPE_UNKNOWN);
                connectivityState.put("cellular", CellularType.TYPE_UNKNOWN);
                Core.updateConnectivityState(connectivityState.toString());
            } catch (JSONException e) {
                e.printStackTrace();
            }
        } else {
            currentNetCap = connMgr.getNetworkCapabilities(currentNet);

            try {
                connectivityState.put("internet",
                        (currentNetCap.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)) ?
                            STATE_ON :
                            STATE_OFF
                );
                connectivityState.put("vpn",
                        (currentNetCap.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) ?
                            STATE_ON :
                            STATE_OFF
                );
                connectivityState.put("metered",
                        (currentNetCap.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)) ?
                            STATE_OFF :
                            STATE_ON
                );
                connectivityState.put("roaming",
                        (currentNetCap.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_ROAMING)) ?
                            STATE_OFF :
                            STATE_ON
                );
                connectivityState.put("trusted",
                        (currentNetCap.hasCapability(NetworkCapabilities.NET_CAPABILITY_TRUSTED)) ?
                            STATE_ON :
                            STATE_OFF
                );
                connectivityState.put("network", NetworkType.getType(currentNetCap));
                connectivityState.put("cellular",
                        (currentNetCap.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) ?
                            CellularType.getType(context) :
                            CellularType.TYPE_NONE
                );
                Core.updateConnectivityState(connectivityState.toString());
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    private static final class NetworkType {
        private static final short
                TYPE_UNKNOWN   = 0,
                TYPE_WIFI      = 1,
                TYPE_ETHERNET  = 2,
                TYPE_BLUETOOTH = 3,
                TYPE_CELLULAR  = 4;

        private static final int getType(NetworkCapabilities currentNetCap) {
            if (currentNetCap.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
                return TYPE_WIFI;
            } else if (currentNetCap.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) {
                return TYPE_ETHERNET;
            } else if (currentNetCap.hasTransport(NetworkCapabilities.TRANSPORT_BLUETOOTH)) {
                return TYPE_BLUETOOTH;
            } else if (currentNetCap.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
                return TYPE_CELLULAR;
            } else {
                return TYPE_UNKNOWN;
            }
        }

        private static final String getTypeString(NetworkCapabilities currentNetCap) {
            switch (getType(currentNetCap)) {
                case TYPE_WIFI:
                    return "Wifi";
                case TYPE_ETHERNET:
                    return "Ethernet";
                case TYPE_BLUETOOTH:
                    return "Bluetooth";
                case TYPE_CELLULAR:
                    return "Cellular";
                default:
                    return "Unknown";
            }
        }
    }

    private static final class CellularType {
        private static final short
                TYPE_UNKNOWN = 0,
                TYPE_NONE    = 1,
                TYPE_2G      = 2,
                TYPE_3G      = 3,
                TYPE_4G      = 4;

        private static final int getType(Context context) {
            TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);

            switch (tm.getNetworkType()) {
                case TelephonyManager.NETWORK_TYPE_GPRS:
                case TelephonyManager.NETWORK_TYPE_EDGE:
                case TelephonyManager.NETWORK_TYPE_CDMA:
                case TelephonyManager.NETWORK_TYPE_1xRTT:
                case TelephonyManager.NETWORK_TYPE_IDEN:
                    return TYPE_2G;
                case TelephonyManager.NETWORK_TYPE_UMTS:
                case TelephonyManager.NETWORK_TYPE_EVDO_0:
                case TelephonyManager.NETWORK_TYPE_EVDO_A:
                case TelephonyManager.NETWORK_TYPE_HSDPA:
                case TelephonyManager.NETWORK_TYPE_HSUPA:
                case TelephonyManager.NETWORK_TYPE_HSPA:
                case TelephonyManager.NETWORK_TYPE_EVDO_B:
                case TelephonyManager.NETWORK_TYPE_EHRPD:
                case TelephonyManager.NETWORK_TYPE_HSPAP:
                    return TYPE_3G;
                case TelephonyManager.NETWORK_TYPE_LTE:
                    return TYPE_4G;
                default:
                    return TYPE_UNKNOWN;
            }
        }

        private static final String getTypeString(Context context) {
            switch (getType(context)) {
                case TYPE_2G:
                    return "2G";
                case TYPE_3G:
                    return "3G";
                case TYPE_4G:
                    return "4G";
                default:
                    return "Unknown";
            }
        }
    }

    private static final void updateBLE(int state) {
        final short
                STATE_ON  = 1,
                STATE_OFF = 2;

        if(isBleAdvAndScanCompatible() && state == BluetoothAdapter.STATE_ON)
            Core.updateBluetoothState(STATE_ON);
        else if(state == BluetoothAdapter.STATE_OFF)
            Core.updateBluetoothState(STATE_OFF);
    }

    private static final boolean isBleAdvAndScanCompatible() {
        if (mBluetoothAdapter == null) {
            Log.w(TAG, "Device doesn't support Bluetooth");
        } else if (mBluetoothAdapter.getBluetoothLeScanner() == null) {
            Log.w(TAG, "Device doesn't support BLE scanning");
        } else if (mBluetoothAdapter.getBluetoothLeAdvertiser() == null) {
            Log.w(TAG, "Device doesn't support BLE advertising");
        } else {
            Log.i(TAG, "Bluetooth adapter supports advertising and scanning");
            return true;
        }

        return false;
    }
}
