# Performance measurements and budgets

Measured locally on 19 October 2026 with Node.js v26.11.1 on macOS arm64. These are core execution measurements on this machine, not browser load metrics or a promise for every device. Reproduce with `npm run benchmark`; raw results are in [performance-results.json](performance-results.json).

| Scenario | Candidates checked | Witnesses retained | Completion | Elapsed |
| --- | ---: | ---: | --- | ---: |
| Default finite menu | 10,584 | 112 | Complete | 100.0 ms |
| Empty-host candidate stress | 50,000 of 62,424 | 0 | Candidate limit; incomplete | 345.1 ms |
| Dense mixed-carrier host | 3,684 of 10,584 | 2,000 | Witness limit; incomplete | 435.5 ms |

Carrier-line coverage is prepared once per orientation/scale and reused while checking translations. Search runs in a worker where supported, and cancellation terminates it. A yielding fallback preserves functionality if workers are unavailable. The browser limits searches to 50,000 candidates, 2,000 witnesses and an eight-second budget, while preserving truthful incomplete-result reporting.

The home page's local HTML/CSS/modules/data/favicon total **187,043 bytes** before HTTP compression. This is a file-size budget, not an observed network waterfall; optional Google Fonts bytes are additional. The reference browser loads its **163,486-byte** compact metadata only when needed and paginates 20 records at a time. The 29.2 MB of reference PDFs are not downloaded during initial page load; each opens on demand.

The application has no npm dependencies, third-party JavaScript framework, analytics or server database. Study notes save after a 500 ms pause to avoid a storage write for every keystroke. Input/resource limits are stated in the model and interface. Comprehensive Lighthouse/Web Vitals, slow-network profiling and low-powered physical-device measurements were not performed.
