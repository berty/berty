import {RouterStore, syncHistoryWithStore} from "mobx-react-router";
import {createBrowserHistory} from "history";

const routing = new RouterStore();

syncHistoryWithStore(createBrowserHistory(), routing);

export default routing;
