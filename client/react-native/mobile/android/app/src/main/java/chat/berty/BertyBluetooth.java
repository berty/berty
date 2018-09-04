package chat.berty;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.ParcelUuid;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.IOException;
import java.util.HashMap;
import java.util.UUID;

public class BertyBluetooth {
	protected String TAG = "BertyBluetooth";

	protected HashMap<String, BluetoothDevice> discoveredDevice;

	protected HashMap<String, BertyBluetoothConnection> connectedDevice;

	protected BertyBluetoothModule bbm;

	protected UUID MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

	protected BluetoothAdapter bAdapter;

	protected BertyBluetoothListerner listener;

	final static int BLUETOOTH_ENABLE_REQUEST = 1;

	private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
		public void onReceive(Context context, Intent intent) {
			String action = intent.getAction();
			if (BluetoothDevice.ACTION_FOUND.equals(action)) {
				BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
				if (device != null) {
					discoveredDevice.put(device.getName(), device);
					WritableMap event = Arguments.createMap();

					if (device.getName() !=  null) {
						event.putString("name", device.getName());
						event.putString("type", device.getAddress());
						try {
							device.fetchUuidsWithSdp();
							ParcelUuid[] supportedUuids = device.getUuids();
							if (supportedUuids != null) {
								WritableArray uuids = Arguments.createArray();
								for (ParcelUuid uuid : supportedUuids) {
									uuids.pushString(uuid.getUuid().toString());
								}
								event.putArray("UUIDS", uuids);
							}
						} catch (Exception e) {
							Log.e(TAG, e.toString());
						}

						bbm.sendEvent("NEW_DEVICE", event);
					}
					Log.d(TAG,"New Device Discovered: " + device.getName());
				}
			}
			if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
				Log.d(TAG, "Discovery finished");
			}
		}
	};

	public BertyBluetooth(BertyBluetoothModule bertyBluetoothModule) {
		bAdapter = BluetoothAdapter.getDefaultAdapter();
		bbm = bertyBluetoothModule;
		discoveredDevice = new HashMap<>();
		connectedDevice = new HashMap<>();
		listener = new BertyBluetoothListerner(this);
		listener.start();
	}

	public void askBluetooth() {
		final Activity mActivity = bbm.getCA();
		Log.d(TAG,"Starting Bluetooth");
		if (bAdapter == null) {
			Log.e(TAG,"no bluetooth");
			return;
		}

		if (!bAdapter.isEnabled()) {
			Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
			mActivity.startActivityForResult(enableBtIntent, BLUETOOTH_ENABLE_REQUEST);
		}
	}

	public void startDiscover() {
		final Activity mActivity = bbm.getCA();
		IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
		mActivity.registerReceiver(mReceiver, filter);
		mActivity.registerReceiver(mReceiver,
				new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED));
		bAdapter.startDiscovery();
		Log.d(TAG, "Discovery started");
	}

	public void startDiscoverabilty() {
		final Activity mActivity = bbm.getCA();
		Intent discoverableIntent =
				new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
		discoverableIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300);
		mActivity.startActivity(discoverableIntent);
		Log.d(TAG, "Discoverability started");
	}

	public void connect(String addr, BluetoothSocket socket) {
		BertyBluetoothConnection tmp = new BertyBluetoothConnection(this, socket);
		Log.d(TAG, "Connect socket init");
		connectedDevice.put(addr, tmp);
		tmp.start();
	}

	public void connect(String addr) {
		BluetoothDevice dev = discoveredDevice.get(addr);
		ConnectThread tmp = new ConnectThread(dev);
		Log.d(TAG, "Connect socket init");
		tmp.start();
	}

	public void disconnect(String addr) {
		BertyBluetoothConnection device = connectedDevice.get(addr);
		connectedDevice.remove(addr);
		device.cancel();
	}

	public void writeTo(String addr, String msg) {
		BertyBluetoothConnection tmp = connectedDevice.get(addr);
		tmp.write(msg.getBytes());
	}

	private class ConnectThread extends Thread {
		private final BluetoothSocket mmSocket;
		private final BluetoothDevice mmDevice;

		public ConnectThread(BluetoothDevice device) {
			// Use a temporary object that is later assigned to mmSocket
			// because mmSocket is final.
			BluetoothSocket tmp = null;
			mmDevice = device;
			Log.d(TAG, "Connecting to: "+device.toString());
			try {
				// Get a BluetoothSocket to connect with the given BluetoothDevice.
				// MY_UUID is the app's UUID string, also used in the server code.
				tmp = device.createInsecureRfcommSocketToServiceRecord(MY_UUID);
			} catch (IOException e) {
				Log.e(TAG, "Socket's create() method failed", e);
			}
			mmSocket = tmp;
		}

		public void run() {
			try {
				// Connect to the remote device through the socket. This call blocks
				// until it succeeds or throws an exception.
				mmSocket.connect();
			} catch (IOException connectException) {
				// Unable to connect; close the socket and return.
				try {
					mmSocket.close();
				} catch (IOException closeException) {
					Log.e(TAG, "Could not close the client socket", closeException);
				}
			}

			// The connection attempt succeeded. Perform work associated with
			// the connection in a separate thread.
			Log.d(TAG, "connected");
			connect(mmDevice.getAddress(), mmSocket);
		}

		// Closes the client socket and causes the thread to finish.
		public void cancel() {
			try {
				mmSocket.close();
			} catch (IOException e) {
				Log.e(TAG, "Could not close the client socket", e);
			}
		}
	}
}
