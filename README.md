# launchctl-create

A simple tool to build & launch macOS launchctl services for people who don't love writing plist files.

```bash
bun index.js path-to-your-service-creator-function.js
```

```bash
bunx @scally/launchctl-create path-to-your-service-creator-function.js
```

## example configuration

Run `llama-server` pointed to a downloaded quantized GGUF file and keep it running.

```javascript
export default async function createService({expandShellPath}) {
  return {
    name: 'com.myservice.llm-service',
    args: [
      'opt/homebrew/bin/llama-server',
      '-m',
      await expandShellPath('~/Downloads/Llama-3.2-3B-Instruct-Q8_0.gguf'),
      '-c',
      '4096',
      '--port',
      '8080',
      '--host',
      '0.0.0.0',
      '-t',
      '16',
      '--mlock',
    ],
    keepAlive: true,
  }
}

```