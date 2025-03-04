import { createMacro } from 'babel-plugin-macros'
import parseTte from './parseTte'
import getStyles from './getStyles'
import replaceWithLocation from './replaceWithLocation'
import { resolve } from 'path'
import { existsSync } from 'fs'

const TW_CLASSES_FILENAME = './styles.json'

export default createMacro(twinMacro, { configName: 'tailwind' })

function twinMacro({ babel: { types: t }, references, state, config }) {
  const sourceRoot = state.file.opts.sourceRoot || '.'
  const configPath = resolve(sourceRoot, config.file || TW_CLASSES_FILENAME)
  const configExists = existsSync(configPath)

  if (configExists) {
    const tailwindConfig = require(configPath)
    state.config = tailwindConfig
  } else {
    state.config = {}
  }

  references.default.forEach(path => {
    const parent = path.findParent(x => x.isTaggedTemplateExpression())
    if (!parent) return

    const parsed = parseTte({
      path: parent,
      types: t,
      state
    })
    if (!parsed) return

    replaceWithLocation(parsed.path, getStyles(parsed.str, t, state))
  })

  state.file.path.scope.crawl()
}
