/**
 * Returns same string with the first character capitalized.
 * @param {string} text - Text to capitalize
 * @return {string} - Same string with first character capitalized
 */
export default function capitalize(text) {
  const strText = String(text);
  const strAfterFirst = strText.length > 1 ? strText.slice(1) : '';
  return strText.charAt(0).toLocaleUpperCase() + strAfterFirst;
}

export { capitalize };
