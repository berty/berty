import { CommonActions } from "@react-navigation/native";
import React, { useContext, useEffect } from "react";
import { Platform } from "react-native";
import { useEventListener } from "expo";
import BertyBridgeExpo from "berty-bridge-expo";
import * as Notifications from "expo-notifications";

import beapi from "@berty/api";
import { useNavigation } from "@berty/navigation";
import { accountClient } from "@berty/utils/accounts/accountClient";
import {
	useConversationsDict,
	useRestartAfterClosing,
	useCloseBridgeAfterClosing,
} from "@berty/hooks";
import { deserializeFromBase64 } from '@berty/grpc-bridge/rpc/utils'

// First, set the handler that will cause the notification
// to show the alert
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

const PushNotificationBridge = () => {
	const conversations = useConversationsDict();
	const { navigate, dispatch } = useNavigation();
	const restartAfterClosing = useRestartAfterClosing();
	const restartBridge = useCloseBridgeAfterClosing();

	useEffect(() => {
		// listener when user interacts with a notification
		const responseListener =
			Notifications.addNotificationResponseReceivedListener((response) => {
				const data = response.notification.request.content.data;

				switch (data.type) {
					case "message":
						const convPK = data?.convPK as string;

						if (!convPK) {
							console.warn("No conversation public key in notification data");
							return;
						}

						const conv = conversations[convPK];
						dispatch(
							CommonActions.reset({
								routes: [
									{ name: "Chat.Home" },
									{
										name:
											conv?.type ===
											beapi.messenger.Conversation.Type.MultiMemberType
												? "Chat.MultiMember"
												: "Chat.OneToOne",
										params: {
											convId: convPK,
										},
									},
								],
							}),
						);
					case "action":
						const action = data?.action as string;
						if (action === "restartAfterClosing") {
							restartAfterClosing();
						} else if (action === "restartBridge") {
							restartBridge();
						}
						break;
					default:
							const typeName = data.type || beapi.messenger.StreamEvent.Notified.Type.Unknown

							const payloadName = typeName.substring('Type'.length)
							const pbobj = (beapi.messenger.StreamEvent.Notified as any)[payloadName]
							if (!pbobj) {
								console.warn('failed to find a protobuf object matching the notification type')
								return
					}
					var payload: any
						if (typeof data.payload === 'string') {
							payload = deserializeFromBase64(data.payload)
						}
						payload =
							data.payload === undefined ? {} : pbobj.decode(data.payload)
				console.log("remi: notification interacted with", data)
				}
			});

		return () => {
			try {
				responseListener.remove();
			} catch (e) {
				console.warn("Push notif remove listener failed: " + e);
			}
		};
	}, [conversations, dispatch, navigate]);

	const pushNotifListener = async (data: any) => {
		const push = await accountClient.pushReceive({
			payload: data,
			tokenType:
				Platform.OS === "ios"
					? beapi.push.PushServiceTokenType
							.PushTokenApplePushNotificationService
					: beapi.push.PushServiceTokenType.PushTokenFirebaseCloudMessaging,
		});
		if (!push.pushData?.alreadyReceived) {
			const convPK = push.pushData?.conversationPublicKey;
			if (convPK) {
				const conv = conversations[convPK]
				Notifications.scheduleNotificationAsync({
					content: {
						title: push.push?.title,
						body: push.push?.body,
						data: { type: "message", convType: conv?.type , convPK: convPK },
					},
					trigger: null,
				});
			}
		}
	};

	useEventListener(BertyBridgeExpo, "onPushReceived", pushNotifListener);

	return null;
};

interface NotificationProviderProps {
	children: React.ReactNode;
}

const NotificationProvider = ({ children }: NotificationProviderProps) =>
	Platform.OS !== "web" ? (
		<>
			<PushNotificationBridge />
			{children}
		</>
	) : (
		<>{children}</>
	);

export default NotificationProvider;
