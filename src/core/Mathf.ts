export namespace Mathf {

	export const EPSILON = Math.pow(2,-52);

	// ======== BASIC MATH ================
	export function add(...numbers: number[]): number {
		let count = 0;
		numbers.forEach((n) => {
			count += n;
		});
		return count;
	}	
	export function addFromArray(numbers: number[]): number {
		let count = 0;
		numbers.forEach((n) => {
			count += n;
		});
		return count;
	}

	export function average(...numbers: number[]): number {
		return addFromArray(numbers)/numbers.length;
	}
	export function averageFromArray(numbers: number[]) {
		return addFromArray(numbers)/numbers.length;
	}

	// ======== INTERPOLATION ============
	export function lerp(x: number, destination: number, amount: number) {
		return x + (destination - x) * amount;
	}

	// ======== CHANCE =================
	export function chance(x: number, outOf: number): boolean {
		return Math.random() < x/outOf;
	}

	export function randomRange(n1: number, n2: number) {
		let high = n1;
		let low = n2;
		if (n2 > n1) {
			high = n2;
			low = n1;
		}

		return Math.random()*(high-low) + low;
	}
	export function choose<T>(...items: T[]): T {
		let index = Math.floor(Math.random() * items.length);
		return items[index];
	}

	export function chooseFromArray<T>(items: T[]): T {
		let index = Math.floor(Math.random() * items.length);
		return items[index];
	}



	// ======= LIMITING Functions ==============

	/** Restricts or 'clamps' a value, between a boundary of two values, inclusively 
	 * @param x The number to clamp
	 * @param n1 Minimum value
	 * @param n2 Maximum value
	 */
  export function clamp(x: number, n1: number, n2: number): number {
    if (n1 === n2) return n1;
    if (n1 > n2) {
      return Math.min(Math.max(n2, x), n1);
    } else {
      return Math.min(Math.max(n1, x), n2);
    }
  }  

  /**
   * Behaves as a true mod function, even with negative numbers
   * @param x 
   * @param n 
   */
  export function mod(x: number, n: number) {
    return (x % n + n) % n;
  }

  /**
   * Return a number that 'wraps around' to the opposite boundary when either boundary is exceeded.
   * @param x Number to wrap.
   * @param n1 First boundary; can be higher or lower than n2.
   * @param n2 Second boundary; can be higher or lower than n1.
   */
  export function wrap(x: number, n1: number, n2: number): number {
    if (n1 == n2) return n1;
    // Determine which number is greater
    let high = n2, low = n1;
    if (n1 > n2) { high = n1, low = n2 }
     
    return Mathf.mod(x - low, high - low) + low;
  }


  // ======= TRIGONOMETRIC Functions ========

  /** Converts Degrees to Radians 
   * @param degrees The value to convert
   * @returns Radians as a floating point
   */
 	export function degtoRad(degrees: number) {
    return (degrees / 180) * Math.PI;
  }

  /** Converts Radians to Degrees 
   * @param radians The value to convert
   * @returns Degrees as a floating point
   */
  export function radToDeg(radians: number) {
      return (radians * 180) / Math.PI;
  }

  /** Calculates the distance between two vectors 
   * @param position1 the first position
   * @param position2 the second position
   * @returns the distance/hypoteneuse length
  */
  export function pointDistance(x1: number, y1: number, x2: number, y2: number) {
    let x = Math.abs(x1 - x2);
    let y = Math.abs(y1 - y2);

    return Math.sqrt((x*x) + (y*y));
  }
  
  /** Takes an angle (in degrees) and a length, and determines the y value
   * @param degrees The angle of the hypoteneuse
   * @param length The length of the hypotenuese
   * @returns The Y value of the resulting vector as a number
   */
  export function lengthDirY(degrees: number, length: number) {
    let polarity = Math.sin( Mathf.degtoRad(degrees) );
    if (Math.abs(polarity) < Mathf.EPSILON) {
      return 0;
    } else {
      return polarity * length;
    }
  }

  /** Takes an angle (in degrees) and a length, and determines the x value
   * @param degrees The angle of the hypoteneuse
   * @param length The length of the hypotenuese
   * @returns The X value of the resulting vector as a number
   */
  export function lengthDirX(degrees: number, length: number) {
    let polarity = Math.cos(Mathf.degtoRad(degrees));
    if (Math.abs(polarity) < Mathf.EPSILON) {
      return 0;
    } else {
      return polarity * length;
    }
  }

  function getQuadrant(x: number, y: number): 0 | 1 | 2 | 3 {
		let quadrant: 0 | 1 | 2 | 3 = 0;
		if (x > 0 && y >= 0) {
			quadrant = 0;
		}
		if (x <= 0 && y > 0) {
			quadrant = 1;
		}
		if (x < 0 && y <= 0) {
			quadrant = 2;
		}
		if (x >= 0 && y < 0) {
			quadrant = 3;
		}
		return quadrant;
	}

	export function pointDirection(x1: number, y1: number, x2: number, y2: number) {
		let diffX = x2 - x1;
		let diffY = y2 - y1;
		let quadrant = getQuadrant(diffX, diffY);
		console.log(quadrant);
		if (quadrant % 2 === 0) { // if quadrants 0 or 2
			return Math.abs(radToDeg(Math.atan(diffY / diffX))) + quadrant * 90;
		} else {
			return 90-Math.abs(radToDeg(Math.atan((diffY / diffX)))) + quadrant * 90;
		}
	}

}

