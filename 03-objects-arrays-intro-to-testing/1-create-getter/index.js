/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keysArr = path.split(".");

  return function getter(obj) {

    for (const key of keysArr) {
      if (!Object.keys(obj).length) return undefined;
      obj = obj[key];
    }
    return obj;
  };
}
