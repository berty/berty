package deviceinfo

import "sync"

var application_state_subs []chan Application_State
var application_state_mutex sync.Mutex

func (*Application_State) Subscribe() <-chan Application_State {
	sub := make(chan Application_State)
	application_state_mutex.Lock()
	application_state_subs = append(application_state_subs, sub)
	application_state_mutex.Unlock()
	return sub
}

func (*Application_State) Unsubscribe(sub <-chan Application_State) {
	application_state_mutex.Lock()
	for i := range application_state_subs {
		if application_state_subs[i] == sub {
			application_state_subs = append(application_state_subs[:i], application_state_subs[i+1:]...)
			close(application_state_subs[i])
			break
		}
	}
	application_state_mutex.Unlock()
}

func (app *Application) SetState(state Application_State) {
	logger().Info(
		"application switch from  " +
			Application_State_name[int32(app.State)] +
			" to " +
			Application_State_name[int32(state)] + " mode",
	)

	app.State = state
	application_state_mutex.Lock()
	for i := range application_state_subs {
		application_state_subs[i] <- app.State
	}
	application_state_mutex.Unlock()
}

func (app *Application) SetRoute(route string) {
	logger().Debug("application switch route from " + app.Route + " to " + route)
	app.Route = route
}
