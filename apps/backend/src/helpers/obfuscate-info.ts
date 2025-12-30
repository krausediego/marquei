/**
 * Obfuscate important information and substitute to ***
 * @param target Record/obj of informations
 * @param words Words to obfuscate on obj
 * @returns
 */
export const obfuscateInformationInObjectDynamic = <T extends Record<string, any>>(
  target: T,
  words: Array<string>
): T => {
  const findChildren = (children: T, wordsToOfuscate: Array<string>) => {
    if (!children) {
      return children;
    }
    const childrenEntries = Object.entries(children);

    childrenEntries.forEach((entrie) => {
      const findWord = wordsToOfuscate.find((s) => s === entrie[0]);

      if (findWord) {
        if (entrie[1]) {
          entrie[1] = '*'.repeat(String(entrie[1]).length);
        }
      }

      if (typeof entrie[1] === 'object') {
        entrie[1] = findChildren(entrie[1], wordsToOfuscate);
      }
    });

    return Object.fromEntries(childrenEntries);
  };

  const ofuscatedObject = findChildren(target, words);
  const newTarget = JSON.parse(JSON.stringify({ ...ofuscatedObject }));
  return {
    ...newTarget,
  };
};
