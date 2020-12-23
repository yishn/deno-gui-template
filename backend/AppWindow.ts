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
      new URL("../build/AppWindow.main.js", import.meta.url),
      {
        getProductName: async () => pkg.productName,
      },
      {
        width: 1000,
        height: 600,
      }
    );
  }
}
