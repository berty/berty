import { CommonActions } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useEventListener } from "expo";
import BertyBridgeExpo from "berty-bridge-expo";
import * as Notifications from "expo-notifications";

import beapi from "@berty/api";
import { useNavigation } from "@berty/navigation";
import { accountClient } from "@berty/utils/accounts/accountClient";
import { navigationRef } from "@berty/navigation/rootRef";
import {
	useConversationsDict,
	useMessengerClient,
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
	const messengerClient = useMessengerClient();
	const { dispatch } = useNavigation();
	const restartAfterClosing = useRestartAfterClosing();
	const restartBridge = useCloseBridgeAfterClosing();

	// Tapped conversation to open once the messenger client is ready (see effect below).
	const [pendingConvPK, setPendingConvPK] = useState<string | null>(null);
	// Dedupe responses delivered both via getLastNotificationResponseAsync and the listener.
	const handledResponseIds = useRef<Set<string>>(new Set());

	const handleResponse = useCallback(
		(response: Notifications.NotificationResponse | null) => {
			if (!response) {
				return;
			}
			// Guard against a malformed notification reaching the global handler (restart screen).
			try {
				const id = response.notification.request.identifier;
				if (id) {
					if (handledResponseIds.current.has(id)) {
						return;
					}
					handledResponseIds.current.add(id);
				}

				const data = response.notification.request.content.data;

				// "action" notifications (restart prompts) are handled on their own.
				if (data.type === "action") {
					const action = data?.action as string;
					if (action === "restartAfterClosing") {
						restartAfterClosing();
					} else if (action === "restartBridge") {
						restartBridge();
					}
					return;
				}

				// Every conversation notification carries `convPK`, whichever path produced it.
				const convPK = data?.convPK as string | undefined;
				if (convPK) {
					// Defer navigation to the effect below (waits for the messenger client).
					setPendingConvPK(convPK);
					return;
				}

				console.warn("notification without a conversation public key", data.type);
			} catch (e) {
				console.warn("failed to handle notification response:", e);
			}
		},
		[restartAfterClosing, restartBridge],
	);

	// Taps while the app is running (foreground or resumed from background).
	useEffect(() => {
		const responseListener =
			Notifications.addNotificationResponseReceivedListener(handleResponse);

		return () => {
			try {
				responseListener.remove();
			} catch (e) {
				console.warn("Push notif remove listener failed: " + e);
			}
		};
	}, [handleResponse]);

	// Tap that launched the app from a killed state. Runs once on mount.
	useEffect(() => {
		let mounted = true;
		Notifications.getLastNotificationResponseAsync()
			.then((response) => {
				if (!mounted || !response) {
					return;
				}
				handleResponse(response);
				// Clear it so it isn't replayed on the next (normal) app launch.
				Notifications.clearLastNotificationResponseAsync().catch(() => {});
			})
			.catch((e) => console.warn("failed to get last notification response:", e));
		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Navigate to the pending conversation once the messenger is ready.
	useEffect(() => {
		if (!pendingConvPK || !messengerClient) {
			return;
		}
		const conv = conversations[pendingConvPK];
		dispatch(
			CommonActions.reset({
				routes: [
					{ name: "Chat.Home" },
					{
						name:
							conv?.type === beapi.messenger.Conversation.Type.MultiMemberType
								? "Chat.MultiMember"
								: "Chat.OneToOne",
						params: {
							convId: pendingConvPK,
						},
					},
				],
			}),
		);
		setPendingConvPK(null);
	}, [pendingConvPK, messengerClient, conversations, dispatch]);

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
				// Don't notify for the conversation the user is currently viewing.
				const currentRoute = navigationRef.current?.getCurrentRoute();
				const isViewingConversation =
					(currentRoute?.name === "Chat.OneToOne" ||
						currentRoute?.name === "Chat.MultiMember") &&
					(currentRoute?.params as { convId?: string } | undefined)?.convId ===
						convPK;
				if (isViewingConversation) {
					return;
				}

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
