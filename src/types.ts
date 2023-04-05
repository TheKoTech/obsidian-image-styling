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
