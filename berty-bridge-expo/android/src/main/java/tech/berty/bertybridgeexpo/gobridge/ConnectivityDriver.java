package tech.berty.bertybridgeexpo.gobridge;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.os.Build;
import android.telephony.TelephonyManager;

import androidx.core.app.ActivityCompat;

import java.net.NetworkInterface;
import java.util.ArrayList;

import bertybridge.Bertybridge;
import bertybridge.ConnectivityInfo;
import bertybridge.IConnectivityHandler;
import bertybridge.IConnectivityDriver;

public class ConnectivityDriver extends BroadcastReceiver implements IConnectivityDriver {
    private final static String TAG = "ConnectivityDriver";
    private ArrayList<IConnectivityHandler> mHandlers;
    private ConnectivityInfo mCurrentState;

    public ConnectivityDriver(Context context) {
        Logger.d(TAG, "Init");
        this.mHandlers = new ArrayList();
        this.updateState(context);
    }

    private static long getCellularType(Context context) {
        TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);

        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            Logger.e(TAG, "Getting cellular type: permission denied");
            return Bertybridge.ConnectivityCellularUnknown;
        }

        int netType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            netType = tm.getDataNetworkType();
        } else {
            netType = tm.getNetworkType();
        }

        switch (netType) {
            case TelephonyManager.NETWORK_TYPE_GPRS:
            case TelephonyManager.NETWORK_TYPE_EDGE:
            case TelephonyManager.NETWORK_TYPE_CDMA:
            case TelephonyManager.NETWORK_TYPE_1xRTT:
            case TelephonyManager.NETWORK_TYPE_IDEN:
            case TelephonyManager.NETWORK_TYPE_GSM:
                return Bertybridge.ConnectivityCellular2G;
            case TelephonyManager.NETWORK_TYPE_UMTS:
            case TelephonyManager.NETWORK_TYPE_EVDO_0:
            case TelephonyManager.NETWORK_TYPE_EVDO_A:
            case TelephonyManager.NETWORK_TYPE_HSDPA:
            case TelephonyManager.NETWORK_TYPE_HSUPA:
            case TelephonyManager.NETWORK_TYPE_HSPA:
            case TelephonyManager.NETWORK_TYPE_EVDO_B:
            case TelephonyManager.NETWORK_TYPE_EHRPD:
            case TelephonyManager.NETWORK_TYPE_HSPAP:
            case TelephonyManager.NETWORK_TYPE_TD_SCDMA:
                return Bertybridge.ConnectivityCellular3G;
            case TelephonyManager.NETWORK_TYPE_LTE:
            case TelephonyManager.NETWORK_TYPE_IWLAN:
            case 19:
                return Bertybridge.ConnectivityCellular4G;
            case TelephonyManager.NETWORK_TYPE_NR:
                return Bertybridge.ConnectivityCellular5G;
            default:
                return Bertybridge.ConnectivityCellularUnknown;
        }
    }

    private static long getBluetoothState() {
        BluetoothAdapter bluetooth = BluetoothAdapter.getDefaultAdapter();

        if (bluetooth == null || !bluetooth.isEnabled()) {
            return Bertybridge.ConnectivityStateOff;
        }

        switch (bluetooth.getState()) {
            case BluetoothAdapter.STATE_ON:
                return Bertybridge.ConnectivityStateOn;
            case BluetoothAdapter.STATE_OFF:
                return Bertybridge.ConnectivityStateOff;
            default:
                return Bertybridge.ConnectivityStateUnknown;
        }
    }

    private ConnectivityInfo getState(Context context) {
        ConnectivityInfo state = new ConnectivityInfo();

        ConnectivityManager manager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        Network network = manager.getActiveNetwork();

        state.setBluetooth(ConnectivityDriver.getBluetoothState());

        if (network == null) {
            state.setState(Bertybridge.ConnectivityStateOff);
            return state;
        }

        NetworkCapabilities capabilities = manager.getNetworkCapabilities(network);

        state.setState(Bertybridge.ConnectivityStateOn);

        state.setMetering(capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)
            ? Bertybridge.ConnectivityStateOff
            : Bertybridge.ConnectivityStateOn);

        if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) {
            state.setNetType(Bertybridge.ConnectivityNetEthernet);
        }
        else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
            state.setNetType(Bertybridge.ConnectivityNetWifi);
        }
        else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
            state.setNetType(Bertybridge.ConnectivityNetCellular);
            state.setCellularType(ConnectivityDriver.getCellularType(context));
        }

        return state;
    }

    private void updateState(Context context) {
        this.mCurrentState = this.getState(context);

        for (IConnectivityHandler handler : this.mHandlers) {
            handler.handleConnectivityUpdate(this.mCurrentState);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Logger.d(TAG, "Network state changed");
        this.updateState(context);
    }

    public ConnectivityInfo getCurrentState() {
        return this.mCurrentState;
    }

	public void registerHandler(IConnectivityHandler handler) {
        this.mHandlers.add(handler);
    }
}
