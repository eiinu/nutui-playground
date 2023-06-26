import { StoreOptions, File, ReplStore } from '@vue/repl'

const style = 'https://cdn.jsdelivr.net/npm/@nutui/nutui/dist/style.css'

const mainFile = `
<script setup lang="ts">
import { ref } from 'vue'
const msg = ref('Hello, NutUI!')
</script>
<template>
  <nut-button> {{ msg }} </nut-button>
</template>
`.trim()

const CONTAINER_FILE = 'Container.vue'
const MAIN_FILE = 'App.vue'
const INSTALL_FILE = 'install-nutui.js'

const containerCode = `\
<script setup>
import App from './App.vue'
import '@nutui/touch-emulator'
import {installNutUI} from './${INSTALL_FILE}'

installNutUI()
</script>

<template>
  <App />
</template>
`
const installCode = `
import NutUI from '@nutui/nutui'
import { getCurrentInstance } from 'vue'

const appendStyle = () => {
  return new Promise((resolve, reject) => {
    const style = document.createElement('style')
    style.innerHTML = '* { margin: 0; padding: 0; }'
    document.body.appendChild(style)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '${style}'
    link.onload = resolve
    link.onerror = reject
    document.body.appendChild(link)
  })
}
await appendStyle()

export const installNutUI = () => {
  const { parent } = window
  const instance = getCurrentInstance()
  instance.appContext.app.use(NutUI)
}
`
export class NutUIStore extends ReplStore {
  constructor(storeOptions?: StoreOptions) {
    super(storeOptions)
    if (!this.state.files[CONTAINER_FILE]) {
      const container = new File(CONTAINER_FILE, containerCode, true)
      this.addFile(container)
    } else {
      this.state.files[CONTAINER_FILE].hidden = true
    }
    if (!this.state.files[INSTALL_FILE]) {
      const install = new File(INSTALL_FILE, installCode, true)
      this.addFile(install)
    } else {
      this.state.files[INSTALL_FILE].hidden = true
    }
    if (!storeOptions?.serializedState) {
      const main = new File(MAIN_FILE, mainFile, false)
      this.addFile(main)
    }
    this.state.mainFile = CONTAINER_FILE
    this.setActive(MAIN_FILE)
  }
}