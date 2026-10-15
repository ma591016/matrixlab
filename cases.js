/* =====================================================================
   cases.js — Business Case Lab (tab 06): the TEXT and DATA of each case.
   ---------------------------------------------------------------------
   cases-engine.js does all the math and drawing; this file only holds
   words and numbers, so adding a new industry means adding one object.

   EVERY case uses the same course model (Theme 2), so students practise
   the same three themes in different industries:
     • two products, linear inverse demand  p = α − B·q
     • linear cost                          c = c_base + w·t   (or backed out from data)
     • one shared resource                  t₁q₁ + t₂q₂ ≤ K,   q ≥ 0
     • profit is a quadratic form           π(q) = (α + r − c)ᵀq − qᵀBq

   Tags on every number:  FACT (public, with source) · ASSUMPTION (yours to
   change) · MODEL (computed).

   Fields of a case
     id, industry, company, title, question
     facts[]       {label, value, note, source, url}
     model         the numbers the engine needs:
        q0, p0       today's quantities and prices (the anchor point)
        e1, e2, eta  own-price elasticities and cross-elasticity (assumptions)
        mode         "implied": back out unit costs by assuming today is optimal
                     "given":   costs = cBase + w × resource use
        cBase, w     used in "given" mode
        r0           extra revenue per unit at baseline (e.g. ad revenue)
        t, K         resource use per unit, and capacity
     display       labels and number formats
     sliders[]     {key, label, min, max, step, fmt}  (keys: e1 e2 eta t1 t2 K w r1 shift1 shift2 shock1 shock2)
     scenarios[]   {label, note, set}
     takeaways[]   checked against an independent Python solver
     limits[], lessons[]
   ===================================================================== */

window.MATRIXLAB_CASES = {
  version: "2.0",

  cases: [
    /* ================================================================
       1. TECH / AI — MICROSOFT: Copilot seats vs AI tokens, one GPU fleet
       Units: seats in millions; tokens in trillions per month;
       seat price $/seat/month; token price $ per million tokens;
       profit in $ millions per month.
       ================================================================ */
    {
      id: "microsoft",
      industry: "Tech / AI",
      company: "Microsoft",
      title: "Copilot seats or AI tokens: where should scarce compute go?",
      question:
        "Microsoft sells AI two ways: Microsoft 365 Copilot as a flat monthly seat, and AI models on Azure priced per token. " +
        "Both run on the same GPUs, and Microsoft says demand for that capacity exceeds supply. Given that constraint, what mix " +
        "of seats and tokens maximizes profit, and when does charging for consumption beat the flat seat?",
      facts: [
        { label: "Microsoft 365 Copilot price", value: "$30 per user per month", note: "Paid yearly ($31.50 if paid monthly, annual commitment)", source: "Microsoft", url: "https://www.microsoft.com/en-us/microsoft-365/copilot/enterprise" },
        { label: "Paid Copilot seats", value: "Over 30 million", note: "Satya Nadella, fiscal Q4 2026 results (July 2026)", source: "UC Today", url: "https://www.uctoday.com/unified-communications/microsoft-365-copilot-passes-30-million-paid-seats-as-cloud-and-ai-growth-power-record-quarter" },
        { label: "Capacity", value: "“Demand continues to surpass supply”", note: "CFO Amy Hood, fiscal Q4 2026 earnings call (July 29, 2026), on cloud capacity", source: "Directions on Microsoft", url: "https://www.directionsonmicrosoft.com/microsoft-expect-capacity-constraints-capex-acceleration-to-continue/" },
        { label: "Token price (GPT-5 on Azure)", value: "$1.25 input / $10.00 output per 1M tokens", note: "Global Standard deployment", source: "AzureSpeed price tracker", url: "https://www.azurespeed.com/AzureAiModelPricing/Models/openai-gpt-5" }
      ],
      model: {
        q0: [30, 300], p0: [30, 3.44],
        e1: 2, e2: 2, eta: 0.3,
        mode: "given", cBase: [2, 0], w: 1.0,
        r0: [0, 0], t: [3, 1], K: 360
      },
      display: {
        names: ["Copilot seats", "API tokens"], pnames: ["Seat price", "Token price"],
        axis: ["Copilot seats (millions)", "API tokens (trillions / month)"],
        q: [{ dec: 1, suf: "M seats" }, { dec: 0, suf: "T tokens/mo" }],
        p: [{ dec: 2, pre: "$", suf: " /seat/mo" }, { dec: 2, pre: "$", suf: " /M tokens" }],
        profit: { scale: 0.001, dec: 2, pre: "$", suf: "B / month" },
        resource: { name: "GPU compute", unit: "T tokens / month" },
        mu: { dec: 2, pre: "$", suf: " per extra M tokens of compute" },
        perResource: { dec: 2, pre: "$", suf: " per M tokens of compute" },
        assumptionNotes: [
          "Blended token price $3.44 = (3 × $1.25 + 1 × $10) / 4, assuming 3 input tokens per output token.",
          "API volume of 300 trillion tokens a month, 3 million tokens per Copilot seat per month, and 360 trillion tokens of monthly capacity are illustrative.",
          "Unit cost = $2 per seat (support, sales) + $1 per million tokens of compute (w). Linear cost, as Theme 2 requires."
        ]
      },
      sliders: [
        { key: "t1", label: "Tokens used per Copilot seat", min: 1, max: 15, step: 0.5, fmt: { dec: 1, suf: "M / month" }, tip: "How heavily each seat consumes compute. Agents and long documents push this up." },
        { key: "K", label: "GPU capacity", min: 250, max: 500, step: 10, fmt: { dec: 0, suf: "T tokens / month" } },
        { key: "w", label: "Compute cost", min: 0.25, max: 3, step: 0.25, fmt: { dec: 2, pre: "$", suf: " per M tokens" } },
        { key: "eta", label: "Substitution (tokens ↔ seats)", min: 0, max: 2.5, step: 0.05, fmt: { dec: 2 }, tip: "Cheaper API tokens let some companies build their own assistant instead of buying seats." },
        { key: "e1", label: "Seat price elasticity", min: 1.2, max: 4, step: 0.1, fmt: { dec: 1 } },
        { key: "e2", label: "Token price elasticity", min: 1.2, max: 4, step: 0.1, fmt: { dec: 1 } }
      ],
      scenarios: [
        { label: "Today: demand exceeds supply", note: "At today's prices customers want 390T tokens; only 360T can be served.", set: {} },
        { label: "Heavy users: 8M tokens per seat", note: "Copilot users lean on it all day.", set: { t1: 8 } },
        { label: "Agentic era: 12M tokens per seat", note: "Agents run long tasks for every user.", set: { t1: 12 } },
        { label: "More GPUs: +20% capacity", note: "New data centers come online.", set: { K: 432 } },
        { label: "Cheaper compute: $0.50 per M", note: "More efficient chips and models.", set: { w: 0.5 } },
        { label: "Break the model", note: "Tokens become near-perfect substitutes for seats.", set: { eta: 2.5, e1: 1.2, e2: 1.2 } }
      ],
      takeaways: [
        "<b>Demand exceeds supply.</b> At today's prices customers would use 390T tokens a month against 360T of capacity. The model rations by price: seats move to about 35.3M at $27.66, API tokens to about 254T at $3.67 per million, and compute is fully used. An extra million tokens of capacity is worth about $0.91 in profit (the shadow price).",
        "<b>Why seats win today.</b> At 3M tokens per seat, a seat earns about $7.55 of margin per million tokens of compute it uses, against about $2.67 for selling tokens directly. When compute is the bottleneck, it goes to whatever earns the most per unit of compute.",
        "<b>Where the answer flips: about 8.4M tokens per seat.</b> At 8M tokens per seat the two uses earn about the same per unit of compute ($3.24 vs $3.10). At 12M the model cuts seats to about 10.9M and raises the seat price to about $40, because a flat seat that consumes heavily is a poor use of scarce GPUs. That's the case for consumption pricing.",
        "<b>More GPUs are worth less than you'd think.</b> With 20% more capacity, profit rises only about 2.5%, to $1.51B a month, and the shadow price collapses from $0.91 to about $0.10. Once capacity stops binding, demand becomes the limit."
      ],
      limits: [
        "Microsoft does not publish token volumes per product, compute cost per token, or how its GPUs are split between products. Those are assumptions.",
        "Real pricing mixes seats, credits, enterprise discounts and many models. Here every token has one blended price.",
        "This shows how a capacity-constrained pricing decision works; it is not a statement about what Microsoft should do."
      ],
      lessons: [
        { label: "Linear technology & shared inputs", module: "p2", concept: "technology" },
        { label: "Optimum & shadow prices", module: "p2", concept: "optimum" },
        { label: "Definiteness", module: "p3", concept: "definiteness" }
      ]
    },

    /* ================================================================
       2. AIRLINE — DELTA A321neo: economy vs First, one cabin
       Units: seats per flight; average one-way fare $; profit $ per flight;
       resource = inches of cabin length.
       ================================================================ */
    {
      id: "delta",
      industry: "Airline",
      company: "Delta Air Lines",
      title: "How many First Class seats should an A321neo have?",
      question:
        "Every First Class seat takes floor space that could hold more economy seats. Delta flies A321neos with 20 First seats and also " +
        "a version with 44. Starting from the 194-seat layout, how should the cabin change as demand for premium travel grows?",
      facts: [
        { label: "A321neo layout (194 seats)", value: "20 First + 174 economy", note: "Delta's media kit splits economy as 42 Comfort + 132 Main; the delta.com seat map shows 60 Comfort + 114 Main. Both give 174 economy seats, which is all the model uses.", source: "Delta News Hub media kit · Delta.com", url: "https://news.delta.com/mediakit/airbus-a321neo" },
        { label: "Seat pitch", value: "First 37 in · Comfort 33–34 in · Main 31 in", note: "Seat width: First 21 in, Comfort and Main 18 in", source: "Delta.com aircraft page", url: "https://www.delta.com/us/en/aircraft/airbus/a321-neo" },
        { label: "Premium-heavy version", value: "164 seats: 44 First, 54 Comfort, 66 Main", note: "Same aircraft type; First pitch 38 in on this version", source: "Delta.com aircraft page", url: "https://www.delta.com/us/en/aircraft/airbus/a321-neo" }
      ],
      model: {
        q0: [174, 20], p0: [230, 620],
        e1: 1.6, e2: 2.0, eta: 0.05,
        mode: "implied", r0: [0, 0],
        t: [5.287, 9.25], K: 1105
      },
      display: {
        names: ["Economy seats", "First seats"], pnames: ["Economy fare", "First fare"],
        axis: ["Economy seats (Main + Comfort)", "First Class seats"],
        q: [{ dec: 0, suf: " seats" }, { dec: 0, suf: " seats" }],
        p: [{ dec: 0, pre: "$", suf: " avg fare" }, { dec: 0, pre: "$", suf: " avg fare" }],
        profit: { scale: 1, dec: 0, pre: "$", suf: " per flight" },
        resource: { name: "cabin length", unit: "inches" },
        mu: { dec: 2, pre: "$", suf: " per extra inch of cabin, per flight" },
        perResource: { dec: 2, pre: "$", suf: " per inch" },
        assumptionNotes: [
          "Cabin length per seat = pitch ÷ seats per row (6 across in economy, 4 in First): 31/6 and 34/6 in for economy (average 5.29 in), 37/4 = 9.25 in for First.",
          "Total seat length 1,105 in = 22 Main rows × 31 + 7 Comfort rows × 34 + 5 First rows × 37 (the media-kit split; the delta.com split gives 1,114 in, a 1% difference).",
          "Average one-way fares of $230 (economy) and $620 (First) are illustrative. Unit costs are backed out by assuming today's layout is optimal."
        ]
      },
      sliders: [
        { key: "shift2", label: "Premium demand shift", min: -20, max: 40, step: 1, fmt: { dec: 0, suf: "%", sign: true }, tip: "Raises First Class willingness to pay at every quantity." },
        { key: "shift1", label: "Economy demand shift", min: -20, max: 20, step: 1, fmt: { dec: 0, suf: "%", sign: true } },
        { key: "t2", label: "Cabin length per First seat", min: 7, max: 14, step: 0.25, fmt: { dec: 2, suf: " in" }, tip: "Bigger seats (lie-flat) take more space." },
        { key: "e1", label: "Economy fare elasticity", min: 1.1, max: 3, step: 0.1, fmt: { dec: 1 } },
        { key: "e2", label: "First fare elasticity", min: 1.1, max: 3, step: 0.1, fmt: { dec: 1 } },
        { key: "eta", label: "Substitution (upgrades)", min: 0, max: 3, step: 0.01, fmt: { dec: 2 } }
      ],
      scenarios: [
        { label: "Today: 194-seat layout", note: "The model reproduces 174 economy + 20 First.", set: {} },
        { label: "Premium boom: +15%", note: "Travelers value First 15% more.", set: { shift2: 15 } },
        { label: "Premium boom: +30%", note: "A strong premium travel cycle.", set: { shift2: 30 } },
        { label: "Strong demand everywhere: +10%", note: "Both cabins more valuable.", set: { shift1: 10, shift2: 10 } },
        { label: "Economy slump: −10%", note: "Leisure demand weakens.", set: { shift1: -10 } },
        { label: "Break the model", note: "Upgrades too easy: the cabins become near-perfect substitutes.", set: { eta: 3, e1: 1.2, e2: 1.2 } }
      ],
      takeaways: [
        "<b>Today's layout sits exactly on the edge.</b> 174 economy and 20 First seats use the full 1,105 inches. In the model the cabin is just full, so space has no shadow value yet.",
        "<b>Premium boom: trade rows for First.</b> With First valued 15% more, the model goes to about 24 First and 167 economy seats, and an extra inch of cabin becomes worth about $1.98 per flight. At +30%: about 28 First and 160 economy, and the inch is worth about $3.97. That's the same direction as Delta's 44-First version of the plane.",
        "<b>Each First seat costs about 1.75 economy seats</b> (9.25 ÷ 5.29 in). So First only wins space if it earns 1.75× the margin per seat. At today's fares the <i>average</i> margin is about $28 per inch for economy and $37 for First, but what decides the layout is the margin of the <i>last</i> seat added: at the best layout those are equal (the shadow price).",
        "<b>In a slump, space stops mattering.</b> With economy demand down 10%, the model flies about 151 economy seats and leaves space unused. The constraint stops binding and its shadow price is zero."
      ],
      limits: [
        "Real cabins are built in whole rows, can't change every month, and include Comfort as a separate product. Here economy is one product and seats are continuous.",
        "Fares, elasticities and costs are illustrative, not Delta data; revenue management changes prices flight by flight.",
        "A teaching model, not advice to Delta."
      ],
      lessons: [
        { label: "Linear technology & shared inputs", module: "p2", concept: "technology" },
        { label: "Optimum & shadow prices", module: "p2", concept: "optimum" },
        { label: "Level sets", module: "p3", concept: "levels" }
      ]
    },

    /* ================================================================
       3. STREAMING — NETFLIX: ad tier vs Standard, one market
       Units: members in millions (US & Canada), $ per month, profit $M/month.
       ================================================================ */
    {
      id: "netflix",
      industry: "Streaming",
      company: "Netflix",
      title: "Ad tier or ad-free: which plan should Netflix push?",
      question:
        "The ad plan is cheaper, but every ad member also earns advertising revenue. The two plans compete for the same households. " +
        "As ad revenue grows, how should Netflix price the two plans, and what happens when the market runs out of new households?",
      facts: [
        { label: "U.S. prices (since March 2026)", value: "Standard with ads $8.99 · Standard $19.99 · Premium $26.99", note: "Previously $7.99 / $17.99 / $24.99", source: "FOX 4 News", url: "https://www.fox4news.com/news/netflix-raising-prices-again-all-plans-how-much-more-youll-be-paying" },
        { label: "Ad revenue", value: "Over $1.5 billion in 2025", note: "More than 2.5× the year before; Netflix expects it to roughly double in 2026", source: "Subscription Insider", url: "https://www.subscriptioninsider.com/article-type/news/netflix-says-ad-supported-tier-reaches-250m-monthly-active-viewers-as-membership-fees-still-drive-revenue" },
        { label: "Ad tier reach", value: "More than 250 million monthly active viewers", note: "Global, announced at the May 2026 Upfront (a reach measure, not members)", source: "Subscription Insider", url: "https://www.subscriptioninsider.com/article-type/news/netflix-says-ad-supported-tier-reaches-250m-monthly-active-viewers-as-membership-fees-still-drive-revenue" }
      ],
      model: {
        q0: [35, 50], p0: [8.99, 19.99],
        e1: 1.8, e2: 1.3, eta: 0.6,
        mode: "implied", r0: [4, 0],
        t: [1, 1], K: 100
      },
      display: {
        names: ["Ad-tier members", "Standard members"], pnames: ["Ad-tier price", "Standard price"],
        axis: ["Ad-tier members (millions)", "Standard members (millions)"],
        q: [{ dec: 1, suf: "M" }, { dec: 1, suf: "M" }],
        p: [{ dec: 2, pre: "$", suf: " /mo" }, { dec: 2, pre: "$", suf: " /mo" }],
        profit: { scale: 1, dec: 0, pre: "$", suf: "M / month" },
        resource: { name: "households", unit: "M households" },
        mu: { dec: 2, pre: "$", suf: " per extra household / month" },
        perResource: { dec: 2, pre: "$", suf: " per household" },
        assumptionNotes: [
          "Netflix stopped reporting quarterly member counts in 2025. The split of 35M ad-tier and 50M Standard members in the U.S. and Canada is illustrative.",
          "Ad revenue of $4 per ad-tier member per month and a ceiling of 100M reachable households are assumptions.",
          "Premium is folded into Standard to keep two products. Unit costs are backed out by assuming today's prices are optimal."
        ]
      },
      sliders: [
        { key: "r1", label: "Ad revenue per ad-tier member", min: 0, max: 12, step: 0.5, fmt: { dec: 2, pre: "$", suf: " /mo" }, tip: "Grows as Netflix sells more ads at better rates." },
        { key: "K", label: "Reachable households", min: 70, max: 120, step: 1, fmt: { dec: 0, suf: "M" } },
        { key: "eta", label: "Substitution between plans", min: 0, max: 2.5, step: 0.05, fmt: { dec: 2 } },
        { key: "e1", label: "Ad-tier price elasticity", min: 1.1, max: 3, step: 0.1, fmt: { dec: 1 } },
        { key: "e2", label: "Standard price elasticity", min: 1.1, max: 3, step: 0.1, fmt: { dec: 1 } }
      ],
      scenarios: [
        { label: "Today", note: "The model reproduces today's prices and member split.", set: {} },
        { label: "Ad revenue doubles ($8)", note: "Netflix expects ad revenue to roughly double in 2026.", set: { r1: 8 } },
        { label: "Market saturates: 80M households", note: "Few new households left to sign up.", set: { K: 80 } },
        { label: "Ads double + saturated (85M)", note: "Growth must come from mix, not reach.", set: { r1: 8, K: 85 } },
        { label: "Break the model", note: "The plans become near-perfect substitutes.", set: { eta: 2.5, e1: 1.2, e2: 1.2 } }
      ],
      takeaways: [
        "<b>Ad revenue makes the cheap plan valuable.</b> If ad revenue per member doubles from $4 to $8, the model <i>cuts</i> the ad-tier price from $8.99 to about $6.99 and grows the ad tier from 35M to about 49M members. Standard stays at $19.99 and dips to about 47.9M. Profit rises to about $1,329M a month.",
        "<b>Saturation turns households into the constraint.</b> With only 80M reachable households, the model raises both prices by about $0.61 and each extra household is worth about $1.23 a month. With fewer customers available, growth comes from price.",
        "<b>Both forces together.</b> Ads doubled in a saturated market (85M) gives about 40.3M ad-tier and 44.7M Standard members. The ad tier is priced at about $8.45 and Standard rises to about $21.45, pushing people toward the plan that earns ad revenue. A household is now worth about $2.92 a month.",
        "<b>The shape matters.</b> If the plans become near-perfect substitutes, B stops being positive definite and there is no single best price pair. Try “Break the model”."
      ],
      limits: [
        "Member split, ad revenue per member and household ceiling are assumptions; Netflix no longer reports member counts.",
        "Real churn, content costs and international markets are not in the model.",
        "A teaching model, not advice to Netflix."
      ],
      lessons: [
        { label: "Linear demand for substitutes", module: "p2", concept: "demand" },
        { label: "Profit as a quadratic form", module: "p2", concept: "profit" },
        { label: "Shape gallery", module: "p3", concept: "gallery" }
      ]
    },

    /* ================================================================
       4. COFFEE — STARBUCKS: hot vs cold drinks, one bar of baristas
       Units: drinks per store per day, $ per drink, profit $ per store per day,
       resource = barista minutes at the bar per day.
       ================================================================ */
    {
      id: "starbucks",
      industry: "Coffee",
      company: "Starbucks",
      title: "Hot vs cold: what should one store's bar make?",
      question:
        "Cold drinks dominate Starbucks sales, but customized cold drinks take longer to make, and the company wants every order ready in about four minutes. " +
        "With barista time as the limit, how should a store's hot and cold drink volumes and prices respond to a cold-drink boom or a staffing shortage?",
      facts: [
        { label: "Cold drinks' share of sales", value: "Nearly 80% of beverage sales", note: "U.S. company-operated stores; Howard Schultz, November 2022 earnings call", source: "Vending Times", url: "https://www.vendingtimes.com/articles/pumpkin-spice-iced-drinks-drive-starbucks-q4-sales/" },
        { label: "Speed target", value: "Four minutes or less", note: "From order to drink in hand; CEO Brian Niccol, “Green Apron Service”, August 2025", source: "FOX Business", url: "https://www.foxbusiness.com/economy/starbucks-ceo-sets-new-time-goal-baristas-making-your-order" }
      ],
      model: {
        q0: [110, 440], p0: [5.25, 6.10],
        e1: 2.2, e2: 2.0, eta: 0.5,
        mode: "implied", r0: [0, 0],
        t: [1.0, 1.4], K: 740
      },
      display: {
        names: ["Hot drinks", "Cold drinks"], pnames: ["Hot-drink price", "Cold-drink price"],
        axis: ["Hot drinks per day", "Cold drinks per day"],
        q: [{ dec: 0, suf: " drinks" }, { dec: 0, suf: " drinks" }],
        p: [{ dec: 2, pre: "$", suf: " avg" }, { dec: 2, pre: "$", suf: " avg" }],
        profit: { scale: 1, dec: 0, pre: "$", suf: " per store per day" },
        resource: { name: "barista time", unit: "bar minutes / day" },
        mu: { dec: 2, pre: "$", suf: " per extra barista minute" },
        perResource: { dec: 2, pre: "$", suf: " per bar minute" },
        assumptionNotes: [
          "550 drinks per store per day with 80% cold (440) matches the cold share above; the daily volume is illustrative.",
          "Average prices of $5.25 (hot) and $6.10 (cold), and bar times of 1.0 and 1.4 minutes per drink, are illustrative.",
          "740 bar minutes a day is the assumed capacity. Unit costs are backed out by assuming today's mix is optimal."
        ]
      },
      sliders: [
        { key: "shift2", label: "Cold-drink demand shift", min: -15, max: 20, step: 1, fmt: { dec: 0, suf: "%", sign: true } },
        { key: "K", label: "Barista minutes at the bar", min: 500, max: 900, step: 10, fmt: { dec: 0, suf: " min/day" } },
        { key: "t2", label: "Minutes per cold drink", min: 0.8, max: 2.2, step: 0.05, fmt: { dec: 2, suf: " min" }, tip: "New equipment or simpler menus make cold drinks faster." },
        { key: "eta", label: "Substitution hot ↔ cold", min: 0, max: 3.5, step: 0.05, fmt: { dec: 2 } },
        { key: "e1", label: "Hot-drink price elasticity", min: 1.1, max: 4, step: 0.1, fmt: { dec: 1 } },
        { key: "e2", label: "Cold-drink price elasticity", min: 1.1, max: 4, step: 0.1, fmt: { dec: 1 } }
      ],
      scenarios: [
        { label: "Today", note: "The model reproduces 110 hot + 440 cold drinks.", set: {} },
        { label: "Cold boom: +5%", note: "Customers value cold drinks 5% more.", set: { shift2: 5 } },
        { label: "Staffing short: 650 minutes", note: "One fewer barista on the bar at peak.", set: { K: 650 } },
        { label: "Cold boom + short staffed", note: "Busy demand, thin team.", set: { shift2: 5, K: 650 } },
        { label: "Fix: faster cold drinks (1.1 min)", note: "Same boom and staffing, quicker cold equipment.", set: { shift2: 5, K: 650, t2: 1.1 } },
        { label: "Break the model", note: "Hot and cold become near-perfect substitutes.", set: { eta: 3.5, e1: 1.2, e2: 1.2 } }
      ],
      takeaways: [
        "<b>A cold boom fills the bar.</b> With cold drinks valued 5% more, the model sells about 454 cold drinks at $6.48 and trims hot drinks to about 104. The bar is now full, and one more barista minute is worth about $0.20 a day.",
        "<b>Staffing shortages hit both drinks.</b> With 650 bar minutes, the model raises prices (hot about $5.50, cold about $6.45) and serves fewer drinks; a barista minute is worth about $0.50. With the boom as well, it's worth about $0.80, or about $48 an hour.",
        "<b>Speed is capacity.</b> Cutting cold-drink time from 1.4 to 1.1 minutes lifts profit from about $1,922 to about $1,971 a day under boom-plus-shortage, and the constraint stops binding. When a store can't add staff, faster equipment does the same job.",
        "<b>Margin per minute decides the mix.</b> At today's prices a hot drink earns about $3.02 per bar minute and a cold drink about $2.31, because cold drinks take longer. That's why, when time binds, the model leans relatively more on hot drinks than sales shares suggest."
      ],
      limits: [
        "Volumes, prices, bar times and capacity are illustrative store-level assumptions, not Starbucks data.",
        "Real stores have peaks, mobile orders, food and many drink types; here there are two drink groups and one day-long time budget.",
        "A teaching model, not advice to Starbucks."
      ],
      lessons: [
        { label: "Linear technology & shared inputs", module: "p2", concept: "technology" },
        { label: "Optimum & shadow prices", module: "p2", concept: "optimum" },
        { label: "Definiteness", module: "p3", concept: "definiteness" }
      ]
    },

    /* ================================================================
       5. AUTOS — TOYOTA: RAV4 vs Camry, one plant network
       Units: thousand vehicles, $ thousand, profit $ million per year.
       ================================================================ */
    {
      id: "toyota",
      industry: "Autos",
      company: "Toyota",
      title: "RAV4 vs. Camry: how many of each?",
      question:
        "Toyota builds both the RAV4 and the Camry at its Kentucky plant, and the two compete for some of the same buyers. Starting from real 2025 " +
        "sales and current prices, how should the mix react to a cost shock, a capacity shortage, or an SUV boom?",
      facts: [
        { label: "RAV4 U.S. sales, 2025", value: "479,288", note: "Toyota's best-selling model", source: "Best-Selling-Cars.com", url: "https://www.best-selling-cars.com/usa/2025-full-year-usa-top-10-best-selling-vehicle-models/" },
        { label: "Camry U.S. sales, 2025", value: "316,185", note: "Top-selling sedan in the U.S. in 2025", source: "The Truth About Cars", url: "https://www.thetruthaboutcars.com/cars/post-45133582" },
        { label: "2026 starting prices", value: "RAV4 $33,495 · Camry $30,895", note: "Base trims, listed prices (not average transaction prices)", source: "TrueCar", url: "https://www.truecar.com/overview/toyota/rav4/2026" },
        { label: "Shared plant", value: "TMMK, Georgetown, Kentucky", note: "Builds the Camry and the RAV4; about 550,000 vehicles a year across three lines", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Toyota_Motor_Manufacturing_Kentucky" }
      ],
      model: {
        q0: [479.288, 316.185], p0: [33.495, 30.895],
        e1: 4, e2: 4, eta: 0.5,
        mode: "implied", r0: [0, 0],
        t: [1, 1], K: 1000
      },
      display: {
        names: ["RAV4", "Camry"], pnames: ["RAV4 price", "Camry price"],
        axis: ["RAV4 (thousand vehicles)", "Camry (thousand vehicles)"],
        q: [{ dec: 0, scale: 1000, suf: " vehicles" }, { dec: 0, scale: 1000, suf: " vehicles" }],
        p: [{ dec: 0, scale: 1000, pre: "$" }, { dec: 0, scale: 1000, pre: "$" }],
        profit: { scale: 0.001, dec: 2, pre: "$", suf: "B contribution / yr" },
        resource: { name: "combined capacity", unit: "thousand vehicles" },
        mu: { dec: 0, scale: 1000, pre: "$", suf: " per extra vehicle of capacity" },
        perResource: { dec: 0, scale: 1000, pre: "$", suf: " per vehicle" },
        assumptionNotes: [
          "Own-price elasticity 4 and cross-elasticity 0.5 are assumptions in the range academic car-demand studies report.",
          "Unit costs are backed out by assuming Toyota's 2025 mix was profit-maximizing (implied margins about 29% and 31% of list price).",
          "Combined capacity of 1,000k means “not binding”; lower it to simulate a shortage."
        ]
      },
      sliders: [
        { key: "shock1", label: "Extra cost per RAV4", min: -3, max: 5, step: 0.25, fmt: { dec: 2, pre: "$", suf: "k", sign: true } },
        { key: "shift1", label: "RAV4 demand shift", min: -10, max: 10, step: 1, fmt: { dec: 0, suf: "%", sign: true } },
        { key: "K", label: "Combined capacity", min: 500, max: 1000, step: 10, fmt: { dec: 0, suf: "k vehicles" } },
        { key: "eta", label: "Substitution RAV4 ↔ Camry", min: 0, max: 2.5, step: 0.05, fmt: { dec: 2 } },
        { key: "e1", label: "RAV4 price elasticity", min: 1.5, max: 8, step: 0.25, fmt: { dec: 2 } },
        { key: "e2", label: "Camry price elasticity", min: 1.5, max: 8, step: 0.25, fmt: { dec: 2 } }
      ],
      scenarios: [
        { label: "2025 baseline", note: "The model reproduces 2025 sales and prices.", set: {} },
        { label: "Cost shock: +$2,000 per RAV4", note: "For example, tariffs on parts.", set: { shock1: 2 } },
        { label: "Supply shock: 700k combined", note: "Only 700,000 of the two can be built.", set: { K: 700 } },
        { label: "SUV boom: +5%", note: "Buyers value the RAV4 5% more.", set: { shift1: 5 } },
        { label: "Break the model", note: "Substitution stronger than own-price effects.", set: { e1: 2, e2: 2, eta: 2.5 } }
      ],
      takeaways: [
        "<b>Cost shock.</b> A $2,000 cost increase on every RAV4 cuts RAV4 output by about 57,000 and <i>raises</i> Camry output by about 8,000 as buyers switch. The RAV4 price rises by about $1,000, half the shock.",
        "<b>Prices sit halfway.</b> When capacity doesn't bind, each optimal price is p* = (α + c)/2, so a RAV4 shock leaves the Camry price unchanged.",
        "<b>Shadow price.</b> With only 700,000 vehicles of capacity, the model builds about 422,000 RAV4s and 278,000 Camrys, raises both prices by about $1,155, and values one more vehicle of capacity at about $2,310."
      ],
      limits: [
        "Marginal costs are not public; the model backs them out by assuming 2025 was optimal.",
        "Sales are 2025 U.S. totals from more than one plant; prices are 2026 base-trim list prices.",
        "A teaching model, not advice to Toyota."
      ],
      lessons: [
        { label: "Inverse", module: "p1", concept: "inverse" },
        { label: "Linear demand", module: "p2", concept: "demand" },
        { label: "Level sets", module: "p3", concept: "levels" }
      ]
    }
  ]
};
