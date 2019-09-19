export class GameTime {
  private _totalMs = 0;
  private _deltaMs = 0;

  update(totalMs: number) {
    let lastTime = this._totalMs;
    this._totalMs = totalMs;
    this._deltaMs = this._totalMs - lastTime;
  }

  get totalMin() { return this._totalMs/1000/60; };
  get deltaMs() { return this._deltaMs; };
  get deltaSec() { return this._deltaMs/1000; }
  get totalMs() { return this._totalMs; };
  get totalSec() { return this._totalMs/1000; };
  get totalHr() { return this._totalMs/1000/60/60; };
}