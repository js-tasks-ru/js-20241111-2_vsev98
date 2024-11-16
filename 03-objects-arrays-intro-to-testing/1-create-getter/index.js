/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keysArr = path.split(".");

  return function getter(obj) {
    if (!Object.keys(obj).length || typeof obj === "undefined")
      return undefined;

    let value = obj[keysArr[0]];

    for (let i = 1; i < keysArr.length; i++) {
      value = value[keysArr[i]];
    }

    return value;
  };
}
