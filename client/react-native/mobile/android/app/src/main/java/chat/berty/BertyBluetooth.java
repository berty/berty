package com.bluetooth;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.BluetoothSocket;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.ParcelUuid;
import android.util.Log;
import android.view.Window;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_NOTIFY;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE;
import static android.bluetooth.BluetoothGattDescriptor.PERMISSION_READ;
import static android.bluetooth.BluetoothGattDescriptor.PERMISSION_WRITE;
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;
import static android.content.Context.BLUETOOTH_SERVICE;

public class BertyBluetooth implements BluetoothAdapter.LeScanCallback {
	protected String TAG = "BertyBluetooth";

    private Set<BluetoothDevice> mRegisteredDevices = new HashSet<>();

    protected HashMap<String, BluetoothDevice> discoveredDevice;

	protected HashMap<String, BertyBluetoothConnection> connectedDevice;

	protected BertyBluetoothModule bbm;

	protected UUID MY_UUID = UUID.fromString("A06C6AB8-886F-4D56-82FC-2CF8610D6663");

	protected BluetoothGattServer mBluetoothGattServer;

	protected  UUID CHARACTERISTIC_COUNTER_UUID = UUID.fromString("31517c58-66bf-470c-b662-e352a6c80cba");
	protected  UUID CHARACTERISTIC_INTERACTOR_UUID = UUID.fromString("0b89d2d4-0ea6-4141-86bb-0c5fb91ab14a");

	protected  UUID DESCRIPTOR_CONFIG_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

	public static UUID DESCRIPTOR_CONFIG = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
	public static UUID DESCRIPTOR_USER_DESC = UUID.fromString("00002901-0000-1000-8000-00805f9b34fb");


	protected BluetoothAdapter bAdapter;

	protected BertyBluetoothListerner listener;

	final static int BLUETOOTH_ENABLE_REQUEST = 1;


	public String[] iPhones = {"","",""};
	public int iPhoneIndex = 0;

	public boolean contains(String[] devices, String device)
	{
		for (String iPhone : devices) {
			if (device.equals(iPhone))
				return true;
		}
		return false;
	}

//	@Override
	protected void onResume() {
//		super.onResume();

		if ((bAdapter != null) && (!bAdapter.isEnabled())) {
//			invalidateOptionsMenu();
		}
	}

//	@Override
	protected void onPause() {
//		super.onPause();

//        stopScan();
	}


//	@Override
	public void onRequestPermissionsResult(int requestCode,
										   String permissions[], int[] grantResults) {
//		init();
	}


	private String lastMessage = "";

	@Override
	public void onLeScan(final BluetoothDevice newDevice, final int newRssi,
						 final byte[] newScanRecord) {

		String message = new String(newScanRecord);
//		TextView textViewToChange = (TextView) findViewById(R.id.textView);
		String oldText = lastMessage;
		String device = newDevice.getAddress();
		String rssi = "" + newRssi;
		Log.e("Device", device);

		if ((!contains(iPhones, device) && message.substring(5,11).equals("iPhone")) || (!message.equals(lastMessage) && contains(iPhones, device))) {
			if (!contains(iPhones, device))
			{
				iPhones[iPhoneIndex] = device;
				iPhoneIndex++;
			}
			Log.e("Device", device);
			lastMessage = message;
			Log.e("Rssi", rssi);
			Log.e("Message", message);
			String newMessage;
			if (message.substring(19, 20).equals("-"))
				newMessage = oldText + message.substring(5, 19);
			else
				newMessage = oldText + message.substring(5) + "\n";
		}
	}

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

	private BluetoothGattService createService() {
		BluetoothGattService service = new BluetoothGattService(MY_UUID, SERVICE_TYPE_PRIMARY);

		// Counter characteristic (read-only, supports subscriptions)
		BluetoothGattCharacteristic counter = new BluetoothGattCharacteristic(CHARACTERISTIC_COUNTER_UUID, PROPERTY_READ | PROPERTY_NOTIFY, PERMISSION_READ);
		BluetoothGattDescriptor counterConfig = new BluetoothGattDescriptor(DESCRIPTOR_CONFIG_UUID, PERMISSION_READ | PERMISSION_WRITE);
        BluetoothGattDescriptor asd = new BluetoothGattDescriptor(DESCRIPTOR_USER_DESC, PERMISSION_READ | PERMISSION_WRITE);
		counter.addDescriptor(counterConfig);
        counter.addDescriptor(asd);

		// Interactor characteristic
		BluetoothGattCharacteristic interactor = new BluetoothGattCharacteristic(CHARACTERISTIC_INTERACTOR_UUID, PROPERTY_WRITE_NO_RESPONSE, PERMISSION_WRITE);

		service.addCharacteristic(counter);
		service.addCharacteristic(interactor);
		return service;
	}

	public BertyBluetooth(BertyBluetoothModule bertyBluetoothModule) {
		bAdapter = BluetoothAdapter.getDefaultAdapter();
		bbm = bertyBluetoothModule;
		discoveredDevice = new HashMap<>();
		connectedDevice = new HashMap<>();
		listener = new BertyBluetoothListerner(this);
		listener.start();
		BluetoothLeAdvertiser advertiser = bAdapter.getBluetoothLeAdvertiser();
		AdvertiseCallback advertisingCallback = new AdvertiseCallback() {
			@Override
			public void onStartSuccess(AdvertiseSettings settingsInEffect) {
				Log.e( "BLE", "Advertising onStartFai: " + settingsInEffect);
				super.onStartSuccess(settingsInEffect);
			}

			@Override
			public void onStartFailure(int errorCode) {
				Log.e( "BLE", "Advertising onStartFailure: " + errorCode );
				super.onStartFailure(errorCode);
			}
		};

		advertiser.startAdvertising(createAdvSettings(true, 100), makeAdvertiseData(), advertisingCallback);
		BluetoothManager mb = (BluetoothManager) ((Context) bertyBluetoothModule.mReactContext).getSystemService(BLUETOOTH_SERVICE);
		mBluetoothGattServer = mb.openGattServer(bertyBluetoothModule.mReactContext, mGattServerCallback);
		mBluetoothGattServer.addService(createService());
	}
	private BluetoothGattServerCallback mGattServerCallback = new BluetoothGattServerCallback() {
		@Override
		public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
			if (newState == BluetoothProfile.STATE_CONNECTED) {
				Log.i(TAG, "BluetoothDevice CONNECTED: " + device);
			} else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
				Log.i(TAG, "BluetoothDevice DISCONNECTED: " + device);
				// Remove device from any active subscriptions
				mRegisteredDevices.remove(device);
			}
		}

		@Override
		public void onCharacteristicReadRequest(BluetoothDevice device, int requestId, int offset, BluetoothGattCharacteristic characteristic) {
			if (CHARACTERISTIC_COUNTER_UUID.equals(characteristic.getUuid())) {
				Log.i(TAG, "Read counter");
				byte[] value = Ints.toByteArray(3);
				mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, value);
			} else {
				// Invalid characteristic
				Log.w(TAG, "Invalid Characteristic Read: " + characteristic.getUuid());
				byte[] value = Ints.toByteArray(0);
				mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, value);
			}
		}

		@Override
		public void onCharacteristicWriteRequest(BluetoothDevice device, int requestId, BluetoothGattCharacteristic characteristic, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {
			if (CHARACTERISTIC_INTERACTOR_UUID.equals(characteristic.getUuid())) {
				Log.i(TAG, "Write interactor");
				if (value.length > 0) {
                    Log.i(TAG, "Write interactor val");
                    Log.i(TAG, new String(value, Charset.forName("UTF-8")));
                }

//				if (mListener != null) {
//					mListener.onInteractorWritten();
//				}
				notifyRegisteredDevices();
			} else {
				// Invalid characteristic
				Log.w(TAG, "Invalid Characteristic Write: " + characteristic.getUuid());
//				mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE, 0, null);
			}
		}

		@Override
		public void onDescriptorReadRequest(BluetoothDevice device, int requestId, int offset, BluetoothGattDescriptor descriptor) {
			if (DESCRIPTOR_CONFIG.equals(descriptor.getUuid())) {
				Log.d(TAG, "Config descriptor read request");
				byte[] returnValue;
				if (mRegisteredDevices.contains(device)) {
					returnValue = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE;
				} else {
					returnValue = BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE;
				}
				mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, returnValue);
			} else if (DESCRIPTOR_USER_DESC.equals(descriptor.getUuid())) {
				Log.d(TAG, "User description descriptor read request");
				byte[] returnValue = "Write any value here to move the cat’s paw and increment the awesomeness counter".getBytes(Charset.forName("UTF-8"));
				returnValue = Arrays.copyOfRange(returnValue, offset, returnValue.length);
				mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, returnValue);
			} else {
				Log.w(TAG, "Unknown descriptor read request");
				mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE, 0, null);
			}
		}

		@Override
		public void onDescriptorWriteRequest(BluetoothDevice device, int requestId, BluetoothGattDescriptor descriptor, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {
			if (DESCRIPTOR_CONFIG.equals(descriptor.getUuid())) {
				if (Arrays.equals(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE, value)) {
					Log.d(TAG, "Subscribe device to notifications: " + device);
					mRegisteredDevices.add(device);
				} else if (Arrays.equals(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE, value)) {
					Log.d(TAG, "Unsubscribe device from notifications: " + device);
					mRegisteredDevices.remove(device);
				}

				if (responseNeeded) {
					mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, null);
				}
			} else {
				Log.w(TAG, "Unknown descriptor write request");
				if (responseNeeded) {
					mBluetoothGattServer.sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE, 0, null);
				}
			}
		}
		@Override
        public void onMtuChanged(BluetoothDevice device, int mtu) {
		    Log.d(TAG, "new mtu is: " + mtu);
        }
	};

    private void notifyRegisteredDevices() {
        if (mRegisteredDevices.isEmpty()) {
            Log.i(TAG, "No subscribers registered");
            return;
        }

        Log.i(TAG, "Sending update to " + mRegisteredDevices.size() + " subscribers");
        for (BluetoothDevice device : mRegisteredDevices) {
            BluetoothGattCharacteristic counterCharacteristic = mBluetoothGattServer
                    .getService(MY_UUID)
                    .getCharacteristic(CHARACTERISTIC_COUNTER_UUID);
//            byte[] value = mListener.onCounterRead();
            counterCharacteristic.setValue(Ints.toByteArray(1));
            mBluetoothGattServer.notifyCharacteristicChanged(device, counterCharacteristic, false);
        }
    }

	public static AdvertiseSettings createAdvSettings(boolean connectable, int timeoutMillis) {
		AdvertiseSettings.Builder builder = new AdvertiseSettings.Builder();
		builder.setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY);
		builder.setConnectable(connectable);
		builder.setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH);
		return builder.build();
	}

	public AdvertiseData makeAdvertiseData() {
		ParcelUuid pUuid = new ParcelUuid(MY_UUID);
		AdvertiseData.Builder builder = new AdvertiseData.Builder()
		.setIncludeDeviceName(true)
		.setIncludeTxPowerLevel(false)
		.addServiceUuid(pUuid);
		return builder.build();
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
//		final Activity mActivity = bbm.getCA();
//		IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
//		mActivity.registerReceiver(mReceiver, filter);
//		mActivity.registerReceiver(mReceiver,
//				new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED));
//		bAdapter.startDiscovery();
//		Log.d(TAG, "Discovery started");
	}

	public void startDiscoverabilty() {
//		final Activity mActivity = bbm.getCA();
//		Intent discoverableIntent =
//				new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
//		discoverableIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300);
//		mActivity.startActivity(discoverableIntent);
//		Log.d(TAG, "Discoverability started");
	}

	public void connect(String addr, BluetoothSocket socket) {
//		BertyBluetoothConnection tmp = new BertyBluetoothConnection(this, socket);
//		Log.d(TAG, "Connect socket init");
//		connectedDevice.put(addr, tmp);
//		tmp.start();
	}

	public void connect(String addr) {
//		BluetoothDevice dev = discoveredDevice.get(addr);
//		ConnectThread tmp = new ConnectThread(dev);
//		Log.d(TAG, "Connect socket init");
//		tmp.start();
	}

	public void disconnect(String addr) {
//		BertyBluetoothConnection device = connectedDevice.get(addr);
//		connectedDevice.remove(addr);
//		device.cancel();
	}

	public void writeTo(String addr, String msg) {
//		BertyBluetoothConnection tmp = connectedDevice.get(addr);
//		tmp.write(msg.getBytes());
	}

	private class ConnectThread extends Thread {
//		private final BluetoothSocket mmSocket;
//		private final BluetoothDevice mmDevice;

		public ConnectThread(BluetoothDevice device) {
//			// Use a temporary object that is later assigned to mmSocket
//			// because mmSocket is final.
//			BluetoothSocket tmp = null;
//			mmDevice = device;
//			Log.d(TAG, "Connecting to: "+device.toString());
//			try {
//				// Get a BluetoothSocket to connect with the given BluetoothDevice.
//				// MY_UUID is the app's UUID string, also used in the server code.
//				tmp = device.createInsecureRfcommSocketToServiceRecord(MY_UUID);
//			} catch (IOException e) {
//				Log.e(TAG, "Socket's create() method failed", e);
//			}
//			mmSocket = tmp;
		}

		public void run() {
//			try {
//				// Connect to the remote device through the socket. This call blocks
//				// until it succeeds or throws an exception.
//				mmSocket.connect();
//			} catch (IOException connectException) {
//				// Unable to connect; close the socket and return.
//				try {
//					mmSocket.close();
//				} catch (IOException closeException) {
//					Log.e(TAG, "Could not close the client socket", closeException);
//				}
//			}
//
//			// The connection attempt succeeded. Perform work associated with
//			// the connection in a separate thread.
//			Log.d(TAG, "connected");
//			connect(mmDevice.getAddress(), mmSocket);
		}

		// Closes the client socket and causes the thread to finish.
		public void cancel() {
//			try {
//				mmSocket.close();
//			} catch (IOException e) {
//				Log.e(TAG, "Could not close the client socket", e);
//			}
		}
	}
}
