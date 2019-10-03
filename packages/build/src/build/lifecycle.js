const MAIN_LIFECYCLE = [
  /* Fetch previous build cache */
  'getCache',
  /* Install project dependancies */
  'install',
  /* Build the site & functions */
  'build',
  'buildSite',
  'buildFunctions',
  /* Package & optimize artifact */
  'package',
  /* Deploy built artifact */
  'deploy',
  /* Save cached assets */
  'saveCache',
  /* Outputs manifest of resources created */
  'manifest'
].flatMap(hook => [`pre${hook}`, hook, `post${hook}`])

const LIFECYCLE = [
  /* Build initialization steps */
  'init',
  ...MAIN_LIFECYCLE,
  /* Build finished */
  'finally',
  'onError'
]

module.exports = { LIFECYCLE }
