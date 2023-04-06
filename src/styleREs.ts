
/** 
 * Contains the regular expressions to parse any part of a style
 * 
 *     Style syntax: `style-name-${args}`
 *     Arguments syntax: `${argName}${argValue}${argUnit}`, name and unit are optinal
 *     Example: `style-name-num10px-"text"`
 */
export class StyleREs {
	/** Matches a string that is a valid numericValue */
	numericValueCheck: RegExp
	/** Matches a string that is a valid stringValue */
	stringValueCheck: RegExp
	/** Matches a string that is a valid colorValue */
	colorValueCheck: RegExp
	/** Matches a string that is a valid hex colorValue */
	rgbaColorCheck: RegExp
	/** Matches a string that is a valid rawValue */
	rawValueCheck: RegExp

	/** Matches a single argument */
	arg: RegExp
	/** Matches all arguments of a style and returns a group named "arg" */
	allArgs: RegExp
	/** Matches the whole style and always returns two groups named "styleName" and "arg" */
	style: RegExp

	constructor(prefix?: string) {
		// I'm storing the regular expressions into strings to reuse them for larger regexes
		const styleName = `(?<styleName>[a-z]+(?:-[a-z]+)*)`

		// values
		const numericValue = `[\\d.]+`
		const stringValue = `(?:".*?"|'.*?'|\\{.*?\\})`
		const rgbaColorValue = `#\\([\\d\\s.,|]*?\\)`
		const hexColorValue = `#[a-fA-F\\d]*`
		const colorValue = `(?:${rgbaColorValue}|${hexColorValue})`
		const rawValue = `&.*?&`

		// value checkers
		const numericValueCheck = `^${numericValue}$`
		const stringValueCheck = `^${stringValue}$`
		const colorValueCheck = `^${colorValue}$`
		// const hexColorCheck = `^${hexColorValue}$`
		const rgbaColorCheck = `^${rgbaColorValue}$`
		const rawValueCheck = `^${rawValue}$`

		// argument parts
		const argName = `(?<argName>[a-z]*)`
		const argUnit = `(?<argUnit>[a-z%]*)`
		const argValue = `(?<argValue>${numericValue}|${stringValue}|${colorValue}|${rawValue})`

		// whole arguments
		const arg = `(?:-${argName}${argValue}${argUnit})`
		const allArgs = `(?<args>${arg}+)`

		const pref = prefix ? `(${prefix})` : `^|\\s`

		const style = `(?<=${pref})${styleName}${allArgs}?(?=\\s|$)`

		this.numericValueCheck = new RegExp(numericValueCheck)
		this.stringValueCheck = new RegExp(stringValueCheck)
		this.colorValueCheck = new RegExp(colorValueCheck)
		this.rgbaColorCheck = new RegExp(rgbaColorCheck)
		this.rawValueCheck = new RegExp(rawValueCheck)
		this.arg = new RegExp(arg, `g`)
		this.allArgs = new RegExp(allArgs, `g`)
		this.style = new RegExp(style, `g`)
	}
}

/*
This is the resulting regular expression:

/(?<=^|\s)(?<styleName>[a-z]+(?:-[a-z]+)*)(?<args>(?:-(?<argName>[a-z]*)(?<argValue>[\d.]+|(?:".*?"|'.*?'|\{.*?\})|(?:#\([\d\s.,|]*?\)|#[a-fA-F\d]*)|&.*?&)(?<argUnit>[a-z%]*))+)?(?=\s|$)/g



This is all the different variations of style names and arguments. I used this text to write that hideous regex

https://regex101.com, 27 matches

class    class-name    c-n-n-n-n-n-n-n    style-name-is-lonk

c-1    c-1px    c-x1px c-n-x1px-1x-y12pxpx-y12pxpx-y12pxpx

c-""    c-n"text"    c-n"abc123\|/<>,.?!@#$%^&*()_+"-1px

c-''    c-n'text'    c-n'abc123\|/<>,.?!@#$%^&*()_+'-1px

c-""    c-n{text}    c-n{abc123\|/<>,.?!@#$%^&*()_+}-1px

c-#000    c-#000000    c-#112233aa    c-n#000    c-n#000000    c-n#112233aa

c-#()    c-#(1, 2, 3)    c-#(1, 2, 3, .5)    c-n#(1, 2, 3, 0.1)    c-n#(1, 2, 3, 0.1)

c-&&    c-&arg&    c-named&arg&    c-n&--a-r-g(.1, 0)&

c-n-x1px-y.1em-"!@#$%^&*()_+||/.,?><:;'\"q\""-n"\""-n#123-n#(255 0 0 | .1)-n&arg&-&--var&

*/
