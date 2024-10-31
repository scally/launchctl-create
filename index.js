import { $ } from 'bun'
import { join } from 'path'
import { cwd } from 'process'

(async function() {
  const expandShellPath = async shellPath =>
    (await $`echo ${shellPath}`).text().trim()
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
  
  await $`launchctl unload ${plistPath}`
  await $`launchctl load ${plistPath}`  
})()
