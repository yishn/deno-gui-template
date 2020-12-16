import {
  Webview,
  WebviewParams,
} from "https://deno.land/x/webview@0.5.5/mod.ts";
import { Actions, ActionsTemplate } from "../shared/Actions.ts";

export type WindowOptions = Omit<WebviewParams, "url">;

export class Window<L extends ActionsTemplate, R extends ActionsTemplate> {
  private _title: string;
  private _visible: boolean;
  private _fullScreen: boolean;
  webview: Webview;

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
    this.webview.setTitle(value);
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    this.webview.setVisible(value);
  }

  get fullScreen(): boolean {
    return this._fullScreen;
  }

  set fullScreen(value: boolean) {
    this._fullScreen = value;
    this.webview.setFullscreen(value);
  }

  constructor(
    scriptUrl: URL,
    private actions: Actions<L, R>,
    options: Partial<WindowOptions>,
  ) {
    this._title = options.title ?? "";
    this._visible = options.visible ?? false;
    this._fullScreen = false;

    let script = Deno.readTextFileSync(scriptUrl);
    let html = (mockExternal: boolean) =>
      `<html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      <script type="text/javascript">

      (function() {
      ${
        !mockExternal ? "" : `window.external = {
          invoke(data) {
            console.log('Invoke:', data);
          }
        };`
      }
      ${script}
      })();

      </script>
      </body>
      </html>`;

    Deno.writeTextFileSync(
      new URL(scriptUrl.href.slice(0, -3) + ".html"),
      html(true),
    );

    this.webview = new Webview({
      title: "",
      visible: false,
      ...options,
      url: `data:text/html,${encodeURIComponent(html(false))}`,
    });

    this.webview.run((evt) => {
      this.actions.receiveMessage(JSON.parse(evt));
    });
  }

  drop() {
    this.webview.drop();
  }
}
