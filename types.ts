
/** I couldn't find a better name for this. I'm sorry */
export interface ImageStyle {
	/** Class name to add to the span container */
	name: string,
	/** Arguments to pass to the span as CSS variables */
	vars?: StyleVariable[]
}

/** A single variable that will be passed to the span containing the image */
export interface StyleVariable {
	/** The variable name that comes after the prefix: --ois-${name} */
	name?: string,
	/** The value */
	value: string,
	/** The unit of numeric values like px or %. If not specified, default will be used */
	unit?: string
}


export class StyleREs {
	styleName: string
	styleVars: string
	numberVar: string
	textVar: string
	colorVar: string
	argVar: string

	constructor() {
		this.styleName = `(?<=^|\\s)([a-z]+(?:-[a-z]+)*)(?=\\s|-|$)`
		this.numberVar = `((?:(?:-[a-z]*[\\d.]+[a-z%]*)`
		this.textVar = `(?:-(?:[a-z]+:)?\\{.*?\\})`
		this.colorVar = `(?:-[a-z]*#(?:[\\da-fA-F]{3}|[\\da-fA-F]{6}|[\\da-fA-F]{8}))`
		this.argVar = `(?:-&.*?&))*)(?![\\w\\-\`{}:#&])`
	}
}

/*
regex101.com

class    class-name    c-n-n-n-n-n-n-n    style-name-is-lonk

c-1    c-1px    c-x1px c-n-x1px-1x-y12pxpx-y12pxpx-y12pxpx

c-""    c-n:"This is a picture\" right?"    c-n:"abc123\|/<>,.?!@#\" \" $%^&*()_+"-1px

c-#000    c-#000000    c-#112233aa    c-n#000    c-n#000000    c-n#112233aa

c-#()    c-#(1, 2, 3)    c-#(1, 2, 3, .5)    c-n#(1, 2, 3, 0.1)    c-n#(1, 2, 3, 0.1)

c-&&    c-&arg&    c-named&arg&    c-n&--a-r-g&

c-n-x1px-y.1em-"!@#$%^&*()_+||/.,?><\"q\""-n:"\""-n#123-n#(255 0 0 | .1)-n&arg&-&--var&

/(?<=^|\s)(?<name>[a-z]+(?:-[a-z]+)*)(?<args>(?:-(?:[a-z]*[\d.]+[a-z]*)|-(?:(?:[a-z]:)?(?:"[^"\\]*(?:\\.[^"\\]*)*"))|-(?:[a-z]*#(?:[a-fA-F\d]*?|\([\d\s.,|]*?\)))|-(?:[a-z]*&[a-z-:\s\(\)]*?&))*?)(?=\s|$)/

*/

