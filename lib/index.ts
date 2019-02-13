import { Compiler } from "webpack"
import * as path from "path"
import * as fs from "fs"

import mockup from "etty-mockup"

const Reset = "\x1b[0m"
const Bright = "\x1b[1m"
const Dim = "\x1b[2m"
const Underscore = "\x1b[4m"
const Blink = "\x1b[5m"
const Reverse = "\x1b[7m"
const Hidden = "\x1b[8m"

const FgBlack = "\x1b[30m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"
const FgBlue = "\x1b[34m"
const FgMagenta = "\x1b[35m"
const FgCyan = "\x1b[36m"
const FgWhite = "\x1b[37m"

const BgBlack = "\x1b[40m"
const BgRed = "\x1b[41m"
const BgGreen = "\x1b[42m"
const BgYellow = "\x1b[43m"
const BgBlue = "\x1b[44m"
const BgMagenta = "\x1b[45m"
const BgCyan = "\x1b[46m"
const BgWhite = "\x1b[47m"

interface EttyPluginOptions {
	template: string,
	locales: string,
	compileTo: string
	prefillFrom?: string,
	logLevel?: "all" | "warning" | "error" | "none",
	minify?: boolean
}

export default class EttyPlugin {
	options: EttyPluginOptions
	mhashes: { [key: string]: string } = {}

	constructor(options: EttyPluginOptions) {
		this.options = {} as EttyPluginOptions
		this.options.template = path.resolve(options.template)
		this.options.locales = path.resolve(options.locales)
		this.options.compileTo = path.resolve(options.compileTo)
		this.options.prefillFrom = options.prefillFrom
			? path.resolve(options.prefillFrom)
			: this.options.compileTo
		this.options.logLevel = ["all", "warning", "error", "none"].includes(options.logLevel)
			? options.logLevel
			: "all"
		this.options.minify = options.minify || false
	}

	apply(compiler: Compiler) {
		compiler.hooks.emit.tapAsync('EttyPlugin', (compilation, done) => {
			this.__info("Checking updated modules...")
			var changedModules = compilation.modules.filter(mdl => {
				if (/\/node_modules\//.test(mdl.id) || !mdl.hash || !mdl.resource)
					return false
				var old = this.mhashes[mdl.resource]
				this.mhashes[mdl.resource] = mdl.hash
				return mdl.hash != old
			}).map(mdl => mdl.resource)

			var { length } = changedModules
			this.__info(`There ${length == 1 ? "is" : "are"} ${length} updated module${length == 1 ? "" : "s"}`)

			var { locales, template } = this.options
			var shouldCompile = false
			if (changedModules.includes(template)) {
				this.__info("template was changed, recompiling translations...")
				shouldCompile = true
			} else if (changedModules.includes(locales)) {
				this.__info("locales were changed, recompiling translations...")
				shouldCompile = true
			}

			if (shouldCompile)
				this.__makeTranslations()
			else
				this.__info("No changes related to translations. Nothing to compile.")

			done()
		})
	}

	__makeTranslations = () => {
		var error = false
		try {
			var template = JSON.parse(fs.readFileSync(this.options.template, { encoding: "utf8" }))
			var locales = JSON.parse(fs.readFileSync(this.options.locales, { encoding: "utf8" })) as string[]
			locales.forEach(locale => {
				console.log("")
				var readPath = `${this.options.prefillFrom}/${locale}.json`
				var writePath = `${this.options.compileTo}/${locale}.json`
				var spacesCount = this.options.minify ? 0 : 4

				var lastTranslate
				try {
					this.__info(`Reading prefill for ${FgBlue}${locale}${FgWhite}...`)
					lastTranslate = JSON.parse(fs.readFileSync(readPath, { encoding: "utf8" }))
				} catch (e) {
					this.__warning(`Prefill for ${FgBlue}${locale}${FgWhite} not found`)
					lastTranslate = {}
				}

				this.__info(`Generating translation for ${FgBlue}${locale}${FgWhite}`)
				var translation = mockup(template, locale, lastTranslate)
	
				try {
					this.__info(`Writing ${FgBlue}${locale}.json${FgWhite}`)
					fs.writeFileSync(writePath, JSON.stringify(translation, null, spacesCount))
				} catch (e) {
					if (e.code == "ENOENT") {
						this.__warning("Target folder does not exist!")
						this.__info("Creating folder...")
						fs.mkdirSync(this.options.compileTo)
						fs.writeFileSync(writePath, JSON.stringify(translation, null, spacesCount))		
					} else {
						throw new Error(`Unknown error during writing ${locale} translation file. ${e.code}`)
					}
				}
				this.__success(`Successfully created ${FgBlue}${locale}.json${FgWhite}!`)
			})
		} catch (e) {
			error = true
			this.__error(e.message || (e.toString && e.toString()) || e)
		}
		console.log("")
		if (error)
			this.__error(`Failed to compile translations :(`)
		else
			this.__success(`Translations are successfully compiled! :)`)
	}

	/* Loggers */

	__ettyLog = `${Dim}${FgYellow}｢etty｣${Reset}:`

	__info = (message: string) => {
		if (this.options.logLevel == "all")
			console.log(`${FgBlue}ℹ ${this.__ettyLog} ${message}`)
	}

	__error = (message: string) => {
		if (this.options.logLevel != "none")
		console.log(`${FgRed}✖ ${this.__ettyLog} ${message} ${FgRed}`)
	}

	__success = (message: string) => {
		if (this.options.logLevel == "all")
			console.log(`${FgGreen}✔ ${this.__ettyLog} ${message}`)
	}

	__warning = (message: string) => {
		if (["all", "warning"].includes(this.options.logLevel))
			console.log(`${FgYellow}⚠ ${this.__ettyLog} ${message}`)
	}
}