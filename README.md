# ZEROSEOK Legal Sites

The canonical source for the static legal and support sites of ZEROSEOK products.

## Product source

Each product owns its source in `products/<product-id>/`. The GitHub Pages workflow builds these folders into matching public paths. Do not edit `dist/`; it is generated.

| Product | Canonical path | Existing URL kept alive |
| --- | --- | --- |
| Grammarlyzer | `/grammarlyzer/` | `grammarlyzer-privacy` |
| Heisei | `/heisei/` | `heisei-legal` |
| Malgil | `/malgil/` | `malgil-privacy` |
| ROAD ATLAS | `/road-atlas/` | `road-atlas-privacy` |
| RAIL ATLAS | `/rail-atlas/` | `rail-atlas-privacy` |
| Vloglet | `/vloglet/` | `vloglet-legal` |

The legacy repositories remain as compatibility hosts only. Their root page redirects to the matching canonical page, so URLs already recorded in Google Play continue to work.

## Validate locally

```sh
node scripts/build.mjs --check
node scripts/build.mjs
```

`LEGAL_SITES.json` is the inventory of managed and not-yet-hosted products. Add a product there and its source folder before publishing its policy.
