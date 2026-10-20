# Performance measurements and budgets

Measured locally on 19 October 2026 with Node.js v26.11.1 on macOS arm64. These are core execution measurements on this machine, not browser load metrics or a promise for every device. Reproduce with `npm run benchmark`; raw results are in [performance-results.json](performance-results.json).

| Scenario | Candidates checked | Witnesses retained | Completion | Elapsed |
| --- | ---: | ---: | --- | ---: |
| Default finite menu | 10,584 | 112 | Complete | 100.0 ms |
| Empty-host candidate stress | 50,000 of 62,424 | 0 | Candidate limit; incomplete | 345.1 ms |
| Dense mixed-carrier host | 3,684 of 10,584 | 2,000 | Witness limit; incomplete | 435.5 ms |

Carrier-line coverage is prepared once per orientation/scale and reused while checking translations. Search runs in a worker where supported, and cancellation terminates it. A yielding fallback preserves functionality if workers are unavailable. The browser limits searches to 50,000 candidates, 2,000 witnesses and an eight-second budget, while preserving truthful incomplete-result reporting.

The home page's local HTML/CSS/static-module dependencies/initial data/favicon total approximately **205 KB** before HTTP compression after adding source-linked experiments. This is a file-size measurement, not an observed network waterfall; optional Google Fonts bytes are additional. The reference browser loads approximately **231 KB** of compact metadata only when needed and paginates 20 records at a time.

The 98 complete reading guides are separate JSON files, loaded only when their source page is opened. Their median size is **3,833 bytes**, their maximum is **7,157 bytes**, and their combined size is **393,269 bytes**. The app does not fetch all 98 guides on the home or library page. The 29.2 MB of reference PDFs also open on demand.

The experiment catalogue is **27,541 bytes**, loaded when a source or experiment route needs it. The interactive model/view modules total approximately **36 KB**, imported only when an individual experiment opens; their shared engine and activity dependencies are already used by the main application. The [experiment report](EXPERIMENTS.md) records bounded model/markup timings and clearly separates them from unverified browser event/layout performance.

The application has no npm dependencies, third-party JavaScript framework, analytics or server database. Study notes save after a 500 ms pause to avoid a storage write for every keystroke. Input/resource limits are stated in the model and interface. Comprehensive Lighthouse/Web Vitals, slow-network profiling and low-powered physical-device measurements were not performed.
