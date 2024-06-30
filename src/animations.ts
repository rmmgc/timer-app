const ANIMATIONS = {
  SLIDE_IN: {
    keyframes: [
      { top: '1em', opacity: 0 },
      { top: 0, opacity: 1 },
    ],
    defaultTiming: {
      duration: 400,
      iterations: 1,
      fill: 'forwards',
      easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
    }
  },
  SLIDE_OUT: {
    keyframes: [
      { top: 0, opacity: 1 },
      { top: '-1em', opacity: 0 },
    ],
    defaultTiming: {
      duration: 400,
      iterations: 1,
      fill: 'forwards',
      easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
    }
  },
  PULSATE: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.2)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    defaultTiming: {
      duration: 600,
      iterations: 3,
    }
  },
  SHAKE: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' }
  ],
    defaultTiming: {
      duration: 300,
      iterations: 1,
    }
  }
};

function animateElement(
  element: HTMLElement,
  name: 'SLIDE_IN' | 'SLIDE_OUT' | 'PULSATE' | 'SHAKE',
  timing?: EffectTiming
) {
  const { keyframes, defaultTiming } = ANIMATIONS[name];

  return new Promise((resolve, reject) => {
    const animation = element.animate(keyframes, timing ?? defaultTiming);
    animation.onfinish = resolve;
    animation.oncancel = () => reject(new Error('Animation canceled'));
  });
}

export { animateElement };
