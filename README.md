# ScenarioDiff research demo

A static, presentation-ready research story for [ScenarioDiff](https://arxiv.org/abs/2608.17164): a scenario-level guidance framework for multimodal time series forecasting. The page includes an 86-second text-led film, three short video loops, and an interactive explorer.

The FPT Long Châu, FPT Smart City, and FPT × E.ON application stories use **fictional briefs and synthetic forecast values** to illustrate the workflow. They are not trained-model outputs or claims of deployment. Measured results on the page come from the paper's Time-MMD experiments.

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
pip install pillow numpy imageio-ffmpeg
python demo_tools/render_video.py
```

The renderer uses synthetic data and does not call an LLM, forecasting checkpoint, or external API.

## Research links

- [Paper](https://arxiv.org/abs/2608.17164)
- [ScenarioDiff model code](https://github.com/ttb06/ScenarioDiff)
