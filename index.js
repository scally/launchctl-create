#!/usr/bin/env bun

import { $ } from 'bun'
import { join } from 'path'
import { cwd } from 'process'

(async function() {
  const expandShellPath = async shellPath =>
    (await $`echo ${shellPath}`.quiet().text()).trim()

  const creatorImportPath = join(cwd(), Bun.argv[2] || 'service.js')
  const creator = (await import(creatorImportPath)).default
  const spec = typeof creator === 'function' ? await creator({
    expandShellPath,
  }) : creator
  
  const plistPath = await expandShellPath(`~/Library/LaunchAgents/${spec.name}.plist`)  
  console.log(`Creating service at ${plistPath}`)
  
  const args = spec.args.map(arg => `<string>${arg}</string>`).join('\n')
  const keepAlive = spec.keepAlive ? '<true/>' : '<false/>'
  
  await Bun.write(
    plistPath,
  `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
  <key>Label</key>
  <string>${spec.name}</string>
  <key>ProgramArguments</key>
  <array>
  ${args}
  </array>
  <key>KeepAlive</key>
  ${keepAlive}
  </dict>
  </plist>
  `)

  if ((await $`launchctl list ${spec.name}`.nothrow().quiet()).exitCode === 0) {
    console.log(`Service ${spec.name} already registered. Attempting removal at ${plistPath}...`)
    await $`launchctl unload ${plistPath}`
  }
  
  console.log('Registering service...')
  await $`launchctl load ${plistPath}`  

  console.log('Done!')
})()
