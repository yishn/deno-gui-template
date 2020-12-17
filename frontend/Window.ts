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
  let __actions: Actions<ActionsTemplate, ActionsTemplate>;
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

  constructor(props: WindowProps<L>) {
    super(props);

    this.actions = window.__actions = new Actions(
      props.actions,
      (data) => external.invoke(data),
    );
  }

  componentDidUpdate(prevProps: WindowProps<L>) {
    this.actions.doRemoteAction("setState", ...[{
      title: prevProps.title !== this.props.title
        ? this.props.title
        : undefined,
      visible: prevProps.visible !== this.props.visible
        ? this.props.visible
        : undefined,
      fullScreen: prevProps.fullScreen !== this.props.fullScreen
        ? this.props.fullScreen
        : undefined,
    }] as never);
  }

  render() {
    return this.props.children;
  }
}
