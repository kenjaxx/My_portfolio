import { PROJECTS } from './data'

/*
  Single source of truth for the "where I am right now" wording.
  The hero status pill and the career timeline both read from here, so the
  number of live apps can never disagree with the project list.

  index.html cannot import this file, so its meta description repeats the
  line "IT graduate, open to full stack roles" by hand. If you change the
  wording here, change it there too.
*/

const liveProjects = PROJECTS.filter((project) => project.live)
const count = liveProjects.length

export const STATUS = {
  // Short line used in the hero pill and as the "Now" title in the timeline.
  short: 'Open to full stack roles',

  // How many projects have a live demo, computed from data.js.
  liveApps: count,
  liveAppsLabel: `${count} live ${count === 1 ? 'app' : 'apps'}`,

  // "Closet — AI Outfit Matcher" becomes "Closet".
  liveAppNames: liveProjects.map((project) => project.title.split(' — ')[0]),
}