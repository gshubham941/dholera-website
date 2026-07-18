import { useState, useMemo, useEffect } from "react";
import {
  MapPin, Search, SlidersHorizontal, Home as HomeIcon, Building2, TreePine,
  Store, Plane, Milestone, Factory, Phone, Mail, ChevronLeft, Check,
  ArrowRight, Compass, Calendar, Ruler, Star, Menu, Loader2, HelpCircle,
  ChevronDown, Info
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ---------------- design tokens ---------------- */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root{
  --indigo:#1B2A4A; --indigo-light:#2E4270; --terracotta:#C1663D;
  --ochre:#D9A441; --madder:#8C3B3B; --cream:#F4EFE3; --cream-dark:#EAE1CC;
  --ink:#2B2420; --ink-soft:#665C4F;
}
.font-display{font-family:'Fraunces',serif;}
.font-body{font-family:'Inter',sans-serif;}
.font-mono{font-family:'IBM Plex Mono',monospace;}
.bg-cream{background:var(--cream);} .bg-cream-dark{background:var(--cream-dark);}
.bg-indigo{background:var(--indigo);} .bg-indigo-light{background:var(--indigo-light);}
.bg-terracotta{background:var(--terracotta);} .bg-ochre{background:var(--ochre);} .bg-madder{background:var(--madder);}
.text-indigo{color:var(--indigo);} .text-terracotta{color:var(--terracotta);} .text-ochre{color:var(--ochre);}
.text-ink{color:var(--ink);} .text-ink-soft{color:var(--ink-soft);} .text-cream{color:var(--cream);}
.border-ink{border-color:var(--ink);}
.step-corner{clip-path:polygon(0 20px,20px 20px,20px 0,100% 0,100% 100%,0 100%);}
.step-divider{clip-path:polygon(0 0,8% 40px,16% 0,24% 40px,32% 0,40% 40px,48% 0,56% 40px,64% 0,72% 40px,80% 0,88% 40px,96% 0,100% 40px,100% 100%,0 100%);}
.grid-texture{background-image:radial-gradient(var(--indigo) 1px, transparent 1px);background-size:22px 22px;opacity:0.08;}
.ajrakh{background-image:repeating-linear-gradient(45deg, rgba(244,239,227,0.10) 0 2px, transparent 2px 14px);}
.card-hover{transition:transform .25s ease, box-shadow .25s ease;}
.card-hover:hover{transform:translateY(-4px); box-shadow:0 18px 40px -12px rgba(27,42,74,0.25);}
`;

const TYPES = ["All", "Residential Plot", "Villa", "Commercial", "Farmland"];
const TYPE_ICON = { "Residential Plot": HomeIcon, "Villa": Building2, "Commercial": Store, "Farmland": TreePine };

// Used only if the API can't be reached (e.g. backend not running yet)
const FALLBACK_PROPERTIES = [
  { id: 1, title: "Sector 4 Riverside Plot", type: "Residential Plot", sector: "Sector 4", area: 300, unit: "sq yd", price: 3150000, possession: "Ready to Register", facing: "East", tag: "River-facing", dAirport: 12, dExpressway: 2, dTata: 8, features: ["Clear title & DA-approved layout", "24-ft gated community road"], desc: "A quiet corner plot along the seasonal riverbelt of Sector 4." },
  { id: 2, title: "Shivalik Smart Villa", type: "Villa", sector: "Sector 9", area: 1850, unit: "sq ft built-up", price: 8500000, possession: "Ready to Move", facing: "North-East", tag: "Corner Unit", dAirport: 15, dExpressway: 4, dTata: 11, features: ["3 BHK + study, corner unit", "Solar water heating"], desc: "A finished 3BHK smart villa in a walled community." },
];

const STATS = [
  { icon: Plane, label: "Dholera International Airport", value: "Under construction" },
  { icon: Factory, label: "TATA Semiconductor Fab", value: "₹91,000 Cr investment" },
  { icon: Milestone, label: "Ahmedabad–Dholera Expressway", value: "109 km, 4-lane" },
  { icon: Ruler, label: "Planned Special Investment Region", value: "920 sq km" },
];

const STEPS = [
  { n: "01", title: "Enquire", body: "Tell us your budget and purpose — residence, plot, or commercial — and we shortlist matching listings." },
  { n: "02", title: "Site Visit", body: "We arrange an on-ground visit to Dholera, including a look at the sector's DA-approved layout maps." },
  { n: "03", title: "Booking", body: "Reserve with a token amount once titles and layout approvals are verified to your satisfaction." },
  { n: "04", title: "Registration", body: "We coordinate the sale deed and registration at the local sub-registrar, documents in hand." },
];

const FAQ_DATA = [
  {
    q: "What is Dholera, and what do the SIR Act and SEZ mean here?",
    a: "Dholera SIR is a 920 sq km greenfield industrial city about 100 km from Ahmedabad, created under the Gujarat Special Investment Region (SIR) Act, 2009, in force since 6 January 2009. The Act lets the state government declare and govern large, self-administered investment regions (minimum 100 sq km) with their own development authority and dispute-resolution system. An SEZ is a different, narrower instrument under the central SEZ Act, 2005 — a smaller customs/export-focused enclave with duty benefits but no independent city-planning authority of its own. A semiconductor-focused SEZ has been carved out within Dholera SIR, but the SIR is the larger governing framework around it."
  },
  {
    q: "What is the background of Dholera?",
    a: "Dholera was historically a small port town on the Gulf of Khambhat with roots going back to the Harappan era. The Gujarat government declared it a Special Investment Region in February 2009, and the project gained momentum from 2013 as a flagship node of the Delhi–Mumbai Industrial Corridor (DMIC). The implementing company, Dholera Industrial City Development Ltd (DICDL), was incorporated on 28 January 2016 as a joint venture between the state and central governments. Trunk infrastructure for the first rollout zone (the 'Activation Area') has been built out since, with investment interest accelerating sharply from around 2022–2023 alongside Tata's semiconductor project."
  },
  {
    q: "What are Dholera's geographic coordinates and location details?",
    a: "Dholera sits at roughly 22.25°N, 72.20°E in Ahmedabad district, Gujarat, on the Gulf of Khambhat — bordered by the Bavaliari creek to the north and Sonaria creek to the south. It's a low-lying coastal plain, which is part of why it suited a from-scratch grid layout, though the area has flooded during heavy monsoons in the past."
  },
  {
    q: "How far is Dholera from Ahmedabad, the nearest seaport, and what connectivity does it have?",
    a: "Dholera is about 100–113 km from Ahmedabad by road — roughly 2 to 2.5 hours on older routes, with the new expressway targeting 40–60 minutes. A dedicated Dholera seaport was originally proposed but has since been shelved, so the nearest working ports are Bhavnagar (roughly 130 km) and the larger Gulf ports further along the coast. For connectivity: the 109 km Ahmedabad–Dholera Expressway (NE-8) opened to the public in early-to-mid 2026, Dholera International Airport is under construction nearby, a metro/monorail link to Ahmedabad has been proposed, and rail connectivity is still in planning (currently the nearest broad-gauge station is Tarapur, about 103 km away)."
  },
  {
    q: "Why did the government choose Dholera for this project?",
    a: "The site combines several practical advantages: it's close enough to Ahmedabad and GIFT City to draw on existing industrial and financial infrastructure, it sits on the DMIC alignment linked to the Western Dedicated Freight Corridor, and it offered a large contiguous stretch of low-value agricultural/saline land — meaning fewer people needed to be relocated compared with building a similar-scale city near a dense urban area. Flat terrain also made a clean grid master plan easier to execute, and being in Gujarat gave it sustained political backing as a DMIC flagship project."
  },
  {
    q: "How is the Dholera Master Plan laid out, and how do TP Schemes and Sub-TP zones work?",
    a: "The 920 sq km region is divided into 12 zones and six sub-centers, spanning 22 villages of Dholera taluka. Physical planning is executed through Town Planning (TP) Schemes under Gujarat's town-planning law — each TP Scheme area is broken into Sub-TP zones, which are further divided into individual serviced plots. The first zone actually built out is the roughly 22 sq km 'Activation Area,' where trunk roads, drainage, power, and ICT ducting are largely complete; the remaining zones are scheduled to roll out in phases through a horizon stretching to around 2042."
  },
  {
    q: "Can you give a milestone timeline for the Planning Phase (2009–2015) vs the Execution Phase (2016–present)?",
    a: "Planning phase (2009–2015): the SIR was declared in 2009, the Gujarat SIR Act became operative, DSIRDA (the planning authority) was constituted, and the initial master plan and land-pooling groundwork were drawn up. Execution phase (2016–present): DICDL, the delivery SPV, was formed in January 2016; trunk-infrastructure contracts followed from around 2017; the ABCD administrative building and Activation Area utilities were substantially completed through the early-to-mid 2020s; the Ahmedabad–Dholera Expressway and Dholera Airport were under construction from roughly 2020 and both reached operational or near-operational status in 2026; and Tata's semiconductor project, alongside a wave of other corporate MoUs, has been the dominant execution-phase story since 2023."
  },
  {
    q: "How does Land Pooling and the TP Scheme mechanism turn an Original Plot (OP) into a Final Plot (FP)?",
    a: "Under Gujarat's town-planning law, a landowner's Original Plot (OP) is pooled together with neighboring plots into a TP Scheme area. Roughly half of that pooled land is set aside for roads, drainage, utilities, and public amenities (or retained by the authority), and the owner receives back a smaller Final Plot (FP) that is fully serviced. The owner keeps legal title throughout the process — they end up with less land by area, but a plot that typically carries a materially higher per-unit value than the original raw, unserviced parcel."
  },
  {
    q: "For the last five fiscal years, what's the variance between Budgeted Estimate and Actual Expenditure on trunk infrastructure?",
    a: "I couldn't find a consolidated, publicly published year-by-year Budgeted-Estimate-vs-Actual-Expenditure table for Dholera's trunk infrastructure — DSIRDA and DICDL don't appear to disclose that breakdown in an easily accessible public format. What is on record are project-level figures: DICDL was formed with an authorized capital of ₹6,000 crore, and the DMIC/NICDC Trust separately approved around ₹4,400 crore specifically for Activation Area trunk works. For an actual fiscal-year-by-fiscal-year variance report, that would need to be requested directly from DSIRDA/DICDL, including via RTI if it isn't already public."
  },
  {
    q: "How aligned and committed are the State and Central governments to Dholera SIR long-term?",
    a: "The commitment is structural, not just rhetorical: DICDL itself is a joint venture, 51% owned by the Gujarat government (through DSIRDA, mainly contributed as land) and 49% by the Government of India (through the NICDC Trust, mainly contributed as funding for trunk infrastructure). Central schemes — the India Semiconductor Mission's support for Tata's fab, and the Sagarmala programme funding the Lothal maritime museum — layer on top of state-level land and utility provisioning. That said, funding for a project like this is released in stages tied to Cabinet approvals and budget cycles rather than guaranteed under one long-term contract, so continued pace depends on sustained political and fiscal follow-through."
  },
  {
    q: "What makes up Dholera SIR's ICT backbone and smart-governance infrastructure?",
    a: "The Activation Area has underground fibre-optic cabling and utility ducting, IoT sensors for traffic and utility monitoring, and smart metering for power and water. It's tied together through an Integrated Command & Control Centre housed in the ABCD (Administrative-cum-Business Centre for Dholera) building, which centralizes CCTV, traffic, and SCADA dashboards, alongside e-governance portals for permits and approvals. Developers frame this against Singapore- or London-style smart city systems — worth verifying how much is genuinely live versus planned when you visit, since 'smart city' claims in marketing materials often run ahead of on-ground reality."
  },
  {
    q: "How is Dholera positioned within the regional Heritage and Eco-Tourism circuit connecting Lothal, Velavadar, and Nalsarovar?",
    a: "Dholera sits close to Lothal, the Harappan-era dockyard town, where the central government is building the National Maritime Heritage Complex (NMHC) — a roughly ₹4,500 crore, Sagarmala-linked museum and heritage park being delivered in phases through 2026–2028. State tourism planning has proposed circuits linking Lothal with Velavadar (blackbuck sanctuary) and Nalsarovar (bird sanctuary), positioning the wider Dholera–Ahmedabad–Bhavnagar belt as a combined industrial-and-heritage corridor, which could support hospitality and retail demand around Dholera as these sites open."
  },
  {
    q: "What's the National Maritime Heritage Complex at Lothal, and why does it matter for the region?",
    a: "The NMHC is a large government museum and heritage-tourism project at Lothal, developed under the Sagarmala programme at a cost of roughly ₹4,500 crore. Its first phase includes six galleries plus Indian Navy and Coast Guard displays, a recreated Lothal township, and a jetty walkway, with later phases adding a lighthouse museum, coastal-state pavilions, and eco-resorts. Because Lothal sits right next to Dholera SIR, the government-backed complex is expected to be one of the larger sustained visitor draws to the wider region once it's fully open."
  },
  {
    q: "What does 'the Dholera Lifeline' refer to right now?",
    a: "As of mid-2026, 'the Dholera Lifeline' is used almost exclusively to describe the Ahmedabad–Dholera Expressway (NE-8) — the 109 km, four-lane (expandable) access-controlled expressway connecting Sarkhej in Ahmedabad to Adhelai near Bhavnagar. Built at a cost of roughly ₹5,800 crore under the Bharatmala Pariyojana, it opened to public use in early-to-mid 2026 after a testing period, and is designed to cut the Ahmedabad-Dholera travel time from around 2–2.5 hours down to roughly 40–60 minutes."
  },
  {
    q: "What's the target date and cargo capacity for Phase 1 of Dholera International Airport?",
    a: "Phase 1 (budgeted at roughly ₹1,300–1,378 crore) is being delivered by DIACL, a joint venture of the Airports Authority of India, the Gujarat government, and NICDIT. Its 3,200-metre runway can handle wide-body aircraft, and a calibration flight successfully landed in June 2026. Cargo operations were targeted to begin in 2026, with full passenger operations targeted by around the end of 2026 — though that date hasn't been officially locked in, and Indian infrastructure timelines have slipped before, so it's worth treating as a target rather than a guarantee. Phase 1's designed capacity is about 1.5 million passengers a year, scaling toward tens of millions annually across later phases."
  },
  {
    q: "What's the projected link between the Kalpasar Dam and long-term Dholera land values?",
    a: "Kalpasar (the Gulf of Khambhat Development Project) is a separate, much larger, and still-proposed project — a roughly ₹1.3 lakh crore dyke across the Gulf that would create a vast freshwater reservoir. As of mid-2026 it remains in the detailed project report/feasibility stage, with construction not projected to begin before around 2028 and completion projected for the mid-2030s at the earliest. If eventually built, planners project it would improve freshwater availability, cut coastal salinity, shorten travel distance between Saurashtra and south Gujarat, and open land around the reservoir for development — commentary in the property industry frames this as a long-term tailwind for Dholera. Given the project has been studied since the 1990s without breaking ground, it's best treated as a distant, unconfirmed catalyst rather than something priced into near-term land values."
  },
  {
    q: "How many companies have invested in Dholera SIR?",
    a: "Dozens of MoUs have been signed since around 2022–2023, spanning semiconductors (Tata Electronics, NextGen Semiconductors), renewables (ReNew, Grew Energy, Tata Power's solar park), data centres (L&T Vyoma, reportedly around ₹25,000 crore; Tillman Global, reportedly a larger hyperscale commitment), steel and EV batteries (Tsingshan Holding Group), and township/industrial-park developers (Mahindra Lifespaces and others). DSIRDA/DICDL don't publish one continuously updated official count, and third-party trackers list somewhere in the range of 10–20-plus named anchor investors as of mid-2026 — though these lists mix formally signed MoUs with earlier-stage interest, so treat any specific number as approximate."
  },
  {
    q: "What percentage of the announced investment has moved from MoUs to active ground execution?",
    a: "I couldn't verify a single official 'total announced investment' figure or a published MoU-to-execution conversion percentage — reported totals vary a lot by source, from roughly ₹1.5 lakh crore counting only the largest confirmed anchor projects, up to ₹3 lakh crore or more once every reported MoU is added, with no single audited consolidated number from DSIRDA or DICDL that I could find. What is independently verifiable is that some anchor projects — Tata's semiconductor fab, the expressway, Airport Phase 1, and the Activation Area's utilities — have reached actual construction or operation, while several of the larger recent MoUs (the L&T Vyoma data centre, Tsingshan's plant) were signed in 2025–2026 and are still at early land-assessment stages. So a meaningful share of the headline figure has not yet reached ground execution, but I can't respond with a specific percentage."
  },
  {
    q: "What's the official URL for the state-sanctioned portal handling Dholera SIR approvals?",
    a: "DSIRDA's official government site is dholera.gujarat.gov.in (SIR Act text, land policy, notices), and DICDL's implementing-agency site is dicdl.gujarat.gov.in. Those are the two authoritative sources I found — worth verifying any land purchase or approval directly through one of them rather than relying solely on a private brokerage or consultant's website."
  },
  {
    q: "What's the equity structure behind Dholera SIR's development, and what are the project details?",
    a: "DICDL, the implementing SPV, was incorporated on 28 January 2016 with an authorized capital of ₹6,000 crore: 51% held by the Gujarat government through DSIRDA (contributed mainly as land) and 49% by the Government of India through the NICDC Trust (contributed mainly as cash for trunk infrastructure — the Trust separately approved about ₹4,400 crore for Activation Area works). DSIRDA is the statutory planning and regulatory authority created under the Gujarat SIR Act; DICDL is the delivery vehicle that executes on the ground. They're legally distinct but work in tandem. Happy to go deeper on any one piece — funding, land policy, or phasing — if useful."
  },
  {
    q: "Why should I consider investing in Dholera SIR?",
    a: "The case investors commonly cite: an early-mover position in a government-backed greenfield SIR with a legal framework (SIR Act, TP-scheme land pooling, RERA where applicable) that's more structured than informal land deals elsewhere; the expressway and Phase 1 of the airport reaching operational status in 2026; and anchor industrial commitment already in construction, led by Tata's semiconductor fab. Set against that: this is still a long-horizon, execution-dependent project, several milestones here have already slipped by years from their original targets, and pricing in the more-developed pockets already reflects a good deal of anticipated growth. This isn't something I can weigh for you — it's worth treating as one input alongside independent legal and financial advice suited to your own situation."
  },
  {
    q: "Is Dholera SIR a safe investment?",
    a: "I'm not able to rate that for you — 'safe' is a personal risk judgment that depends on your time horizon, capital, and what else you're comparing it against, and I'm not a financial advisor. What I can offer are the factual considerations: the SIR Act framework and the TP-scheme land-pooling process (which converts pooled land into a clear, serviced Final Plot) provide more structural clarity than an informal land purchase would. Against that, timeline slippage has been well documented here — the airport and expressway both moved years past their original target dates — and less-developed sectors or farmland parcels carry real liquidity and conversion-timeline risk. Before any purchase, independent title verification, a DSIRDA/DICDL check on the specific plot, and RERA registration status (where applicable) are worth confirming directly rather than taking a seller's word for it."
  },
];

function formatINR(n) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2).replace(/\.00$/, "") + " Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2).replace(/\.00$/, "") + " Lakh";
  return "₹" + n.toLocaleString("en-IN");
}

function StepDivider({ flip }) {
  return <div className={`step-divider bg-indigo h-10 w-full ${flip ? "rotate-180" : ""}`} />;
}

function PlaceholderArt({ type, tag }) {
  const Icon = TYPE_ICON[type] || HomeIcon;
  return (
    <div className="relative h-44 w-full bg-indigo ajrakh overflow-hidden step-corner flex items-center justify-center">
      <Icon size={46} className="text-cream opacity-90" strokeWidth={1.3} />
      <div className="absolute top-3 right-3 bg-ochre text-indigo text-xs font-mono font-semibold px-2 py-1 rounded-sm">
        {tag}
      </div>
    </div>
  );
}

function PropertyCard({ p, onOpen }) {
  return (
    <div className="bg-white card-hover cursor-pointer overflow-hidden shadow-sm" onClick={() => onOpen(p)}>
      <PlaceholderArt type={p.type} tag={p.tag} />
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-soft mb-2">
          <MapPin size={13} /> {p.sector}
        </div>
        <h3 className="font-display text-lg font-semibold text-ink leading-snug mb-1">{p.title}</h3>
        <p className="font-mono text-xs text-ink-soft mb-3">{p.area.toLocaleString("en-IN")} {p.unit}</p>
        <div className="flex items-end justify-between">
          <span className="font-display text-xl font-bold text-terracotta">{formatINR(p.price)}</span>
          <span className="text-xs font-body text-indigo bg-cream-dark px-2 py-1 rounded-sm">{p.possession}</span>
        </div>
      </div>
    </div>
  );
}

function Nav({ setView, view, menuOpen, setMenuOpen }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "listings", label: "Properties" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ];

  const goTo = (id) => {
    if (id === "faq") {
      setView("home");
      setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 50);
    } else {
      setView(id);
    }
  };
  return (
    <header className="sticky top-0 z-30 bg-indigo font-body">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <button onClick={() => setView("home")} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ochre step-corner" />
          <span className="font-display text-xl font-bold text-cream tracking-tight">Bhoomi <span className="text-ochre">Dholera</span></span>
        </button>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <button key={l.id} onClick={() => goTo(l.id)}
              className={`text-sm tracking-wide ${view === l.id ? "text-ochre" : "text-cream"} hover:text-ochre transition-colors`}>
              {l.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setView("contact")} className="hidden md:block bg-terracotta text-cream text-sm font-semibold px-4 py-2 hover:opacity-90 transition-opacity">
          Book a Site Visit
        </button>
        <button className="md:hidden text-cream" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-indigo-light px-5 pb-4 flex flex-col gap-3">
          {links.map(l => (
            <button key={l.id} onClick={() => { goTo(l.id); setMenuOpen(false); }}
              className="text-left text-cream text-sm py-1">{l.label}</button>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero({ goListings, quickType, setQuickType }) {
  return (
    <section className="relative bg-indigo overflow-hidden">
      <div className="absolute inset-0 grid-texture" />
      <div className="max-w-6xl mx-auto px-5 pt-16 pb-24 relative">
        <p className="font-mono text-ochre text-xs tracking-[0.25em] mb-4">INDIA'S FIRST GREENFIELD SMART CITY · GUJARAT</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-cream leading-[1.05] max-w-3xl">
          Land in the city being built<br />from a blank map.
        </h1>
        <p className="font-body text-cream/80 text-lg max-w-xl mt-5">
          Plots, villas and commercial units across Dholera Special Investment Region — verified titles, DA-approved layouts, priced for investors and end-users alike.
        </p>

        <div className="mt-9 bg-cream p-2 flex flex-col sm:flex-row gap-2 max-w-2xl step-corner">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Search size={18} className="text-ink-soft" />
            <select value={quickType} onChange={e => setQuickType(e.target.value)}
              className="font-body text-sm text-ink bg-transparent py-3 flex-1 outline-none">
              {TYPES.map(t => <option key={t} value={t}>{t === "All" ? "Any property type" : t}</option>)}
            </select>
          </div>
          <button onClick={goListings}
            className="bg-terracotta text-cream font-semibold text-sm px-6 py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            Search listings <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <StepDivider />
    </section>
  );
}

function WhySection() {
  return (
    <section className="bg-cream py-16">
      <div className="max-w-6xl mx-auto px-5">
        <p className="font-mono text-terracotta text-xs tracking-[0.2em] mb-2">THE INVESTMENT CASE</p>
        <h2 className="font-display text-3xl font-bold text-ink mb-10">Why Dholera, why now</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white p-6 step-corner">
              <s.icon size={26} className="text-madder mb-4" strokeWidth={1.5} />
              <p className="font-display text-lg font-semibold text-ink leading-snug mb-1">{s.value}</p>
              <p className="font-body text-sm text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="bg-cream-dark py-16">
      <div className="max-w-6xl mx-auto px-5">
        <p className="font-mono text-terracotta text-xs tracking-[0.2em] mb-2">HOW A PURCHASE WORKS</p>
        <h2 className="font-display text-3xl font-bold text-ink mb-10">Four steps, start to registration</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 relative">
          {STEPS.map((s, i) => (
            <div key={i} className="relative bg-cream p-6" style={{ marginTop: i % 2 === 1 ? "20px" : "0" }}>
              <span className="font-mono text-3xl font-bold text-ochre">{s.n}</span>
              <h3 className="font-display text-lg font-semibold text-ink mt-2 mb-2">{s.title}</h3>
              <p className="font-body text-sm text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ properties, goListings, openDetail }) {
  return (
    <section className="bg-cream py-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-terracotta text-xs tracking-[0.2em] mb-2">CURRENT INVENTORY</p>
            <h2 className="font-display text-3xl font-bold text-ink">Featured listings</h2>
          </div>
          <button onClick={goListings} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo hover:text-terracotta transition-colors">
            View all properties <ArrowRight size={15} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 3).map(p => <PropertyCard key={p.id} p={p} onOpen={openDetail} />)}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="bg-cream border-l-4 border-terracotta">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 text-left px-5 py-4"
      >
        <span className="font-display font-semibold text-ink text-base leading-snug">{item.q}</span>
        <ChevronDown size={20} className={`shrink-0 text-terracotta mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <p className="font-body text-sm text-ink-soft leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section className="bg-ochre py-16" id="faq">
      <div className="max-w-4xl mx-auto px-5">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={18} className="text-indigo" />
          <p className="font-mono text-indigo text-xs tracking-[0.2em] font-semibold">HIGHLIGHTED · FREQUENTLY ASKED</p>
        </div>
        <h2 className="font-display text-3xl font-bold text-indigo mb-3">Dholera SIR: the full picture</h2>
        <div className="flex items-start gap-2 bg-indigo/10 px-4 py-3 mb-8">
          <Info size={16} className="text-indigo mt-0.5 shrink-0" />
          <p className="font-body text-sm text-indigo/90">
            Answers below are compiled from government and public sources as of mid-2026. Large infrastructure
            projects shift timelines often — verify current status directly with DSIRDA/DICDL before making
            decisions based on any date or figure here.
          </p>
        </div>
        <div className="space-y-2">
          {FAQ_DATA.map((item, i) => (
            <FAQItem key={i} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", interest: "Residential Plot", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      setForm({ name: "", phone: "", interest: "Residential Plot", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-indigo py-16" id="contact">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12">
        <div>
          <p className="font-mono text-ochre text-xs tracking-[0.2em] mb-2">GET IN TOUCH</p>
          <h2 className="font-display text-3xl font-bold text-cream mb-4">Plan a site visit</h2>
          <p className="font-body text-cream/75 mb-8 max-w-md">
            Share your budget and preferred sector — we'll send verified listing options and arrange a guided visit to Dholera.
          </p>
          <div className="space-y-3 font-body text-cream/85 text-sm">
            <div className="flex items-center gap-3"><Phone size={16} className="text-ochre" /> +91 98765 43210</div>
            <div className="flex items-center gap-3"><Mail size={16} className="text-ochre" /> hello@bhoomidholera.example</div>
            <div className="flex items-center gap-3"><MapPin size={16} className="text-ochre" /> Site Office, TP-1 Central Spine, Dholera</div>
          </div>
        </div>
        <form className="bg-cream p-6 step-corner space-y-3" onSubmit={handleSubmit}>
          <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white font-body text-sm text-ink px-4 py-3 outline-none border border-transparent focus:border-terracotta" />
          <input required placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-white font-body text-sm text-ink px-4 py-3 outline-none border border-transparent focus:border-terracotta" />
          <select value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })}
            className="w-full bg-white font-body text-sm text-ink px-4 py-3 outline-none border border-transparent focus:border-terracotta">
            {TYPES.filter(t => t !== "All").map(t => <option key={t}>{t}</option>)}
          </select>
          <textarea placeholder="Anything specific you're looking for?" rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full bg-white font-body text-sm text-ink px-4 py-3 outline-none border border-transparent focus:border-terracotta" />
          <button disabled={status === "sending"} className="w-full bg-terracotta text-cream font-semibold text-sm py-3 hover:opacity-90 transition-opacity disabled:opacity-60">
            {status === "sending" ? "Sending…" : "Request a call back"}
          </button>
          {status === "sent" && <p className="text-sm text-green-700 font-body">Thanks — we'll be in touch shortly.</p>}
          {status === "error" && <p className="text-sm text-madder font-body">Couldn't reach the server. Is the backend running?</p>}
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-indigo border-t border-cream/10 py-6">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="font-display text-cream font-semibold">Bhoomi <span className="text-ochre">Dholera</span></span>
        <p className="font-mono text-cream/50 text-xs">Listings shown are illustrative placeholders · verify all titles independently before purchase</p>
      </div>
    </footer>
  );
}

function ListingsView({ properties, loading, openDetail, filters, setFilters }) {
  const filtered = useMemo(() => {
    return properties
      .filter(p => filters.type === "All" || p.type === filters.type)
      .filter(p => p.price <= filters.maxPrice)
      .sort((a, b) => filters.sort === "price-asc" ? a.price - b.price : filters.sort === "price-desc" ? b.price - a.price : 0);
  }, [properties, filters]);

  return (
    <section className="bg-cream min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <p className="font-mono text-terracotta text-xs tracking-[0.2em] mb-2">ALL LISTINGS</p>
        <h1 className="font-display text-3xl font-bold text-ink mb-8">Properties across Dholera SIR</h1>

        <div className="bg-white p-4 mb-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center step-corner">
          <div className="flex items-center gap-2 text-ink-soft"><SlidersHorizontal size={16} /><span className="font-mono text-xs">FILTER</span></div>
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
            className="font-body text-sm text-ink border border-cream-dark px-3 py-2 flex-1">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
            className="font-body text-sm text-ink border border-cream-dark px-3 py-2 flex-1">
            <option value={110000000}>Any budget</option>
            <option value={3000000}>Up to ₹30 Lakh</option>
            <option value={5000000}>Up to ₹50 Lakh</option>
            <option value={8000000}>Up to ₹80 Lakh</option>
            <option value={110000000}>Up to ₹1.1 Cr</option>
          </select>
          <select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}
            className="font-body text-sm text-ink border border-cream-dark px-3 py-2 flex-1">
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-ink-soft font-body py-10 justify-center">
            <Loader2 size={18} className="animate-spin" /> Loading listings…
          </div>
        ) : (
          <>
            <p className="font-mono text-xs text-ink-soft mb-5">{filtered.length} propert{filtered.length === 1 ? "y" : "ies"} found</p>
            {filtered.length === 0 ? (
              <div className="bg-white p-10 text-center step-corner">
                <p className="font-display text-lg text-ink mb-1">No listings match this filter</p>
                <p className="font-body text-sm text-ink-soft">Try widening your budget or property type.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(p => <PropertyCard key={p.id} p={p} onOpen={openDetail} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function DetailView({ property, back }) {
  const Icon = TYPE_ICON[property.type] || HomeIcon;
  return (
    <section className="bg-cream min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <button onClick={back} className="flex items-center gap-1 text-sm font-semibold text-indigo hover:text-terracotta transition-colors mb-6">
          <ChevronLeft size={16} /> Back to listings
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-indigo ajrakh h-72 step-corner flex items-center justify-center mb-3">
              <Icon size={64} className="text-cream opacity-90" strokeWidth={1.2} />
            </div>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="bg-indigo-light ajrakh h-16 step-corner flex items-center justify-center">
                  <Icon size={18} className="text-cream/60" />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm font-mono text-ink-soft mb-2">
              <MapPin size={14} /> {property.sector}
            </div>
            <h1 className="font-display text-3xl font-bold text-ink mb-4">{property.title}</h1>
            <p className="font-body text-ink-soft leading-relaxed mb-8">{property.desc}</p>

            <h2 className="font-display text-xl font-semibold text-ink mb-4">Features</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {(property.features || []).map((f, i) => (
                <div key={i} className="flex items-start gap-2 bg-white px-4 py-3">
                  <Check size={16} className="text-terracotta mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-ink">{f}</span>
                </div>
              ))}
            </div>

            <h2 className="font-display text-xl font-semibold text-ink mb-4">Distance to key landmarks</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-white p-4"><Plane size={18} className="text-madder mb-2" /><p className="font-display font-semibold text-ink">{property.dAirport} km</p><p className="font-mono text-xs text-ink-soft">Dholera Airport</p></div>
              <div className="bg-white p-4"><Milestone size={18} className="text-madder mb-2" /><p className="font-display font-semibold text-ink">{property.dExpressway} km</p><p className="font-mono text-xs text-ink-soft">Expressway access</p></div>
              <div className="bg-white p-4"><Factory size={18} className="text-madder mb-2" /><p className="font-display font-semibold text-ink">{property.dTata} km</p><p className="font-mono text-xs text-ink-soft">TATA Semiconductor Fab</p></div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 sticky top-24 step-corner">
              <span className="inline-block bg-ochre text-indigo text-xs font-mono font-semibold px-2 py-1 mb-4">{property.tag}</span>
              <p className="font-display text-3xl font-bold text-terracotta mb-1">{formatINR(property.price)}</p>
              <p className="font-mono text-xs text-ink-soft mb-6">{property.area.toLocaleString("en-IN")} {property.unit}</p>

              <div className="space-y-3 mb-6 border-t border-cream-dark pt-4">
                <div className="flex justify-between text-sm"><span className="text-ink-soft flex items-center gap-2"><Compass size={14} /> Facing</span><span className="text-ink font-medium">{property.facing}</span></div>
                <div className="flex justify-between text-sm"><span className="text-ink-soft flex items-center gap-2"><Calendar size={14} /> Possession</span><span className="text-ink font-medium">{property.possession}</span></div>
                <div className="flex justify-between text-sm"><span className="text-ink-soft flex items-center gap-2"><Star size={14} /> Type</span><span className="text-ink font-medium">{property.type}</span></div>
              </div>

              <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="w-full bg-terracotta text-cream font-semibold text-sm py-3 mb-2 hover:opacity-90 transition-opacity">
                Enquire about this property
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [quickType, setQuickType] = useState("All");
  const [filters, setFilters] = useState({ type: "All", maxPrice: 110000000, sort: "default" });
  const [properties, setProperties] = useState(FALLBACK_PROPERTIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/properties`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setProperties(data))
      .catch(() => setProperties(FALLBACK_PROPERTIES))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (p) => { setSelected(p); setView("detail"); window.scrollTo?.(0, 0); };
  const goListings = () => { setFilters(f => ({ ...f, type: quickType })); setView("listings"); };

  return (
    <div className="font-body min-h-screen" style={{ background: "var(--cream)" }}>
      <style>{FONTS}</style>
      <Nav setView={setView} view={view} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {view === "home" && (
        <>
          <Hero goListings={goListings} quickType={quickType} setQuickType={setQuickType} />
          <WhySection />
          <FeaturedSection properties={properties} goListings={() => setView("listings")} openDetail={openDetail} />
          <ProcessSection />
          <FAQSection />
          <ContactSection />
        </>
      )}

      {view === "listings" && (
        <>
          <ListingsView properties={properties} loading={loading} openDetail={openDetail} filters={filters} setFilters={setFilters} />
          <ContactSection />
        </>
      )}

      {view === "detail" && selected && <DetailView property={selected} back={() => setView("listings")} />}

      {view === "contact" && <ContactSection />}

      <Footer />
    </div>
  );
}
