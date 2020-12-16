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
  response: ReturnType<A[K]> extends Promise<infer T> ? T : never;
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
    protected sendData: (data: string) => void,
  ) {
    this.id = 0;
    this.responseQueue = {};
  }

  async receiveMessage<K extends keyof L, J extends keyof R>(
    message: RawActionMessage<L, K> | RawResponseMessage<R, J>,
  ): Promise<void> {
    if ("response" in message) {
      let callback = this.responseQueue[message.id];
      if (callback != null) callback(message);
    } else {
      let response = await this.localActions[message.key](
        ...message.args,
      ) as RawResponseMessage<L, K>["response"];

      this.sendMessage({
        id: message.id,
        response,
      });
    }
  }

  protected sendMessage<K extends keyof L, J extends keyof R>(
    message: RawActionMessage<R, J> | RawResponseMessage<L, K>,
  ): void {
    this.sendData(JSON.stringify(message));
  }

  async doRemoteAction<J extends keyof R>(
    key: J,
    ...args: Parameters<R[J]>
  ): Promise<ReturnType<R[J]>> {
    let responseMessage = await new Promise<RawResponseMessage<R, J>>(
      (resolve) => {
        let id = this.id++;

        this.responseQueue[id] = resolve;

        this.sendMessage({
          id,
          key,
          args,
        });
      },
    );

    return responseMessage.response;
  }
}
