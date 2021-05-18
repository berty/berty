import electron from "./Electron";
import { OpenFiles } from "./JsToGo";
import {
	InitNodeList,
	AddToNodeList,
	UpdateNodeList,
	InitTraceList,
	AddToTraceList,
	UpdateTraceList,
	AddToStepList,
} from "../store/Store";

export const messageHandler = (message: { name: string, payload: any }) => {
	switch (message.name) {
		case "console_log":
			switch (message.payload.level) {
				case "debug":
					console.debug(message.payload.message);
					break;
				case "warning":
					console.warn(message.payload.message);
					break;
				case "info":
					console.info(message.payload.message);
					break;
				case "error":
					console.error(message.payload.message);
					break;
				default:
					console.error(
						`Unknow level "${message.payload.level}" with message: "${message.payload.message}"`
					);
					break;
			}
			break;

		case "open_files":
			OpenFiles();
			break;

		case "display_error":
			electron.remote.dialog.showErrorBox(
				message.payload.title,
				message.payload.content
			);
			return { payload: "" };

		case "list_sessions":
			console.log("got list_sessions", message.payload)
			InitNodeList(message.payload);
			return { payload: "" };

		case "create_session":
			AddToNodeList(message.payload);
			break;

		case "update_session":
			UpdateNodeList(message.payload);
			break;

		case "list_traces":
			InitTraceList(message.payload);
			return { payload: "" };

		case "create_trace":
			AddToTraceList(message.payload);
			break;

		case "update_trace":
			UpdateTraceList(message.payload);
			break;

		case "create_step":
			AddToStepList(message.payload);
			break;

		default:
			console.error("unknown event received from Go:", message);
			break;
	}
}

export const HandleAstilectronMessages = () => {
	astilectron.onMessage(messageHandler);
};
