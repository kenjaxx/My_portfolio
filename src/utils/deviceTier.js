// Cheap, one-time device check used to turn down heavy visual effects.
// Add ?lowpower to the URL to force the low-power path while testing.
let cached

export function getDeviceTier() {
  if (cached) return cached

  if (typeof window === 'undefined') {
    cached = { lowPower: false, coarse: false, saveData: false }
    return cached
  }

  const nav = navigator
  const cores = nav.hardwareConcurrency || 8
  const memory = nav.deviceMemory || 8 // undefined on Safari, so assume capable
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const saveData = Boolean(nav.connection && nav.connection.saveData)
  const forced = new URLSearchParams(window.location.search).has('lowpower')

  const lowPower =
    forced ||
    saveData ||
    cores <= 2 ||
    memory <= 2 ||
    (coarse && (cores <= 4 || memory <= 4))

  cached = { lowPower, coarse, saveData }
  return cached
}