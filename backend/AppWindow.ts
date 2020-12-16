import { Actions } from "../shared/Actions.ts";
import {
  AppWindowBackendActions,
  AppWindowFrontendActions,
} from "../shared/AppWindowActions.ts";
import pkg from "./pkg.ts";
import { Window } from "./Window.ts";

export class AppWindow
  extends Window<AppWindowBackendActions, AppWindowFrontendActions> {
  constructor() {
    super(
      new URL("../build/AppWindow.js", import.meta.url),
      new Actions(
        {
          getProductName: async () => {
            return pkg.productName;
          },

          setWindowTitle: async (title: string) => {
            this.title = title;
          },
        },
        (data) => {
          this.webview.eval(`window.__actions.receiveMessage(${data});`);
        },
      ),
      {
        title: pkg.productName,
      },
    );
  }
}
