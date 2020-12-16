import { h, render } from "https://cdn.skypack.dev/preact@^10.5.7?dts";
import { Actions } from "../shared/Actions.ts";
import {
  AppWindowBackendActions,
  AppWindowFrontendActions,
} from "../shared/AppWindowActions.ts";

declare namespace external {
  function invoke(data: string): void;
}

declare namespace window {
  let __actions: Actions<AppWindowFrontendActions, AppWindowBackendActions>;
}

const actions = window.__actions = new Actions<
  AppWindowFrontendActions,
  AppWindowBackendActions
>(
  {},
  (data) => external.invoke(data),
);

actions.doRemoteAction("getProductName").then((name) => {
  render(h("h1", {}, `Hello ${name}!`), document.body);
});

setTimeout(() => {
  actions.doRemoteAction("setWindowTitle", "Welcome!");
}, 2000);
