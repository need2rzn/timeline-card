# Timeline Card

A custom Lovelace card for Home Assistant that renders a vertical,
alternating timeline of recent events for one or more entities.\
Supports per-entity configuration, localized time and state labels, icon
mapping, and flexible filtering.

![Timeline Card preview](./docs/screenshot.png)

------------------------------------------------------------------------

## ✨ Features

-   Alternating left/right timeline layout with a central gradient line\
-   Configurable history range (in hours)\
-   Global limit for the number of events shown\
-   Per-entity configuration (name, icons, colors, status labels,
    filters)\
-   Localized **relative time** (e.g. "5 minutes ago") or **absolute
    datetime**\
-   Locale-based state translation with per-entity overrides\
-   Works with any entity that appears in Home Assistant history

------------------------------------------------------------------------

## 📦 Installation

### HACS (planned)

Until the repository is added to HACS, use manual installation.

### Manual Installation

1.  Copy `timeline-card.js` into your Home Assistant `www` folder:

```{=html}
<!-- -->
```
    /config/www/timeline-card/timeline-card.js

2.  Add the resource to your dashboard configuration:

``` yaml
resources:
  - url: /local/timeline-card/timeline-card.js
    type: module
```

Or via UI:\
**Settings → Dashboards → Three dots → Resources → Add resource**

------------------------------------------------------------------------

## 🌐 Locales

The card uses JSON-based localization.\
Create the following directory structure:

    /www/timeline-card/locales/en.json
    /www/timeline-card/locales/de.json

Language selection order:

1.  `language:` option in YAML\
2.  Home Assistant UI language\
3.  Browser language\
4.  Fallback → English

### Example `en.json`

{ "time": { "seconds": "a few seconds ago", "minutes": "{n} minutes
ago", "hours": "{n} hours ago", "days": "{n} days ago" }, "status": {
"locked": "locked", "unlocked": "unlocked", "open": "open", "closed":
"closed", "on": "on", "off": "off", "home": "home", "not_home": "away"
}, "date_format": { "datetime": { "day": "2-digit", "month": "2-digit",
"year": "numeric", "hour": "2-digit", "minute": "2-digit" } } }

### Example `de.json`

{ "time": { "seconds": "vor wenigen Sekunden", "minutes": "vor {n}
Minuten", "hours": "vor {n} Stunden", "days": "vor {n} Tagen" },
"status": { "locked": "abgeschlossen", "unlocked": "geöffnet", "open":
"offen", "closed": "geschlossen", "on": "an", "off": "aus", "home": "zu
Hause", "not_home": "abwesend" }, "date_format": { "datetime": { "day":
"2-digit", "month": "2-digit", "year": "numeric", "hour": "2-digit",
"minute": "2-digit" } } }

------------------------------------------------------------------------

## ⚙️ Configuration

### Basic Example

``` yaml
type: custom:timeline-card
title: Door & Presence
hours: 12
limit: 8
relative_time: true
show_states: true
entities:
  - entity: binary_sensor.frontdoor_contact
  - entity: person.tobi
```

### Card Options

  -------------------------------------------------------------------------
  Option               Type          Required    Default    Description
  -------------------- ------------- ----------- ---------- ---------------
  `entities`           list          yes         ---        List of
                                                            entities or
                                                            config objects

  `hours`              number        yes         ---        Number of hours
                                                            of history to
                                                            fetch

  `limit`              number        yes         ---        Max number of
                                                            events
                                                            displayed

  `title`              string        no          ""         Card title

  `relative_time`      boolean       no          false      Use relative
                                                            ("5 minutes
                                                            ago") time

  `show_states`        boolean       no          true       Show state next
                                                            to the entity
                                                            name

  `language`           string        no          auto       Language code
                                                            (e.g. `en`,
                                                            `de`)
  -------------------------------------------------------------------------

------------------------------------------------------------------------

## 🧩 Per-Entity Configuration

### Example

``` yaml
entities:
  - entity: binary_sensor.frontdoor_contact
    name: Front Door
    icon: mdi:door
    icon_color: "#ffcc00"
    icon_color_map:
      on: "#ff4444"
      off: "#44ff44"
    icon_map:
      on: mdi:door-open
      off: mdi:door-closed
      default: mdi:door
    status_map:
      on: "opened"
      off: "closed"
    include_states:
      - on
      - off
```

### Entity Options

  -----------------------------------------------------------------------
  Option                           Type            Description
  -------------------------------- --------------- ----------------------
  `name`                           string          Display name override

  `icon`                           string          Static icon

  `icon_map`                       object          State → icon

  `icon_color`                     string          Static color

  `icon_color_map`                 object          State → color

  `status_map`                     object          State → label override

  `include_states`                 list            Only show events whose
                                                   raw state is in this
                                                   list
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 🔧 How Icons Are Resolved

Priority order:

1.  `icon_map[state]`\
2.  `icon`\
3.  `icon_map.default`\
4.  HA native icon\
5.  Device class icons\
6.  Domain icons\
7.  Generic icons (`on`, `off`, `open`, `closed`)\
8.  Fallback → `mdi:help-circle`

------------------------------------------------------------------------

## 📊 How States Are Translated

1.  `status_map[state]`\
2.  `status.{state}` from locale JSON\
3.  Raw state string

------------------------------------------------------------------------

## 📘 Examples

### Presence Timeline

``` yaml
type: custom:timeline-card
title: Presence Timeline
hours: 24
limit: 10
relative_time: true
entities:
  - entity: person.tobi
    icon_map:
      home: mdi:home
      not_home: mdi:account-arrow-right
    status_map:
      home: "at home"
      not_home: "away"
```

### Door Monitoring

``` yaml
type: custom:timeline-card
title: Doors & Windows
hours: 6
limit: 12
show_states: true
entities:
  - entity: binary_sensor.frontdoor_contact
  - entity: binary_sensor.window_livingroom
```

------------------------------------------------------------------------

## 🛠 Development Notes

-   Custom element name: `timeline-card`\
-   File: `timeline-card.js`\
-   No external dependencies\
-   Uses the Home Assistant history API

------------------------------------------------------------------------

## 📄 License

MIT License\
Free to use, free to modify.
