/**
 * Defines the structure for the matching result.
 *
 * @template T - The type of the candidate object.
 */
type Match<T extends Record<string, any>> = {
  candidate: T;
  score: number;
};

/**
 * Filters keys of T that are stringable (string, number, boolean).
 *
 * @template T - The type to filter keys from.
 */
type StringableKeys<T> = {
  [K in keyof T]: T[K] extends string | number | boolean ? K : never;
}[keyof T];

/**
 * Calculate Levenshtein distance between two strings.
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {number} - The Levenshtein distance.
 */
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 1; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function tokenize(str: string): string[] {
  // Remove punctuation marks and convert to lowercase
  const cleanStr = str
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
  return cleanStr.split(" ");
}

function calculateScore(
  queryToken: string,
  candidateToken: string,
  position: number
): number {
  let score = 0;

  if (candidateToken.startsWith(queryToken)) {
    score += 2; // Major bonus for starts-with partial matches
  }

  if (candidateToken === queryToken) {
    score += 4; // Even bigger bonus for exact matches
  }

  // Add Levenshtein-based score but normalize it to be smaller than other bonuses
  const distance = levenshtein(queryToken, candidateToken);
  score += (1 / (1 + distance)) * 0.5;

  // Position-based bonus: early matches score higher
  if (position === 0) {
    score += 1; // Bonus if the match is at the beginning
  }

  return score;
}
/**
 * Perform fuzzy search on an array of objects based on specified fields.
 *
 * @template T - The type of the candidate object, must extend Record<string, any>.
 * @param {string} query - The search query string.
 * @param {T[]} candidates - An array of candidate objects.
 * @param {Array<StringableKeys<T>>} fields - Fields within objects to search through.
 * @param {number} numResults - Number of results to return.
 * @returns {Match<T>[]} - An array of matches with their Levenshtein distances.
 */
export function fuzzySearch<T extends Record<string, any>>(
  query: string,
  candidates: T[],
  fields: Array<keyof T>,
  numResults: number,
  minScore: number,
  strictnessRatio: number
): Match<T>[] {
  const queryTokens = tokenize(query);
  const scores: Match<T>[] = [];

  for (const candidate of candidates) {
    let score = 0;
    let strictScore = 0;
    const matchedTokens: Set<string> = new Set();

    for (const field of fields) {
      const fieldValueTokens = tokenize(String(candidate[field]));

      for (const queryToken of queryTokens) {
        let prevTokenMatched = false;

        for (let position = 0; position < fieldValueTokens.length; position++) {
          const fieldValueToken = fieldValueTokens[position];

          if (!matchedTokens.has(fieldValueToken)) {
            const tokenScore = calculateScore(
              queryToken,
              fieldValueToken,
              position
            );

            if (tokenScore > 0) {
              matchedTokens.add(fieldValueToken);
              score += tokenScore;

              if (tokenScore > 1) {
                strictScore += tokenScore;
              }

              if (prevTokenMatched) {
                score += 1;
              }

              prevTokenMatched = true;
            } else {
              prevTokenMatched = false;
            }
          }
        }
      }
    }

    const candidateStrictnessRatio = score ? strictScore / score : 0;

    if (score >= minScore && candidateStrictnessRatio >= strictnessRatio) {
      scores.push({ candidate, score });
    }
  }

  return scores.sort((a, b) => b.score - a.score).slice(0, numResults);
}

/**
 * Debounce a function call.
 *
 * @template T - The type of the `this` context for the function.
 * @template U - The tuple type representing the argument types of the function.
 *
 * @param {(...args: U) => void} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay the function call.
 * @returns {(...args: U) => void} - The debounced function.
 */
export function debounce<T, U extends any[]>(
  func: (this: T, ...args: U) => void,
  wait: number
): (this: T, ...args: U) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: T, ...args: U): void {
    const context = this;

    const later = () => {
      timeout = null;
      func.apply(context, args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}
