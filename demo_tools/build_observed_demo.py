"""Build English examples from published observations; forecasts are authored independently.

Run only when intentionally refreshing source snapshots. The video renderer uses
the committed snapshot and does not need network access.
"""
from pathlib import Path
import csv, io, json, hashlib
from datetime import datetime, timezone
import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets'
records = []

def fetch(url, tokens=()):
    r = requests.get(url, timeout=45)
    r.raise_for_status()
    for token in tokens:
        assert token in r.text, (url, token)
    records.append(dict(url=url, retrievedUTC=datetime.now(timezone.utc).isoformat(),
                        sha256=hashlib.sha256(r.content).hexdigest(), verifiedTokens=list(tokens)))
    return r.text

def series(domain, start, split, end, scale=1):
    url = f'https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/{domain}/{domain}.csv'
    rows = list(csv.DictReader(io.StringIO(fetch(url))))
    selected = [(r['start_date'], round(float(r['OT'])/scale, 3)) for r in rows if start <= r['start_date'] <= end]
    return url, [v for d,v in selected if d < split], [v for d,v in selected if d >= split], [d for d,v in selected]

health_urls = [
 'https://hcdc.vn/tinh-hinh-dich-benh-sot-xuat-huyet-va-tay-chan-mieng-tai-tp-ho-chi-minh-tinh-den-tuan-302024-x6HEAv.html',
 'https://tuoitre.vn/nld/tp-hcm-phat-hien-60-ca-nghi-sot-phat-ban-soi-trong-1-tuan-196240810151904281.htm',
 'https://hcdc.vn/tinh-hinh-dich-benh-sot-xuat-huyet-tay-chan-mieng-va-soi-tai-tp-ho-chi-minh-tinh-den-tuan-322024-39XFah.html',
 'https://thanhnien.vn/tinh-hinh-dich-benh-soi-moi-nhat-tai-tphcm-185240824095909048.htm',
 'https://alobacsi.com/hcdc-benh-truyen-nhiem-o-tphcm-tang-cao.html',
 'https://vtv.vn/suc-khoe/tp-ho-chi-minh-ghi-nhan-118-ca-sot-phat-ban-nghi-soi-trong-tuan-qua-20240903112903123.htm'
]
for url, value in zip(health_urls, [232,254,272,299,301,243]):
    fetch(url, [str(value)])
traffic_url, traffic_h, traffic_gt, traffic_dates = series('Traffic','2019-08-01','2020-03-01','2020-07-01',1000)
energy_url, energy_h, energy_gt, energy_dates = series('Energy','2022-01-03','2022-03-07','2022-04-11')
traffic_event = 'https://trumpwhitehouse.archives.gov/briefings-statements/remarks-president-trump-vice-president-pence-members-coronavirus-task-force-press-briefing-3/'
energy_event = 'https://www.eia.gov/todayinenergy/detail.php?id=51498'
fetch(traffic_event, ['discretionary travel'])
fetch(energy_event, ['March 4, 2022', '$100'])

cases = [
 dict(id='pharmacy',number='01',domain='Healthcare',brand='Ho Chi Minh City / Vietnam',
      title='When case counts\nstart to climb.',shortTitle='A rising health signal',
      source='HCDC',published='13 August 2024',url=health_urls[2],dataUrl=health_urls[2],
      sourceTitle='Dengue surveillance: week 32',stat='272',statUnit='reported dengue cases in week 32',
      fact='HCDC reported 272 dengue cases in week 32, 18.8% above the preceding four-week average.',
      factSecondary='18.8% above the preceding four-week average.',
      cutoff='Weeks 30–35 / 2024',metric='Reported dengue cases',unit='Cases / week',
      history=[232,254,272],groundTruth=[299,301,243],historyDates=['W30','W31','W32'],futureDates=['W33','W34','W35'],
      baseline=[291,310,329],guided=[304,325,315],
      anchors=[dict(i=1,lo=305,hi=340,label='W34 / 305–340 cases'),dict(i=2,lo=295,hi=330,label='W35 / 295–330 cases')],
      range=[180,380],ticks=[200,250,300,350],direction='Short-term rise',
      context='Weekly case counts are rising. A surveillance report gives planners a reason to consider sustained near-term pressure.',
      scenario='Cases may remain elevated over the next three weeks before growth slows.',
      action='Plan for pressure.\nCheck the outcome.',
      assumption='The observed week-35 decline is sharper than the scenario anticipates. Context is useful, but does not remove uncertainty.',
      observationSources=health_urls,
      observationDates=['2024-07-22','2024-07-29','2024-08-05','2024-08-12','2024-08-19','2024-08-26']),
 dict(id='traffic',number='02',domain='Mobility',brand='United States / Time-MMD',
      title='When travel\ncomes to a halt.',shortTitle='An abrupt demand shock',
      source='White House archive',published='16 March 2020',url=traffic_event,dataUrl=traffic_url,
      sourceTitle='National guidance to reduce travel',stat='15 days',statUnit='initial federal guidance period',
      fact='Federal guidance called for avoiding discretionary travel as the COVID-19 response intensified.',
      factSecondary='Avoid discretionary travel and reduce in-person activity.',
      cutoff='August 2019–July 2020',metric='U.S. vehicle miles traveled',unit='Billion vehicle miles / month',
      history=traffic_h,groundTruth=traffic_gt,historyDates=['Aug','Sep','Oct','Nov','Dec','Jan','Feb'],futureDates=['Mar','Apr','May','Jun','Jul'],
      baseline=[268,275,282,286,288],guided=[215,190,203,231,252],
      anchors=[dict(i=1,lo=175,hi=205,label='April / 175–205 billion'),dict(i=4,lo=240,hi=265,label='July / 240–265 billion')],
      range=[130,330],ticks=[150,200,250,300],direction='Drop, then recovery',
      context='Travel guidance changes the demand regime. The monthly series provides a retrospective view of the disruption.',
      scenario='Travel falls sharply while restrictions take effect, followed by a gradual recovery.',
      action='Locate the shock.\nAllow a recovery.',
      assumption='April observations fall below the scenario; the recovery is faster. Compare timing and magnitude, not just direction.',
      observationSources=[traffic_url]*len(traffic_dates),observationDates=traffic_dates),
 dict(id='energy',number='03',domain='Energy',brand='United States / Time-MMD',
      title='When supply risk\nreaches the pump.',shortTitle='A price shock',
      source='U.S. EIA',published='4 March 2022',url=energy_event,dataUrl=energy_url,
      sourceTitle='Crude oil rises above $100',stat='$100+',statUnit='crude oil futures / barrel',
      fact='EIA reported crude prices above $100 per barrel following Russia’s invasion of Ukraine, with increased volatility.',
      factSecondary='Crude market disruption creates upward pressure on retail fuel prices.',
      cutoff='January–April / 2022',metric='U.S. retail gasoline price',unit='USD / gallon · all grades',
      history=energy_h,groundTruth=energy_gt,historyDates=['Jan 3','Jan 10','Jan 17','Jan 24','Jan 31','Feb 7','Feb 14','Feb 21','Feb 28'],futureDates=['Mar 7','Mar 14','Mar 21','Mar 28','Apr 4','Apr 11'],
      baseline=[3.75,3.80,3.85,3.90,3.95,4.00],guided=[4.03,4.25,4.38,4.40,4.33,4.25],
      anchors=[dict(i=1,lo=4.1,hi=4.4,label='March 14 / $4.10–4.40'),dict(i=5,lo=4.1,hi=4.4,label='April 11 / $4.10–4.40')],
      range=[3.0,4.9],ticks=[3,3.5,4,4.5],direction='A sudden price jump',
      context='The crude-oil report arrives before the March 7 retail observation. Supply risk suggests a jump beyond the recent trend.',
      scenario='Retail gasoline prices rise quickly, remain elevated, then ease as the initial shock moderates.',
      action='Anticipate the jump.\nCompare the timing.',
      assumption='The observed peak arrives earlier than the scenario. Both the jump and the easing phase matter for planning.',
      observationSources=[energy_url]*len(energy_dates),observationDates=energy_dates)
]
for c in cases:
    assert len(c['history']) == len(c['historyDates'])
    assert len(c['groundTruth']) == len(c['futureDates']) == len(c['guided']) == len(c['baseline'])
    assert len(c['observationSources']) == len(c['history']) + len(c['groundTruth'])
data=dict(version=3,cases=cases,provenance='Published observations; authored scenario, anchor and forecast paths. Retrospective examples, not model evaluation or a point-in-time backtest.')
(OUT/'demo-data.js').write_text('window.SCENARIO_DEMO = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(OUT/'demo-sources.json').write_text(json.dumps(dict(note=data['provenance'],healthReporting='HCDC surveillance counts as reported in linked bulletins and news reports; week labels follow those reports.',trafficUnitConversion='Time-MMD OT (million vehicle miles) divided by 1000.',energySeries='Weekly U.S. all-grades, all-formulations retail gasoline price, USD/gallon.',snapshots=records),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Built three observed series and source verification records.')
