/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keysArr = path.split(".");
  let i = 0;

  return function getter(obj) {
    switch (true) {
      case typeof obj !== "object":
        i = 0;
        return obj;
      case obj === null:
        return null;
      case !Object.keys(obj).length || typeof obj === "undefined":
        return undefined;

      default:
        return (obj = getter(obj[keysArr[i++]]));
    }
  };
}
