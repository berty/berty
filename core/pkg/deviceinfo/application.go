package deviceinfo

import "sync"

var (
	appState  = AppState_Kill
	subs      []chan AppState
	subsMutex sync.Mutex
)

func GetAppState() AppState {
	return appState
}

func SetAppState(state AppState) {
	logger().Info("application switch from  " + AppState_name[int32(appState)] + " to " + AppState_name[int32(state)] + " mode")
	appState = state
	subsMutex.Lock()
	for i := range subs {
		subs[i] <- appState
	}
	subsMutex.Unlock()
}

func SubscribeAppState() <-chan AppState {
	sub := make(chan AppState, 1)
	subsMutex.Lock()
	subs = append(subs, sub)
	subsMutex.Unlock()
	return sub
}

func UnsubscribeAppState(sub <-chan AppState) {
	subsMutex.Lock()
	for i := range subs {
		if subs[i] == sub {
			subs = append(subs[:i], subs[i+1:]...)
			close(subs[i])
			break
		}
	}
	subsMutex.Unlock()
}
