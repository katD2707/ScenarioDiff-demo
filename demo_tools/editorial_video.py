"""English presentation and denoising loops using published observed series.
Forecast targets and animation are authored; no model checkpoint is evaluated.
"""
from pathlib import Path
from functools import lru_cache
import csv, json, math, sys, subprocess
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets'
DATA = json.loads((OUT/'demo-data.js').read_text(encoding='utf-8').split('window.SCENARIO_DEMO = ',1)[1].rstrip(';\n'))
CASES = DATA['cases']
W,H,FPS = 1920,1080,24
INK='#272727'; MUTED='#58616d'; BLUE='#456486'; PINK='#ad576f'; GREEN='#287957'; LINE='#b2bbc7'
BG=Image.open(OUT/'demo-background.png').convert('RGB').resize((W,H),Image.Resampling.LANCZOS)
SCENES=[
 dict(kind='intro',duration=9,caption='An event can change the future before that change appears in the historical series.'),
 dict(kind='method',duration=14,caption='Historical evidence informs a scenario. Sparse anchors identify local regions of interest; diffusion generates the trajectory.'),
]
for i,c in enumerate(CASES):
    SCENES.extend([dict(kind='source',case=i,duration=14,caption=c['fact']),
                   dict(kind='scenario',case=i,duration=15,caption=c['scenario']),
                   dict(kind='forecast',case=i,duration=16,caption=c['assumption'])])
SCENES.append(dict(kind='outro',duration=12,caption='Published observations provide the comparison. Scenario and forecast paths illustrate the mechanism, rather than a model evaluation.'))
TOTAL=sum(s['duration'] for s in SCENES)

@lru_cache(maxsize=100)
def font(size,kind='sans'):
    # Playfair preserves the template's editorial serif feel and supports Vietnamese.
    name={'serif':'PlayfairDisplay.ttf','mono':'Inter.ttf','sans':'Inter.ttf'}[kind]
    f=ImageFont.truetype(str(OUT/'fonts'/name),size)
    if kind=='serif':f.set_variation_by_axes([600])
    return f

def txt(d,xy,value,size=28,kind='sans',fill=INK):
    d.text(xy,str(value),font=font(size,kind),fill=fill)

def wrap(d,xy,value,width,size=28,kind='sans',fill=INK,leading=1.4):
    x,y=xy; face=font(size,kind)
    for para in str(value).split('\n'):
        line=''
        for word in para.split():
            trial=(line+' '+word).strip()
            if line and d.textlength(trial,font=face)>width:
                d.text((x,y),line,font=face,fill=fill); y+=size*leading;line=word
            else:line=trial
        if line:d.text((x,y),line,font=face,fill=fill);y+=size*leading
    return y

def rule(d,y,x0=90,x1=1830,color=INK):d.line((x0,y,x1,y),fill=color,width=1)
def star(d,cx,cy,r=30):
    pts=[]
    for i in range(80):
        a=2*math.pi*i/80
        pts.append((cx+r*math.cos(a)**3,cy+r*math.sin(a)**3))
    d.polygon(pts,fill=INK)

def pill(d,xy,label):
    x,y=xy; ww=d.textlength(label,font=font(20,'mono'))+34
    d.rounded_rectangle((x,y,x+ww,y+40),radius=20,outline=INK,width=1)
    txt(d,(x+17,y+7),label,20,'mono')

def path(d,points,fill=INK,width=4,progress=1,dashed=False):
    count=(len(points)-1)*max(0,min(progress,1));whole=int(count)
    pp=points[:whole+1]
    if whole<len(points)-1:
        a,b=points[whole:whole+2];u=count-whole;pp.append((a[0]+u*(b[0]-a[0]),a[1]+u*(b[1]-a[1])))
    if len(pp)<2:return
    if dashed:
        for a,b in zip(pp,pp[1:]):
            length=math.dist(a,b);n=max(1,int(length/8))
            for j in range(0,n,2):
                u,v=j/n,min(1,(j+1)/n)
                d.line((a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[0]+(b[0]-a[0])*v,a[1]+(b[1]-a[1])*v),fill=fill,width=width)
    else:d.line(pp,fill=fill,width=width,joint='curve')


def common(scene,idx):
    im=BG.copy();d=ImageDraw.Draw(im)
    txt(d,(90,43),'ScenarioDiff',28,'serif');star(d,290,61,16)
    txt(d,(1430,49),'RESEARCH / DEMO',20,'mono');rule(d,94)
    rule(d,949,color=LINE)
    wrap(d,(90,970),scene['caption'],1660,25,leading=1.35)
    txt(d,(90,1045),'HEALTHCARE / MOBILITY / ENERGY',16,'mono',MUTED)
    txt(d,(1710,1043),f'{idx+1:02d} / {len(SCENES):02d}',18,'mono',MUTED)
    return im,d

def trajectory(c,amount=1):
    # Local, authored anchor correction. Ground truth is never read here.
    sign=1 if c['id']=='traffic' else -1
    span=c['range'][1]-c['range'][0]
    return [v+sign*span*.12*max(math.exp(-.5*((i-a['i'])/.8)**2) for a in c['anchors'])*(1-amount)
            for i,v in enumerate(c['guided'])]

def chart(d,c,box,stage=4,sampling=1,anchor_strength=1,truth=False):
    x0,y0,x1,y1=box
    d.rounded_rectangle(box,radius=5,fill='#f7f8fb',outline='#cad0d9',width=1)
    txt(d,(x0+30,y0+20),c['metric'],27,'serif')
    txt(d,(x0+30,y0+63),c['unit'],19,fill=MUTED)
    left,top,right,bottom=x0+83,y0+139,x1-44,y1-133
    origin=left+(right-left)*.43
    d.rectangle((origin,top,right,bottom),fill='#ecedf5')
    lo,hi=c['range'];yy=lambda v:bottom-(v-lo)/(hi-lo)*(bottom-top)
    hx=lambda i:left+(origin-left)*i/(len(c['history'])-1)
    fx=lambda i:origin+(right-origin)*(i+1)/len(c['baseline'])
    for v in c['ticks']:
        d.line((left,yy(v),right,yy(v)),fill='#dce0e7',width=1)
        txt(d,(left-64,yy(v)-12),f'{v:g}',19,'mono',MUTED)
    d.line((origin,top,origin,bottom),fill='#a3aeba',width=2)
    hist=[(hx(i),yy(v)) for i,v in enumerate(c['history'])]
    path(d,hist,INK,4)
    for x,y in hist:d.ellipse((x-4,y-4,x+4,y+4),fill=INK)
    path(d,[hist[-1]]+[(fx(i),yy(v)) for i,v in enumerate(c['baseline'])],'#929ba7',3,dashed=True)
    for i in sorted(set([0,(len(hist)-1)//2,len(hist)-1])):
        label=c['historyDates'][i];width=d.textlength(label,font=font(18))
        txt(d,(hx(i)-width/2,bottom+18),label,18,fill=MUTED)
    for i in sorted(set([len(c['futureDates'])//2,len(c['futureDates'])-1])):
        label=c['futureDates'][i];width=d.textlength(label,font=font(18))
        txt(d,(fx(i)-width/2,bottom+18),label,18,fill=MUTED)
    txt(d,(left,top-34),'OBSERVED HISTORY',17,'mono',MUTED)
    txt(d,(origin+18,top-34),'EVENT WINDOW',17,'mono',BLUE)
    if stage>=3 and anchor_strength>0:
        for a in c['anchors']:
            x=fx(a['i']);d.rounded_rectangle((x-18,yy(a['hi']),x+18,yy(a['lo'])),radius=6,fill='#ebccda',outline=PINK,width=2)
    if stage>=4:
        vals=trajectory(c,anchor_strength)
        for j in range(5):
            pts=[hist[-1]]
            for i,v in enumerate(vals):
                noise=(hi-lo)*(.16*(1-sampling)+.012)*math.sin((i+1)*(j+1)*1.47+j)
                pts.append((fx(i),yy(v+noise)))
            path(d,pts,'#b7c4d7',2)
        path(d,[hist[-1]]+[(fx(i),yy(v+(hi-lo)*.12*(1-sampling)*math.sin((i+1)*2.1))) for i,v in enumerate(vals)],BLUE,5)
    if truth:
        gt=[hist[-1]]+[(fx(i),yy(v)) for i,v in enumerate(c['groundTruth'])]
        path(d,gt,GREEN,4,dashed=True)
        for x,y in gt[1:]:d.ellipse((x-5,y-5,x+5,y+5),fill=GREEN)
    labels=[('History',INK),('Baseline','#929ba7'),('Forecast',BLUE),('Ground truth',GREEN),('Anchors',PINK)]
    for i,(label,color) in enumerate(labels):
        x=x0+27+i*(x1-x0-45)/5;y=y1-48
        d.line((x,y+9,x+24,y+9),fill=color,width=4)
        txt(d,(x+32,y-3),label,17,fill=MUTED)

def heading(d,kicker,title):
    txt(d,(90,133),kicker.upper(),21,'mono',MUTED)
    wrap(d,(90,182),title,1720,65,'serif',leading=1.1)

@lru_cache(maxsize=24)
def static_scene(idx):
    s=SCENES[idx];im,d=common(s,idx);kind=s['kind']
    if kind=='intro':
        star(d,1630,259,102);star(d,1770,176,38)
        txt(d,(90,164),'FROM EVENTS TO FORECASTS',25,'mono',MUTED)
        wrap(d,(90,270),'Read the context.\nSee a different future.',1510,112,'serif',leading=1.16)
        rule(d,577)
        txt(d,(95,635),'03',98,'serif');txt(d,(290,648),'events. Three patterns of change.',47,'serif')
        txt(d,(290,729),'HEALTHCARE / MOBILITY / ENERGY',25,'mono',MUTED)
        txt(d,(95,852),'Published observations. Scenario-guided trajectories.',30,fill=MUTED)
    elif kind=='method':
        heading(d,'The mechanism','From evidence to a future trajectory.')
        labels=['Read the past','Describe the future','Locate the change','Generate & refine']
        agents=['Historical Context Agent','Scenario Agent','Anchor Guidance Agent','Diffusion + Anchor Blending']
        desc=['Extract stepwise evidence from historical documents.','Build a qualitative scenario for the event window.','Specify sparse value intervals at relevant future steps.','Denoise candidate paths and refine anchor regions.']
        for i in range(4):
            x=90+i*445;d.ellipse((x,380,x+76,456),outline=INK,width=1)
            txt(d,(x+23,393),str(i+1),32,'serif')
            if i<3:d.line((x+76,419,x+425,419),fill=INK,width=1)
            txt(d,(x,505),labels[i],32,'serif')
            wrap(d,(x,573),agents[i],375,21,fill=BLUE)
            wrap(d,(x,675),desc[i],365,29)
        rule(d,834)
        txt(d,(90,866),'History grounds the context. Anchors guide selected regions.',28,fill=MUTED)
    elif kind in ['source','scenario','forecast']:
        c=CASES[s['case']]
        suffix={'source':'An event changes the context.','scenario':'A scenario becomes local guidance.','forecast':'From noise to an anchored trajectory.'}[kind]
        heading(d,c['number']+' / '+c['domain'],suffix)
        if kind=='source':
            d.rectangle((90,310,790,900),fill='#f9f9fc',outline='#adb6c3',width=1)
            pill(d,(120,339),'EVENT REPORT');txt(d,(120,399),c['published'],22,fill=MUTED)
            cy=wrap(d,(120,450),c['sourceTitle'],610,41,'serif',leading=1.23)
            rule(d,cy+19,120,760,LINE)
            txt(d,(120,cy+43),c['stat'],86,'serif')
            wrap(d,(120,cy+150),c['statUnit'],610,25,fill=MUTED)
            txt(d,(120,851),c['source'],22,fill=BLUE)
            txt(d,(865,327),c['brand'].upper(),21,fill=MUTED)
            wrap(d,(865,390),c['title'],910,68,'serif',leading=1.15)
            wrap(d,(865,614),c['context'],895,31,leading=1.5)
            pill(d,(865,844),c['cutoff'])
        elif kind=='scenario':
            txt(d,(90,332),'SCENARIO',21,'mono',MUTED)
            y=wrap(d,(90,384),c['scenario'],610,36,'serif',leading=1.3)
            rule(d,y+36,90,715,LINE)
            txt(d,(90,y+65),'SPARSE ANCHOR INTERVALS',20,'mono',MUTED)
            for i,a in enumerate(c['anchors']):txt(d,(90,y+116+i*62),a['label'],28,'serif',PINK)
            chart(d,c,(790,310,1830,900),stage=3)
        else:
            txt(d,(90,332),'CONTEXT / ANCHORS / TRAJECTORY',19,fill=MUTED)
            wrap(d,(90,393),c['action'],610,52,'serif',leading=1.25)
            rule(d,623,90,715,LINE)
            wrap(d,(90,668),'First watch the forecast settle. Then compare it with the green observed series.',600,30,leading=1.45)
            txt(d,(90,858),c['brand'],20,fill=MUTED)
    else:
        heading(d,'Three patterns of change','Context gives the forecast a direction.')
        for i,c in enumerate(CASES):
            x=90+i*580;txt(d,(x,368),c['number'],78,'serif',BLUE)
            wrap(d,(x,497),c['direction'],505,43,'serif',leading=1.2)
            txt(d,(x,635),c['domain'].upper(),23,fill=MUTED)
        rule(d,720)
        txt(d,(90,772),'Explore the event. Watch the trajectory. Compare the outcome.',43,'serif')
        txt(d,(90,867),'katd2707.github.io/ScenarioDiff-demo',27,fill=BLUE)
    return im

def phase(t):
    return '01 / Initial noise' if t<3 else '02 / Context-conditioned denoising' if t<8 else '03 / Local anchor guidance' if t<12 else '04 / Compare with ground truth'

def animate_chart(d,c,box,t):
    chart(d,c,box,sampling=min(1,t/7),anchor_strength=max(0,min(1,(t-8)/4)),truth=t>=12)

def frame(idx,local,global_t):
    im=static_scene(idx).copy();d=ImageDraw.Draw(im);s=SCENES[idx]
    if s['kind']=='forecast':
        animate_chart(d,CASES[s['case']],(790,310,1830,900),local)
        txt(d,(810,913),phase(local),19,fill=BLUE)
    elif s['kind']=='method':
        selected=min(3,int(local/3.5));x=90+selected*445
        d.ellipse((x,380,x+76,456),fill=INK);txt(d,(x+23,393),str(selected+1),32,'serif','#fff')
    d.rectangle((0,H-5,int(W*global_t/TOTAL),H),fill=BLUE)
    if local<.35:im=Image.blend(BG,im,local/.35)
    return im

def loop_frame(c,t):
    im=Image.new('RGB',(1120,780),'#f7f8fb');d=ImageDraw.Draw(im)
    animate_chart(d,c,(0,0,1120,705),t)
    txt(d,(28,730),phase(t),24,fill=BLUE)
    return im

def stamp(t):return f'{int(t)//3600:02d}:{int(t)//60%60:02d}:{int(t)%60:02d}.000'

def supporting_files():
    t=0;vtt=['WEBVTT',''];transcript=['# ScenarioDiff — English presentation','','History and ground truth are published observations. Scenario, anchor and forecast paths are authored illustrations, not model evaluation or a point-in-time backtest.',''];chapters=[]
    for i,s in enumerate(SCENES):
        vtt.extend([str(i+1),f'{stamp(t)} --> {stamp(t+s["duration"])}',s['caption'],''])
        title=s['kind'] if 'case' not in s else CASES[s['case']]['domain']+' / '+s['kind']
        chapters.append(dict(start=t,title=title));transcript.extend([f'## {stamp(t)} — {title}',s['caption'],'']);t+=s['duration']
    (OUT/'demo-en.vtt').write_text('\n'.join(vtt),encoding='utf-8')
    (OUT/'demo-transcript-en.md').write_text('\n'.join(transcript),encoding='utf-8')
    (OUT/'demo-chapters.json').write_text(json.dumps(dict(duration=TOTAL,chapters=chapters),indent=2),encoding='utf-8')
    with (OUT/'demo-series.csv').open('w',newline='',encoding='utf-8-sig') as f:
        writer=csv.writer(f);writer.writerow(['case','period','series','value','unit','provenance','source_url'])
        for c in CASES:
            n=len(c['history'])
            for name,offset in [('history',0),('groundTruth',n)]:
                for i,v in enumerate(c[name]):writer.writerow([c['id'],c['observationDates'][offset+i],name,v,c['unit'],'published_observation',c['observationSources'][offset+i]])
            for name in ['baseline','guided']:
                for i,v in enumerate(c[name]):writer.writerow([c['id'],c['observationDates'][n+i],name,v,c['unit'],'authored_illustration',''])

def render():
    supporting_files();frame(0,5,5).save(OUT/'poster.jpg',quality=95)
    preview=Image.new('RGB',(1920,2160),'white')
    for i,idx in enumerate([0,1,2,3,4,7,10,11]):
        scene=frame(idx,14 if SCENES[idx]['kind']=='forecast' else 8,8);scene.thumbnail((960,540));preview.paste(scene,((i%2)*960,(i//2)*540))
    preview.save(ROOT/'_archive'/'video-review.jpg',quality=93)
    for i,c in enumerate(CASES):
        frame([4,7,10][i],14,14).save(OUT/(c['id']+'-poster.jpg'),quality=93)
        loop_frame(c,15).save(OUT/(c['id']+'-denoising.jpg'),quality=95)
    if '--preview' in sys.argv:print('English storyboard ready.',flush=True);return
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    writer=imageio_ffmpeg.write_frames(str(OUT/'scenariodiff-demo.mp4'),(W,H),fps=FPS,codec='libx264',pix_fmt_in='rgb24',pix_fmt_out='yuv420p',macro_block_size=1,output_params=['-preset','fast','-crf','20','-movflags','+faststart'])
    writer.send(None);global_t=0
    try:
        for idx,s in enumerate(SCENES):
            for f in range(s['duration']*FPS):writer.send(np.asarray(frame(idx,f/FPS,global_t+f/FPS)))
            global_t+=s['duration'];print(f'Chapter {idx+1}/12 rendered ({global_t}s)',flush=True)
    finally:writer.close()
    for c,start in zip(CASES,[37,82,127]):
        subprocess.run([ffmpeg,'-y','-ss',str(start),'-i',str(OUT/'scenariodiff-demo.mp4'),'-t','31','-an','-vf','scale=1280:720','-c:v','libx264','-crf','22','-preset','fast','-movflags','+faststart',str(OUT/(c['id']+'-loop.mp4'))],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        writer=imageio_ffmpeg.write_frames(str(OUT/(c['id']+'-denoising.mp4')),(1120,780),fps=12,codec='libx264',pix_fmt_in='rgb24',pix_fmt_out='yuv420p',macro_block_size=1,output_params=['-preset','fast','-crf','20','-movflags','+faststart'])
        writer.send(None)
        try:
            for f in range(16*12):writer.send(np.asarray(loop_frame(c,f/12)))
        finally:writer.close()
        subprocess.run([ffmpeg,'-y','-i',str(OUT/(c['id']+'-denoising.mp4')),'-filter_complex','fps=8,scale=672:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer','-loop','0',str(OUT/(c['id']+'-denoising.gif'))],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        print('Rendered loops: '+c['id'],flush=True)
    print('English film, clips, MP4 loops and GIFs ready.',flush=True)

if __name__=='__main__':render()
