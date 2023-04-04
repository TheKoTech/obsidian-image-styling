import { MarkdownPostProcessor, Plugin } from "obsidian"
import { styleUnits } from 'styleUnits'
import { OisSettingTab, OisSettings, DEFAULT_SETTINGS } from 'Settings'
import { parseExtension, parseStyles } from 'parsers'
import { StyleREs } from 'types'
// import { imageExtension } from 'imageExtension'

/** Image extensions that Obsidian accepts */
const imageExtensions = [`png`, `webp`, `jpg`, `jpeg`, `gif`, `bmp`, `svg`]

/** Recursively goes up the parent nodes of element to the last one */
const findRootParent = (element: HTMLElement): HTMLElement => {
	return element.parentElement ? findRootParent(element.parentElement) : element
}

/** Applies the styles to the span and passes their args as CSS variables */
const applyStyles = (span: HTMLSpanElement, alt: string) => {

	const styles = parseStyles(alt)
	const paragraph = span.parentElement

	// If height or width are specified, convert them into styles
	const spanWidth = span.attributes.getNamedItem(`width`)?.value
	if (spanWidth) {
		styles.push({ name: `w`, vars: [{ name: `num`, value: String(spanWidth) }] })
	}
	const spanHeight = span.attributes.getNamedItem(`height`)?.value
	if (spanHeight) {
		styles.push({ name: `h`, vars: [{ name: `num`, value: String(spanHeight) }] })
	}

	span.classList.add(`obsidian-image-styling`)

	// Add CSS classes
	styles.forEach(style => {
		span.classList.add(`ois-${style.name}`)

		// Create a separate span for the label and pass it the same CSS classes
		if (style.name.startsWith(`label`)) {

			const labelSpan = createSpan()
			labelSpan.classList.add(`ois-label-text`)
			paragraph?.insertAfter(labelSpan, span)

			const text = style.vars?.find(elem => elem.name === `str`)?.value
			labelSpan.innerText = text?.substring(1, text.length - 1) || ``
		}

		// The `banner` style requires the root div to be styled too.
		// The root div is the rendered markdown line container.
		// If only I could use the :has() operator...
		if (style.name === `banner`) {
			const div = findRootParent(span)
			div.classList.add(`ois-banner-container`)
		}
	})

	// Insert CSS variables
	styles.forEach(style => {
		style.vars?.forEach(v => {
			const varName = `--ois-${style.name}` + (v.name ? `-${v.name}` : ``)

			let unit = v.unit
			if (!unit && v.value.match(/^[\d.]+$/)) {
				unit = styleUnits[style.name] || ``
			}

			span.style.setProperty(varName, `${v.value}${unit}`)

			// Give the label the same variables
			const labelSpan: HTMLSpanElement | null | undefined = paragraph?.querySelector(`span.ois-label-text`)
			if (labelSpan) {
				labelSpan.style.setProperty(varName, `${v.value}${unit}`)
			}

			// Give banner's parent div the same variables
			const rootDiv = findRootParent(span)
			if (rootDiv.classList.contains(`ois-banner-container`)) {
				rootDiv.style.setProperty(varName, `${v.value}${unit}`)
			}
		})
	})
}

const imageStylingPostProcessor: MarkdownPostProcessor = (element) => {

	// Internal embeds are first stored in a span with all the HTML attributes.
	// There is a mandatory core plugin that fetches the internally embedded images and passes the span's attributes to it.
	const spans = element.querySelectorAll("span.internal-embed[src][alt]") as NodeListOf<HTMLSpanElement>

	if (spans.length > 0) {
		spans.forEach(span => {
			const src = span.attributes.getNamedItem(`src`)?.value
			const alt = span.attributes.getNamedItem(`alt`)?.value

			if (!src || !alt) return

			const fileExtension = parseExtension(src)

			// additional checks to only select images
			if (!fileExtension) return
			if (!imageExtensions.contains(fileExtension)) return
			if (alt === src) return

			applyStyles(span, alt)
		})
	}

	const images = element.querySelectorAll(`img[alt][src]`) as NodeListOf<HTMLImageElement>
	if (images.length > 0) {
		images.forEach(image => {
			if (image.alt === image.src) return false

			// Create a span, put the image in it and pass image's alt and src in it for styling.
			// This is needed for flexibility in writing CSS.
			const span = createSpan()
			image.parentElement?.insertBefore(span, image)
			span.setAttribute(`alt`, image.alt)
			span.setAttribute(`src`, image.src)
			span.appendChild(image)

			// if width and height aren't specified, the img.height and img.width inherit the source's dimensions.
			// img.attributes are defined only if they're specified in the HTML tag like <img widht="200">.
			const imageWidth = image.attributes.getNamedItem(`width`)?.value
			const imageHeight = image.attributes.getNamedItem(`height`)?.value
			if (imageWidth) { span.setAttribute(`width`, imageWidth) }
			if (imageHeight) { span.setAttribute(`height`, imageHeight) }

			applyStyles(span, image.alt)
		})
	}

}



export default class ImageStyling extends Plugin {

	settings: OisSettings
	/** One day I'll implement a setting to configure these. Not today though. */
	styleREs: StyleREs

	override async onload(): Promise<void> {
		await this.loadSettings()
		this.styleREs = new StyleREs()
		this.addSettingTab(new OisSettingTab(this.app, this))

		this.registerMarkdownPostProcessor(imageStylingPostProcessor)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
