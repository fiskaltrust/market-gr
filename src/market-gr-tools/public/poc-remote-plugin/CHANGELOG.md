# Changelog

## 2026.05.1

- Initial proof-of-concept remote plugin. Loaded at runtime via the apphost's
  `remotePluginLoader`. Demonstrates the dependency-injection contract
  (the apphost passes its own `React` to the plugin so hooks and context
  remain in a single realm).
