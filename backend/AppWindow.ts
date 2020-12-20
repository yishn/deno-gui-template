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
      {
        getProductName: async () => pkg.productName,
      },
    );
  }
}
