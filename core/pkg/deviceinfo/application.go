package deviceinfo

import "sync"

var applicationStateSubs []chan Application_State
var appplicationStateMutex sync.Mutex

func (*Application_State) Subscribe() <-chan Application_State {
	sub := make(chan Application_State)
	appplicationStateMutex.Lock()
	applicationStateSubs = append(applicationStateSubs, sub)
	appplicationStateMutex.Unlock()
	return sub
}

func (*Application_State) Unsubscribe(sub <-chan Application_State) {
	appplicationStateMutex.Lock()
	for i := range applicationStateSubs {
		if applicationStateSubs[i] == sub {
			applicationStateSubs = append(applicationStateSubs[:i], applicationStateSubs[i+1:]...)
			close(applicationStateSubs[i])
			break
		}
	}
	appplicationStateMutex.Unlock()
}

func (app *Application) SetState(state Application_State) {
	logger().Info(
		"application switch from  " +
			Application_State_name[int32(app.State)] +
			" to " +
			Application_State_name[int32(state)] + " mode",
	)

	app.State = state
	appplicationStateMutex.Lock()
	for i := range applicationStateSubs {
		applicationStateSubs[i] <- app.State
	}
	appplicationStateMutex.Unlock()
}

func (app *Application) SetRoute(route string) {
	logger().Debug("application switch route from " + app.Route + " to " + route)
	app.Route = route
}
