// ------------------------------------
// NEW: Collapse consecutive duplicates
// ------------------------------------
/**
 * Collapse duplicate state changes per entity.
 *
 * The original implementation collapsed duplicates only when the same
 * entity/state combination appeared consecutively in the overall list. When
 * multiple entities were included, events for other entities would break
 * the sequence and prevent duplicates from being removed. This updated
 * implementation tracks the last state for each entity separately, so
 * duplicates are collapsed regardless of other entities in between. The
 * behaviour remains unchanged when `collapse_duplicates` is disabled at
 * either the entity or global level.
 *
 * @param {Array} list      The list of items sorted newest first
 * @param {Array} entities  The configured entity objects
 * @param {Object} globalConfig Card-level config containing collapse_duplicates
 * @returns {Array} A new array with duplicates collapsed
 */
function collapseDuplicates(list, entities, globalConfig) {
  // We iterate from the end (oldest first) so that the earliest event in a
  // sequence of duplicates is retained. Events later in time will be
  // skipped if they represent the same state for a given entity. The
  // collapsed list is then reversed back to descending order.
  const collapsedReversed = [];
  // Track the last raw_state seen for each entity ID while iterating from
  // oldest to newest. This represents the state we have already kept.
  const lastStates = {};

  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    const cfg = entities.find((e) => e.entity === item.id) || {};
    // Determine whether to collapse duplicates for this item
    const collapse =
      cfg.collapse_duplicates ?? globalConfig.collapse_duplicates ?? false;

    const lastState = lastStates[item.id];
    if (collapse) {
      if (lastState === item.raw_state) {
        // We've already kept an earlier event with this state for this entity.
        // Skip newer duplicates to keep the oldest occurrence.
        continue;
      }
    }

    // Include the item when collapse is disabled or this is the first time
    // we've encountered this state for the entity.
    collapsedReversed.push(item);
    // Update last state for this entity so we can detect duplicates in this
    // run of events. Always update regardless of collapse so that the
    // tracking is consistent for entities with collapse disabled.
    lastStates[item.id] = item.raw_state;
  }

  // Restore original (newest-first) order
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
