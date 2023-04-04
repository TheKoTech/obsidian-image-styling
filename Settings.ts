import ImageStyling from 'main'
import { App, PluginSettingTab, Setting } from 'obsidian'

export interface OisSettings {
	prefix: string,
	defaultObjectFit: string
}

export const DEFAULT_SETTINGS: OisSettings = {
	prefix: `e`,
	defaultObjectFit: `contain`
}

// This is for settings if I ever need any
export class OisSettingTab extends PluginSettingTab {
	plugin: ImageStyling

	constructor(app: App, plugin: ImageStyling) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		containerEl.createEl(`h1`, { text: `Image Styling` })

		console.log(`display`, this.plugin.settings)

		// new Setting(containerEl)
		// 	.setName(`Prefix`)
		// 	.setDesc(`With a prefix styles will work only if you add this prefix in the beginning — [.w-400 .h-200]`)
		// 	.addText(text => text
		// 		.setPlaceholder(`Examples: . ! @`)
		// 		.setValue(this.plugin.settings.prefix)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.prefix = value
		// 			await this.plugin.saveSettings()
		// 		})
		// 	)

		new Setting(containerEl)
			.setName(`Image positioning behavior`)
			.setDesc(`Changes how Obsidian renders images`)
			.addDropdown(dropdown => dropdown
				.setValue(this.plugin.settings.defaultObjectFit)
				.addOption(`cover`, `Scale up to fill (default)`)
				.addOption(`fill`, `Stretch to fill`)
				.addOption(`contain`, `Scale down to contain`)
				.onChange(async (value) => {
					this.plugin.settings.defaultObjectFit = value
					await this.plugin.saveSettings()
				})
			)
	}
}
