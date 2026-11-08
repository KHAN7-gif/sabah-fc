const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
export function validSnapshot(value) {
  return isObject(value) && value.schemaVersion === 1 && typeof value.revision === 'string' &&
    Array.isArray(value.players) && Array.isArray(value.matches) && Array.isArray(value.teams) &&
    isObject(value.playerProfiles || {});
}
export function selectPortalData({ published, localData, localProfiles, metadata, admin, fallback }) {
  const remote = validSnapshot(published);
  const draft = remote && admin && metadata?.pending === true && metadata.baseRevision === published.revision;
  const deploying = remote && admin && metadata?.pending === false && metadata.previousRevision === published.revision &&
    typeof metadata.baseRevision === 'string' && metadata.baseRevision !== published.revision;
  const useLocal = !remote || draft || deploying;
  return {
    data: structuredClone(useLocal && isObject(localData) ? localData : remote ? published : fallback),
    profiles: structuredClone(useLocal && isObject(localProfiles) ? localProfiles : remote ? published.playerProfiles || {} : {}),
    pending: !!draft,
    baseRevision: (draft || deploying) ? metadata.baseRevision : remote ? published.revision : null,
    deploying: !!deploying,
    preserveLocal: remote && !useLocal && (isObject(localData) || isObject(localProfiles))
  };
}
