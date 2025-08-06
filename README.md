# DHL Tracker Card

A custom Lovelace card for Home Assistant that displays all active DHL package tracking sensors from the [dhl_tracker](https://github.com/nk-designz/home-assistant-dhl-tracker) integration.

## Installation (via HACS)

1. Add this repo to HACS as a custom repository (type: plugin).
2. Install `DHL Tracker Card`.
3. Add it as a resource:

```yaml
url: /hacsfiles/dhl-tracker-card/dhl-tracker-card.js
type: module
```
