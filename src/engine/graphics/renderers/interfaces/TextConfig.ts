export interface TextConfig {
  position: Vector2Like;
  fontFamily: string;
  fontSize: number;
  text: string;
  fillStyle?: string;
  strokeStyle?: string;
  textAlign?: 'start' | 'end' | 'left' | 'center' | 'right';
}