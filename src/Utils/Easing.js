
// test: https://www.wolframalpha.com/input/?i=f+%3D+(sin(Pi+*+x++-+Pi%2F2)+%2B+1)%2F2+;+x+from+0+to+1
export const easingInOutSine = t => ((Math.sin(Math.PI * t - Math.PI / 2) + 1) / 2);

// test: https://www.wolframalpha.com/input/?i=f+%3D+sin(Pi+*+x+%2F+2)+;+x+from+0+to+1
export const easingOutSine = t => (Math.sin(Math.PI * t / 2));
