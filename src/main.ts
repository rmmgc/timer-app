import './style.css';
import './theme';

import { animateElement } from './animations';
import { calculateTimeSegments, throttle, isValidInteger } from './helpers';

interface AppState {
  hours: number,
  minutes: number,
  seconds: number,
  secondsLeft: number,
  secondsTotal: number,
  paused: boolean,
  timerId?: number,
}

const state: AppState = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  secondsLeft: -1,
  secondsTotal: -1,
  paused: false,
};

// Maximum amount of seconds that timer can display properly
const TIMER_SECONDS_MAX = (99 * 60 * 60) + (59 * 60) + 59;

// Wrappers holding timer and timer inputs for initial setup
const timerWrapper = document.getElementById('timer-display');
const timerInputWrapper = document.getElementById('timer-setup');

// Elements to show running timer state
const hoursElement: HTMLDivElement = document.getElementById('hours-segment') as HTMLDivElement;
const minutesElement = document.getElementById('minutes-segment') as HTMLDivElement;
const secondsElement = document.getElementById('seconds-segment') as HTMLDivElement;

// Input elements to set initial timer values
const hoursInput = document.getElementById('time-input-hours') as HTMLInputElement;
const minutesInput = document.getElementById('time-input-minutes') as HTMLInputElement;
const secondsInput = document.getElementById('time-input-seconds') as HTMLInputElement;

// Control buttons to play/pause/stop timer
const playButton = document.getElementById('btn-play') as HTMLButtonElement;
const pauseButton = document.getElementById('btn-pause') as HTMLButtonElement;
const stopButton = document.getElementById('btn-stop') as HTMLButtonElement;

/**
 * Clean up timer state and reset HTML elements.
 */
function timerCleanup(): void {
  // Reset state
  state.paused = false;
  state.secondsLeft = -1;
  state.secondsTotal = -1;

  // Show input elements
  timerWrapper!.style.display = 'none';
  timerInputWrapper!.style.display = 'flex';

  // Enable paly button
  playButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = true;
}

/**
 * Take values from HTML input elements and calculates the
 * total amount of seconds that timer needs to go rough.
 */
function prepareInitialValues(): void {
  const hoursInputValue = hoursInput.value || '0';
  const minutesInputValue = minutesInput.value || '0';
  const secondsInputValue = secondsInput.value || '0';

  if (!isValidInteger(hoursInputValue) || !isValidInteger(minutesInputValue) || !isValidInteger(secondsInputValue)) {
    console.warn('Values for hours, minutes and seconds must be provided as numbers');
    animateElement(playButton, 'SHAKE');
    return;
  }

  let secondsTotal = parseInt(hoursInputValue) * 3600 + parseInt(minutesInputValue) * 60 + parseInt(secondsInputValue);
  secondsTotal = secondsTotal > TIMER_SECONDS_MAX ? TIMER_SECONDS_MAX : secondsTotal;

  state.secondsTotal = secondsTotal;
  state.secondsLeft = secondsTotal;
}

/**
 * Stop running timer.
 * Function can be triggered when timer is running or when timer is finished.
 * If function is called while timer is running, `scheduleAnimation`
 * can be used to skip running "timer done" animation.
 */
function stopTimer(scheduleAnimation = true) {
  // Clear timer
  clearInterval(state.timerId);
  state.secondsLeft = -1;

  // Skip animation
  if (!scheduleAnimation) {
    timerCleanup();
    return;
  }

  // Disable all buttons during animation
  playButton.disabled = true;
  pauseButton.disabled = true;
  stopButton.disabled = true;

  // Run animations when on "timer done"
  Promise.all([
    animateElement(hoursElement, 'PULSATE'),
    animateElement(minutesElement, 'PULSATE'),
    animateElement(secondsElement, 'PULSATE'),
  ])
    .then(timerCleanup);
}

/**
 * Resume currently active timer.
 */
function resumeTimer() {
  if (!hoursElement || !secondsElement || !minutesElement) {
    console.warn('DOM is not in valid state, missing required elements!');
    stopTimer(false);
    return;
  }

  updateTimer();
  state.secondsLeft -= 1;

  // Cover the case when timer is resumed at 0 seconds left
  if (state.secondsLeft === -1) {
    stopTimer();
    return;
  }

  // Disable start/resume button when timer is resumed
  playButton.disabled = true;
  pauseButton.disabled = false;
  stopButton.disabled = false;

  // Resume timer and update state
  state.paused = false;
  state.timerId = setInterval(() => {
    updateTimer();
  
    if (state.secondsLeft <= 0) {
      stopTimer();
    } else {
      state.secondsLeft -= 1;
    }
  }, 1000);
}

function initTimer() {
  // Make sure that the timer is not paused before initializing
  if (state.paused) {
    resumeTimer();
    return;
  }

  prepareInitialValues();
  if (state.secondsLeft <= 0) {
    console.warn('Remaining time is not valid. There is no time left to go trough');
    animateElement(playButton, 'SHAKE');
    return;
  }

  // Show timer view elements
  timerWrapper!.style.display = 'flex';
  timerInputWrapper!.style.display = 'none';

  resumeTimer();
}

function pauseTimer() {
  if (state.paused) {
    return;
  }

  clearInterval(state.timerId);
  state.paused = true;

  playButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = false;
}

function updateTimer() {
  const { hours, minutes, seconds } = calculateTimeSegments(state.secondsLeft);
 
  if (hours !== state.hours) {
    updateTimerSegment(hoursElement, hours);
    state.hours = hours;
  }

  if (minutes !== state.minutes) {
    updateTimerSegment(minutesElement, minutes);
    state.minutes = minutes;
  }

  if (seconds !== state.seconds) {
    updateTimerSegment(secondsElement, seconds);
    state.seconds = seconds;
  }
}

function updateTimerSegment(segment: HTMLDivElement, timeSegmentValue: number) {
  const [previousValueElement, newValueElement] = segment.querySelectorAll('span');
  newValueElement.textContent = String(timeSegmentValue).padStart(2, '0');

  // Skip animation for the first loop
  if (state.secondsLeft === state.secondsTotal) {
    previousValueElement.innerHTML = newValueElement.innerHTML;
    return;
  }

  Promise.all([
    animateElement(newValueElement, 'SLIDE_IN'),
    animateElement(previousValueElement, 'SLIDE_OUT')
  ])
    .then(() => {
      previousValueElement.innerHTML = newValueElement.innerHTML;
    });
}


/**
 * Timer can be controlled using specific keys. Currently supported:
 * - Enter -> initializes timer
 * - Space -> pauses/resumes timer (timer needs to be initialized before)
 */
function handleKeydownEvents(event: KeyboardEvent) {
  const { code } = event;

  if (code === 'Space') {
    if (state.secondsLeft < 0) {
      return;
    }

    if (!state.paused) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }

  if (code === 'Enter') {
    if (state.secondsTotal >= 0) {
      return;
    }

    initTimer();
  }
}

// Throttle keydown handler to prevent user spamming the keys
const throttledHandleKeydownEvents = throttle(handleKeydownEvents, 300);

document.addEventListener('keydown', throttledHandleKeydownEvents);
playButton?.addEventListener('mousedown', initTimer);
pauseButton?.addEventListener('mousedown', pauseTimer);
stopButton?.addEventListener('mousedown', () => stopTimer(false));
