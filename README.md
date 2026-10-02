# ScenarioDiff research demo

An academic project page with the original abstract, paper figures, method, results, an English presentation and three animated event examples.

Live page: https://katd2707.github.io/ScenarioDiff-demo/

## Public-impact examples

The three English examples use published observations around sourced events:

- Weekly reported dengue cases in Ho Chi Minh City, around the HCDC week-32/2024 bulletin. Rising cases affect local care services.
- Monthly U.S. vehicle miles traveled around the March 2020 COVID-19 travel guidance. Mobility changes affect work and access to services.
- Weekly U.S. retail gasoline prices following the early-March 2022 oil shock. Higher fuel costs affect household transport budgets.

The black history and green ground-truth curves use published observations. The event reports are sourced. The scenarios, anchor intervals, baseline and blue forecast paths are illustrative retrospective examples, not measured ScenarioDiff output or a point-in-time evaluation. The data snapshot records observation sources and dates in `assets/demo-data.js` and retrieval details in `assets/demo-sources.json`.

The three examples share one compact desktop row, with a common legend. Event callouts connect directly to the relevant point on each plot. Cards stack on small screens.

The green ground-truth reference and the gray baseline stay visible from the start. The blue trajectory denoises, then receives local anchor corrections. The authored examples show the corrected trajectory closer to the reference than the pre-anchor path, with a clearly visible residual error rather than an exact match. The observed outcome is displayed for retrospective comparison; it is not a claimed model input. This visual behavior is illustrative, not an empirical accuracy claim.

Animations play when visible and respect reduced-motion preferences. The page has play/pause and walkthrough controls; download/export links and the outcome-reveal control are removed. Previously created files remain on disk.

## Run locally

    python -m http.server 8000

Open http://localhost:8000. The site is static and uses relative paths for GitHub Pages.

## Rebuild media

    pip install pillow numpy imageio-ffmpeg requests
    python demo_tools/editorial_video.py --preview
    python demo_tools/render_video.py

The 170-second film is 1920 x 1080 at 24 fps, with English on-screen narration, captions and a transcript. Three 31-second walkthrough clips and three 16-second denoising loops are generated from the same data snapshot. The film is silent for live presenter narration.

## Source files

- `assets/demo-data.js`: the active English content, public observation series and authored comparison trajectories.
- `assets/demo-sources.json`: event and observation source retrieval records.
- `assets/demo-series.csv`: point-level observation and illustration provenance.
- `demo_tools/editorial_video.py`: presentation renderer; `render_video.py` calls it.
- `demo_tools/demo_sections.html`: active video and example section markup.
- `demo_tools/check_demo.mjs`: checks playback, chapter seeking, reduced motion and responsive layout.

The current renderer reads the committed data snapshot without network access. The older `build_observed_demo.py` is retained for reference; it does not encode the current authored forecast trajectories. Older unused assets remain in the repository, and the page does not offer downloads or exports.

The original abstract, three complete Introduction paragraphs in Method, and complete Main Results subsection are preserved. Figure 2 remains a crop from the paper. Tables I and II are full HTML transcriptions with the paper's red, blue, and bold top-three highlighting. Table I retains all 20 models and both first-place counts; model names omit bracketed citation numbers. The Paper link opens the full PDF.

## Visual attribution

The demo uses the gradient asset and editorial visual style of the user-supplied Cosmetics PPT Template by EaTemp. Playfair Display and Inter fonts are self-hosted with their licenses. The surrounding article follows the Block Diffusion project-page style. Work stays in this repository; previously supplied files and unused older assets are retained.
