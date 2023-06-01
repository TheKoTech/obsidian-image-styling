import ImageStyling from './main'
import { App, PluginSettingTab, Setting } from 'obsidian'

export interface OisSettings {
	prefix: string
	defaultObjectFit: string
}

export const DEFAULT_SETTINGS: OisSettings = {
	prefix: ``,
	defaultObjectFit: `cover`
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

		containerEl.createEl(`h2`, { text: `Image Styling` })

		new Setting(containerEl)
			.setName(`Prefix`)
			.setDesc(`Requires reload! Specify a prefix for styles: .w-100 or !card`)
			.addText(text =>
				text
					.setPlaceholder(`Examples: . ! @ :`)
					.setValue(this.plugin.settings.prefix)
					.onChange(async value => {
						this.plugin.settings.prefix = value
						await this.plugin.saveSettings()
					})
			)

		new Setting(containerEl)
			.setName(`Image scaling method`)
			.setDesc(`Requires reload! Changes how Obsidian scales images`)
			.addDropdown(dropdown =>
				dropdown
					.addOption(`cover`, `Scale up to fill (default)`)
					.addOption(`fill`, `Stretch (obsidian default)`)
					.addOption(`contain`, `Scale down to contain`)
					.setValue(this.plugin.settings.defaultObjectFit)
					.onChange(async value => {
						this.plugin.settings.defaultObjectFit = value
						await this.plugin.saveSettings()
					})
			)
	}
}
