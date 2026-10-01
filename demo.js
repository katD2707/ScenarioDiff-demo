/* Presentation-only explorer. No API calls, model inference, or customer data. */
(() => {
  'use strict';
  const data = window.SCENARIO_DEMO;
  const stories = Object.fromEntries(data.cases.map(c => [c.id, c]));
  const $ = id => document.getElementById(id);
  let activeCase = 'pharmacy', activeStep = 0, strength = .7, showContext = true;
  let timer = null, animation = null, animationProgress = 1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const stages = ['Đường nền từ lịch sử', 'Giữ lại bằng chứng liên quan', 'Hình dung một kịch bản', 'Đặt ràng buộc ở vài thời điểm', 'Tạo và hiệu chỉnh quỹ đạo'];
  const roles = ['DỮ LIỆU ĐẦU VÀO', 'HISTORICAL CONTEXT AGENT', 'SCENARIO AGENT', 'ANCHOR GUIDANCE AGENT', 'DIFFUSION + ANCHOR BLENDING'];
  const put = (id, value) => { $(id).textContent = value; };
  function element(tag, cls, text, parent) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    if (parent) parent.append(el);
    return el;
  }
  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (parent) parent.append(el);
    return el;
  }
  function svgText(parent, text, x, y, attrs = {}) {
    const node = svgEl('text', {x, y, fill:'#58616d', 'font-family':'DemoSans, Arial, sans-serif', 'font-size':13, ...attrs}, parent);
    node.textContent = text;
    return node;
  }
  const path = points => points.map((p,i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const number = value => new Intl.NumberFormat('vi-VN', {maximumFractionDigits:1}).format(value);

  // A deterministic local blend solely for teaching the role of anchor strength.
  // It is not an implementation or evaluation of the paper's sampler.
  function trajectory(c, amount = strength) {
    const sign = c.id === 'energy' ? 1 : -1;
    return c.guided.map((v, i) => {
      const local = Math.max(...c.anchors.map(a => Math.exp(-.5 * ((i-a.i)/.8)**2)));
      return v + sign * (c.range[1]-c.range[0]) * .18 * local * (1-amount);
    });
  }
  function renderChart() {
    const c = stories[activeCase], svg = $('demo-chart');
    svg.replaceChildren();
    const left = 55, right = 895, top = 62, bottom = 350, origin = 399;
    const y = v => bottom - (v-c.range[0])/(c.range[1]-c.range[0])*(bottom-top);
    const hx = i => left+(origin-left)*i/(c.history.length-1);
    const fx = i => origin+(right-origin)*(i+1)/c.baseline.length;
    const hist = c.history.map((v,i)=>[hx(i),y(v)]);
    const base = [hist.at(-1), ...c.baseline.map((v,i)=>[fx(i),y(v)])];
    const values = trajectory(c);
    const guided = [hist.at(-1), ...values.map((v,i)=>[fx(i),y(v)])];
    const defs=svgEl('defs',{},svg),clip=svgEl('clipPath',{id:'plot-clip'},defs);
    svgEl('rect',{x:left,y:top,width:right-left,height:bottom-top},clip);
    svgEl('rect',{x:origin,y:top,width:right-origin,height:bottom-top,fill:'#edf0f7'},svg);
    c.ticks.forEach(v=>{
      svgEl('line',{x1:left,y1:y(v),x2:right,y2:y(v),stroke:'#dce1e8'},svg);
      svgText(svg,number(v),left-10,y(v)+4,{'text-anchor':'end','font-size':12});
    });
    svgEl('line',{x1:origin,y1:top-3,x2:origin,y2:bottom,stroke:'#a7b1bf','stroke-dasharray':'4 5'},svg);
    svgText(svg,'LỊCH SỬ GIẢ LẬP',left,28,{'font-size':12,'letter-spacing':'.6'});
    svgText(svg,'TƯƠNG LAI MINH HỌA',origin+18,28,{'font-size':12,'letter-spacing':'.6',fill:'#456486'});
    [0,3,7].forEach(i=>svgText(svg,c.historyDates[i],hx(i),bottom+26,{'text-anchor':'middle','font-size':12}));
    const futureLabels = c.futureDates.length > 7 ? [0,2,4,6,9] : c.futureDates.map((_,i)=>i);
    futureLabels.forEach(i=>svgText(svg,c.futureDates[i],fx(i),bottom+26,{'text-anchor':'middle','font-size':12}));
    svgText(svg,'Mốc dự báo: '+c.cutoff,left,410,{'font-size':12});
    const plot = svgEl('g',{'clip-path':'url(#plot-clip)'},svg);
    if (activeStep >= 3) c.anchors.forEach(a=>{
      svgEl('rect',{x:fx(a.i)-15,y:y(a.hi),width:30,height:y(a.lo)-y(a.hi),rx:5,fill:'#eacbdb',stroke:'#ad576f','stroke-width':1.5},plot);
      svgText(svg,`${a.lo}–${a.hi}`,fx(a.i),y(a.hi)-11,{'text-anchor':'middle','font-size':12,fill:'#93445f'});
    });
    svgEl('path',{d:path(hist),fill:'none',stroke:'#272727','stroke-width':3,'stroke-linejoin':'round'},plot);
    hist.forEach(([cx,cy],i)=>{
      const dot=svgEl('circle',{cx,cy,r:3.5,fill:'#272727'},plot);
      svgEl('title',{},dot).textContent=`${c.historyDates[i]}: ${number(c.history[i])} ${c.unit} (giả lập)`;
    });
    svgEl('path',{d:path(base),fill:'none',stroke:'#9aa3b0','stroke-width':2,'stroke-dasharray':'7 6'},plot);
    if (activeStep===1) {
      svgEl('rect',{x:75,y:77,width:290,height:59,fill:'#fff',stroke:'#b3bfd0'},svg);
      svgText(svg,'BẢN TIN ĐÃ CÓ',90,99,{'font-size':11,fill:'#456486'});
      svgText(svg,c.published,90,122,{'font-size':13,fill:'#272727'});
    }
    if ((activeStep===2 || activeStep===3) && showContext) {
      svgText(svg,'KỊCH BẢN ĐỊNH TÍNH',origin+28,94,{'font-size':11,fill:'#456486'});
      svgText(svg,c.id==='energy'?'Giảm dần sau nắng nóng':c.id==='traffic'?'Đỉnh cục bộ theo giờ':'Tăng ngắn hạn rồi hạ dần',origin+28,123,{'font-size':19,fill:'#456486','font-family':'DemoSerif, Georgia, serif'});
    }
    if (activeStep===4 && showContext) {
      const span=c.range[1]-c.range[0];
      for (let j=0;j<6;j++) {
        const points=[hist.at(-1),...values.map((v,i)=>[fx(i),y(v+span*(.14*(1-animationProgress)+.013)*Math.sin((i+1)*(j+1)*1.47+j))])];
        svgEl('path',{d:path(points),fill:'none',stroke:'#bdcbdc','stroke-width':1.3,opacity:.75},plot);
      }
      const animated=[hist.at(-1),...values.map((v,i)=>[fx(i),y(v+span*.1*(1-animationProgress)*Math.sin((i+1)*2.1))])];
      svgEl('path',{id:'guided-path',d:path(animationProgress<1?animated:guided),fill:'none',stroke:'#456486','stroke-width':3.5,'stroke-linejoin':'round'},plot);
      const last=guided.at(-1);
      svgEl('circle',{cx:last[0],cy:last[1],r:4,fill:'#456486'},plot);
    }
    svg.setAttribute('aria-label',`${c.metric}, ${c.unit}. Lịch sử và dự báo giả lập. ${activeStep>=3?'Hai khoảng neo. ':''}${activeStep===4&&showContext?'Đường theo bối cảnh và đường nền.':''}`);
    put('chart-explanation', activeStep===4 ? (showContext ? 'Các nét nhạt là quỹ đạo minh họa, không phải khoảng tin cậy. Điểm neo chỉ tác động quanh các thời điểm được chọn.' : 'Đang xem đường nền khi ẩn quỹ đạo có bối cảnh. Bật lại để so sánh.') : activeStep>=2 ? 'Ở bước này, kịch bản mô tả hướng biến động; quỹ đạo số chỉ xuất hiện ở bước Dự báo.' : 'Đường đứt biểu diễn ngoại suy giả lập từ lịch sử. Bản tin và dữ liệu kinh doanh là hai nguồn thông tin riêng biệt.');
  }
  function cancelAnimation() {
    if (animation) cancelAnimationFrame(animation);
    animation=null;animationProgress=1;
  }
  function animateForecast() {
    cancelAnimation();
    if (reducedMotion.matches) {renderChart();return;}
    const start=performance.now();
    function tick(now) {
      animationProgress=Math.min(1,(now-start)/2400);renderChart();
      if(animationProgress<1)animation=requestAnimationFrame(tick);else animation=null;
    }
    animation=requestAnimationFrame(tick);
  }
  function stopAuto() {
    clearInterval(timer);timer=null;
    put('auto-demo','▶ Tự chạy');$('auto-demo').setAttribute('aria-pressed','false');
  }
  function renderStory(animate=false) {
    const c=stories[activeCase];
    put('case-kicker',c.brand);put('case-title',c.title);put('case-cutoff',c.cutoff);put('case-period',c.forecastPeriod);
    put('source-date',c.published);$('source-date').dateTime=c.publishedISO;
    put('source-title',c.sourceTitle);put('source-stat',c.stat);put('source-stat-unit',c.statUnit);put('source-fact',c.fact);
    $('source-link').href=c.url;put('source-link',c.source+' ↗');
    put('chart-label',c.metric);put('chart-unit',c.unit+' · '+c.historyType);
    put('step-tag',`0${activeStep+1} / ${roles[activeStep]}`);put('step-heading',stages[activeStep]);
    put('step-text',[c.stageNotes[0],c.context,c.scenario,c.anchorText,c.action][activeStep]);
    put('step-detail',activeStep===0?'Đây là dữ liệu giả lập có đơn vị và khung thời gian cụ thể, không phải số đo từ doanh nghiệp.':c.stageNotes[activeStep]);
    put('case-assumption',c.assumption);
    put('next-step',activeStep===4?'Bắt đầu lại ↺':'Tiếp: '+data.stages[activeStep+1]+' →');
    document.querySelectorAll('.case-tab').forEach(button=>{
      const selected=button.dataset.case===activeCase;
      button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
    });
    $('case-panel').setAttribute('aria-labelledby','tab-'+activeCase);
    document.querySelectorAll('.step-button').forEach(button=>{
      const selected=Number(button.dataset.step)===activeStep;
      button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));
    });
    document.querySelector('.lab-evidence').classList.toggle('highlight',activeStep===1);
    $('anchor-strength').disabled=activeStep!==4;$('replay-forecast').disabled=activeStep!==4||!showContext;
    $('anchor-readout').hidden=activeStep<3;
    $('anchor-readout').replaceChildren(...c.anchors.map(a=>element('span','',a.label+' · khoảng neo giả lập')));
    cancelAnimation();renderChart();if(animate&&activeStep===4)animateForecast();
  }
  function selectCase(id,scroll=false) {
    stopAuto();activeCase=id;activeStep=0;renderStory();
    if(scroll)$('interactive').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
  }
  function openClip(c,button) {
    const dialog=$('clip-dialog'),video=$('clip-video');
    put('clip-title',c.number+' / '+c.shortTitle);
    video.src=`assets/${c.id}-loop.mp4`;video.poster=`assets/${c.id}-poster.jpg`;video.preload='metadata';video.load();
    dialog.showModal();video.play().catch(()=>{});
    dialog.addEventListener('close',()=>{video.pause();button.focus();},{once:true});
  }
  function populateExamples() {
    for(const c of data.cases) {
      const card=element('article','event-example',undefined,$('event-examples'));
      const num=element('div','event-number',c.number,card);element('span','',c.domain,num);
      element('h3','',c.title,card);element('div','event-stat',c.stat,card);element('p','event-unit',c.statUnit,card);
      element('p','event-fact',c.fact,card);
      const link=element('a','event-source',c.source+' · '+c.published+' ↗',card);link.href=c.url;link.target='_blank';link.rel='noopener noreferrer';
      const svg=svgEl('svg',{viewBox:'0 0 330 100',class:'event-spark',role:'img','aria-label':'Đường nền và đường theo bối cảnh, cả hai đều giả lập'},card);
      const yy=v=>85-(v-c.range[0])/(c.range[1]-c.range[0])*70;
      const hp=c.history.map((v,i)=>[5+i*17,yy(v)]),bp=[hp.at(-1),...c.baseline.map((v,i)=>[124+(i+1)*200/c.baseline.length,yy(v)])],gp=[hp.at(-1),...trajectory(c,.7).map((v,i)=>[124+(i+1)*200/c.guided.length,yy(v)])];
      svgEl('rect',{x:124,y:5,width:204,height:87,fill:'#e7eaf2'},svg);
      svgEl('path',{d:path(hp),fill:'none',stroke:'#272727','stroke-width':2},svg);
      svgEl('path',{d:path(bp),fill:'none',stroke:'#99a3b1','stroke-dasharray':'4 4','stroke-width':1.5},svg);
      svgEl('path',{d:path(gp),fill:'none',stroke:'#456486','stroke-width':2.5},svg);
      element('p','spark-caption','Đường nền (đứt) / có bối cảnh (xanh) · giả lập',card);
      const actions=element('div','event-actions',undefined,card);
      const explore=element('button','demo-button','Khám phá →',actions);explore.type='button';explore.addEventListener('click',()=>selectCase(c.id,true));
      const clip=element('button','text-button','Xem clip 31 giây ↗',actions);clip.type='button';clip.addEventListener('click',()=>openClip(c,clip));
      const row=element('article','source-register-row',undefined,$('source-register'));element('span','',c.number,row);
      const middle=element('div','',undefined,row),heading=element('h3','',undefined,middle),sourceLink=element('a','',c.sourceTitle+' ↗',heading);
      sourceLink.href=c.url;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
      element('p','',c.source+' · '+c.fact,middle);const time=element('time','',c.published,row);time.dateTime=c.publishedISO;
    }
  }
  document.querySelectorAll('.case-tab').forEach(button=>button.addEventListener('click',()=>selectCase(button.dataset.case)));
  document.querySelector('.case-tabs').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const keys=Object.keys(stories),i=keys.indexOf(activeCase);
    const next=event.key==='Home'?0:event.key==='End'?keys.length-1:(i+(event.key==='ArrowRight'?1:-1)+keys.length)%keys.length;
    selectCase(keys[next]);$('tab-'+activeCase).focus();
  });
  document.querySelectorAll('.step-button').forEach(button=>button.addEventListener('click',()=>{stopAuto();activeStep=Number(button.dataset.step);renderStory(true);}));
  $('next-step').addEventListener('click',()=>{stopAuto();activeStep=(activeStep+1)%5;renderStory(true);});
  $('auto-demo').addEventListener('click',()=>{
    if(timer){stopAuto();return;}
    activeStep=0;renderStory();put('auto-demo','Ⅱ Tạm dừng');$('auto-demo').setAttribute('aria-pressed','true');
    timer=setInterval(()=>{if(activeStep===4){stopAuto();return;}activeStep++;renderStory(true);},6500);
  });
  $('anchor-strength').addEventListener('input',event=>{strength=Number(event.target.value)/100;put('anchor-value',event.target.value+'%');cancelAnimation();renderChart();});
  $('show-context').addEventListener('change',event=>{showContext=event.target.checked;cancelAnimation();renderChart();$('replay-forecast').disabled=activeStep!==4||!showContext;});
  $('replay-forecast').addEventListener('click',animateForecast);
  $('close-clip').addEventListener('click',()=>$('clip-dialog').close());
  $('clip-dialog').addEventListener('click',event=>{if(event.target===$('clip-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();cancelAnimation();}});
  const video=$('presentation-video'),chapterButtons=[...document.querySelectorAll('[data-seek]')];
  chapterButtons.forEach(button=>button.addEventListener('click',()=>{
    const seek=()=>{video.currentTime=Number(button.dataset.seek);video.play().catch(()=>{});};
    if(video.readyState>=1)seek();else{video.addEventListener('loadedmetadata',seek,{once:true});video.load();}
  }));
  video.addEventListener('timeupdate',()=>chapterButtons.forEach((button,i)=>button.classList.toggle('active',video.currentTime>=Number(button.dataset.seek)&&(i===chapterButtons.length-1||video.currentTime<Number(chapterButtons[i+1].dataset.seek)))));
  populateExamples();renderStory();
})();
