window.SCENARIO_DEMO = {
  "version": 5,
  "cases": [
    {
      "id": "pharmacy",
      "number": "01",
      "sourceId": "hcdc-2024-w32",
      "url": "https://hcdc.vn/tinh-hinh-dich-benh-sot-xuat-huyet-tay-chan-mieng-va-soi-tai-tp-ho-chi-minh-tinh-den-tuan-322024-39XFah.html",
      "publishedISO": "2024-08-13T18:17:00+07:00",
      "cutoffISO": "2024-08-18T23:59:00+07:00",
      "history": [
        510,
        525,
        518,
        542,
        536,
        558,
        565,
        580
      ],
      "historyDates": [
        "W26",
        "W27",
        "W28",
        "W29",
        "W30",
        "W31",
        "W32",
        "W33"
      ],
      "futureDates": [
        "W34",
        "W35",
        "W36",
        "W37",
        "W38",
        "W39"
      ],
      "baseline": [
        585,
        591,
        596,
        602,
        608,
        613
      ],
      "guided": [
        618.26,
        681.87,
        750.4,
        806.87,
        745.4,
        711.87
      ],
      "anchors": [
        {
          "i": 2,
          "lo": 750,
          "hi": 840,
          "label": "W36 / 750-840 units"
        },
        {
          "i": 4,
          "lo": 740,
          "hi": 820,
          "label": "W38 / 740-820 units"
        }
      ],
      "range": [
        400,
        950
      ],
      "ticks": [
        400,
        500,
        600,
        700,
        800,
        900
      ],
      "domain": "Healthcare & retail",
      "brand": "FPT Long Chau / potential application",
      "title": "An outbreak bulletin.\nA different stock plan.",
      "shortTitle": "Demand for healthcare supplies",
      "source": "HCDC",
      "published": "13 August 2024 / 18:17",
      "sourceTitle": "Ho Chi Minh City health bulletin / week 32",
      "fact": "HCDC reported 272 dengue cases in week 32, 18.8% above the preceding four-week average.",
      "stat": "272",
      "statUnit": "reported cases / week 32",
      "factSecondary": "18.8% above the preceding four-week average.",
      "cutoff": "18 August 2024 / weeks 34-39 ahead",
      "metric": "Healthcare supply demand",
      "unit": "Units / week",
      "direction": "A short-term demand rise",
      "context": "A health bulletin signals rising local pressure. A pharmacy cluster may need to review inventory and replenishment lead times.",
      "scenario": "Demand for healthcare supplies rises over the next few weeks, then eases as replenishment catches up.",
      "action": "Anticipate demand.\nPlan replenishment.",
      "assumption": "The anchors lift the forecast around weeks 36 and 38, bringing it closer to the ground-truth reference while preserving the overall demand pattern. A visible forecast error remains after refinement.",
      "groundTruth": [
        625,
        708,
        800,
        830,
        790,
        735
      ],
      "seriesProvenance": "authored_illustration",
      "preAnchor": [
        616.134,
        659.711,
        702.0,
        784.711,
        697.0,
        689.711
      ],
      "plotEvent": {
        "location": "history",
        "i": 7,
        "label": "HCDC bulletin\n272 cases / +18.8%"
      }
    },
    {
      "id": "traffic",
      "number": "02",
      "sourceId": "pc08-2025-04-21",
      "url": "https://tphcm.chinhphu.vn/lich-cam-duong-phuc-vu-le-ky-niem-50-nam-ngay-giai-phong-mien-nam-101250421153314319.htm",
      "publishedISO": "2025-04-21T15:43:00+07:00",
      "cutoffISO": "2025-04-22T15:00:00+07:00",
      "history": [
        24,
        22,
        20,
        19,
        21,
        20,
        22,
        24
      ],
      "historyDates": [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00"
      ],
      "futureDates": [
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
        "00:00",
        "01:00"
      ],
      "baseline": [
        25,
        27,
        29,
        27,
        24,
        22,
        20,
        18,
        17,
        16
      ],
      "guided": [
        25.997,
        29.842,
        39.352,
        44.4,
        44.352,
        41.842,
        35.352,
        28.4,
        24.352,
        20.842
      ],
      "anchors": [
        {
          "i": 3,
          "lo": 43,
          "hi": 52,
          "label": "19:00 / 43-52 min"
        },
        {
          "i": 7,
          "lo": 28,
          "hi": 36,
          "label": "23:00 / 28-36 min"
        }
      ],
      "range": [
        10,
        60
      ],
      "ticks": [
        10,
        20,
        30,
        40,
        50,
        60
      ],
      "domain": "Smart city",
      "brand": "FPT Smart City / potential application",
      "title": "Traffic is still light.\nThe closure is scheduled.",
      "shortTitle": "Travel around restricted roads",
      "source": "Government News / PC08",
      "published": "21 April 2025 / 15:43",
      "sourceTitle": "Road closures for the April 30 celebrations",
      "fact": "Selected central Ho Chi Minh City roads were scheduled to close from 17:30 on April 22 until 01:00 on April 23.",
      "stat": "17:30",
      "statUnit": "22 April 2025 / restrictions begin",
      "factSecondary": "Restrictions end at 01:00 on April 23.",
      "cutoff": "22-23 April 2025 / hourly travel time",
      "metric": "Travel time on a nearby open route",
      "unit": "Minutes / trip",
      "direction": "An event-time traffic peak",
      "context": "The announcement gives the start, end and location of the restrictions. The example follows diverted traffic on a nearby route that remains open.",
      "scenario": "Diverted traffic increases travel time after 17:30, followed by a gradual decline toward the end of the night.",
      "action": "Anticipate the peak.\nAdjust delivery times.",
      "assumption": "Guidance raises the peak near 19:00 and refines the easing phase near 23:00. The forecast moves closer to the ground-truth reference at both anchor regions. A visible forecast error remains after refinement.",
      "groundTruth": [
        27,
        31,
        42,
        49,
        47,
        43,
        38,
        33,
        27,
        22
      ],
      "seriesProvenance": "authored_illustration",
      "preAnchor": [
        25.993,
        29.649,
        37.337,
        40.0,
        42.337,
        41.649,
        33.337,
        24.0,
        22.337,
        20.649
      ],
      "plotEvent": {
        "location": "future",
        "i": 1.5,
        "label": "Road closure\n22 Apr / 17:30"
      }
    },
    {
      "id": "energy",
      "number": "03",
      "sourceId": "evn-2024-w17",
      "url": "https://www.evn.com.vn/d6/news/Tuan-tu-22-2842024-Dam-bao-dien-khi-phu-tai-tang-ky-luc-0-0-124167.aspx",
      "publishedISO": "2024-04-29T08:00:00+07:00",
      "cutoffISO": "2024-04-29T23:59:00+07:00",
      "history": [
        42,
        44,
        43,
        46,
        49,
        51,
        50,
        52
      ],
      "historyDates": [
        "Apr 22",
        "Apr 23",
        "Apr 24",
        "Apr 25",
        "Apr 26",
        "Apr 27",
        "Apr 28",
        "Apr 29"
      ],
      "futureDates": [
        "Apr 30",
        "May 1",
        "May 2",
        "May 3",
        "May 4",
        "May 5",
        "May 6"
      ],
      "baseline": [
        53,
        54,
        55,
        56,
        57,
        58,
        59
      ],
      "guided": [
        52.003,
        51.126,
        49.319,
        47.88,
        44.319,
        43.319,
        44.88
      ],
      "anchors": [
        {
          "i": 3,
          "lo": 43,
          "hi": 48,
          "label": "May 3 / 43-48 MW"
        },
        {
          "i": 6,
          "lo": 40,
          "hi": 45,
          "label": "May 6 / 40-45 MW"
        }
      ],
      "range": [
        30,
        70
      ],
      "ticks": [
        30,
        40,
        50,
        60,
        70
      ],
      "domain": "Energy",
      "brand": "FPT x E.ON / potential application",
      "title": "After the heat peak,\ndemand may ease.",
      "shortTitle": "Electricity demand as heat eases",
      "source": "EVN / Electricity Regulatory Authority",
      "published": "29 April 2024 / 08:00",
      "sourceTitle": "Power system update / April 22-28",
      "fact": "EVN reported average national consumption of 946.6 million kWh per day and an outlook for easing heat over the following ten days.",
      "stat": "946.6",
      "statUnit": "million kWh / day / nationwide",
      "factSecondary": "Outlook: the heat may ease over the next ten days.",
      "cutoff": "30 April-6 May 2024 / daily peak load",
      "metric": "Peak load of a facility cluster",
      "unit": "MW",
      "direction": "A weather-driven reversal",
      "context": "The report combines high recent consumption with an outlook for easing heat. Lower cooling demand can change the direction of a facility-load forecast.",
      "scenario": "As the heat eases, cooling demand falls and the facility cluster load declines instead of extending its recent upward trend.",
      "action": "Follow the weather.\nAdjust capacity plans.",
      "assumption": "The anchors lower the trajectory around May 3 and May 6, aligning it more closely with the ground-truth reference during the easing phase. A visible forecast error remains after refinement.",
      "groundTruth": [
        51.8,
        50.7,
        47.7,
        44.5,
        42.7,
        41.6,
        41.8
      ],
      "seriesProvenance": "authored_illustration",
      "preAnchor": [
        52.006,
        51.281,
        50.93,
        51.4,
        45.93,
        44.93,
        48.4
      ],
      "plotEvent": {
        "location": "history",
        "i": 7,
        "label": "Heat-easing outlook\n29 Apr / EVN"
      }
    }
  ],
  "provenance": "Event reports are sourced. Operating histories, ground-truth references and forecast paths are illustrative; they are not customer measurements or model evaluation."
};
