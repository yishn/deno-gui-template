import {
  Webview,
  WebviewParams,
} from "https://deno.land/x/webview@0.5.5/mod.ts";
import { Actions, ActionsTemplate } from "../shared/Actions.ts";
import { objEntries } from "../shared/utils.ts";
import type {
  WindowBackendActions,
  WindowFrontendActions,
} from "../shared/WindowActions.ts";

export type WindowOptions = Omit<
  WebviewParams,
  | "url"
  | "title"
  | "visible"
  | "fullScreen"
>;

export interface WindowState {
  title: string;
  visible: boolean;
  fullScreen: boolean;
}

export class Window<
  L extends ActionsTemplate,
  R extends ActionsTemplate,
> {
  private actions: Actions<L & WindowBackendActions, R & WindowFrontendActions>;
  webview: Webview;
  state: Readonly<WindowState>;

  setState(state: Partial<WindowState>) {
    this.state = { ...this.state, ...state };

    for (let keyValuePair of objEntries(state)) {
      if (keyValuePair[1] === undefined) continue;

      if (keyValuePair[0] === "title") {
        this.webview.setTitle(keyValuePair[1]);
      } else if (keyValuePair[0] === "visible") {
        this.webview.setVisible(keyValuePair[1]);
      } else if (keyValuePair[0] === "fullScreen") {
        this.webview.setFullscreen(keyValuePair[1]);
      }
    }
  }

  constructor(
    scriptUrl: URL,
    localActions: L,
    options?: Partial<WindowOptions>,
  ) {
    this.actions = new Actions(
      {
        ...localActions,
        print: async (obj: object) => console.log(obj),
        setState: async (state: Partial<WindowState>) => this.setState(state),
      },
      (data) => {
        this.webview.eval(`window.__actions.receiveMessage(${data});`);
      },
    );

    this.state = {
      title: "",
      visible: false,
      fullScreen: false,
    };

    let script = Deno.readTextFileSync(scriptUrl);
    let html = (mockExternal: boolean) =>
      `<html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      <div id="root"></div>
      <script type="text/javascript">

      (function() {
      ${
        !mockExternal ? "" : `window.external = {
          invoke(data) {
            console.log('Invoke:', data);
          }
        };`
      }
      ${script.replace(/<\/script>/g, "\\u003c/script>")}
      })();

      </script>
      </body>
      </html>`;

    Deno.writeTextFileSync(
      new URL(scriptUrl.href.slice(0, -3) + ".html"),
      html(true),
    );

    this.webview = new Webview({
      title: this.state.title,
      visible: this.state.visible,
      ...options,
      url: `data:text/html,${encodeURIComponent(html(false))}`,
    });
  }

  run(): Promise<void> {
    return this.webview.run((evt) => {
      this.actions.receiveMessage(JSON.parse(evt));
    });
  }

  drop() {
    this.webview.drop();
  }
}
