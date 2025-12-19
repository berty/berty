import beapi from "@berty/api";
import * as Notifications from "expo-notifications";

// returns true if the notification should be inhibited
export type NotificationsInhibitor = (
	evt: beapi.messenger.StreamEvent.INotified,
) => boolean | "sound-only";

export const showNeedRestartNotification = (action: string, t: any) => {
	Notifications.scheduleNotificationAsync({
		content: {
			title: t("notification.need-restart.title"),
			body: t("notification.need-restart.desc"),
			data: { type: "action", action: action },
		},
		trigger: null,
	});
};
