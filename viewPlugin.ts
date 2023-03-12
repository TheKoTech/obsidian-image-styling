import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
} from "@codemirror/view";

class MyViewPlugin implements PluginValue {
  constructor(view: EditorView) {
    // ...
  }

  update(update: ViewUpdate) {
		if (update.docChanged) {
			console.log(`Doc change`)
		}
		if (update.viewportChanged) {
			console.log(`Viewport change`)
		}
  }

  destroy() {
    // ...
  }
}

export const myViewPlugin = ViewPlugin.fromClass(MyViewPlugin);
