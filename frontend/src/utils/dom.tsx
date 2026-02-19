import React from 'react';

import { isBrowser } from './platform';

/**
 * addEventListeners
 *
 * Allow multiple events to be added in one call, jQuery-style
 *
 * @param  {EventTarget}     target  target node
 * @param  {array, string}   events   events to add
 * @param  {function}        handler  event handler
 * @param  {object, boolean} options  event options
 */
export const addEventListeners = (
  target: EventTarget,
  events: string[] | string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean
) => {
  if (!Array.isArray(events)) {
    events = events.split(' ');
  }

  events.forEach(event => {
    target.addEventListener(event, handler, options);
  });
};

/**
 * removeEventListeners
 *
 * Allow multiple events to be removed in one call, jQuery-style
 *
 * @param  {EventTarget}     target  target node
 * @param  {array, string}   events   events to remove
 * @param  {function}        handler  event handler
 * @param  {object, boolean} options  event options
 */
export const removeEventListeners = (
  target: EventTarget,
  events: string[] | string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean
) => {
  if (!Array.isArray(events)) {
    events = events.split(' ');
  }

  events.forEach(event => {
    target.removeEventListener(event, handler, options);
  });
};

export const waitForEvent = (target: EventTarget, event: string) => {
  return new Promise<Event>(resolve => {
    target.addEventListener(event, resolve, { once: true });
  });
};

export const waitForEvents = (
  target: EventTarget,
  events: string[] | string
) => {
  if (!Array.isArray(events)) {
    events = events.split(' ');
  }

  return Promise.all(events.map(event => waitForEvent(target, event)));
};

export const getAbsoluteOffset = (element: HTMLElement) => {
  let top = 0;
  let left = 0;

  while (element) {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent as HTMLElement;
  }

  return { left, top };
};

export const getEventPath = (event: Event) => {
  const path: EventTarget[] = [];
  let currentElem = event.target as HTMLElement | null;

  while (currentElem) {
    path.push(currentElem);
    currentElem = currentElem.parentElement;
  }

  if (!path.includes(window) && !path.includes(document)) path.push(document);
  if (!path.includes(window)) path.push(window);

  return path;
};

export const getViewportInfo = () => {
  const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement | null;
  if (!viewport || !viewport.content)
    return { width: window.innerWidth, height: window.innerHeight };

  return Object.fromEntries(
    viewport.content.split(',').map((content: string) =>
      content
        .trim()
        .split('=')
        .map((data, index) => {
          if (index === 1 && data.match(/\d+/)) return parseFloat(data);
          return data;
        })
    )
  );
};

export const eventsMap = {
  mousemove: 'touchmove',
  mousedown: 'touchstart',
  mouseup: 'touchend',
} as const;

export const splitTextIntoLetters = (text: string) => {
  const array = text.split('');
  return array.map((letter, i) => <span key={`${i}-${letter}`}>{letter}</span>);
};

export const getCSSRules = (element: HTMLElement) => {
  const sheets = document.styleSheets;
  const matchingRules: CSSStyleDeclaration[] = [];
  element.matches = element.matches || element.webkitMatchesSelector;

  Array.from(sheets).forEach((sheet: CSSStyleSheet) => {
    const rules = sheet.rules || sheet.cssRules;

    Array.from(rules).forEach((rule: CSSRule) => {
      if (rule instanceof CSSStyleRule && element.matches(rule.selectorText)) {
        matchingRules.push(rule.style);
      }
    });
  });

  return matchingRules;
};

export const remToPx = (rem: number) =>
  isBrowser()
    ? rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    : 0;
