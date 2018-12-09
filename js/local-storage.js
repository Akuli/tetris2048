define([], function() {
  "use strict";

  let useLocalStorage = true;
  const fakeLocalStorage = {};

  return {
    set(key, value) {
      fakeLocalStorage[key] = value;

      if (useLocalStorage) {
        try {
          console.log('setting:', key, value);
          window.localStorage.setItem('tetris2048-' + key, value);
        } catch(e) {
          console.log(e);   // eslint-disable-line no-console
          useLocalStorage = false;
        }
      }
    },

    get(key) {
      if (fakeLocalStorage[key] === undefined && useLocalStorage) {
        try {
          fakeLocalStorage[key] = window.localStorage.getItem('tetris2048-' + key);
        } catch(e) {
          console.log(e);   // eslint-disable-line no-console
          useLocalStorage = false;
        }
      }

      // make sure to never return undefined, always null or string
      if (fakeLocalStorage[key] === undefined) {
        return null;
      }
      return fakeLocalStorage[key];
    }
  };
});

