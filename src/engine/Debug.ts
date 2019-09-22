export class Debug {
  static isDebug = true;
  static assertEqual<T>(actual: T, expected: T, testName: string): void {
    if (!Debug.isDebug) return;

    if (actual === expected) {
      console.log(`[${testName}] PASSED`);
    } else {
      if (typeof expected === 'string') {
        console.log(`[${testName}] FAILED! Expected: "${expected}", but got "${actual}"`)
      } else if (typeof expected === 'object') {
        console.log(`[${testName}] FAILED! Expected:\n`, expected, `\nbut got:\n`, actual);
      } else {
        console.log(`[${testName}] FAILED! Expected: ${expected}, but got ${actual}`);
      }
    }
  }

  static log(...params: any[]) {
    if (Debug.isDebug) {
      console.log(...params);
    }
  }
}