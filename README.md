# ScenarioDiff research demo

An academic project page with the original abstract, paper figures, method, results, an English presentation and three animated event examples.

Live page: https://katd2707.github.io/ScenarioDiff-demo/

## Vietnam examples

The original three Vietnamese use cases are presented in English:

- Healthcare supplies for a potential FPT Long Chau application, using the HCDC week-32/2024 bulletin as context.
- Travel time on a nearby open route during Ho Chi Minh City road restrictions, using the April 21, 2025 Government News / PC08 announcement.
- Facility-cluster peak electricity demand as heat eases, using EVN's April 29, 2024 report as context.

The event reports are real. Operating histories, ground-truth reference curves, scenarios, anchors and forecast paths are authored illustrations, not customer measurements, trained-model output or evaluation results. These restore the original application stories; the intervening U.S. Time-MMD examples are no longer active.

The three examples share one compact desktop row, with a common legend. Event callouts connect directly to the relevant point on each plot. Cards stack on small screens.

The green ground-truth reference and the gray baseline stay visible from the start. The blue trajectory denoises, then receives local anchor corrections. The authored examples show the corrected trajectory closer to the reference than the pre-anchor path, with a clearly visible residual error rather than an exact match. Guidance never reads the ground-truth array. This visual behavior is illustrative, not an empirical accuracy claim.

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

- `assets/demo-data.js`: the active English content, original operating curves and authored comparison trajectories.
- `assets/demo-sources.json`: the original Vietnam event-report retrieval records.
- `demo_tools/editorial_video.py`: presentation renderer; `render_video.py` calls it.
- `demo_tools/demo_sections.html`: active video and example section markup.
- `demo_tools/check_demo.mjs`: checks playback, chapter seeking, reduced motion and responsive layout.

`build_observed_demo.py` belongs to the previous public-observation examples and is not used for this version. The current renderer reads the committed data snapshot without network access. Older GIF/CSV/transcript assets are retained, but the current page does not offer downloads or exports.

The original abstract, three complete Introduction paragraphs in Method, complete Main Results subsection, Figure 2, Table I and Table II are preserved. The Paper link opens the full PDF.

## Visual attribution

The demo uses the gradient asset and editorial visual style of the user-supplied Cosmetics PPT Template by EaTemp. Playfair Display and Inter fonts are self-hosted with their licenses. The surrounding article follows the Block Diffusion project-page style. Work stays in this repository; previously supplied files and unused older assets are retained.
