# ScenarioDiff research demo

A static project page for [ScenarioDiff](https://arxiv.org/abs/2608.17164), organized as an academic article: original abstract, method, video, illustrative applications, interactive demo, and results. The Paper button links to the PDF. The Vietnamese demo includes a 170-second, 1920×1080 film with on-screen explanations, three 31-second clips, chapter navigation, and an interactive explorer.

The examples reference **real, dated public reports** from HCDC, the Government news portal (PC08 road-closure information), and EVN. The FPT Long Châu, FPT Smart City, and FPT × E.ON contexts are potential applications. **All business operating histories, scenarios, anchor bands and forecast paths are authored simulations**, not customer data, trained-model outputs, calibrated intervals, or deployment claims. The complete paper is available at [`assets/scenariodiff-paper.pdf`](assets/scenariodiff-paper.pdf).

The abstract is copied verbatim from that PDF. Method prose uses three complete original paragraphs from the Introduction; Results reproduces the complete Main Results subsection (V-B). Figure 2 (page 4) and Table I (page 7) are cropped from the original PDF at 4× resolution. Table II is transcribed in full as an HTML table. Visitors can open the source crops at full size, and mobile users can scroll across them.

## Preview

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages

In repository **Settings → Pages**, select **Deploy from a branch**, then choose `main` and `/(root)`. Once GitHub finishes building, the expected URL is:

<https://katD2707.github.io/ScenarioDiff-demo/>

This site uses relative paths and needs no build step.

## Video source

The MP4 and three loop clips are in `assets/`. To regenerate them on Windows:

```bash
pip install pillow numpy imageio-ffmpeg requests
python demo_tools/render_video.py
```

The current renderer is `demo_tools/editorial_video.py`; `render_video.py` invokes it. Add `--preview` to render the storyboard only. Rendering uses local assets and does not call an LLM or forecasting checkpoint. The silent film is designed for presenter narration and includes Vietnamese explanations on screen, a VTT caption track, and a downloadable transcript.

The shared scenario data is [`assets/demo-data.js`](assets/demo-data.js). The browser's anchor-strength slider uses a deterministic local blend to illustrate the role of anchors; it is not the paper's sampling implementation. The film shows stylized denoising and anchor guidance. Numeric curves are illustrative throughout.

## Evidence and reproducibility

- [`assets/demo-sources.json`](assets/demo-sources.json): original URLs, publication times, actual reported facts, retrieval timestamps and response hashes.
- [`assets/demo-series.csv`](assets/demo-series.csv): all synthetic operating histories, baselines and authored scenario targets.
- [`assets/demo-transcript-vi.md`](assets/demo-transcript-vi.md): timed Vietnamese presentation script.
- `demo_tools/prepare_demo.py`: retrieve the three public pages, verify numeric/date tokens, and download the open-license fonts. It also extracts the unmodified gradient background from the user's original PPTX in the parent directory. It does not republish entire articles.
- `demo_tools/demo_sections.html`: source markup for the video, examples and explorer sections in `index.html`.

Each source was published before its example's forecast cutoff. Source metrics are kept separate from synthetic business units: disease cases are not converted directly to orders, national kWh are not converted into facility MW, and a road-closure schedule is not presented as measured travel time.

## Visual attribution

The demo uses the gradient background and editorial layout vocabulary of the user-supplied **Cosmetics PPT Template by EaTemp**. Playfair Display replaces DM Serif Display in Vietnamese text to ensure complete accent support. Inter supplies the body text. Font licenses are included under `assets/fonts/`. The surrounding research article retains its academic layout.

## Research links

- [Paper](https://arxiv.org/abs/2608.17164)
- [ScenarioDiff model code](https://github.com/ttb06/ScenarioDiff)
