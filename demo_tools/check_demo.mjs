// Browser verification for source-backed demo behavior and responsive layout.
import {spawn} from 'node:child_process';
import {mkdtempSync, readFileSync, existsSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const profile=mkdtempSync(join(tmpdir(),'scenariodiff-demo-qa-'));
const browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--no-sandbox','--disable-gpu','--disable-software-rasterizer','--remote-allow-origins=*','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const portFile=join(profile,'DevToolsActivePort');
 for(let i=0;i<100&&!existsSync(portFile);i++)await wait(100);
 assert(existsSync(portFile),'Chrome did not start');
 const port=Number(readFileSync(portFile,'utf8').split('\n')[0]);
 const page=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(p=>p.type==='page');
 const socket=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
 let id=1;const pending=new Map(),errors=[];
 socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const i=id++;pending.set(i,{resolve,reject});socket.send(JSON.stringify({id:i,method,params}));});
 const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1050,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:pathToFileURL(resolve('index.html')).href});
 for(let i=0;i<100;i++){if(await js('document.readyState')==='complete')break;await wait(100);}
 await js('document.fonts.ready');await wait(300);
 assert.equal(await js('document.querySelectorAll(".paper-overall-table tbody tr").length'),20);
 assert.equal(await js('document.querySelectorAll(".paper-overall-table .rank-first").length'),10);
 assert.equal(await js('document.querySelectorAll(".paper-overall-table .rank-second").length'),10);
 assert.equal(await js('document.querySelectorAll(".paper-overall-table .rank-third").length'),10);
 assert.equal(await js('document.querySelectorAll(".paper-results-table:not(.paper-overall-table) .rank-first").length'),6);
 assert.equal(await js('document.querySelectorAll(".paper-results-table:not(.paper-overall-table) .rank-second").length'),6);
 assert.equal(await js('document.querySelectorAll(".paper-results-table:not(.paper-overall-table) .rank-third").length'),6);
 assert.equal(await js('[...document.querySelectorAll(".paper-overall-table tbody th")].some(e=>/\\[\\d+\\]/.test(e.textContent))'),false);
 assert.equal(await js('getComputedStyle(document.querySelector(".paper-overall-table .rank-first")).color'),'rgb(192, 0, 0)');

 assert.equal(await js('document.querySelectorAll(".event-example").length'),3);
 const positions=await js('[...document.querySelectorAll(".event-example")].map(e=>({top:e.getBoundingClientRect().top,left:e.getBoundingClientRect().left,height:e.getBoundingClientRect().height}))');
 assert(positions.every(p=>Math.abs(p.top-positions[0].top)<1),'Desktop examples must share one row');
 assert(positions[0].left<positions[1].left&&positions[1].left<positions[2].left);
 assert(positions.every(p=>p.height<620),'Example cards should remain compact');
 assert.equal(await js('document.querySelectorAll(".examples-legend span").length'),5);

 assert.equal(await js('document.querySelectorAll("#interactive, #demo-sources").length'),0);
 assert.equal(await js('document.querySelectorAll("[lang=vi]").length'),0);
 assert.equal(await js('document.querySelectorAll("a[download], .event-downloads, .demo-resource-links, [data-outcome]").length'),0);
 assert.equal(await js('[...document.querySelectorAll(".denoising-loop")].every(v=>v.paused)'),true,'Reduced motion should pause animations');
 const screenshots=[];
 const shot=async(name,selector)=>{await js(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);await wait(250);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const p=join(tmpdir(),name+'.png');writeFileSync(p,Buffer.from(r.data,'base64'));screenshots.push(p);};
 await shot('scenariodiff-english-video-desktop','#video');
 await shot('scenariodiff-english-examples-desktop','#examples');
 await shot('scenariodiff-table-i-desktop','.paper-overall-table');
 await shot('scenariodiff-table-ii-desktop','.paper-results-table:not(.paper-overall-table)');
 const results=[];
 for(const c of ['pharmacy','traffic','energy']) {
  const select=`document.querySelector('[data-example="${c}"]')`;
  await js(`${select}.querySelector('.toggle-loop').click()`);await wait(500);
  assert.equal(await js(`${select}.querySelector('video').paused`),false,'Animation play failed');
  await js(`${select}.querySelector('.toggle-loop').click()`);
  assert.equal(await js(`${select}.querySelector('video').paused`),true,'Animation pause failed');
  await js(`${select}.querySelector('video').currentTime = 15`);await wait(250);
  const data=await js(`window.SCENARIO_DEMO.cases.find(c=>c.id==='${c}')`);
  assert.equal(data.groundTruth.length,data.futureDates.length);
  results.push({case:c,history:data.history,groundTruth:data.groundTruth});
 }
 await js('document.querySelectorAll("[data-seek]")[3].click()');await wait(1200);
 const media=await js('({duration:document.querySelector("#presentation-video").duration,time:document.querySelector("#presentation-video").currentTime,width:document.querySelector("#presentation-video").videoWidth,height:document.querySelector("#presentation-video").videoHeight})');
 assert(media.time>=68&&media.time<73,'Chapter seek failed');assert.equal(Math.round(media.duration),170);assert.equal(media.width,1920);assert.equal(media.height,1080);
 await js('document.querySelector("#presentation-video").pause();document.querySelector("[data-clip]").click()');
 for(let i=0;i<40;i++){if(await js('Number.isFinite(document.querySelector("#clip-video").duration)'))break;await wait(100);}
 assert.equal(await js('document.querySelector("#clip-dialog").open'),true);
 assert.equal(Math.round(await js('document.querySelector("#clip-video").duration')),31);
 await js('document.querySelector("#close-clip").click()');await wait(150);assert.equal(await js('document.querySelector("#clip-dialog").open'),false);
 assert.equal(await js('document.activeElement.hasAttribute("data-clip")'),true,'Dialog should restore focus');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const mobile=await js('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})');assert.equal(mobile.scrollWidth,mobile.width,'Page overflows on mobile');
 assert.equal(await js('document.querySelector(".paper-overall-table").scrollWidth>document.querySelector(".paper-overall-table").closest(".table-scroll").clientWidth'),true,'Table I should scroll within its region on mobile');
 await shot('scenariodiff-english-example-mobile','.event-example');
 await shot('scenariodiff-english-chart-mobile','.event-visual');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await js('document.querySelectorAll(".denoising-loop").forEach(v=>delete v.dataset.manual);document.querySelector("#video").scrollIntoView({behavior:"instant"})');await wait(200);
 await js('document.querySelector(".denoising-loop").scrollIntoView({behavior:"instant"})');await wait(600);
 assert.equal(await js('document.querySelector(".denoising-loop").paused'),false,'Visible muted loop should autoplay');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(200);
 assert.equal(await js('document.querySelector(".denoising-loop").paused'),true,'Motion preference should stop playback');
 assert.equal(errors.length,0,'Browser runtime errors');
 console.log(JSON.stringify({passed:true,results,media,mobile,screenshots},null,2));socket.close();
} finally {browser.kill();}
