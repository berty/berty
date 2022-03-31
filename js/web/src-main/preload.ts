import { contextBridge } from "electron";

contextBridge.exposeInMainWorld(
    'api',
    {
        test: () => console.log('context bridge test.')
    }
);