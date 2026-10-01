"""Render the Vietnamese, source-backed ScenarioDiff film in the EaTemp style.

Usage: python demo_tools/editorial_video.py [--preview]
Public sources and authored simulations are deliberately separate in the data.
All diffusion animations illustrate mechanics; no model is run here.
"""
from pathlib import Path
import csv
import json
import math
import sys
from functools import lru_cache
import subprocess
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets'
DATA = json.loads((OUT / 'demo-data.js').read_text(encoding='utf-8').split('window.SCENARIO_DEMO = ',1)[1].rstrip(';\n'))
CASES = DATA['cases']
W,H,FPS = 1920,1080,24
INK='#272727'; MUTED='#58616d'; BLUE='#456486'; PINK='#ad576f'; LINE='#b2bbc7'
BG = Image.open(OUT/'demo-background.png').convert('RGB').resize((W,H),Image.Resampling.LANCZOS)
SCENES = [
 {'kind':'intro','duration':9,'caption':'Một thông báo có thể xuất hiện trước khi dữ liệu vận hành thay đổi. ScenarioDiff tổ chức bằng chứng đó thành hướng dẫn cho dự báo.'},
 {'kind':'method','duration':14,'caption':'Historical Context Agent lọc bằng chứng. Scenario Agent mô tả tương lai. Anchor Guidance Agent đặt khoảng neo; mô hình diffusion tạo và hiệu chỉnh quỹ đạo.'},
 {'kind':'source','case':0,'duration':14,'caption':'Bản tin HCDC là dữ liệu thật. Số ca bệnh giúp nhận diện bối cảnh; không được quy đổi trực tiếp thành đơn hàng hoặc lượng thuốc.'},
 {'kind':'scenario','case':0,'duration':15,'caption':'Giả thuyết cho cụm nhà thuốc: nhu cầu vật tư chăm sóc tăng ngắn hạn. Hai khoảng neo là giả định của demo, không phải số liệu HCDC.'},
 {'kind':'forecast','case':0,'duration':16,'caption':'Quan sát đường nền, các quỹ đạo minh họa và hai vùng neo. Bối cảnh giúp người vận hành xem xét phương án bổ sung hàng sớm hơn.'},
 {'kind':'source','case':1,'duration':14,'caption':'Thông báo công bố trước một ngày: hạn chế giao thông từ 17:30 ngày 22/4 đến 01:00 ngày 23/4. Đây là sự kiện có thời gian rõ ràng.'},
 {'kind':'scenario','case':1,'duration':15,'caption':'Ví dụ xét tuyến lân cận còn mở: xe chuyển hướng có thể làm tăng thời gian di chuyển. Các giá trị phút và khoảng neo đều được giả lập.'},
 {'kind':'forecast','case':1,'duration':16,'caption':'Neo tập trung vào đỉnh và giai đoạn hạ nhiệt. Có thể thử đổi giờ giao hàng trước khi sự kiện bắt đầu; đây chưa phải dự báo giao thông thực.'},
 {'kind':'source','case':2,'duration':14,'caption':'EVN báo cáo mức tiêu thụ cao trong tuần 22–28/4, đồng thời nêu triển vọng nắng nóng dịu đi. Bản tin có trước mốc dự báo.'},
 {'kind':'scenario','case':2,'duration':15,'caption':'Kịch bản có thể đảo chiều xu hướng: nhu cầu làm mát giảm. Chuỗi MW của cụm cơ sở được giả lập, tách biệt với số kWh toàn quốc.'},
 {'kind':'forecast','case':2,'duration':16,'caption':'Đường nền kéo dài xu hướng tăng; bối cảnh gợi ý hạ phụ tải. Các quỹ đạo được minh họa quanh khoảng neo, không có tuyên bố về độ chính xác.'},
 {'kind':'outro','duration':12,'caption':'Ba ngành, cùng một quy trình: bằng chứng, kịch bản, điểm neo, dự báo. Mở demo tương tác để kiểm tra nguồn và thay đổi độ mạnh điểm neo.'},
]
TOTAL = sum(s['duration'] for s in SCENES)

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

def common(scene,idx):
    im=BG.copy();d=ImageDraw.Draw(im)
    txt(d,(90,43),'ScenarioDiff',28,'serif');star(d,290,61,16)
    txt(d,(1415,49),'RESEARCH / DEMO VI',20,'mono')
    rule(d,94)
    rule(d,949,color=LINE)
    wrap(d,(90,969),scene['caption'],1650,23,fill=INK,leading=1.4)
    txt(d,(90,1045),'SỰ KIỆN THẬT · CHUỖI VẬN HÀNH VÀ DỰ BÁO GIẢ LẬP',16,'mono',MUTED)
    txt(d,(1700,1041),f'{idx+1:02d} / {len(SCENES):02d}',18,'mono',MUTED)
    return im,d

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

def trajectory(c,amount=.7):
    sign=1 if c['id']=='energy' else -1
    result=[]
    for i,v in enumerate(c['guided']):
        local=max(math.exp(-.5*((i-a['i'])/.8)**2) for a in c['anchors'])
        result.append(v+sign*(c['range'][1]-c['range'][0])*.18*local*(1-amount))
    return result

def chart(d,c,box,stage=0,progress=1,sampling=1,show_anchors=True,anchor_strength=.7):
    x0,y0,x1,y1=box
    d.rounded_rectangle(box,radius=5,fill='#f7f8fb',outline='#cad0d9',width=1)
    txt(d,(x0+30,y0+20),c['metric'],25,'serif')
    txt(d,(x0+30,y0+60),c['unit']+' · toàn bộ đường cong giả lập',17,'sans',MUTED)
    left,top,right,bottom=x0+70,y0+123,x1-35,y1-120
    origin=left+(right-left)*.42
    d.rectangle((origin,top,right,bottom),fill='#ecedf5')
    lo,hi=c['range'];yy=lambda v:bottom-(v-lo)/(hi-lo)*(bottom-top)
    hx=lambda i:left+(origin-left)*i/(len(c['history'])-1)
    fx=lambda i:origin+(right-origin)*(i+1)/len(c['baseline'])
    for v in c['ticks']:
        d.line((left,yy(v),right,yy(v)),fill='#dce0e7',width=1)
        txt(d,(left-55,yy(v)-10),str(v),16,'mono',MUTED)
    d.line((origin,top,origin,bottom),fill='#a3aeba',width=2)
    hist=[(hx(i),yy(v)) for i,v in enumerate(c['history'])]
    base=[hist[-1]]+[(fx(i),yy(v)) for i,v in enumerate(c['baseline'])]
    values=trajectory(c,anchor_strength)
    guided=[hist[-1]]+[(fx(i),yy(v)) for i,v in enumerate(values)]
    path(d,hist,INK,4)
    for x,y in hist:d.ellipse((x-4,y-4,x+4,y+4),fill=INK)
    path(d,base,'#8f99a7',3,dashed=True)
    for i in [0,3,7]:txt(d,(hx(i)-17,bottom+12),c['historyDates'][i],16,'mono',MUTED)
    indexes=sorted(set([0,len(c['futureDates'])//2,len(c['futureDates'])-1]))
    for i in indexes:txt(d,(fx(i)-22,bottom+12),c['futureDates'][i],16,'mono',MUTED)
    txt(d,(left,top-32),'LỊCH SỬ GIẢ LẬP',16,'mono',MUTED)
    txt(d,(origin+20,top-32),'TƯƠNG LAI MINH HỌA',16,'mono',BLUE)
    if stage>=3 and show_anchors:
        for a in c['anchors']:
            x=fx(a['i']);d.rounded_rectangle((x-18,yy(a['hi']),x+18,yy(a['lo'])),radius=6,fill='#ebccda',outline=PINK,width=2)
    if stage>=4:
        for j in range(6):
            pp=[hist[-1]]
            for i,v in enumerate(values):
                noise=(hi-lo)*(.16*(1-sampling)+.018)*math.sin((i+1)*(j+1)*1.47+j)
                vv=v+noise
                pp.append((fx(i),yy(vv)))
            path(d,pp,'#b7c4d7',2,progress)
        mean=[hist[-1]]+[(fx(i),yy(v+(hi-lo)*.11*(1-sampling)*math.sin((i+1)*2.1))) for i,v in enumerate(values)]
        path(d,mean,BLUE,5,progress)
    elif stage==2:
        # Only qualitative direction: no numeric forecast appears at this stage.
        txt(d,(origin+32,top+45),'KỊCH BẢN',18,'mono',BLUE)
        wrap(d,(origin+32,top+85),'Tăng ngắn hạn' if c['id']=='pharmacy' else 'Đỉnh theo giờ' if c['id']=='traffic' else 'Giảm dần',right-origin-60,31,'serif',BLUE)
    legendY=y1-50
    for x,label,color in [(x0+30,'Lịch sử',INK),(x0+220,'Đường nền','#8f99a7'),(x0+465,'Có bối cảnh',BLUE),(x0+740,'Neo',PINK)]:
        d.line((x,legendY+10,x+30,legendY+10),fill=color,width=4);txt(d,(x+40,legendY),label,18,fill=MUTED)

def source_card(d,c,box):
    x,y,x1,y1=box;d.rectangle(box,fill='#f9f9fc',outline='#adb6c3',width=1)
    pill(d,(x+30,y+28),'BẢN TIN THẬT')
    txt(d,(x+30,y+88),c['published'],20,'mono',MUTED)
    cy=wrap(d,(x+30,y+138),c['sourceTitle'],x1-x-60,36,'serif',leading=1.25)
    rule(d,cy+20,x+30,x1-30,LINE)
    txt(d,(x+30,cy+45),c['stat'],85,'serif')
    cy=wrap(d,(x+30,cy+151),c['statUnit'],x1-x-60,22,fill=MUTED)
    wrap(d,(x+30,cy+23),c['factSecondary'],x1-x-60,25,fill=BLUE)
    wrap(d,(x+30,y1-70),c['source'],x1-x-60,18,'mono',MUTED)

def heading(d,kicker,title):
    txt(d,(90,130),kicker.upper(),21,'mono',MUTED)
    wrap(d,(90,178),title,1720,64,'serif',leading=1.1)

@lru_cache(maxsize=24)
def static_scene(idx):
    s=SCENES[idx]; im,d=common(s,idx);kind=s['kind']
    if kind=='intro':
        star(d,1580,268,102);star(d,1720,183,38)
        txt(d,(90,164),'TỪ THÔNG BÁO ĐẾN DỰ BÁO',25,'mono',MUTED)
        wrap(d,(90,268),'Đọc bối cảnh.\nThấy một tương lai khác.',1600,109,'serif',leading=1.12)
        rule(d,573)
        txt(d,(95,620),'03',93,'serif');txt(d,(275,635),'sự kiện thật tại Việt Nam',41,'serif')
        txt(d,(277,704),'Y TẾ  /  GIAO THÔNG  /  NĂNG LƯỢNG',24,'mono',MUTED)
        wrap(d,(95,819),'Một minh họa bằng tiếng Việt về cơ chế ScenarioDiff.',1500,32,fill=MUTED)
    elif kind=='method':
        heading(d,'Cơ chế trong bài báo','Bằng chứng có vai trò ở từng bước.')
        names=['Lọc bằng chứng','Tạo kịch bản','Đặt khoảng neo','Tạo quỹ đạo']
        agents=['Historical Context Agent','Scenario Agent','Anchor Guidance Agent','Diffusion + Anchor Blending']
        desc=['Đọc tài liệu đã có tại mốc dự báo.','Mô tả hướng biến động bằng ngôn ngữ.','Chọn thời điểm và khoảng giá trị cần chú ý.','Sinh các khả năng rồi hiệu chỉnh cục bộ.']
        for i in range(4):
            x=90+i*445
            d.ellipse((x,380,x+76,456),outline=INK,width=1);txt(d,(x+23,393),str(i+1),32,'serif')
            if i<3:d.line((x+76,419,x+425,419),fill=INK,width=1)
            txt(d,(x,505),names[i],35,'serif')
            wrap(d,(x,566),agents[i],382,20,'mono',BLUE)
            wrap(d,(x,654),desc[i],368,28)
        rule(d,802)
        txt(d,(90,834),'Trong demo: diễn giải được soạn sẵn; không chạy LLM hoặc checkpoint.',26,fill=MUTED)
    elif kind in ['source','scenario','forecast']:
        c=CASES[s['case']]
        suffix={'source':'Bằng chứng có trước dự báo','scenario':'Từ nhận định đến khoảng neo','forecast':'Quan sát tác động lên quỹ đạo'}[kind]
        heading(d,c['number']+' / '+c['domain'],suffix)
        if kind=='source':
            source_card(d,c,(90,310,790,890))
            txt(d,(865,322),'MỐC DỰ BÁO',21,'mono',MUTED)
            txt(d,(865,367),c['cutoff'],41,'serif')
            rule(d,433,865,1830,LINE)
            wrap(d,(865,474),c['title'],930,59,'serif',leading=1.16)
            wrap(d,(865,650),c['context'],900,29,leading=1.5)
            pill(d,(865,832),'NGUỒN CÓ TRƯỚC MỐC DỰ BÁO')
        elif kind=='scenario':
            txt(d,(90,325),'SCENARIO AGENT / MINH HỌA',19,'mono',MUTED)
            y=wrap(d,(90,368),c['scenario'],610,34,'serif',leading=1.35)
            rule(d,y+29,90,720,LINE)
            txt(d,(90,y+58),'ANCHOR GUIDANCE / MINH HỌA',19,'mono',MUTED)
            for i,a in enumerate(c['anchors']):
                txt(d,(90,y+108+i*66),a['label'],31,'serif',PINK)
            wrap(d,(90,813),'Các khoảng neo là giả định của demo, không phải số đo từ bản tin.',605,22,fill=MUTED)
            chart(d,c,(790,310,1830,890),stage=3)
        else:
            txt(d,(90,322),'BỐI CẢNH → ĐIỂM NEO → QUỸ ĐẠO',18,'mono',MUTED)
            wrap(d,(90,374),c['action'],610,44,'serif',leading=1.24)
            rule(d,635,90,715,LINE)
            wrap(d,(90,667),c['assumption'],610,23,fill=MUTED,leading=1.5)
            txt(d,(90,863),'MÔ PHỎNG CƠ CHẾ / KHÔNG CHẤM ĐỘ CHÍNH XÁC',16,'mono',BLUE)
            chart(d,c,(790,310,1830,890),stage=3)
    else:
        heading(d,'Từ nghiên cứu đến ứng dụng','Cùng một quy trình. Ba kiểu tác động.')
        for i,(big,small) in enumerate([('Tăng ngắn hạn','Y tế · chuẩn bị tồn kho'),('Đỉnh cục bộ','Giao thông · điều phối theo giờ'),('Đảo chiều','Năng lượng · xem xét lịch vận hành')]):
            x=90+i*580;txt(d,(x,365),f'0{i+1}',72,'serif',BLUE)
            txt(d,(x,485),big,45,'serif');wrap(d,(x,558),small,500,28)
        rule(d,693)
        txt(d,(90,748),'Khám phá nguồn & thử từng bước',55,'serif')
        txt(d,(90,838),'katd2707.github.io/ScenarioDiff-demo',28,'mono',BLUE)
        star(d,1760,811,53)
    return im

def frame(idx,local,global_t):
    im=static_scene(idx).copy();d=ImageDraw.Draw(im);s=SCENES[idx]
    u=local/s['duration']
    if s['kind']=='forecast':
        c=CASES[s['case']];sampling=min(1,local/7)
        amount=.7*max(0,min(1,(local-8)/4))
        chart(d,c,(790,310,1830,890),stage=4,progress=min(1,local/3),sampling=sampling,show_anchors=local>=8,anchor_strength=amount)
        phase='01 / Khởi tạo nhiễu' if local<3 else '02 / Khử nhiễu có bối cảnh' if local<8 else '03 / Hiệu chỉnh quanh neo'
        txt(d,(810,906),phase+' · hoạt ảnh minh họa',20,'sans',BLUE)
    elif s['kind']=='method':
        selected=min(3,int(local/3.5));x=90+selected*445
        d.ellipse((x,380,x+76,456),fill=INK);txt(d,(x+23,393),str(selected+1),32,'serif','#fff')
    d.rectangle((0,H-5,int(W*global_t/TOTAL),H),fill=BLUE)
    # Short fade-in per chapter, while keeping the text stable for reading.
    if local<.35:
        im=Image.blend(BG,im,local/.35)
    return im

def stamp(t):
    return f'{int(t)//3600:02d}:{int(t)//60%60:02d}:{int(t)%60:02d}.000'

def supporting_files():
    t=0;vtt=['WEBVTT',''];transcript=['# ScenarioDiff — Demo tiếng Việt','', 'Sự kiện thật; chuỗi vận hành, kịch bản, neo và quỹ đạo giả lập. Không chạy mô hình.','']
    chapters=[]
    for i,s in enumerate(SCENES):
        vtt.extend([str(i+1),f'{stamp(t)} --> {stamp(t+s["duration"])}',s['caption'],''])
        title=s['kind'] if 'case' not in s else CASES[s['case']]['domain']+' / '+s['kind']
        chapters.append({'start':t,'title':title});transcript.extend([f'## {stamp(t)} — {title}',s['caption'],'']);t+=s['duration']
    (OUT/'demo-vi.vtt').write_text('\n'.join(vtt),encoding='utf-8')
    (OUT/'demo-transcript-vi.md').write_text('\n'.join(transcript),encoding='utf-8')
    (OUT/'demo-chapters.json').write_text(json.dumps({'duration':TOTAL,'chapters':chapters},ensure_ascii=False,indent=2),encoding='utf-8')
    with (OUT/'demo-series.csv').open('w',newline='',encoding='utf-8-sig') as f:
        writer=csv.writer(f);writer.writerow(['case','period','series','value','unit','provenance'])
        for c in CASES:
            for name,dates in [('history',c['historyDates']),('baseline',c['futureDates']),('guided',c['futureDates'])]:
                writer.writerows([c['id'],date,name,v,c['unit'],'authored_simulation'] for date,v in zip(dates,c[name]))
            for name,amount in [('scenario_before_anchors',0),('default_forecast_70_percent',.7)]:
                writer.writerows([c['id'],date,name,round(v,3),c['unit'],'authored_simulation'] for date,v in zip(c['futureDates'],trajectory(c,amount)))

def render():
    supporting_files()
    frame(0,5,5).save(OUT/'poster.jpg',quality=95)
    # Still previews are part of the reviewable demo, not a separate working folder.
    preview=Image.new('RGB',(1920,1620),'white')
    for i,idx in enumerate([0,1,2,3,6,10]):
        scene=frame(idx,8,8);scene.thumbnail((960,540));preview.paste(scene,((i%2)*960,(i//2)*540))
    preview.save(ROOT/'_archive'/'video-review.jpg',quality=92)
    for i,c in enumerate(CASES):
        frame([4,7,10][i],14,14).save(OUT/(c['id']+'-poster.jpg'),quality=93)
    if '--preview' in sys.argv:
        print('Preview and supporting files ready.',flush=True);return
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    writer=imageio_ffmpeg.write_frames(str(OUT/'scenariodiff-demo.mp4'),(W,H),fps=FPS,codec='libx264',pix_fmt_in='rgb24',pix_fmt_out='yuv420p',quality=8,macro_block_size=1,output_params=['-preset','fast','-crf','20','-movflags','+faststart'])
    writer.send(None);global_t=0
    try:
        for idx,s in enumerate(SCENES):
            for f in range(s['duration']*FPS):
                writer.send(np.asarray(frame(idx,f/FPS,global_t+f/FPS)))
            global_t+=s['duration'];print(f'Chapter {idx+1}/{len(SCENES)} rendered ({global_t}s)',flush=True)
    finally:writer.close()
    # Reuse the informative scenario + forecast sequences as short, captioned loops.
    for c,start in zip(CASES,[37,82,127]):
        subprocess.run([ffmpeg,'-y','-ss',str(start),'-i',str(OUT/'scenariodiff-demo.mp4'),'-t','31','-an','-vf','scale=1280:720','-c:v','libx264','-crf','22','-preset','fast','-movflags','+faststart',str(OUT/(c['id']+'-loop.mp4'))],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    print(f'Completed {TOTAL}s film and three 31s examples.',flush=True)

if __name__=='__main__':render()
