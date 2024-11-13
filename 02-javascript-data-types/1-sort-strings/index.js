/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = "asc") {
  const sortDirect = param === "asc" ? 1 : -1;
  return Array.from(arr).sort((a, b) => {
    return (
      sortDirect * a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" })
    );
  });
}
