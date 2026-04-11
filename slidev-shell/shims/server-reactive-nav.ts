/**
 * server-reactive:nav shim
 *
 * When __SLIDEV_HAS_SERVER__ = false, @slidev/client's createSyncState()
 * ignores this value and uses its own defaultState instead.
 * We export a matching shape so TypeScript is satisfied.
 */
export default {
  page: 1,
  clicks: 0,
  clicksTotal: 0,
}
