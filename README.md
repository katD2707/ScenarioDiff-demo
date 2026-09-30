# ScenarioDiff research demo

A static project page for [ScenarioDiff](https://arxiv.org/abs/2608.17164). It uses the paper's original abstract and Figure 2, embeds the complete paper PDF, and includes an 86-second text-led film, three short video loops, and an interactive explorer.

The FPT Long Châu, FPT Smart City, and FPT × E.ON application stories use **fictional briefs and synthetic forecast values** to illustrate the workflow. They are not trained-model outputs or claims of deployment. The complete paper is available at [`assets/scenariodiff-paper.pdf`](assets/scenariodiff-paper.pdf).

The abstract is copied verbatim from that PDF. The method image is a 4× resolution crop of Figure 2 on page 4; visitors can open it at full size, and mobile users can scroll across it.

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
