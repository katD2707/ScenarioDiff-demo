# ScenarioDiff research demo

An academic project page with the original abstract, paper figures, method, results, an English presentation and three animated event examples.

Live page: https://katd2707.github.io/ScenarioDiff-demo/

## Examples and observations

- **Healthcare:** Ho Chi Minh City weekly dengue reports, weeks 30-35 of 2024. HCDC reports and linked coverage provide the counts. These are reported disease cases, not pharmacy sales.
- **Mobility:** U.S. monthly vehicle miles traveled, August 2019-July 2020, from the Traffic series in [Time-MMD](https://github.com/AdityaLab/Time-MMD). Original units (million vehicle miles) are divided by 1,000 for display as billions. Federal travel guidance supplies the event context.
- **Energy:** U.S. weekly all-grades retail gasoline prices, January-April 2022, from the Energy series in Time-MMD. EIA's March 4, 2022 report supplies the crude-oil event context.

History and ground truth contain published observations. Scenarios, anchor intervals, baselines and forecast paths are authored illustrations. The animations do not run the paper's checkpoint or reproduce its numerical results. Ground truth is read only by the comparison renderer, never by the authored trajectory function. The examples are retrospective and do not reconstruct publication lags or a point-in-time evaluation. No customer operating data or company deployment is claimed.

Each example shows initial noise, context-conditioned denoising, local anchor guidance and then the observed outcome. MP4 loops run only when visible; reduced-motion users initially see the final comparison. Play/pause and Show outcome controls are available. GIF downloads provide the same 16-second animation for presentations.

## Run locally

    python -m http.server 8000

Open http://localhost:8000. The site is static and uses relative paths for GitHub Pages.

## Rebuild media

    pip install pillow numpy imageio-ffmpeg requests
    python demo_tools/editorial_video.py --preview
    python demo_tools/render_video.py

The 170-second film is 1920 x 1080 at 24 fps, with English on-screen narration, captions and a transcript. Three 31-second walkthrough clips and three 16-second denoising loops are generated from the same data snapshot. The film is silent for live presenter narration.

To refresh the source snapshots intentionally:

    python demo_tools/build_observed_demo.py

This retrieves public reports and numerical CSVs, verifies expected tokens, and records retrieval timestamps and response hashes. It does not redistribute full articles. The committed snapshot supports offline rendering.

## Files

- `assets/demo-data.js`: shared observed series, authored trajectories, context and point-level source URLs.
- `assets/demo-series.csv`: observations and authored forecasts, explicitly distinguished in the provenance column.
- `assets/demo-sources.json`: source retrieval records, units and interpretation.
- `assets/demo-transcript-en.md` and `assets/demo-en.vtt`: English narration and captions.
- `demo_tools/demo_sections.html`: active video and example section markup.
- `demo_tools/check_demo.mjs`: Chrome checks for playback controls, chapter seeking, reduced motion and responsive layout.

The original abstract, the three complete Introduction paragraphs in Method, the complete Main Results subsection, Figure 2, Table I and Table II are preserved. The Paper link opens the full PDF.

## Visual attribution

The demo uses the gradient asset and editorial visual style of the user-supplied Cosmetics PPT Template by EaTemp. Playfair Display and Inter fonts are self-hosted with their licenses. The surrounding article follows the Block Diffusion project-page style. Work stays in this repository; previously supplied files and unused older assets are retained.
