interface Synchronized {
  tick: number;
  ownedBy: string | null;
}

/** Union two LWWMaps returning a copy of the superset.
 *
 * The union is biased towards state2 on equal tick counts of both,
 * by performing the merging of state2 onto result secondary and
 * avoid an explicit lesser equals check there.
 *
 */
function unionLastWriterWins<T extends Synchronized, K extends keyof T>(
  state1: { [key: string]: T },
  state2: { [key: string]: T }
): { [key: string]: T } {
  const result: { [key: string]: T } = {};

  for (const key of Object.keys(state2)) {
    if (state1.hasOwnProperty(key) && state1[key].tick > state2[key].tick) {
      continue;
    }
    result[key] = {} as any;
    for (const [prop, value] of Object.entries(state2[key])) {
      result[key][prop as K] = value;
    }
  }

  for (const key of Object.keys(state1)) {
    if (state2.hasOwnProperty(key) && state2[key].tick > state1[key].tick) {
      continue;
    }
    result[key] = {} as any;
    for (const [prop, value] of Object.entries(state1[key])) {
      result[key][prop as K] = value;
    }
  }

  return result;
}
