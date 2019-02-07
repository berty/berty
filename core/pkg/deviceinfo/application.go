package deviceinfo

var appState = AppState_Kill

func GetAppState() AppState {
	return appState
}

func SetAppState(state AppState) {
	logger().Info("application switch from  " + AppState_name[int32(appState)] + " to " + AppState_name[int32(state)] + " mode")
	appState = state
}
