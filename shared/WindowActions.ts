import type { WindowState } from "../backend/Window.ts";

export type WindowBackendActions = {
  print(obj: unknown): Promise<void>;
  setState(state: Partial<WindowState>): Promise<void>;
};

export type WindowFrontendActions = {};
