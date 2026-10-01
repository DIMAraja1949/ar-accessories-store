export class AsyncLocalStorage {
  getStore() { return undefined; }
  run(_store: any, callback: () => any) { return callback(); }
  enterWith() {}
  disable() {}
}
export default { AsyncLocalStorage };