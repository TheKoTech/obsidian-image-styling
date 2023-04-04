import { ImageStyle, StyleVariable } from 'types'

/** Parses the file extension from the given string */
export const parseExtension = (fileName: string): string | undefined => fileName.match(/(?<=\.)[\d\w]+$/)?.pop()?.toLowerCase()

/** 
 * Parses a string for styles with the following syntax: 
 * 
 * `{style-name}-{param123unit}-{textparam:`value of the text param`}.`
 * 
 * Styles must be separate with spaces or symbols like `;`, `|`.
 */
export const parseStyles = (alt: string): ImageStyle[] => {

	/** 
	 * This hideous regex matches the syntax in 4 parts - lookbehind, class-name, args, lookahead.
	 * If you want to know how it works, go to https://regex101.com 
	 * */
	const match = [...alt.matchAll(
		/(?<![\w\-`:#&])([a-z]+(?:-[a-z]+)*)((?:(?:-[a-z]*[\d.]+[a-z%]*)|(?:-(?:[a-z]+:)?\{.*?\})|(?:-[a-z]*#(?:[\da-fA-F]{3}|[\da-fA-F]{6}|[\da-fA-F]{8}))|(?:-&.*?&))*)(?![\w\-`{}:#&])/g
	)]
	return match.map(style => {
		// todo: wtf is this

		const res = {} as ImageStyle
		let vars: StyleVariable[] | undefined
		if (style[2]) {
			vars = parseVariables(style[2])
		}

		res.name = style[1]
		res.vars = vars

		return res
	})
}

/** Parses the given string into StyleVariables. Assumes the args are written correctly. */
const parseVariables = (varString: string): StyleVariable[] => {
	/** The regex matches 3 types of variables - numeric, text and color. It returns 3 groups - name, value and unit. */
	const matches = [...varString.matchAll(
		/(?<=-)([a-z]*)([\d.]+|(?:(?::)?\{.*?\})|(?:#[\da-fA-F]*)|(?:&.*?&))([a-z%]*)/g
	)]
	const bullshitResult: StyleVariable[] =
		matches.map(match => {
			let name = match[1]

			if (!name) {
				// different default names allow to write multi-arg styles like border-1px-#fff-$dotted$
				if (match[2].match(/^[\d.]+$/)) name = `num`
				if (match[2].match(/\}$/)) name = `str`
				if (match[2].match(/^#/)) name = `col`
				if (match[2].match(/&$/)) name = `arg`
			}

			let value = match[2]
			/** The regex matches `}` at the end - indicates a string value*/
			if (value.match(/\}$/)) {
				/** The regex matches anything between curly braces */
				value = `'${value.match(
					/(?<=\{)(.*)(?=\})/
				)?.pop()}'`
			}
			if (value.match(/&$/)) {
				value = value.match(/(?<=&).*(?=&)/)?.pop() || ``
			}

			const res = {
				name: name,
				value: value,
				unit: match[3]
			} as StyleVariable

			return res as StyleVariable
		})


	return bullshitResult
}

