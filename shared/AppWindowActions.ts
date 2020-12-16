export type AppWindowBackendActions = {
  getProductName(): Promise<string>;
  setWindowTitle(title: string): Promise<void>;
}

export type AppWindowFrontendActions = {}
