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
  const collapsed = [];
  // Track the last raw_state seen for each entity ID
  const lastStates = {};

  for (const item of list) {
    const cfg = entities.find((e) => e.entity === item.id) || {};
    // Determine whether to collapse duplicates for this item
    const collapse =
      cfg.collapse_duplicates ?? globalConfig.collapse_duplicates ?? false;

    // Retrieve last seen state for this entity
    const lastState = lastStates[item.id];

    if (collapse) {
      if (lastState === item.raw_state) {
        // Skip duplicate events for this entity/state
        continue;
      }
    }

    // Otherwise include the item
    collapsed.push(item);
    // Update last state for this entity so future duplicates are detected
    lastStates[item.id] = item.raw_state;
  }

  return collapsed;
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
