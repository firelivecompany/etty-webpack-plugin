import { Compiler, compilation } from "webpack"
import { Tap } from "tapable"

interface EttyPluginOptions {
	locales?: "",
	compileTo?: ""
	prefillFrom?: ""
}

export default class EttyPlugin {
	options: EttyPluginOptions
	mhashes: { [key: string]: string } = {}

	constructor(options: EttyPluginOptions) {
		this.options = options
		// if (!this.options.prefillFrom)
		// 	this.options.prefillFrom = this.options.compileTo
	}

	apply(compiler: Compiler) {
		compiler.hooks.emit.tapAsync('MyPlugin', (compilation, done) => {
			var changedModules = compilation.modules.filter(mdl => {
				if (/\/node_modules\//.test(mdl.id) || !mdl.hash || !mdl.resource)
					return false
				var old = this.mhashes[mdl.resource]
				this.mhashes[mdl.resource] = mdl.hash
				return mdl.hash != old
			}).map(mdl => mdl.resource)

			console.log(changedModules)
			done()
		})
	}
}