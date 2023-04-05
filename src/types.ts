/** A single style to apply to an image */
export interface ImageStyle {
	/** Class name to add to the parent span container */
	name: string,
	/** Arguments to pass to the parent span container as CSS variables */
	args?: StyleArg[]
}

/** A single variable that will be passed to the span containing the image */
export interface StyleArg {
	/** The variable name that comes after the prefix: `--ois-${name}`. If not specified, set to default */
	name?: string,
	/** The value - a string, a number, a color or a raw CSS value */
	value: string,
	/** The unit of numeric values like `px` or `%`. If not specified, set to default */
	unit?: string
}

/** 
 * Contains the regular expressions to parse any part of a style 
 * 
 *     Style syntax: `style-name-${args}`
 *     Arguments syntax: `${argName}${argValue}${argUnit}`
 *     Example: `style-name-num10px-"text"`
 */
export class StyleREs {
	/** Matches the name of a style */
	styleName: RegExp
	/** Matches the name part of an argument */
	argName: RegExp
	/** Matches the value of a numeric argument */
	numericValue: RegExp
	/** Matches the value of a text argument. Skips escape characters (\") */
	textValue: RegExp
	/** Matches the value of a color argument. Accepts #hex and #(r, g, b, a) values */
	colorValue: RegExp
	/** Matches the value of a raw argument */
	rawValue: RegExp
	/** Matches the unit part of an argument (px, em, %) */
	argUnit: RegExp
	/** Matches the value of an argument */
	argValue: RegExp
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
		const textValue = `"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"`
		const colorValue = `(?:#\\([\\d\\s.,|]*?\\)|#[a-fA-F\\d]*)`
		const rawValue = `&[^&\\\\]*(?:\\\\.[^&\\\\]*)*&`
		
		// argument parts
		const argName = `(?<argName>[a-z]*)`
		const argUnit = `(?<argUnit>[a-z%]*)`
		const argValue = `(?<argValue>${numericValue}|${textValue}|${colorValue}|${rawValue})`

		const arg = `(?:-${argName}${argValue}${argUnit})`
		const allArgs = `(?<args>${arg}+)`

		const style = `(?<=^|\\s)${styleName}${allArgs}?(?=\\s|$)`

		this.styleName = new RegExp(styleName)
		this.argName = new RegExp(argName)
		this.numericValue = new RegExp(numericValue)
		this.textValue = new RegExp(textValue)
		this.colorValue = new RegExp(colorValue)
		this.rawValue = new RegExp(rawValue)
		this.argUnit = new RegExp(argUnit)
		this.argValue = new RegExp(argValue)
		this.arg = new RegExp(arg, `g`)
		this.allArgs = new RegExp(allArgs, `g`)
		this.style = new RegExp(style, `g`)
		console.log(this.arg)
		console.log(this.style)
	}
}

/*
This is all the different variations of style names and arguments. I used this to write that hideous regex below

Test the regex: https://regex101.com, 27 matches

class    class-name    c-n-n-n-n-n-n-n    style-name-is-lonk

c-1    c-1px    c-x1px c-n-x1px-1x-y12pxpx-y12pxpx-y12pxpx

c-""    c-n"This is a picture\" right?"    c-n"abc123\|/<>,.?!@#\" \" $%^&*()_+"-1px

c-#000    c-#000000    c-#112233aa    c-n#000    c-n#000000    c-n#112233aa

c-#()    c-#(1, 2, 3)    c-#(1, 2, 3, .5)    c-n#(1, 2, 3, 0.1)    c-n#(1, 2, 3, 0.1)

c-&&    c-&arg&    c-named&arg&    c-n&--a-r-g(.1, 0)&

c-n-x1px-y.1em-"!@#$%^&*()_+||/.,?><:;'\"q\""-n"\""-n#123-n#(255 0 0 | .1)-n&arg&-&--var&

/         (  styleName                   )(  arg      (  argName       )(  argValue  num  |  str                   |  col                            |  raw                   )(  argUnit         ) )         /g
/(?<=^|\s)(?<styleName>[a-z]+(?:-[a-z]+)*)(?<args>(?:-(?<argName>[a-z]*)(?<argValue>[\d.]+|"[^"\\]*(?:\\.[^"\\]*)*"|(?:#[a-fA-F\d]*|#\([\d\s.,|]*?\))|&[^&\\]*(?:\\.[^&\\]*)*&)(?<argUnit>[a-z%]*))+)?(?=\s|$)/g
*/
