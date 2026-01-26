// ------------------------------------
// NEW: Collapse consecutive duplicates
// ------------------------------------
function collapseDuplicates(list, entities, globalConfig) {
  const collapsedReversed = [];
  let lastKey = null;

  // Iterate from the end (oldest first)
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    const cfg = entities.find((e) => e.entity === item.id) || {};

    // Determine whether to collapse duplicates for this item
    const collapse =
      cfg.collapse_duplicates ?? globalConfig.collapse_duplicates ?? false;

    if (!collapse) {
      // Always include items when collapsing is disabled. Do not reset
      // lastKey so that duplicate tracking continues across these items.
      collapsedReversed.push(item);
      continue;
    }

    // duplicate key = same entity + same raw_state
    const key = `${item.id}__${item.raw_state}`;
    if (key !== lastKey) {
      // Found the earliest occurrence in a run of duplicates
      collapsedReversed.push(item);
      lastKey = key;
    }
    // If key === lastKey, skip the item to collapse duplicates
  }

  // Restore original (descending) order
  return collapsedReversed.reverse();
}

export function filterHistory(items, entities, limit, globalConfig = {}) {
  let filtered = items.filter((ev) => {
    const cfg = entities.find((e) => e.entity === ev.id);
    const include = Array.isArray(cfg?.include_states)
      ? cfg.include_states
      : null;
    const exclude = Array.isArray(cfg?.exclude_states)
      ? cfg.exclude_states
      : null;

    if (include) return include.includes(ev.raw_state);
    if (exclude) return !exclude.includes(ev.raw_state);
    return true;
  });

  // Sort (newest first)
  filtered = filtered.sort((a, b) => b.time - a.time);

  // NEW: collapse duplicates
  filtered = collapseDuplicates(filtered, entities, globalConfig);

  // Apply limit
  return filtered.slice(0, limit);
}
