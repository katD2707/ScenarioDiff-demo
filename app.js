const stories = {
  pharmacy: {
    kicker: "ILLUSTRATIVE / HEALTHCARE", title: "A local demand surge is coming.",
    description: "The sales curve looks routine. Early context suggests a change before it shows up at the pharmacy counter.",
    icon: "✚", label: "WEEKLY MEDICINE DEMAND INDEX",
    history: [57,59,58,61,60,62,64,61,63,65,64,66,65,67,66,68],
    baseline: [68,69,70,71,70,71,73,73,74,75,75,76],
    guided: [69,71,77,86,95,101,99,93,87,83,80,78],
    anchors: [{i:5,lo:91,hi:105},{i:8,lo:82,hi:96}],
    evidence: "A fictional local health bulletin and supply note flag growing demand for fever remedies.",
    scenario: "Demand rises sharply for a short period, then eases as supply and conditions stabilize.",
    anchorText: "Two soft bands mark the likely surge and its gradual decline.",
    forecastText: "The illustrated trajectory responds to the signal and is locally refined around the anchor bands."
  },
  traffic: {
    kicker: "ILLUSTRATIVE / SMART CITY", title: "The bottleneck is announced first.",
    description: "Traffic still follows its usual rhythm, but a planned lane closure changes what may happen next.",
    icon: "↗", label: "EVENING CONGESTION INDEX",
    history: [44,47,43,48,46,49,45,48,50,47,51,49,53,50,54,52],
    baseline: [53,54,55,54,56,56,57,57,58,57,59,59],
    guided: [54,57,65,76,89,94,91,84,76,70,65,61],
    anchors: [{i:5,lo:87,hi:100},{i:9,lo:65,hi:77}],
    evidence: "A fictional roadworks bulletin and event schedule identify an upcoming corridor constraint.",
    scenario: "Congestion spikes around the closure, then fades as traffic redistributes.",
    anchorText: "Sparse intervals target the peak and the recovery period.",
    forecastText: "The scenario-guided line illustrates an event-aware forecast before congestion appears in the history."
  },
  energy: {
    kicker: "ILLUSTRATIVE / ENERGY", title: "A heatwave changes the load outlook.",
    description: "An ordinary consumption trend is accompanied by an early weather signal and an operations note.",
    icon: "ϟ", label: "ELECTRICITY LOAD INDEX",
    history: [69,70,68,71,72,70,73,74,72,74,75,73,76,77,75,78],
    baseline: [79,79,80,81,81,82,83,82,83,84,83,84],
    guided: [79,82,86,93,100,105,108,103,97,91,87,84],
    anchors: [{i:6,lo:99,hi:112},{i:9,lo:87,hi:99}],
    evidence: "A fictional temperature alert and maintenance note indicate pressure on local demand.",
    scenario: "Cooling demand rises for several periods before gradually returning toward normal.",
    anchorText: "The agent places plausible ranges near the peak and easing phase.",
    forecastText: "The illustrated forecast explores a higher-demand future while retaining the surrounding pattern."
  }
};

let activeCase = "pharmacy";
let activeStep = 0;
const stageNames = ["NUMERICAL HISTORY", "HISTORICAL CONTEXT", "SCENARIO DESCRIPTION", "SPARSE ANCHORS", "ILLUSTRATIVE FORECAST"];
const nextNames = ["evidence", "scenario", "anchors", "forecast", "restart"];
const svgNS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(svgNS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (parent) parent.appendChild(node);
  return node;
}
function textNode(parent, value, x, y, extra = {}) {
  const node = el("text", { x, y, ...extra }, parent);
  node.textContent = value;
  return node;
}
function smoothPath(points) {
  if (!points.length) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}
function renderChart() {
  const svg = document.getElementById("demo-chart");
  const story = stories[activeCase];
  svg.replaceChildren();
  const y = v => 280 - (v - 35) * 2.35;
  const histX = i => 42 + i * 20.2;
  const futureX = i => 345 + i * 32.7;
  const history = story.history.map((v, i) => [histX(i), y(v)]);
  const base = [[histX(15), y(story.history[15])], ...story.baseline.map((v, i) => [futureX(i), y(v)])];
  const guided = [[histX(15), y(story.history[15])], ...story.guided.map((v, i) => [futureX(i), y(v)])];
  el("rect", {x:345,y:19,width:378,height:262,fill:"#f2f6ff"}, svg);
  [40,60,80,100,120].forEach(v => {
    el("line",{x1:39,y1:y(v),x2:726,y2:y(v),stroke:"#e5ebea","stroke-width":1},svg);
    textNode(svg,String(v),8,y(v)+4,{fill:"#96a8ad","font-size":10,"font-family":"DM Sans, sans-serif"});
  });
  el("line",{x1:345,y1:19,x2:345,y2:281,stroke:"#a5b8bd","stroke-width":1.5,"stroke-dasharray":"5 5"},svg);
  textNode(svg,"FORECAST ORIGIN",354,307,{fill:"#8da1a7","font-size":9,"font-weight":800,"letter-spacing":".12em","font-family":"DM Sans, sans-serif"});
  if (activeStep >= 3) story.anchors.forEach((a,j) => {
    const x = futureX(a.i), top = y(a.hi), bottom = y(a.lo);
    el("rect",{x:x-13,y:top,width:26,height:bottom-top,rx:7,fill:"#fb775e33",stroke:"#fb775e","stroke-width":1.5},svg);
    textNode(svg,`ANCHOR ${j+1}`,x-25,top-10,{fill:"#db634b","font-size":9,"font-weight":800,"font-family":"DM Sans, sans-serif"});
  });
  el("path",{d:smoothPath(history),fill:"none",stroke:"#3b5961","stroke-width":3,"stroke-linecap":"round"},svg);
  el("circle",{cx:history.at(-1)[0],cy:history.at(-1)[1],r:5,fill:"#3b5961",stroke:"#fff","stroke-width":2},svg);
  el("path",{d:smoothPath(base),fill:"none",stroke:"#a9b8bf","stroke-width":2.5,"stroke-dasharray":"7 7","stroke-linecap":"round"},svg);
  if (activeStep >= 2) {
    if (activeStep === 4) {
      const upper = guided.map(([x,yy])=>[x,yy-14]), lower = [...guided].reverse().map(([x,yy])=>[x,yy+14]);
      el("path",{d:`${smoothPath(upper)} L${lower[0][0]},${lower[0][1]} ${smoothPath(lower).replace(/^M[^C]*/,"")} Z`,fill:"#315fff18"},svg);
    }
    el("path",{d:smoothPath(guided),fill:"none",stroke:"#315fff","stroke-width":activeStep===4?4:2.5,"stroke-dasharray":activeStep===4?"":"7 7",opacity:activeStep===4?1:.55,"stroke-linecap":"round"},svg);
    if (activeStep === 4) el("circle",{cx:guided.at(-1)[0],cy:guided.at(-1)[1],r:5,fill:"#315fff",stroke:"#fff","stroke-width":2},svg);
  }
  if (activeStep === 1) {
    el("rect",{x:379,y:32,width:327,height:50,rx:8,fill:"#fff",stroke:"#cddfe4"},svg);
    textNode(svg,"EARLY DOCUMENT SIGNAL",395,52,{fill:"#315fff","font-size":10,"font-weight":800,"font-family":"DM Sans, sans-serif"});
    textNode(svg,"Evidence arrives before the curve changes",395,69,{fill:"#526a73","font-size":10,"font-family":"DM Sans, sans-serif"});
  }
  svg.setAttribute("aria-label",`${story.label}: observed history, illustrative history-only forecast${activeStep>=2?", scenario-guided line":""}${activeStep>=3?", and anchor intervals":""}`);
}
function renderStory() {
  const story = stories[activeCase];
  document.getElementById("case-kicker").textContent = story.kicker;
  document.getElementById("case-title").textContent = story.title;
  document.getElementById("case-description").textContent = story.description;
  document.getElementById("case-icon").textContent = story.icon;
  document.getElementById("chart-label").textContent = story.label;
  document.getElementById("step-tag").textContent = `0${activeStep+1} / ${stageNames[activeStep]}`;
  document.getElementById("step-text").textContent = [
    "A familiar pattern. The historical values alone do not reveal the upcoming event.",
    story.evidence, story.scenario, story.anchorText, story.forecastText
  ][activeStep];
  document.getElementById("next-step").innerHTML = `${activeStep===4?"Restart story":"Next: "+nextNames[activeStep]} <span aria-hidden="true">→</span>`;
  document.querySelectorAll(".case-tab").forEach(button => {
    const chosen = button.dataset.case === activeCase;
    button.classList.toggle("active",chosen);
    button.setAttribute("aria-selected",String(chosen));
    button.tabIndex = chosen ? 0 : -1;
  });
  document.getElementById("case-panel").setAttribute("aria-labelledby",`tab-${activeCase}`);
  document.querySelectorAll(".step-button").forEach(button => {
    const chosen = Number(button.dataset.step) === activeStep;
    button.classList.toggle("active",chosen);
    button.setAttribute("aria-pressed",String(chosen));
  });
  renderChart();
}
document.querySelectorAll(".case-tab").forEach(button => button.addEventListener("click", () => {
  activeCase = button.dataset.case;
  activeStep = 0;
  renderStory();
}));
document.querySelector(".case-tabs").addEventListener("keydown", event => {
  if (!["ArrowLeft","ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const keys = Object.keys(stories);
  const direction = event.key === "ArrowRight" ? 1 : -1;
  activeCase = keys[(keys.indexOf(activeCase) + direction + keys.length) % keys.length];
  activeStep = 0;
  renderStory();
  document.getElementById(`tab-${activeCase}`).focus();
});
document.querySelectorAll(".step-button").forEach(button => button.addEventListener("click", () => {
  activeStep = Number(button.dataset.step);
  renderStory();
}));
document.getElementById("next-step").addEventListener("click", () => {
  activeStep = (activeStep + 1) % 5;
  renderStory();
});
renderStory();
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), {threshold:.08});
  document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
} else document.querySelectorAll(".reveal").forEach(item => item.classList.add("visible"));
