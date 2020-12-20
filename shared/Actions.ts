export type ActionsTemplate = Record<
  string,
  (...args: any[]) => Promise<any>
>;

export interface RawActionMessage<
  A extends ActionsTemplate,
  K extends keyof A,
> {
  id: number;
  key: K;
  args: Parameters<A[K]>;
}

export interface RawResponseMessage<
  A extends ActionsTemplate,
  K extends keyof A,
> {
  id: number;
  response?: ReturnType<A[K]> extends Promise<infer T> ? T : never;
  error?: {
    message: string;
    stack?: string;
  };
}

export class RemoteActionError extends Error {
  constructor(message: string, public remoteStack?: string) {
    super(message);

    this.name = "RemoteActionError";
  }
}

export class Actions<
  L extends ActionsTemplate,
  R extends ActionsTemplate,
> {
  protected id: number;
  protected responseQueue: Record<
    string,
    ((message: RawResponseMessage<R, keyof R>) => void) | undefined
  >;

  constructor(
    public localActions: L,
    sendData: (data: string) => void,
  ) {
    this.id = 0;
    this.responseQueue = {};

    this.sendMessage = (message) => sendData(JSON.stringify(message));
  }

  async receiveMessage<K extends keyof L, J extends keyof R>(
    message: RawActionMessage<L, K> | RawResponseMessage<R, J>,
  ): Promise<void> {
    if (!("key" in message)) {
      let callback = this.responseQueue[message.id];
      if (callback != null) callback(message);
    } else {
      try {
        let response = await this.localActions[message.key](
          ...message.args,
        ) as RawResponseMessage<L, K>["response"];

        this.sendMessage({
          id: message.id,
          response,
        });
      } catch (err) {
        this.sendMessage({
          id: message.id,
          response: undefined,
          error: {
            message: err.message,
            stack: err.stack,
          },
        });
      }
    }
  }

  protected sendMessage<K extends keyof L, J extends keyof R>(
    message: RawActionMessage<R, J> | RawResponseMessage<L, K>,
  ): void {}

  async doRemoteAction<J extends keyof R>(
    key: J,
    ...args: Parameters<R[J]>
  ): Promise<ReturnType<R[J]>> {
    let responseMessage = await new Promise<RawResponseMessage<R, J>>(
      (resolve) => {
        let id = this.id++;

        this.responseQueue[id] = (rawResponse) => {
          delete this.responseQueue[id];
          resolve(rawResponse);
        };

        this.sendMessage({
          id,
          key,
          args,
        });
      },
    );

    if (responseMessage.error != null) {
      throw new RemoteActionError(
        responseMessage.error.message,
        responseMessage.error.stack,
      );
    }

    return responseMessage.response;
  }
}
