const { resolve, dirname, basename } = require('path')
const { homedir } = require('os')
const {
  env: { CACHE_BASE },
} = require('process')

const pathExists = require('path-exists')
const del = require('del')
const moveFile = require('move-file')
const cpy = require('cpy')

const { logCacheStart, logCacheDir } = require('../log/main')
const isNetlifyCI = require('../utils/is-netlify-ci')

// Cache a list of pre-defined directories, for future builds to re-use
const cacheArtifacts = async function(baseDir, cacheDir) {
  logCacheStart()

  await Promise.all(ARTIFACTS.map(({ path }) => saveCache({ baseDir, cacheDir, path })))
}

// List of directories to cache
const ARTIFACTS = [
  { path: './node_modules' },
  { path: './bower_components' },
  { path: './.bundle' },
  { path: './.venv' },
  { path: './wapm_packages' },
  { path: '~/.yarn_cache' },
]

// Cache a single directory
const saveCache = async function({ baseDir, cacheDir, path }) {
  const { srcPath, cachePath } = parseCachePath(path, baseDir, cacheDir)

  if (!(await pathExists(srcPath))) {
    return
  }

  logCacheDir(path)

  await del(cachePath, { force: true })

  // In CI, files are directly moved, which is faster.
  // But locally, we want to keep the source files.
  if (isNetlifyCI()) {
    await moveFile(srcPath, cachePath, { overwrite: false })
  } else {
    await cpy(basename(srcPath), dirname(cachePath), { cwd: dirname(srcPath), parents: true })
  }
}

const parseCachePath = function(path, baseDir, cacheDir) {
  const [base, ...pathA] = path.split('/')
  const baseA = getBase(base, baseDir)
  const relPath = pathA.join('/')

  const srcPath = resolve(baseA, relPath)
  const cachePath = resolve(cacheDir, relPath)
  return { srcPath, cachePath }
}

const getBase = function(base, baseDir) {
  // This is used in tests
  if (CACHE_BASE !== undefined) {
    return resolve(baseDir, CACHE_BASE)
  }

  if (base === '~') {
    return homedir()
  }

  return resolve(baseDir, base)
}

module.exports = { cacheArtifacts }
