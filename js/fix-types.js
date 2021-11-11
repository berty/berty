const fs = require('fs')

// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15960#issuecomment-440892917

fs.rmSync('node_modules/@types/react-native/globals.d.ts', { force: true })

const fileToEdit = 'node_modules/@types/react-native/index.d.ts'

let file = fs.readFileSync(fileToEdit).toString('utf8')

file = file.replace('/// <reference path="globals.d.ts" />', '')
file = file.replace('declare global', 'declare namespace IgnoreTheseGlobals')

fs.writeFileSync(fileToEdit, file)
