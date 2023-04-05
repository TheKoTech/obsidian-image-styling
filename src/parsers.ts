import { ImageStyle, StyleArg, StyleREs } from './types'

/** Parses the file extension from the given string */
export const parseExtension = (fileName: string): string | undefined => fileName.match(/(?<=\.)[\d\w]+$/)?.pop()?.toLowerCase()

/** Parses a string into style objects */
export const parseStyles = (alt: string, styleREs: StyleREs): ImageStyle[] => {
	const matches = [...alt.matchAll(styleREs.style)]
	return matches.map(match => ({
		// always present
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		name: match.groups!.styleName,
		args: parseArgs(match.groups?.args, styleREs)
	} as ImageStyle))
}

/** Parses the given string into StyleArgs. Assumes the args are written correctly. */
const parseArgs = (varString: string | undefined, styleREs: StyleREs): StyleArg[] => {
	if (!varString) return []

	const matches = [...varString.matchAll(styleREs.arg)]
	console.log(`parseVariables matches`, ...matches)
	return matches.map(match => {

		// always present
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		let name = match.groups!.argName

		// always present
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		let value = match.groups!.argValue

		if (!name) {
			// different default names allow to write multi-arg styles like border-1px-#fff-$dotted$
			if (value.match(/^[\d.]+$/)) name = `num`
			if (value.match(/^".*"$/)) name = `str`
			if (value.match(/^#/)) name = `col`
			if (value.match(/^&.*&$/)) name = `arg`
		}

		if (value.match(/^&.*&$/)) {
			value = value.slice(1, value.length - 1)
		}

		if (value.match(/^#\(.*\)$/)) {
			value = `rgba(${value.slice(2, value.length - 1)})`
		}

		const res = {
			name: name,
			value: value,
			// always present
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			unit: match.groups!.argUnit
		} as StyleArg

		console.log(`style: `, res, `match: `, match)


		return res as StyleArg
	})
}

