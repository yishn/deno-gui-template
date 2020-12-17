import type { WindowState } from "../backend/Window.ts";

export type WindowBackendActions = {
  setState(state: Partial<WindowState>): Promise<void>;
};

export type WindowFrontendActions = {};
