/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(str, trim = str.length) {
  const arrStr = str.split("");
  let count = 0;

  return arrStr
    .reduce((acc, symbol) => {
      // console.log(acc.at(-1));
      count++;

      if (symbol !== acc.at(-1)) count = 0;
      if (count < trim) acc.push(symbol);

      return acc;
    }, [])
    .join("");
}
