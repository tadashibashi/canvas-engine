import { State } from "./State";

export class StateQueue<T> {
  current: State<T> | null = null;
  last: State<T> | null = null;
}