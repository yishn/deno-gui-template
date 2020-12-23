import React, { Component, createRef, RefObject } from "./lib/react.ts";
import {
  AppWindowBackendActions,
  AppWindowFrontendActions,
} from "../shared/AppWindowActions.ts";
import { Window } from "./Window.ts";

export interface AppWindowProps {}

export interface AppWindowState {
  productName: string;
}

export class AppWindow extends Component<AppWindowProps, AppWindowState> {
  windowRef: RefObject<
    Window<AppWindowFrontendActions, AppWindowBackendActions>
  >;

  constructor(props: AppWindowProps) {
    super(props);

    this.windowRef = createRef();

    this.state = {
      productName: "",
    };
  }

  async componentDidMount() {
    if (this.windowRef.current == null) return;

    let productName = await this.windowRef.current.actions.doRemoteAction(
      "getProductName",
    );

    this.setState({
      productName,
    });
  }

  render() {
    return (
      <Window<AppWindowFrontendActions, AppWindowBackendActions>
        ref={this.windowRef}
        actions={{}}
        title={this.state.productName}
        visible
      >
        <h1>Hello World!</h1>
        <p>{(window as any).navigator.userAgent}</p>
      </Window>
    );
  }
}
