/** Infrastructure lifecycle only. Domain modules define their own repository contracts. */
export interface DatabaseProvider<TClient> {
  readonly client: TClient;
  ping(): Promise<void>;
  close(): Promise<void>;
}
