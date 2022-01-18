# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) using [cra-template-typescript-electron](https://github.com/vixalie/cra-template-typescript-electron) template.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Electron will start automaticly when dev server is ready and [http://localhost:3000](http://localhost:3000) can be visited.

The page will reload if you make edits.\
You will also see any lint errors in the console.

Electron will restart automaticly when you modified files in `src-main` directory.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

DO NOT run this command directly, it is not enough to distribute a application only by building the renderer.

### `npm run dist:*`

Distribute application to the `dist` folder. `*` can be replace by `win`, `mac` or `linux`. It will build the renderer and main scripts, and then use [electron-builder](https://www.electron.build/) to package them into distributable.

### `npm run fix:electron`

When you encountered the error called 'Electron failed to install correctly', you will need this command to reinstall Electron module.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
