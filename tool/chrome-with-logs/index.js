// https://stackoverflow.com/questions/45621694/how-to-get-console-log-output-in-terminal-via-headless-chrome-runtime-evaluate

const chromeLauncher = require("chrome-launcher");
const CDP = require("chrome-remote-interface");
const file = require("fs");

const {URL} = process.env;

if (!URL) throw new Error("missing URL environment variable");

(async function() {
  async function launchChrome() {
    return await chromeLauncher.launch({
      chromeFlags: ["--headless", "--disable-gpu"]
    });
  }
  const chrome = await launchChrome();
  const protocol = await CDP({
    port: chrome.port
  });

  const {DOM, Network, Page, Emulation, Runtime, Console} = protocol;

  await Promise.all([
    Network.enable(),
    Page.enable(),
    DOM.enable(),
    Runtime.enable(),
    Console.enable()
  ]);

  Console.messageAdded(result => {
    console.log(result);
  });

  await Page.navigate({url: process.env.URL});
})();
