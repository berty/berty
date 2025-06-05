import { CommonActions } from "@react-navigation/native";
import React, { useContext, useEffect } from "react";
import {
	EmitterSubscription,
	NativeEventEmitter,
	NativeModules,
	Platform,
} from "react-native";
import * as Notifications from "expo-notifications";

import beapi from "@berty/api";
import NotificationBody from "@berty/components/NotificationBody";
import { EventEmitterContext } from "@berty/contexts/eventEmitter.context";
import { useNavigation } from "@berty/navigation";
import { accountClient } from "@berty/utils/accounts/accountClient";
import {
	useConversationsDict,
	useRestartAfterClosing,
	useCloseBridgeAfterClosing,
} from "@berty/hooks";

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

				switch (data.action) {
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
						} else if (action === "restartbridge") {
							restartBridge();
						}
						break;
				}
			});

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
					Notifications.scheduleNotificationAsync({
						content: {
							title: push.push?.title,
							body: push.push?.body,
							data: { type: "message", convPK: convPK },
						},
						trigger: null,
					});
				}
			}
		};
		let eventListener: EmitterSubscription | undefined;
		if (NativeModules.EventEmitter) {
			try {
				eventListener = new NativeEventEmitter(
					NativeModules.EventEmitter,
				).addListener("onPushReceived", pushNotifListener);
			} catch (e) {
				console.warn("Push notif add listener failed: " + e);
			}
		}
		return () => {
			try {
				Notifications.removeNotificationSubscription(responseListener);
				eventListener?.remove(); // Unsubscribe from native event emitter
			} catch (e) {
				console.warn("Push notif remove listener failed: " + e);
			}
		};
	}, [conversations, dispatch, navigate]);
	return null;
};

const NotificationBridge = () => {
	const eventEmitter = useContext(EventEmitterContext);
	var evt: any;

	useEffect(() => {
		const responseListener =
			Notifications.addNotificationResponseReceivedListener((response) => {
				evt.payload.onPress();
			});
		const inAppNotifListener = (evt: any) => {
			Notifications.scheduleNotificationAsync({
				content: {
					title: evt.payload.title,
					body: evt.payload.body,
					data: evt,
				},
				trigger: null,
			});
		};

		let added = false;
		try {
			eventEmitter.addListener("notification", inAppNotifListener);
			added = true;
		} catch (e) {
			console.log("Error: Push notif add listener failed: " + e);
		}

		return () => {
			Notifications.removeNotificationSubscription(responseListener);
			if (added) {
				eventEmitter.removeListener("notification", inAppNotifListener);
			}
		};
	}, [eventEmitter]);
	return null;
};

interface NotificationProviderProps {
	children: React.ReactNode;
}

const NotificationProvider = ({ children }: NotificationProviderProps) =>
	Platform.OS !== "web" ? (
		<>
			<NotificationBridge />
			<PushNotificationBridge />
			{children}
		</>
	) : (
		<>{children}</>
	);

export default NotificationProvider;
