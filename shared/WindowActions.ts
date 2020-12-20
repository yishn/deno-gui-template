import type { WindowState } from "../backend/Window.ts";

export type WindowBackendActions = {
  print(obj: object): Promise<void>;
  setState(state: Partial<WindowState>): Promise<void>;
};

export type WindowFrontendActions = {};
