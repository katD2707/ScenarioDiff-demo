"""Render the captioned, synthetic ScenarioDiff presentation film.

Run from the repository root: python demo_tools/render_video.py
Requires Pillow, numpy, and imageio-ffmpeg. No model checkpoint is used.
"""
from __future__ import annotations

import math
import subprocess
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = (ROOT / "docs" / "assets") if (ROOT / "docs").is_dir() else (ROOT / "assets")
OUT.mkdir(parents=True, exist_ok=True)
W, H, FPS, DURATION = 1280, 720, 20, 86
INK = (16, 38, 48)
BLUE = (69, 105, 255)
AQUA = (87, 225, 205)
CORAL = (251, 119, 94)
WHITE = (247, 250, 249)
MUTED = (149, 181, 188)
FONT_DIR = Path("C:/Windows/Fonts")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / ("segoeuib.ttf" if bold else "segoeui.ttf")), size)


F = {n: font(n) for n in (17, 20, 22, 25, 28, 34, 38, 46, 52, 59, 64, 74)}
FB = {n: font(n, True) for n in (17, 20, 22, 25, 28, 34, 38, 46, 52, 59, 64, 74)}


def ease(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def alpha_hex(color, a):
    return (*color, max(0, min(255, int(a))))


def rr(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(tuple(map(int, box)), radius=radius, fill=fill, outline=outline, width=width)


def multiline(draw, xy, lines, size=28, fill=WHITE, bold=False, gap=1.25):
    x, y = xy
    face = FB[size] if bold else F[size]
    for line in lines:
        draw.text((int(x), int(y)), line, font=face, fill=fill)
        y += size * gap


def label(draw, xy, value, fill=MUTED):
    draw.text(tuple(map(int, xy)), value.upper(), font=FB[17], fill=fill)


def polyline(draw, points, color, width=4, fraction=1):
    if fraction <= 0:
        return
    last = max(2, int((len(points) - 1) * min(fraction, 1)) + 1)
    p = points[:last]
    if len(p) >= 2:
        draw.line(p, fill=color, width=width, joint="curve")
        x, y = p[-1]
        draw.ellipse((x-5, y-5, x+5, y+5), fill=color)


def chart(draw, box, history, base, guided, anchors, progress, show_anchors=True, show_guided=True):
    x0, y0, x1, y1 = box
    rr(draw, box, 19, (22, 49, 59), outline=(51, 79, 88), width=2)
    left, top, right, bottom = x0+45, y0+43, x1-31, y1-56
    origin = left + (right-left)*.49
    draw.rectangle((origin, top, right, bottom), fill=(26, 57, 72))
    for i in range(5):
        y = top+(bottom-top)*i/4
        draw.line((left, y, right, y), fill=(51, 78, 87), width=1)
    draw.line((origin, top, origin, bottom), fill=(110, 143, 153), width=2)
    low, high = 35, 120
    yy = lambda v: int(bottom - (v-low)/(high-low)*(bottom-top))
    history_pts = [(int(left+(origin-left)*i/(len(history)-1)), yy(v)) for i,v in enumerate(history)]
    base_pts = [(int(origin+(right-origin)*(i+1)/len(base)), yy(v)) for i,v in enumerate(base)]
    guided_pts = [(int(origin+(right-origin)*(i+1)/len(guided)), yy(v)) for i,v in enumerate(guided)]
    polyline(draw, history_pts, (150, 183, 191), 4)
    # Dashed history-only continuation.
    bp = [history_pts[-1]]+base_pts
    for i in range(0,len(bp)-1,2):
        draw.line((bp[i], bp[min(i+1,len(bp)-1)]), fill=(115, 148, 157), width=3)
    if show_anchors and progress>.15:
        for idx, lowv, highv in anchors:
            x = guided_pts[idx][0]
            bx = (x-15, yy(highv), x+15, yy(lowv))
            rr(draw, bx, 7, (84, 63, 61), outline=CORAL, width=2)
    if show_guided and progress>.23:
        frac = ease((progress-.23)/.69)
        polyline(draw, [history_pts[-1]]+guided_pts, AQUA, 5, frac)
    label(draw, (left, bottom+18), "Observed history")
    label(draw, (origin+16, bottom+18), "Possible future")


def base_frame(t):
    im = Image.new("RGB", (W,H), INK)
    d = ImageDraw.Draw(im)
    # Quiet technical grid, shared across every scene.
    for x in range(0,W,80):
        d.line((x,0,x,H), fill=(21,47,57), width=1)
    for y in range(0,H,80):
        d.line((0,y,W,y), fill=(21,47,57), width=1)
    d.ellipse((970,-240,1570,360), outline=(25,75,86), width=2)
    d.ellipse((-270,510,460,1240), outline=(25,75,86), width=2)
    rr(d,(40,29,67,56),8,BLUE)
    d.line((48,45,54,37,61,45),fill=WHITE,width=3)
    d.text((79,30),"SCENARIO",font=FB[20],fill=WHITE)
    d.text((195,30),"DIFF",font=FB[20],fill=AQUA)
    label(d,(1038,32),"ICDM 2026",AQUA)
    d.line((42,669,1238,669),fill=(61,90,100),width=1)
    label(d,(44,682),"Illustrative research demo",MUTED)
    d.text((1185,678),f"{min(99,int(100*t/DURATION)):02d}%",font=FB[17],fill=MUTED)
    return im,d


def intro(d,t):
    u=ease(t/3)
    label(d,(68,113),"What if a forecast could read the room?",AQUA)
    multiline(d,(68,178),["Forecast","beyond","the curve."],74,WHITE,True,1.08)
    d.text((70,474),"Documents become scenarios.",font=F[28],fill=(190,215,218))
    d.text((70,513),"Scenarios guide possible futures.",font=F[28],fill=(190,215,218))
    chart(d,(592,150,1228,575),[57,60,58,63,65,63,67,68,66,70,69,72],
          [73,74,75,76,75,77,78,78],[74,78,86,94,101,98,90,84],[(4,94,106)],u)
    rr(d,(68,582,484,625),13,(35,66,76),outline=(62,107,113))
    label(d,(86,593),"Evidence  →  Scenario  →  Anchors",WHITE)


def method(d,t):
    local=t-8
    label(d,(65,118),"01 / The mechanism",AQUA)
    multiline(d,(65,159),["From early clues to","a guided forecast."],59,WHITE,True,1.12)
    stages=[("01","Historical Context","Filter reports, news, logs"),
            ("02","Scenario Agent","Describe a possible future"),
            ("03","Anchor Guidance","Place sparse value bands"),
            ("04","Diffusion Forecast","Generate and locally refine")]
    for i,(num,name,desc) in enumerate(stages):
        x=65+i*303
        activated=local>=i*2.4
        rr(d,(x,363,x+278,555),16,(30,66,76) if activated else (23,51,61),outline=BLUE if activated else (52,82,91),width=2)
        d.text((x+19,382),num,font=FB[22],fill=AQUA if activated else MUTED)
        d.text((x+19,435),name,font=FB[25],fill=WHITE)
        d.text((x+19,480),desc,font=F[17],fill=(173,202,207))
        if i<3:
            d.text((x+279,439),"→",font=FB[28],fill=AQUA)
    rr(d,(65,584,735,628),12,(42,69,76))
    label(d,(80,596),"Only pre-forecast evidence enters the agents",WHITE)


CASES = [
    dict(start=21,end=39,number="02",tag="FPT LONG CHÂU / HEALTHCARE",title=["A demand surge","before the counter."],
         evidence=["Fictional local health bulletin:","fever cases may rise next week."],
         scenario=["Short demand spike,","then gradual easing."],
         history=[57,59,58,61,60,62,64,61,63,65,64,66,65,67,66,68],
         base=[68,69,70,71,70,71,73,73,74,75,75,76],guided=[69,71,77,86,95,101,99,93,87,83,80,78],
         anchors=[(5,91,105),(8,82,96)],metric="WEEKLY MEDICINE DEMAND INDEX"),
    dict(start=39,end=57,number="03",tag="FPT SMART CITY / TRAFFIC",title=["A closure changes","the city rhythm."],
         evidence=["Fictional works notice:","a corridor lane will close."],
         scenario=["A temporary congestion peak,","then traffic redistributes."],
         history=[44,47,43,48,46,49,45,48,50,47,51,49,53,50,54,52],
         base=[53,54,55,54,56,56,57,57,58,57,59,59],guided=[54,57,65,76,89,94,91,84,76,70,65,61],
         anchors=[(5,87,100),(9,65,77)],metric="EVENING CONGESTION INDEX"),
    dict(start=57,end=75,number="04",tag="FPT × E.ON / ENERGY",title=["A heatwave enters","the load outlook."],
         evidence=["Fictional weather alert:","a hot spell is approaching."],
         scenario=["Cooling load rises,","then returns toward normal."],
         history=[69,70,68,71,72,70,73,74,72,74,75,73,76,77,75,78],
         base=[79,79,80,81,81,82,83,82,83,84,83,84],guided=[79,82,86,93,100,105,108,103,97,91,87,84],
         anchors=[(6,99,112),(9,87,99)],metric="ELECTRICITY LOAD INDEX"),
]


def case_scene(d,t,c):
    local=t-c["start"]
    progress=max(0,min(1,(local-8)/9))
    label(d,(65,106),c["number"]+" / "+c["tag"],AQUA)
    multiline(d,(65,155),c["title"],52,WHITE,True,1.15)
    rr(d,(66,306,486,388),14,(32,64,73),outline=(62,104,110))
    label(d,(84,316),"Evidence",AQUA)
    multiline(d,(84,343),c["evidence"],20,WHITE,False,1.2)
    if local>4.2:
        rr(d,(66,401,486,495),14,(49,62,81),outline=(87,109,158))
        label(d,(84,412),"Scenario",(145,170,255))
        multiline(d,(84,440),c["scenario"],20,WHITE,False,1.2)
    if local>7:
        rr(d,(66,509,486,583),14,(79,53,51),outline=CORAL)
        label(d,(84,523),"Sparse anchors",CORAL)
        d.text((84,551),"Plausible value intervals",font=F[20],fill=WHITE)
    label(d,(575,121),c["metric"],MUTED)
    chart(d,(548,153,1221,574),c["history"],c["base"],c["guided"],c["anchors"],progress,local>7,local>8)
    # A readable takeaway remains onscreen while the curve settles.
    if local>11:
        rr(d,(549,588,1220,632),11,(43,72,79))
        label(d,(570,599),"Context changes the possible future",WHITE)


def ending(d,t):
    u=ease((t-75)/2)
    label(d,(65,115),"05 / The research takeaway",AQUA)
    multiline(d,(65,170),["A clearer path from","context to forecast."],59,WHITE,True,1.14)
    rr(d,(66,370,385,532),17,(29,62,72),outline=(67,107,118))
    rr(d,(480,370,799,532),17,(29,62,72),outline=(67,107,118))
    rr(d,(894,370,1213,532),17,(29,62,72),outline=(67,107,118))
    for x,num,caption in [(92,"3","specialized agents"),(506,"5","benchmark domains"),(920,"13","first-place horizon results")]:
        d.text((x,388),num,font=FB[64],fill=AQUA)
        d.text((x,482),caption,font=FB[20],fill=WHITE)
    label(d,(67,578),"Paper: arxiv.org/abs/2608.17164",WHITE)
    label(d,(67,610),"Code: github.com/ttb06/ScenarioDiff",MUTED)
    # The footer stays candid when frames are used in a presentation.
    d.text((927,616),"Cases are fictional illustrations",font=F[17],fill=CORAL)


def render(t):
    im,d=base_frame(t)
    if t<8: intro(d,t)
    elif t<21: method(d,t)
    elif t<75:
        for c in CASES:
            if c["start"]<=t<c["end"]:
                case_scene(d,t,c)
                break
    else: ending(d,t)
    return im


def main():
    poster=render(4.5)
    poster.save(OUT/"poster.jpg",quality=90,optimize=True)
    output=str(OUT/"scenariodiff-demo.mp4")
    writer=imageio_ffmpeg.write_frames(output,(W,H),fps=FPS,codec="libx264",quality=7,
                                       pix_fmt_in="rgb24",pix_fmt_out="yuv420p",
                                       output_params=["-movflags","+faststart","-an"])
    writer.send(None)
    try:
        for i in range(DURATION*FPS):
            writer.send(np.asarray(render(i/FPS)).tobytes())
            if i%200==0: print(f"Rendered {i}/{DURATION*FPS} frames",flush=True)
    finally:
        writer.close()
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    for name, start in (("pharmacy", 29), ("traffic", 47), ("energy", 65)):
        subprocess.run([ffmpeg, "-y", "-ss", str(start), "-i", output, "-t", "8",
                        "-vf", "scale=640:-2", "-c:v", "libx264", "-preset", "fast",
                        "-crf", "27", "-an", "-movflags", "+faststart",
                        str(OUT / f"{name}-loop.mp4")], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Saved {output}")


if __name__ == "__main__":
    main()
