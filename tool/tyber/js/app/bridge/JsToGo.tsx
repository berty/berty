import { Platform } from "react-native";
import electron from "./Electron";
import { shouldUseWebsocket, WebsocketClient } from "../store/WebsocketData"

export const OpenFiles = () => {
	if (__DEV__) {
		console.warn("Can't open files in dev mode");
		return;
	}

	electron.remote.dialog
		.showOpenDialog({
			title: "Open Log files",
			properties: ["openFile", "multiSelections"],
		})
		.then((result: any) => {
			if (result.canceled !== true) {
				astilectron.sendMessage({
					name: "open_files",
					payload: result.filePaths,
				});
			}
		})
		.catch((err: any) => {
			console.error("sending open_files event failed:", err);
		});
};

export const InitAstilectronConfig = () => {
	astilectron.sendMessage({
		name: "init_config",
		payload: electron.remote.app.getPath("appData"),
	});
};

export const OpenSession = (sessionID: string) => {
	if (shouldUseWebsocket) {
		WebsocketClient.send(
			"open_session",
			sessionID,
		);
	} else {
		astilectron.sendMessage({
			name: "open_session",
			payload: sessionID,
		})
	}
};

export const ClearAllSessions = () => {
	if (__DEV__) {
		console.warn("Can't clear sessions in dev mode");
		return;
	}

	let cancel = 0;
	electron.remote.dialog
		.showMessageBox({
			type: "question",
			message: "Clear all sessions",
			detail: "Are you sure you want to delete all sessions?",
			buttons: ["No", "Yes"],
			defaultId: cancel,
			cancelId: cancel,
		})
		.then((result: any) => {
			if (result.response !== cancel) {
				astilectron.sendMessage({
					name: "clear_sessions",
				});
			}
		})
		.catch((err: any) => {
			console.error("sending clear_sessions event failed:", err);
		});
};

export const ToggleDevTools = () => {
	if (__DEV__) {
		console.warn("Can't toggle dev tools in dev mode");
		return;
	}
	astilectron.sendMessage({
		name: "toggle_devtools",
	});
};

export const OpenPreferences = () => {
	if (__DEV__) {
		console.warn("Can't open preferences in dev mode");
		return;
	}
	astilectron.sendMessage({
		name: "open_preferences",
	});
};
