export class SignalDispatcher {
  static listeners = {};

  static addListener(signal, callback) {
    if (!(signal in this.listeners)) {
      this.listeners[signal] = new Array();
    }
    this.listeners[signal].push(callback);
  }

  static dispatchSignal(signal) {
    if (signal in this.listeners) {
      this.listeners[signal].forEach((callback) => {
        callback();
      });
    }
  }
}
