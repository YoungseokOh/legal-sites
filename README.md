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
| SAIL ATLAS | `/sail-atlas/` | Play currently uses the recorded Gist URL |
| FOCUS ATLAS | `/focus-atlas/` | Play currently uses the recorded Google Sites URL |
| Vloglet | `/vloglet/` | `vloglet-legal` |
| fromo — Photo Ready | `/fromo/` | — |
| Hangulario | `/hangulario/` | — |

The six legacy GitHub Pages repositories remain compatibility hosts. They contain
generated, full-content mirrors so URLs already recorded in Google Play work even
for clients that do not execute JavaScript. Edit only this repository, then sync
the mirrors with `node scripts/build.mjs --sync-legacy` from clean local checkouts.
Local compatibility checkouts live under the ignored `.legacy-checkouts/`
directory so they do not clutter the parent Projects directory or enter this repo.

SAIL ATLAS and FOCUS ATLAS are now managed here as well. Their currently recorded
external policy URLs remain listed in `LEGAL_SITES.json` until a separately
authorized Play Console URL change is completed and verified.

## Validate locally

```sh
node scripts/build.mjs --check
node scripts/build.mjs
node scripts/build.mjs --sync-legacy
```

`LEGAL_SITES.json` is the inventory of managed products, compatibility hosts, and
known registered policy URLs. Add a product there and its source folder before
publishing its policy.
