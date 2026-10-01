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
 assert.equal(await js('document.querySelectorAll(".event-example").length'),3);
 assert.equal(await js('document.querySelectorAll("#source-register a").length'),3);
 assert.equal(await js('document.querySelectorAll("#guided-path").length'),0);
 const screenshots=[];
 const shot=async(name,selector)=>{await js(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);await wait(250);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const p=join(tmpdir(),name+'.png');writeFileSync(p,Buffer.from(r.data,'base64'));screenshots.push(p);};
 await shot('scenariodiff-new-video-desktop','#video');
 await shot('scenariodiff-new-examples-desktop','#examples');
 const results=[];
 for(const c of ['pharmacy','traffic','energy']) {
  await js(`document.querySelector('#tab-${c}').click()`);
  assert.equal(await js('document.querySelectorAll("#guided-path").length'),0);
  for(let step=1;step<=4;step++) {
   await js(`document.querySelector('[data-step="${step}"]').click()`);
   assert.equal(await js('document.querySelectorAll("#guided-path").length'),step===4?1:0);
  }
  const setStrength=async value=>{await js(`{const e=document.querySelector('#anchor-strength');e.value=${value};e.dispatchEvent(new Event('input',{bubbles:true}));}`);return js('document.querySelector("#guided-path").getAttribute("d")');};
  const weak=await setStrength(0),strong=await setStrength(100);assert.notEqual(weak,strong,'Anchor slider must change the path');
  await setStrength(70);
  await js('document.querySelector("#show-context").click()');assert.equal(await js('document.querySelectorAll("#guided-path").length'),0);
  await js('document.querySelector("#show-context").click()');assert.equal(await js('document.querySelectorAll("#guided-path").length'),1);
  results.push(await js('({title:document.querySelector("#case-title").textContent,stage:document.querySelector("#step-tag").textContent,source:document.querySelector("#source-link").href})'));
 }
 await js('document.querySelector("#tab-traffic").click();document.querySelector("[data-step=\\"4\\"]").click()');
 await shot('scenariodiff-new-lab-desktop','#case-panel');
 await js('document.querySelector("[data-seek=\\"68\\"]").click()');await wait(1000);
 const media=await js('({duration:document.querySelector("#presentation-video").duration,time:document.querySelector("#presentation-video").currentTime,width:document.querySelector("#presentation-video").videoWidth,height:document.querySelector("#presentation-video").videoHeight})');
 assert(media.time>=68&&media.time<73,'Chapter seek failed');assert.equal(Math.round(media.duration),170);assert.equal(media.width,1920);assert.equal(media.height,1080);
 await js('document.querySelector("#presentation-video").pause();document.querySelector(".event-actions .text-button").click()');
 for(let i=0;i<30;i++){if(await js('Number.isFinite(document.querySelector("#clip-video").duration)'))break;await wait(100);}
 assert.equal(await js('document.querySelector("#clip-dialog").open'),true);
 assert.equal(Math.round(await js('document.querySelector("#clip-video").duration')),31);
 await js('document.querySelector("#close-clip").click()');assert.equal(await js('document.querySelector("#clip-dialog").open'),false);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const mobile=await js('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})');assert.equal(mobile.scrollWidth,mobile.width,'Page overflows on mobile');
 await shot('scenariodiff-new-examples-mobile','#examples');
 await shot('scenariodiff-new-lab-mobile','#case-panel');
 await shot('scenariodiff-new-chart-mobile','.lab-chart-panel');
 assert.equal(errors.length,0,'Browser runtime errors');
 console.log(JSON.stringify({passed:true,results,media,mobile,screenshots},null,2));socket.close();
} finally {browser.kill();}
