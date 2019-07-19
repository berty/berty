package core

func SetStoragePath(path string) error {
	return bridge.SetStoragePath(path)
}

func GetStoragePath() string {
	return bridge.GetStoragePath()
}

func SetAppState(state string) error {
	return bridge.SetAppState(state)
}

func GetAppState() string {
	return bridge.GetAppState()
}

func GetAppRoute() string {
	return bridge.GetAppRoute()
}

func SetAppRoute(route string) {
	bridge.SetAppRoute(route)
}
