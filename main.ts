import { MarkdownPostProcessor, Plugin } from "obsidian"
import { styleUnits } from './src/styleUnits'
import { OisSettingTab, OisSettings, DEFAULT_SETTINGS } from './src/Settings'
import { parseExtension, parseStyles } from './src/parsers'
import { StyleREs } from './src/styleREs'

export default class ImageStyling extends Plugin {

	settings: OisSettings
	styleREs: StyleREs

	override async onload(): Promise<void> {
		await this.loadSettings()
		this.styleREs = new StyleREs(this.settings.prefix)
		this.addSettingTab(new OisSettingTab(this.app, this))

		this.registerMarkdownPostProcessor(
			this.getPostProcessor()
		)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


	/** Applies the styles to the span and passes their args as CSS variables */
	applyStyles = (span: HTMLSpanElement, alt: string) => {

		span.classList.add(`ois`)
		span.style.setProperty(`--ois-default-object-fit`, this.settings.defaultObjectFit ?? `cover`)

		const styles = parseStyles(alt, this.styleREs)
		const paragraph = span.parentElement

		// If height or width are specified, convert them into styles
		const spanWidth = span.attributes.getNamedItem(`width`)?.value
		if (spanWidth) {
			styles.push({
				name: `w`, args: [{ name: `num`, value: String(spanWidth) }]
			})
		}
		const spanHeight = span.attributes.getNamedItem(`height`)?.value
		if (spanHeight) {
			styles.push({
				name: `h`, args: [{ name: `num`, value: String(spanHeight) }]
			})
		}

		// Add CSS classes
		styles.forEach(style => {
			span.classList.add(`ois-${style.name}`)

			// todo: docs, extract
			if (style.name.match(/^(label|text|title)/)) {

				const text = style.args?.find(elem => elem.name === `str`)?.value

				if (text) {
					let textWrapper = this.selectParent(span, `div.ois-text-wrapper`)
					const textContainer = createSpan()
					textContainer.classList.add(`ois-${style.name}-container`)
					textContainer.innerText = text.substring(1, text.length - 1)
					
					console.log(1)
					if (!textWrapper) {
						textWrapper = createDiv()
						textWrapper.classList.add(`ois-text-wrapper`)
						textWrapper.appendChild(span)
						paragraph?.insertAfter(textWrapper, span)
					}
					textWrapper.appendChild(textContainer)
					console.log(2)
				}

			}

			// The `banner` style requires the root div to be styled too.
			// The root div is a line in rendered markdown.
			// If only I could use the :has() operator...
			if (style.name === `banner`) {
				const div = this.findRootParent(span)
				div.classList.add(`ois-banner-container`)
			}
		})

		// Insert CSS variables
		styles.forEach(style => {
			const labelWrapper: HTMLSpanElement | null | undefined = paragraph?.querySelector(`.ois-text-wrapper`)
			const label: HTMLSpanElement | null | undefined = paragraph?.querySelector(`.ois-label-text`)

			style.args?.forEach(v => {
				const varName = `--ois-${style.name}` + (v.name ? `-${v.name}` : ``)

				let unit = v.unit
				if (!unit && v.value.match(/^[\d.]+$/)) {
					unit = styleUnits[style.name] || ``
				}

				span.style.setProperty(varName, `${v.value}${unit}`)

				// Give the label the same variables
				if (label) {
					label.style.setProperty(varName, `${v.value}${unit}`)
				}
				if (labelWrapper) {
					labelWrapper.style.setProperty(varName, `${v.value}${unit}`)
				}

				// Give banner's parent div the same variables
				const rootDiv = this.findRootParent(span)
				if (rootDiv.classList.contains(`ois-banner-container`)) {
					rootDiv.style.setProperty(varName, `${v.value}${unit}`)
				}
			})
			if (labelWrapper) {
				labelWrapper.classList.add(`ois-${style.name}`)
			}
		})
	}

	/** 
	 * Returns the MarkdownPostProcessor that converts `<img>` and `<span>` elements with ALT into styled images
	 * @param styleREs - the RE object that will be used to parse styles
	 */
	getPostProcessor = (): MarkdownPostProcessor => {

		return (element) => {

			// Internal embeds are first stored in a span with all the HTML attributes.
			// There is a mandatory core plugin that fetches the internally embedded images and passes the span's attributes to it.
			const spans = element.querySelectorAll(`span.internal-embed[src][alt]`) as NodeListOf<HTMLSpanElement>

			if (spans.length > 0) {
				spans.forEach(span => {
					const src = span.attributes.getNamedItem(`src`)?.value
					const alt = span.attributes.getNamedItem(`alt`)?.value

					if (!src || !alt) return

					const fileExtension = parseExtension(src)

					// additional checks to only select images
					if (!fileExtension) return
					const acceptedExtensions = [`png`, `webp`, `jpg`, `jpeg`, `gif`, `bmp`, `svg`]
					if (!acceptedExtensions.contains(fileExtension)) return
					if (alt === src) return

					this.applyStyles(span, alt)
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

					this.applyStyles(span, image.alt)
				})
			}
		}
	}

	/** Recursively goes up the parent nodes of an HTML element to the last one */
	findRootParent = (element: HTMLElement): HTMLElement =>
		element.parentElement ? this.findRootParent(element.parentElement) : element

	/** Recursively goes up the parent nodesto find the first parent that matches query */
	selectParent = (element: HTMLElement, query: string): HTMLElement | undefined => {
		if (!element.parentElement) return
		if (element.matchParent(query)) return element.parentElement
		return this.selectParent(element.parentElement, query)
	}

}
