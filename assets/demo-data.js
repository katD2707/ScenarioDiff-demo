window.SCENARIO_DEMO = {
  "version": 6,
  "cases": [
    {
      "id": "pharmacy",
      "number": "01",
      "domain": "Public health",
      "brand": "Ho Chi Minh City / Vietnam",
      "title": "Dengue cases rise.\nCare planning changes.",
      "shortTitle": "Dengue cases and care planning",
      "source": "HCDC",
      "published": "13 August 2024",
      "url": "https://hcdc.vn/tinh-hinh-dich-benh-sot-xuat-huyet-tay-chan-mieng-va-soi-tai-tp-ho-chi-minh-tinh-den-tuan-322024-39XFah.html",
      "dataUrl": "https://hcdc.vn/tinh-hinh-dich-benh-sot-xuat-huyet-tay-chan-mieng-va-soi-tai-tp-ho-chi-minh-tinh-den-tuan-322024-39XFah.html",
      "sourceTitle": "Dengue surveillance: week 32",
      "stat": "272",
      "statUnit": "reported dengue cases in week 32",
      "fact": "HCDC reported 272 dengue cases in week 32, 18.8% above the preceding four-week average.",
      "factSecondary": "18.8% above the preceding four-week average.",
      "cutoff": "Weeks 30-35 / 2024",
      "metric": "Reported dengue cases",
      "unit": "Cases / week",
      "history": [
        232,
        254,
        272
      ],
      "groundTruth": [
        299,
        301,
        243
      ],
      "historyDates": [
        "W30",
        "W31",
        "W32"
      ],
      "futureDates": [
        "W33",
        "W34",
        "W35"
      ],
      "baseline": [
        291,
        310,
        329
      ],
      "guided": [
        293,
        308,
        260
      ],
      "anchors": [
        {
          "i": 1,
          "lo": 295,
          "hi": 320,
          "label": "Week 34 / 295-320 cases"
        },
        {
          "i": 2,
          "lo": 238,
          "hi": 280,
          "label": "Week 35 / 238-280 cases"
        }
      ],
      "range": [
        180,
        380
      ],
      "ticks": [
        200,
        250,
        300,
        350
      ],
      "direction": "Pressure on local care",
      "context": "HCDC reported rising dengue cases in Ho Chi Minh City. Weekly case counts help health services anticipate near-term pressure.",
      "scenario": "Reported cases stay elevated briefly and then ease.",
      "action": "Prepare care capacity.\nTrack the decline.",
      "assumption": "Guidance follows the rise and then turns down. The reported week-35 decline is sharper than the illustrative forecast.",
      "observationSources": [
        "https://hcdc.vn/tinh-hinh-dich-benh-sot-xuat-huyet-va-tay-chan-mieng-tai-tp-ho-chi-minh-tinh-den-tuan-302024-x6HEAv.html",
        "https://tuoitre.vn/nld/tp-hcm-phat-hien-60-ca-nghi-sot-phat-ban-soi-trong-1-tuan-196240810151904281.htm",
        "https://hcdc.vn/tinh-hinh-dich-benh-sot-xuat-huyet-tay-chan-mieng-va-soi-tai-tp-ho-chi-minh-tinh-den-tuan-322024-39XFah.html",
        "https://thanhnien.vn/tinh-hinh-dich-benh-soi-moi-nhat-tai-tphcm-185240824095909048.htm",
        "https://alobacsi.com/hcdc-benh-truyen-nhiem-o-tphcm-tang-cao.html",
        "https://vtv.vn/suc-khoe/tp-ho-chi-minh-ghi-nhan-118-ca-sot-phat-ban-nghi-soi-trong-tuan-qua-20240903112903123.htm"
      ],
      "observationDates": [
        "2024-07-22",
        "2024-07-29",
        "2024-08-05",
        "2024-08-12",
        "2024-08-19",
        "2024-08-26"
      ],
      "impact": "Rising cases increase pressure on local care services.",
      "preAnchor": [
        282,
        326,
        326
      ],
      "plotEvent": {
        "location": "history",
        "i": 2,
        "label": "HCDC bulletin\n13 Aug / 272 cases"
      }
    },
    {
      "id": "traffic",
      "number": "02",
      "domain": "Mobility",
      "brand": "United States / national travel",
      "title": "Travel guidance changes.\nMobility drops.",
      "shortTitle": "Travel restrictions and mobility",
      "source": "White House archive",
      "published": "16 March 2020",
      "url": "https://trumpwhitehouse.archives.gov/briefings-statements/remarks-president-trump-vice-president-pence-members-coronavirus-task-force-press-briefing-3/",
      "dataUrl": "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
      "sourceTitle": "National guidance to reduce travel",
      "stat": "15 days",
      "statUnit": "initial federal guidance period",
      "fact": "Federal guidance called for avoiding discretionary travel as the COVID-19 response intensified.",
      "factSecondary": "Avoid discretionary travel and reduce in-person activity.",
      "cutoff": "August 2019-July 2020",
      "metric": "U.S. vehicle miles traveled",
      "unit": "Billion vehicle miles / month",
      "history": [
        288.116,
        267.747,
        283.961,
        260.326,
        261.757,
        260.847,
        242.695
      ],
      "groundTruth": [
        226.638,
        167.617,
        221.006,
        250.33,
        265.55
      ],
      "historyDates": [
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb"
      ],
      "futureDates": [
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul"
      ],
      "baseline": [
        268,
        275,
        282,
        286,
        288
      ],
      "guided": [
        225,
        189,
        216,
        246,
        261
      ],
      "anchors": [
        {
          "i": 1,
          "lo": 175,
          "hi": 205,
          "label": "April / 175-205 billion"
        },
        {
          "i": 4,
          "lo": 245,
          "hi": 275,
          "label": "July / 245-275 billion"
        }
      ],
      "range": [
        130,
        330
      ],
      "ticks": [
        150,
        200,
        250,
        300
      ],
      "direction": "A sharp mobility disruption",
      "context": "Federal pandemic guidance called for less discretionary travel. Monthly vehicle miles show the subsequent national mobility shock.",
      "scenario": "Travel falls abruptly and then recovers as conditions change.",
      "action": "Plan essential travel.\nWatch the recovery.",
      "assumption": "Guidance captures the mobility drop and recovery. The observed April low is deeper than the illustrative forecast.",
      "observationSources": [
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Traffic/Traffic.csv"
      ],
      "observationDates": [
        "2019-08-01",
        "2019-09-01",
        "2019-10-01",
        "2019-11-01",
        "2019-12-01",
        "2020-01-01",
        "2020-02-01",
        "2020-03-01",
        "2020-04-01",
        "2020-05-01",
        "2020-06-01",
        "2020-07-01"
      ],
      "impact": "Mobility affects work, daily journeys, and access to services.",
      "preAnchor": [
        249,
        249,
        245,
        268,
        279
      ],
      "plotEvent": {
        "location": "future",
        "i": 0,
        "label": "Reduce travel\n16 Mar 2020"
      }
    },
    {
      "id": "energy",
      "number": "03",
      "domain": "Energy",
      "brand": "United States / retail fuel",
      "title": "Crude oil jumps.\nFuel costs follow.",
      "shortTitle": "Fuel prices and household costs",
      "source": "U.S. EIA",
      "published": "4 March 2022",
      "url": "https://www.eia.gov/todayinenergy/detail.php?id=51498",
      "dataUrl": "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
      "sourceTitle": "Crude oil rises above $100",
      "stat": "$100+",
      "statUnit": "crude oil futures / barrel",
      "fact": "EIA reported crude prices above $100 per barrel following Russia’s invasion of Ukraine, with increased volatility.",
      "factSecondary": "Crude market disruption creates upward pressure on retail fuel prices.",
      "cutoff": "January-April 2022",
      "metric": "U.S. retail gasoline price",
      "unit": "USD / gallon · all grades",
      "history": [
        3.381,
        3.394,
        3.404,
        3.421,
        3.464,
        3.538,
        3.581,
        3.624,
        3.701
      ],
      "groundTruth": [
        4.196,
        4.414,
        4.343,
        4.334,
        4.274,
        4.196
      ],
      "historyDates": [
        "Jan 3",
        "Jan 10",
        "Jan 17",
        "Jan 24",
        "Jan 31",
        "Feb 7",
        "Feb 14",
        "Feb 21",
        "Feb 28"
      ],
      "futureDates": [
        "Mar 7",
        "Mar 14",
        "Mar 21",
        "Mar 28",
        "Apr 4",
        "Apr 11"
      ],
      "baseline": [
        3.75,
        3.8,
        3.85,
        3.9,
        3.95,
        4.0
      ],
      "guided": [
        4.08,
        4.34,
        4.36,
        4.31,
        4.26,
        4.22
      ],
      "anchors": [
        {
          "i": 1,
          "lo": 4.1,
          "hi": 4.5,
          "label": "March 14 / $4.10-4.50"
        },
        {
          "i": 5,
          "lo": 4.1,
          "hi": 4.4,
          "label": "April 11 / $4.10-4.40"
        }
      ],
      "range": [
        3.0,
        4.9
      ],
      "ticks": [
        3,
        3.5,
        4,
        4.5
      ],
      "direction": "Pressure on household budgets",
      "context": "EIA described crude oil above $100 per barrel after Russia's invasion of Ukraine. Weekly retail gasoline prices show the price shock that followed.",
      "scenario": "Retail prices rise rapidly, peak, and then ease while remaining elevated.",
      "action": "Prepare for higher costs.\nWatch the peak.",
      "assumption": "Guidance captures the rise in retail prices. The observed March peak is higher and earlier than the illustrative path.",
      "observationSources": [
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv",
        "https://raw.githubusercontent.com/AdityaLab/Time-MMD/main/numerical/Energy/Energy.csv"
      ],
      "observationDates": [
        "2022-01-03",
        "2022-01-10",
        "2022-01-17",
        "2022-01-24",
        "2022-01-31",
        "2022-02-07",
        "2022-02-14",
        "2022-02-21",
        "2022-02-28",
        "2022-03-07",
        "2022-03-14",
        "2022-03-21",
        "2022-03-28",
        "2022-04-04",
        "2022-04-11"
      ],
      "impact": "Pump prices directly affect household transport budgets.",
      "preAnchor": [
        3.82,
        3.96,
        4.05,
        4.08,
        4.06,
        4.06
      ],
      "plotEvent": {
        "location": "future",
        "i": 0,
        "label": "Crude above $100\nEIA / 4 Mar"
      }
    }
  ],
  "provenance": "History and ground truth are published observations. Event reports are sourced. Forecasts and anchor intervals are illustrative retrospective examples, not ScenarioDiff model predictions or a point-in-time evaluation."
};
