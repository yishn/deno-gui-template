import { Component } from "./lib/react.ts";
import { Actions, ActionsTemplate } from "../shared/Actions.ts";
import type {
  WindowBackendActions,
  WindowFrontendActions,
} from "../shared/WindowActions.ts";

declare namespace external {
  function invoke(data: string): void;
}

declare namespace window {
  let __actions: Actions<ActionsTemplate, ActionsTemplate> | undefined;

  function addEventListener(name: string, callback: (evt: any) => any): void;
}

export interface WindowProps<L extends ActionsTemplate> {
  actions: L;
  title?: string;
  visible?: boolean;
  fullScreen?: boolean;
}

export class Window<L extends ActionsTemplate, R extends ActionsTemplate>
  extends Component<WindowProps<L>> {
  actions: Actions<L & WindowFrontendActions, R & WindowBackendActions>;

  get windowActions(): Actions<WindowFrontendActions, WindowBackendActions> {
    return this.actions;
  }

  constructor(props: WindowProps<L>) {
    super(props);

    this.actions = window.__actions = new Actions(
      props.actions,
      (data) => external.invoke(data),
    );
  }

  componentDidMount() {
    this.windowActions.doRemoteAction("setState", {
      title: this.props.title,
      visible: this.props.visible,
      fullScreen: this.props.fullScreen,
    });

    window.addEventListener("error", (evt) => {
      if (evt.error == null) return;

      this.windowActions.doRemoteAction(
        "print",
        `Frontend Uncaught Error: ${evt.error.stack || evt.error}`,
      );
    });

    window.addEventListener("unhandledrejection", (evt) => {
      this.windowActions.doRemoteAction(
        "print",
        `Frontend Unhandled Rejection: ${evt.reason.stack || evt.reason}`,
      );
    });
  }

  componentDidUpdate(prevProps: WindowProps<L>) {
    let windowStateChange = {
      title: prevProps.title !== this.props.title
        ? this.props.title
        : undefined,
      visible: prevProps.visible !== this.props.visible ? this.props.visible
      : undefined,
      fullScreen: prevProps.fullScreen !== this.props.fullScreen
        ? this.props.fullScreen
        : undefined,
    };

    if (Object.values(windowStateChange).some((value) => value !== undefined)) {
      this.windowActions.doRemoteAction("setState", windowStateChange);
    }
  }

  render() {
    return this.props.children;
  }
}
