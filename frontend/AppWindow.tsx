import React, { Component, render } from "./lib/react.ts";
import { Actions } from "../shared/Actions.ts";
import {
  AppWindowBackendActions,
  AppWindowFrontendActions,
} from "../shared/AppWindowActions.ts";
import { Window } from "./Window.ts";

declare namespace document {
  function getElementById(id: string): any;
}

interface AppWindowProps {}

class AppWindow extends Component<AppWindowProps> {
  constructor(props: AppWindowProps) {
    super(props);
  }

  render() {
    return <h1>Hello World!</h1>;
  }
}

render(<AppWindow />, document.getElementById("root"));
