export namespace TweenFunctions {
	/**
	 * @param t current time
	 * @param b starting value
	 * @param c relative target value
	 * @param d duration
	 */
	export function linear(t, b, c, d) {
		return c*t/d + b;
	}

	/**
	 * @param t current time
	 * @param b starting value
	 * @param c relative target value
	 * @param d duration
	 */
	export function easeInQuad(t, b, c, d) {
		t /= d;
		return c*t*t + b;
	}

	export function easeOutQuad(t, b, c, d) {
		t /= d;
		return -c * t*(t-2) + b;
	};

	export function easeInOutQuad(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	}

	export function easeInCubic(t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	}

	export function easeOutCubic(t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	}

	export function easeInOutCubic(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	}

	export function easeInQuart(t, b, c, d) {
		t /= d;
		return c*t*t*t*t + b;
	}

	export function easeOutQuart(t, b, c, d) {
		t /= d;
		t--;
		return -c * (t*t*t*t - 1) + b;
	}

	export function easeInOutQuart(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t + b;
		t -= 2;
		return -c/2 * (t*t*t*t - 2) + b;
	}

	export function easeInQuint(t, b, c, d) {
		t /= d;
		return c*t*t*t*t*t + b;
	}

	export function easeOutQuint(t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t*t*t + 1) + b;
	}

	export function easeInOutQuint(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t*t*t + 2) + b;
	}

	export function easeInSine(t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	}

	export function easeOutSine(t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	}

	export function easeInOutSine(t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	}

	export function easeInExpo(t, b, c, d) {
		return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
	}

	export function easeOutExpo(t, b, c, d) {
		return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
	}

	export function easeInOutExpo(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
		t--;
		return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
	}

	export function easeInCirc(t, b, c, d) {
		t /= d;
		return -c * (Math.sqrt(1 - t*t) - 1) + b;
	}

	export function easeOutCirc(t, b, c, d) {
		t /= d;
		t--;
		return c * Math.sqrt(1 - t*t) + b;
	}

	export function easeInOutCirc(t, b, c, d) {
		t /= d/2;
		if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		t -= 2;
		return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
	}

}
