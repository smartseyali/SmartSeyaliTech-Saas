#!/usr/bin/env node
/**
 * Smartseyali — Bulk template scaffolder (rich version).
 *
 * Each spec now includes category-specific rich content arrays
 * (products/programs/speakers/episodes/etc.) rendered into the
 * template's home + secondary pages. Contact pages use a shared form.
 *
 * Re-run safe — overwrites only slugs listed in SPECS. Pattikadai,
 * Sparkle, and the earlier minimal templates are untouched.
 *
 *   node scripts/scaffold-templates.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "public", "templates");

// ── Template specs ─────────────────────────────────────────────
const SPECS = [
    // ═════════════════════ ECOMMERCE ═════════════════════
    {
        category: "ecommerce",
        slug: "fashion-boutique",
        brand: "Atelier",
        mark: "A",
        palette: { bg: "#F5F1EB", text: "#1A1D2E", muted: "#6B6B6B", card: "#FFFFFF", border: "#E8E2D6", accent: "#1A1D2E", accent2: "#C8A97E" },
        heroBadge: "New Collection · SS26",
        tagline: "Curated fashion for the thoughtful closet",
        pages: {
            home:   { hero: "Timeless pieces, thoughtfully curated.", sub: "Independent designers, ethical materials, pieces that last beyond the season." },
            second: { slug: "shop", file: "shop.html", title: "Shop", hero: "New arrivals", sub: "Fresh from our partner studios." },
        },
        kind: "shop",
        products: [
            { name: "Linen Wrap Dress", meta: "Handwoven in Ponduru", price: "₹ 4,800" },
            { name: "Cashmere Cardigan", meta: "Nepalese highland wool", price: "₹ 12,400" },
            { name: "Silk Scarf Set", meta: "Hand-block printed", price: "₹ 2,200" },
            { name: "Cotton Shirt Dress", meta: "GOTS-certified", price: "₹ 3,600" },
            { name: "Wide-leg Trousers", meta: "Tencel blend", price: "₹ 4,200" },
            { name: "Knit Turtleneck", meta: "Merino wool", price: "₹ 5,800" },
            { name: "Leather Tote", meta: "Vegetable-tanned", price: "₹ 7,400" },
            { name: "Classic Overshirt", meta: "Organic cotton", price: "₹ 3,900" },
        ],
        features: [
            { title: "Sustainable sourcing", body: "Every piece traced back to its maker — no fast fashion here." },
            { title: "Made to last", body: "Investment pieces engineered for decades of wear, not seasons." },
            { title: "Ethical craft", body: "Fair wages and transparent supply chains at every step." },
        ],
    },
    {
        category: "ecommerce",
        slug: "electronics-hub",
        brand: "Volt",
        mark: "V",
        palette: { bg: "#0A0A0A", text: "#F5F5F5", muted: "#9CA3AF", card: "#141414", border: "#262626", accent: "#BEFF00", accent2: "#7AE600" },
        heroBadge: "Pre-order · Ships April",
        tagline: "Gear for builders, makers, and nerds",
        pages: {
            home:   { hero: "Tools that keep up with you.", sub: "High-performance gadgets, dev gear, and the obscure accessories that make work feel good." },
            second: { slug: "shop", file: "shop.html", title: "Catalog", hero: "Browse the catalog", sub: "Updated weekly with new drops." },
        },
        kind: "shop",
        products: [
            { name: "Mechanical Keyboard", meta: "75% hot-swap · Gateron", price: "₹ 14,900" },
            { name: "USB-C Hub 8-in-1", meta: "PD 100W · 4K HDMI", price: "₹ 3,800" },
            { name: "Ergonomic Mouse", meta: "Silent clicks · 2.4G", price: "₹ 2,400" },
            { name: "27\" 4K Monitor", meta: "USB-C · HDR400", price: "₹ 42,500" },
            { name: "Fast Charger 65W", meta: "GaN · dual-port", price: "₹ 2,100" },
            { name: "Lavalier Mic", meta: "USB-C · plug-and-play", price: "₹ 1,800" },
            { name: "Mini LED Desk Lamp", meta: "CRI 95+ · dimmable", price: "₹ 3,400" },
            { name: "SSD 2TB NVMe", meta: "PCIe 4.0 · 7000MB/s", price: "₹ 12,900" },
        ],
        features: [
            { title: "Hand-tested", body: "Every product we list has been used daily by our team for at least 30 days." },
            { title: "30-day returns", body: "If it doesn't work for you, send it back. No restocking fees, ever." },
            { title: "Expert support", body: "Talk to someone who actually knows the spec sheet." },
        ],
    },
    {
        category: "ecommerce",
        slug: "grocery-market",
        brand: "FreshCart",
        mark: "F",
        palette: { bg: "#FFFBE6", text: "#1B3A1B", muted: "#5C7A5C", card: "#FFFFFF", border: "#DCE6D2", accent: "#1B5E20", accent2: "#66BB6A" },
        heroBadge: "Fresh today · 2-hour delivery",
        tagline: "Fresh produce, delivered today",
        pages: {
            home:   { hero: "Today's harvest, at your door.", sub: "Farm-sourced vegetables, dairy, and pantry staples — delivered within 2 hours." },
            second: { slug: "shop", file: "shop.html", title: "Shop", hero: "In season now", sub: "Hand-picked this morning." },
        },
        kind: "shop",
        products: [
            { name: "Alphonso Mangoes 1kg", meta: "Ratnagiri orchards", price: "₹ 449" },
            { name: "Farm Tomatoes 500g", meta: "Nashik · vine-ripened", price: "₹ 52" },
            { name: "A2 Cow Ghee 500ml", meta: "Grass-fed · cultured", price: "₹ 1,100" },
            { name: "Organic Spinach 250g", meta: "No pesticides", price: "₹ 38" },
            { name: "Sprouted Ragi Flour 1kg", meta: "Stone-ground", price: "₹ 220" },
            { name: "Ooty Carrots 1kg", meta: "Fresh from Nilgiris", price: "₹ 85" },
            { name: "Cold-press Sesame Oil 1L", meta: "Traditional ghani", price: "₹ 640" },
            { name: "Wild Honey 500g", meta: "From the Western Ghats", price: "₹ 520" },
        ],
        features: [
            { title: "Farm-direct", body: "Skip the warehouse. Your produce comes straight from local growers." },
            { title: "2-hour delivery", body: "Order by noon, cooking by dinner. Timed slots anywhere in the city." },
            { title: "Fresh guarantee", body: "Not happy with anything? Full refund, no questions asked." },
        ],
    },

    // ═════════════════════ EDUCATION ═════════════════════
    {
        category: "education",
        slug: "university-modern",
        brand: "Meridian University",
        mark: "M",
        palette: { bg: "#FFFFFF", text: "#0D3B66", muted: "#5B6D81", card: "#F7F9FC", border: "#E0E7EF", accent: "#0D3B66", accent2: "#F4D35E" },
        heroBadge: "Admissions open · Fall 2026",
        tagline: "A modern campus rooted in tradition",
        pages: {
            home:   { hero: "Where ideas meet rigor.", sub: "A 125-year-old research university with 40,000 students, 18 schools, and a campus designed for discovery." },
            second: { slug: "programs", file: "programs.html", title: "Programs", hero: "Undergraduate and graduate programs", sub: "From the arts to engineering — over 200 degrees." },
        },
        kind: "programs",
        stats: [
            { n: "40k+", l: "Students" },
            { n: "200+", l: "Degrees" },
            { n: "18",   l: "Schools" },
            { n: "125",  l: "Years" },
        ],
        programs: [
            { track: "Undergraduate", title: "B.Tech Computer Science", desc: "4-year program · AI, systems, theory specializations.", meta: "Duration: 4 years · 240 seats" },
            { track: "Undergraduate", title: "B.A. Economics", desc: "Quantitative econ with optional policy track.", meta: "Duration: 3 years · 120 seats" },
            { track: "Graduate", title: "M.S. Data Science", desc: "Thesis-based · industry residency.", meta: "Duration: 2 years · 60 seats" },
            { track: "Graduate", title: "MBA", desc: "Full-time · case-method curriculum.", meta: "Duration: 2 years · 180 seats" },
            { track: "Doctoral", title: "Ph.D. Computer Science", desc: "Research across 8 labs.", meta: "Duration: 5 years · 40 seats" },
            { track: "Professional", title: "Executive Education", desc: "Short courses for working leaders.", meta: "Duration: 4-12 weeks" },
        ],
        features: [
            { title: "World-class faculty", body: "200+ professors, including 12 Nobel laureates and 30 MacArthur Fellows." },
            { title: "Research-first", body: "$1.2B in annual research funding across medicine, AI, and climate science." },
            { title: "Global campus", body: "Exchange programs with 80 universities across 40 countries." },
        ],
    },
    {
        category: "education",
        slug: "skills-academy",
        brand: "Skillforge",
        mark: "S",
        palette: { bg: "#0E0724", text: "#F3EEFF", muted: "#A79CC9", card: "#1A0F3D", border: "#2D1E5C", accent: "#8B5CF6", accent2: "#EC4899" },
        heroBadge: "New cohort starts April 8",
        tagline: "Online courses for ambitious professionals",
        pages: {
            home:   { hero: "Level up, on your schedule.", sub: "Self-paced online courses taught by practitioners working at top companies." },
            second: { slug: "programs", file: "programs.html", title: "Courses", hero: "Browse courses", sub: "Engineering, product, design, and business." },
        },
        kind: "programs",
        stats: [
            { n: "50+",  l: "Courses" },
            { n: "20k+", l: "Learners" },
            { n: "4.8★", l: "Avg rating" },
            { n: "80",   l: "Instructors" },
        ],
        programs: [
            { track: "Engineering", title: "System Design Deep-Dive", desc: "Design scalable distributed systems. Staff+ level.", meta: "8 weeks · 12 hrs/wk · ₹ 24,900" },
            { track: "Engineering", title: "Production ML", desc: "MLOps, feature stores, drift, deployment.", meta: "6 weeks · 10 hrs/wk · ₹ 19,900" },
            { track: "Product", title: "Product Strategy Fundamentals", desc: "Positioning, pricing, growth loops.", meta: "5 weeks · 8 hrs/wk · ₹ 14,900" },
            { track: "Design", title: "Advanced Product Design", desc: "Complex-system UX, design research.", meta: "10 weeks · 10 hrs/wk · ₹ 22,900" },
            { track: "Business", title: "Founder Finance", desc: "Cap tables, fundraising, unit economics.", meta: "4 weeks · 6 hrs/wk · ₹ 9,900" },
            { track: "Data", title: "SQL for Analysts", desc: "Window functions, CTEs, query optimization.", meta: "3 weeks · 5 hrs/wk · Free" },
        ],
        features: [
            { title: "Learn from practitioners", body: "Every instructor is currently working at a top company in their field." },
            { title: "Project-based", body: "Build portfolio pieces — not watch passive video lectures." },
            { title: "Community", body: "Live weekly Q&A, peer review, and a Discord with 20k active members." },
        ],
    },
    {
        category: "education",
        slug: "kids-school",
        brand: "Little Learners",
        mark: "L",
        palette: { bg: "#FFF8E1", text: "#0B3954", muted: "#5A7A92", card: "#FFFFFF", border: "#FFE0A3", accent: "#118AB2", accent2: "#FFD166" },
        heroBadge: "Admissions open for 2026",
        tagline: "A school where curiosity comes first",
        pages: {
            home:   { hero: "A playful place to grow.", sub: "A K-6 school where kids build, experiment, and learn to love learning — every single day." },
            second: { slug: "programs", file: "programs.html", title: "Programs", hero: "Our programs", sub: "From preschool to grade 6, with enrichment tracks." },
        },
        kind: "programs",
        stats: [
            { n: "12:1", l: "Student-teacher ratio" },
            { n: "320",  l: "Students" },
            { n: "42",   l: "Teachers" },
            { n: "8",    l: "Acre campus" },
        ],
        programs: [
            { track: "Preschool", title: "Nursery & KG (Ages 3-5)", desc: "Play-based learning with a focus on curiosity and confidence.", meta: "Half-day & full-day options" },
            { track: "Primary", title: "Lower Primary (Grade 1-3)", desc: "Foundational literacy, numeracy, and social-emotional learning.", meta: "Full-day · 6 subjects" },
            { track: "Primary", title: "Upper Primary (Grade 4-6)", desc: "Project-based learning across sciences and the arts.", meta: "Full-day · 8 subjects" },
            { track: "Enrichment", title: "Music & Movement", desc: "Weekly music lessons and dance for all grades.", meta: "Included in tuition" },
            { track: "Enrichment", title: "Coding Club", desc: "Beginner to intermediate — Scratch to Python.", meta: "Grades 3+ · 2x/week" },
            { track: "Enrichment", title: "Farm-to-Table Garden", desc: "Students grow and harvest food for school lunches.", meta: "Part of science curriculum" },
        ],
        features: [
            { title: "Small classes", body: "12:1 student-to-teacher ratio — real attention, real relationships." },
            { title: "Hands-on learning", body: "Maker-spaces, outdoor classrooms, and a farm-to-table garden." },
            { title: "Whole child", body: "Academic rigor paired with social-emotional learning and the arts." },
        ],
    },

    // ═════════════════════ LANDING PAGE ═════════════════════
    {
        category: "landing-page",
        slug: "app-launch",
        brand: "Orbit",
        mark: "O",
        palette: { bg: "#FFFFFF", text: "#111827", muted: "#6B7280", card: "#F9FAFB", border: "#E5E7EB", accent: "#007AFF", accent2: "#5856D6" },
        heroBadge: "iOS 17+ · Android 12+",
        tagline: "Your life, orbiting around what matters",
        pages: {
            home:   { hero: "One app. All your rituals.", sub: "Orbit is the mobile journal that quietly keeps track of your moods, habits, and moments worth remembering." },
            second: { slug: "about", file: "about.html", title: "About", hero: "We build the tools we wanted", sub: "A small team from Bangalore and Berlin, shipping one feature at a time." },
        },
        kind: "features",
        featureList: [
            { title: "Daily prompts", body: "Three quick questions to start your day. Takes under a minute." },
            { title: "Mood tracking", body: "Tag how you feel — we'll surface patterns over time." },
            { title: "Encrypted vault", body: "Your journal is encrypted on-device. Not even we can read it." },
            { title: "Cross-device sync", body: "iPhone → iPad → Mac, all in sync. Offline first." },
            { title: "Export anytime", body: "PDF or markdown. No lock-in, ever." },
            { title: "No ads, no algorithm", body: "Just a clean space. Pay once a month or don't." },
        ],
        ctaText: "Join the waitlist",
    },
    {
        category: "landing-page",
        slug: "agency-portfolio",
        brand: "Studio Brick",
        mark: "B",
        palette: { bg: "#FFFFFF", text: "#000000", muted: "#666666", card: "#FAFAFA", border: "#E0E0E0", accent: "#E63946", accent2: "#000000" },
        heroBadge: "Independent studio · Mumbai",
        tagline: "Brands. Identities. Loud work.",
        pages: {
            home:   { hero: "We make brands people feel.", sub: "A creative studio of 14 humans in Mumbai, building identities for ambitious businesses around the world." },
            second: { slug: "about", file: "about.html", title: "About", hero: "Our approach", sub: "Strategy first, then craft. Always in that order." },
        },
        kind: "casestudies",
        services: [
            { n: "01", title: "Strategy", body: "Brand positioning, naming, and tone of voice — the foundation everything else sits on." },
            { n: "02", title: "Identity", body: "Logo systems, type, and visual language that scales across every medium." },
            { n: "03", title: "Launch", body: "Campaigns, websites, and rollout playbooks to take your brand to market." },
        ],
        caseStudies: [
            { tag: "Identity · 2025", title: "Halwa & Co." },
            { tag: "Campaign · 2025", title: "Meridian Bank" },
            { tag: "Identity · 2024", title: "Northwind Tea" },
            { tag: "Brand · 2024", title: "Lumo Studios" },
            { tag: "Launch · 2023", title: "Harvest Market" },
            { tag: "Identity · 2023", title: "Atlas Coffee" },
        ],
        clients: ["NewDesk", "Harvest", "Meridian", "Lumo", "Northwind", "Halwa & Co.", "Atlas", "Pattikadai"],
    },
    {
        category: "landing-page",
        slug: "event-conference",
        brand: "Summit 2026",
        mark: "S",
        palette: { bg: "#1A0B2E", text: "#FAF6FF", muted: "#B09ED9", card: "#2B1855", border: "#3F2A6F", accent: "#E91E63", accent2: "#FF8A00" },
        heroBadge: "March 12–14, 2026 · Bangalore",
        tagline: "Three days. One city. The future of work.",
        pages: {
            home:   { hero: "The future of work, live.", sub: "60 speakers, 1,200 attendees, unlimited coffee. Bangalore, this March." },
            second: { slug: "about", file: "about.html", title: "Schedule", hero: "The schedule", sub: "Three days of talks, workshops, and hallway-track brilliance." },
        },
        kind: "event",
        speakers: [
            { name: "Asha Menon", role: "CTO, NewDesk", initial: "AM" },
            { name: "Karan Rai", role: "Founder, Orbit", initial: "KR" },
            { name: "Priya Shah", role: "Head of Design, Lumo", initial: "PS" },
            { name: "Rohan Kapoor", role: "Principal, Meridian", initial: "RK" },
            { name: "Sanya Verma", role: "VP Product, Atlas", initial: "SV" },
            { name: "Dev Krishnan", role: "Eng Lead, Harvest", initial: "DK" },
            { name: "Lakshmi Iyer", role: "Partner, Northwind", initial: "LI" },
            { name: "Aditya Rao", role: "Founder, Halwa", initial: "AR" },
        ],
        schedule: [
            { day: "Day 1", time: "09:30", title: "Opening keynote: The work ahead", who: "Asha Menon" },
            { day: "Day 1", time: "11:00", title: "Workshop: Scaling your first engineering team", who: "Karan Rai" },
            { day: "Day 1", time: "14:00", title: "Panel: Design in the age of AI", who: "Priya Shah + others" },
            { day: "Day 2", time: "09:30", title: "Keynote: Product in hard times", who: "Sanya Verma" },
            { day: "Day 2", time: "11:00", title: "Workshop: From zero to product-market fit", who: "Aditya Rao" },
            { day: "Day 3", time: "10:00", title: "Closing: The next five years", who: "Rohan Kapoor" },
        ],
        sponsors: ["NewDesk", "Orbit", "Meridian", "Lumo", "Harvest", "Atlas"],
    },
    {
        category: "landing-page",
        slug: "consultancy",
        brand: "Northwind",
        mark: "N",
        palette: { bg: "#F8FAFA", text: "#0F2A3D", muted: "#5B7085", card: "#FFFFFF", border: "#D9E2E8", accent: "#0F766E", accent2: "#0891B2" },
        heroBadge: "Series B–D · Operator advisory",
        tagline: "Advisory for operators scaling past 100",
        pages: {
            home:   { hero: "Advisory that ships.", sub: "We work with Series B–D founders to solve the operational problems that show up when companies cross 100 people." },
            second: { slug: "about", file: "about.html", title: "About", hero: "How we engage", sub: "Deep 12-week engagements. Fixed scope, fixed price." },
        },
        kind: "services",
        serviceList: [
            { n: "01", title: "Diagnose", body: "Two weeks mapping current state — interviews, data pulls, process audits." },
            { n: "02", title: "Design", body: "A concrete operating model with RACI, OKRs, and the cadence your team needs." },
            { n: "03", title: "Deliver", body: "We stay on board through rollout, so change actually happens." },
            { n: "04", title: "Handover", body: "Documented playbooks and trained in-house leaders before we walk away." },
        ],
        stats: [
            { n: "24", l: "Engagements" },
            { n: "12 wk", l: "Avg duration" },
            { n: "NPS 72", l: "Client satisfaction" },
        ],
        clients: ["Meridian", "Lumo", "Harvest", "Atlas Coffee", "NewDesk", "Orbit"],
    },

    // ═════════════════════ DYNAMIC ═════════════════════
    {
        category: "dynamic",
        slug: "portfolio-designer",
        brand: "Maya Iyer",
        mark: "M",
        palette: { bg: "#FFFFFF", text: "#111111", muted: "#666666", card: "#F5F5F5", border: "#E0E0E0", accent: "#FF5A1F", accent2: "#000000" },
        heroBadge: "Open for freelance Q2 2026",
        tagline: "Designer. Illustrator. Curious human.",
        pages: {
            home:   { hero: "I design products people actually use.", sub: "Ten years of product design across fintech, healthtech, and the occasional side project. Currently at a Series C company, open to freelance." },
            second: { slug: "about", file: "about.html", title: "About", hero: "About me", sub: "Designer by trade, illustrator by hobby, reader by obsession." },
        },
        kind: "projects",
        projects: [
            { tag: "Product design · 2025", title: "Orbit — Journal app" },
            { tag: "Illustration · 2025", title: "Annual report cover" },
            { tag: "Product design · 2024", title: "Meridian redesign" },
            { tag: "Branding · 2024", title: "Halwa visual system" },
            { tag: "Editorial · 2023", title: "Zine: The slow web" },
            { tag: "Product design · 2023", title: "Atlas checkout" },
        ],
        writing: [
            { cat: "Essay", title: "Why I still sketch in pencil", date: "Feb 2026" },
            { cat: "Tutorial", title: "Designing for low-bandwidth audiences", date: "Jan 2026" },
            { cat: "Essay", title: "The case for slower tools", date: "Dec 2025" },
        ],
    },
    {
        category: "dynamic",
        slug: "news-magazine",
        brand: "The Signal",
        mark: "T",
        palette: { bg: "#F5EFDC", text: "#1C1C1C", muted: "#5C5C5C", card: "#FFFFFF", border: "#D8CFBB", accent: "#B91C1C", accent2: "#1C1C1C" },
        heroBadge: "Daily digest · reader-funded",
        tagline: "News that respects your time",
        pages: {
            home:   { hero: "Ten stories you needed today.", sub: "A morning digest of world news, markets, and culture — written by humans, edited by humans, read in 7 minutes." },
            second: { slug: "about", file: "about.html", title: "About", hero: "Our approach", sub: "Slow news, honest sourcing, no clickbait." },
        },
        kind: "stories",
        stories: [
            { cat: "Markets", title: "The quiet collapse of the mid-market VC", desc: "Funds under $500M are shutting down at record pace. Here's what's changed.", date: "8 min read" },
            { cat: "Tech", title: "Why every startup now builds on the edge", desc: "Cloudflare's developer platform crossed a threshold this quarter. Engineers explain the shift.", date: "12 min read" },
            { cat: "Politics", title: "A new template for state-level climate policy", desc: "Kerala's draft bill reads like nothing else. Inside the committee that wrote it.", date: "15 min read" },
            { cat: "Business", title: "India's long-tail D2C is growing up", desc: "What 40 small founders say about the year of margins over growth.", date: "10 min read" },
            { cat: "Culture", title: "The podcast bubble finally popped. What's next?", desc: "Audio creators are leaving Spotify. Five of them explain why.", date: "9 min read" },
            { cat: "Markets", title: "Why chip stocks are rising again", desc: "The second wave of AI demand looks different from the first.", date: "7 min read" },
        ],
    },
    {
        category: "dynamic",
        slug: "community-forum",
        brand: "Commons",
        mark: "C",
        palette: { bg: "#FFFFFF", text: "#0F172A", muted: "#64748B", card: "#F8FAFC", border: "#E2E8F0", accent: "#2563EB", accent2: "#7C3AED" },
        heroBadge: "Invite-only · 3,400 members",
        tagline: "A community for builders and thinkers",
        pages: {
            home:   { hero: "Build. Share. Learn.", sub: "A private community of 3,400 practitioners across product, engineering, and design — swapping notes on the hard parts of building." },
            second: { slug: "about", file: "about.html", title: "About", hero: "About the community", sub: "Who we are and what we're about." },
        },
        kind: "community",
        stats: [
            { n: "3,400",  l: "Members" },
            { n: "42",     l: "Countries" },
            { n: "120+",   l: "Live events/yr" },
            { n: "4.9★",   l: "Member NPS" },
        ],
        events: [
            { day: "Tue",  time: "Apr 8 · 18:00 IST", title: "Office hours: scaling your first engineering team", who: "with Karan R." },
            { day: "Thu",  time: "Apr 10 · 20:00 IST", title: "AMA: Design systems for small teams", who: "with Priya S." },
            { day: "Sat",  time: "Apr 12 · 11:00 IST", title: "Code review: shipping a side project", who: "with the community" },
            { day: "Tue",  time: "Apr 15 · 18:00 IST", title: "Monthly book club: Staff Engineer", who: "with 40+ members" },
        ],
        features: [
            { title: "Daily discussions", body: "Active threads on product strategy, engineering, and go-to-market — moderated by practitioners." },
            { title: "Weekly events", body: "Live office hours, code reviews, and AMAs with leaders in our community." },
            { title: "A tight community", body: "Applications are reviewed. The bar is high, but so is the signal." },
        ],
    },
    {
        category: "dynamic",
        slug: "podcast-show",
        brand: "Static",
        mark: "S",
        palette: { bg: "#14121F", text: "#F1E8FF", muted: "#9C8FBF", card: "#221E33", border: "#332B4D", accent: "#FF6B9D", accent2: "#C77DFF" },
        heroBadge: "Weekly · season 4",
        tagline: "Conversations worth hearing",
        pages: {
            home:   { hero: "Long conversations with interesting people.", sub: "A weekly podcast about craft, creativity, and the slow work of doing something well. Hosted by Kiran R. · New episodes every Tuesday." },
            second: { slug: "about", file: "about.html", title: "Episodes", hero: "All episodes", sub: "Season 4 drops every Tuesday at 6am IST." },
        },
        kind: "episodes",
        episodes: [
            { num: "47", title: "The slow web, and the software it asks for", desc: "with Maya Iyer", date: "Apr 1, 2026" },
            { num: "46", title: "Why shipping is a design skill", desc: "with Asha Menon", date: "Mar 25, 2026" },
            { num: "45", title: "The creative cost of scaling", desc: "with Karan Rai", date: "Mar 18, 2026" },
            { num: "44", title: "Craft in a hurry", desc: "with Priya Shah", date: "Mar 11, 2026" },
            { num: "43", title: "What independent work teaches you", desc: "with Lakshmi Iyer", date: "Mar 4, 2026" },
            { num: "42", title: "Building in the open", desc: "with Dev Krishnan", date: "Feb 25, 2026" },
        ],
    },
];

// ── Shared .htaccess ───────────────────────────────────────────
const HTACCESS = `# Smartseyali — clean URLs + basic caching
Options -MultiViews
RewriteEngine On
RewriteBase /

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\\.html -f
RewriteRule ^(.*)$ $1.html [L]

<FilesMatch "\\.(css|js|woff2|svg|png|jpg|jpeg|webp|gif|ico)$">
  Header set Cache-Control "public, max-age=2592000"
</FilesMatch>

Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "strict-origin-when-cross-origin"

ErrorDocument 404 /404.html
`;

// ── CSS ────────────────────────────────────────────────────────
function renderCss(p) {
    return `/* Smartseyali — ${p.slug} (${p.category}) */
:root{
  --bg:${p.palette.bg};--text:${p.palette.text};--muted:${p.palette.muted};
  --card:${p.palette.card};--border:${p.palette.border};
  --accent:${p.palette.accent};--accent-2:${p.palette.accent2};
  --radius:12px;--radius-sm:8px;
}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--text);line-height:1.55;-webkit-font-smoothing:antialiased;letter-spacing:-.005em}
a{color:var(--accent);text-decoration:none}a:hover{opacity:.85}
img{max-width:100%;display:block}
.container{max-width:1120px;margin:0 auto;padding:0 1.25rem}
header{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 88%, transparent);backdrop-filter:saturate(180%) blur(10px);border-bottom:1px solid var(--border)}
.nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 0;gap:1rem}
.brand{display:flex;align-items:center;gap:.6rem;font-weight:700;color:var(--text)}
.brand .mark{width:32px;height:32px;border-radius:10px;background:var(--accent);color:var(--bg);display:grid;place-items:center;font-weight:800;font-size:1rem}
.nav ul{list-style:none;display:flex;gap:1.5rem;margin:0;padding:0}
.nav a{color:var(--muted);font-weight:500;font-size:.92rem}.nav a:hover{color:var(--text);opacity:1}
.cta{display:inline-flex;align-items:center;gap:.4rem;padding:.7rem 1.25rem;border-radius:var(--radius-sm);background:var(--accent);color:var(--bg);font-weight:600;font-size:.9rem;border:0;cursor:pointer;transition:.15s;text-decoration:none}
.cta:hover{background:var(--accent-2);color:var(--bg);opacity:1}
.cta-outline{display:inline-flex;align-items:center;padding:.7rem 1.25rem;border-radius:var(--radius-sm);color:var(--text);border:1px solid var(--border);font-weight:500;font-size:.9rem;text-decoration:none;background:transparent}
.cta-outline:hover{background:var(--card)}
.hero{padding:5rem 0 4rem}
.hero h1{font-size:clamp(2rem,5vw,3.75rem);line-height:1.1;letter-spacing:-.025em;margin:.8rem 0 1rem;color:var(--text);font-weight:700}
.hero p{font-size:1.125rem;color:var(--muted);max-width:680px;margin:0 0 2rem}
.hero-actions{display:flex;gap:.75rem;flex-wrap:wrap}
.grid{display:grid;gap:1.25rem}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.grid-4{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem}
.card h3{margin:0 0 .5rem;font-size:1.1rem;color:var(--text);letter-spacing:-.01em}
.card p{margin:0;color:var(--muted);font-size:.95rem}
.section{padding:4.5rem 0;border-top:1px solid var(--border)}
.section-head{text-align:center;margin-bottom:2.75rem}
.section-head h2{font-size:2.125rem;letter-spacing:-.02em;margin:0 0 .5rem;color:var(--text);font-weight:700}
.section-head p{color:var(--muted);margin:0;max-width:560px;margin-inline:auto}
footer{border-top:1px solid var(--border);padding:2.5rem 0 3rem;color:var(--muted);font-size:.9rem;text-align:center}
footer a{color:var(--muted)}footer a:hover{color:var(--text)}
.form{display:grid;gap:.75rem;max-width:480px;margin:0 auto}
.form input,.form textarea,.form select{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:.85rem 1rem;color:var(--text);font-family:inherit;font-size:.95rem}
.form input:focus,.form textarea:focus,.form select:focus{outline:0;border-color:var(--accent)}
.badge{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .75rem;border-radius:999px;font-size:.72rem;font-weight:600;letter-spacing:.03em;text-transform:uppercase;background:color-mix(in srgb,var(--accent) 15%,transparent);color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 25%,transparent)}
.badge-alt{background:color-mix(in srgb,var(--accent-2) 15%,transparent);color:var(--accent-2);border-color:color-mix(in srgb,var(--accent-2) 25%,transparent)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1.25rem;margin:0 0 2rem;padding:1.75rem;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)}
.stat{text-align:center}
.stat .n{font-size:1.85rem;font-weight:700;color:var(--accent);letter-spacing:-.02em;line-height:1}
.stat .l{font-size:.8rem;color:var(--muted);margin-top:.35rem}
.product-grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.product{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column;transition:.2s}
.product:hover{transform:translateY(-2px);box-shadow:0 8px 24px color-mix(in srgb,var(--text) 8%,transparent)}
.product .img{aspect-ratio:4/5;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 25%,var(--card)),color-mix(in srgb,var(--accent-2) 25%,var(--card)));display:grid;place-items:center;color:var(--text);opacity:.85;font-weight:800;font-size:2.5rem}
.product .body{padding:.9rem 1rem 1rem;display:flex;flex-direction:column;gap:.35rem;flex:1}
.product h4{margin:0;font-size:.95rem;color:var(--text);letter-spacing:-.01em}
.product .desc{margin:0;font-size:.8rem;color:var(--muted)}
.product .price{font-weight:700;color:var(--text);margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:.5rem}
.product .price .buy{padding:.35rem .8rem;border-radius:6px;font-size:.72rem;background:var(--accent);color:var(--bg);border:0;cursor:pointer;font-weight:600}
.filters{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem}
.filter{padding:.4rem .9rem;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--muted);font-size:.78rem;cursor:pointer;text-decoration:none}
.filter.active,.filter:hover{background:var(--accent);color:var(--bg);border-color:var(--accent)}
.program-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem;display:flex;flex-direction:column;gap:.75rem;transition:.2s}
.program-card:hover{transform:translateY(-2px);border-color:var(--accent)}
.program-card .meta-top{display:flex;gap:.5rem;flex-wrap:wrap;font-size:.7rem;color:var(--accent);text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.program-card h4{margin:0;font-size:1.15rem;letter-spacing:-.01em}
.program-card p{margin:0;color:var(--muted);font-size:.92rem;flex:1;line-height:1.5}
.program-card .foot{display:flex;justify-content:space-between;align-items:center;padding-top:.75rem;border-top:1px solid var(--border);font-size:.85rem;color:var(--muted)}
.speaker{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem 1.25rem;text-align:center}
.speaker .avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));margin:0 auto .75rem;display:grid;place-items:center;color:var(--bg);font-size:1.3rem;font-weight:800}
.speaker h4{margin:0;font-size:.98rem}
.speaker .role{font-size:.78rem;color:var(--muted);margin-top:.25rem}
.episode{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem 1.25rem;display:flex;gap:1rem;align-items:center;margin-bottom:.75rem;transition:.2s}
.episode:hover{border-color:var(--accent)}
.episode .num{width:46px;height:46px;border-radius:50%;background:var(--accent);color:var(--bg);display:grid;place-items:center;font-weight:800;flex-shrink:0;font-size:1rem}
.episode .body{flex:1;min-width:0}
.episode h4{margin:0;font-size:.98rem;letter-spacing:-.005em}
.episode p{margin:.2rem 0 0;font-size:.8rem;color:var(--muted)}
.episode time{font-size:.72rem;color:var(--muted);white-space:nowrap}
.schedule-row{display:grid;grid-template-columns:130px 1fr auto;gap:1rem;padding:1.1rem 1.25rem;border-left:3px solid var(--accent);background:var(--card);border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:.5rem;align-items:center}
.schedule-row .time{font-weight:700;color:var(--accent);font-size:.85rem}
.schedule-row .time small{display:block;color:var(--muted);font-weight:500;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em}
.schedule-row h4{margin:0;font-size:1rem;letter-spacing:-.005em}
.schedule-row .meta{font-size:.78rem;color:var(--muted);margin-top:.15rem}
.story-card{border-bottom:1px solid var(--border);padding:1.5rem 0;display:grid;grid-template-columns:1fr auto;gap:1.5rem;align-items:start}
.story-card:last-child{border-bottom:0}
.story-card .cat{font-size:.72rem;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;font-weight:700}
.story-card h4{margin:.4rem 0 .5rem;font-size:1.2rem;letter-spacing:-.015em;line-height:1.3}
.story-card p{margin:0;color:var(--muted);font-size:.92rem;line-height:1.55}
.story-card time{font-size:.75rem;color:var(--muted);white-space:nowrap;padding-top:2rem}
.project-tile{aspect-ratio:4/3;background:linear-gradient(135deg,var(--accent),var(--accent-2));border-radius:var(--radius);padding:1.5rem;display:flex;flex-direction:column;justify-content:flex-end;color:var(--bg);cursor:pointer;transition:.2s;text-decoration:none;overflow:hidden;position:relative}
.project-tile:hover{transform:translateY(-2px);box-shadow:0 12px 28px color-mix(in srgb,var(--accent) 30%,transparent)}
.project-tile h4{margin:0;font-size:1.15rem;color:inherit;letter-spacing:-.01em}
.project-tile .tag{font-size:.7rem;opacity:.85;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem;font-weight:600}
.sponsor-row{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;margin-top:1.5rem}
.sponsor-row div{padding:.75rem 1.5rem;border:1px dashed var(--border);border-radius:var(--radius-sm);font-weight:700;color:var(--muted);font-size:.9rem;letter-spacing:.02em}
.newsletter{max-width:500px;margin:0 auto;display:flex;gap:.5rem}
.newsletter input{flex:1;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:.85rem 1rem;color:var(--text);font-size:.9rem}
.newsletter button{padding:.85rem 1.5rem;background:var(--accent);color:var(--bg);border:0;border-radius:var(--radius-sm);font-weight:600;cursor:pointer}
.subscribe-row{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-top:1.25rem}
.subscribe-row a{padding:.55rem 1rem;border:1px solid var(--border);border-radius:999px;font-size:.82rem;color:var(--muted);text-decoration:none;background:var(--card)}
.subscribe-row a:hover{border-color:var(--accent);color:var(--accent)}
.service-row{display:grid;grid-template-columns:auto 1fr auto;gap:1.25rem;padding:1.5rem 0;border-bottom:1px solid var(--border);align-items:center}
.service-row:last-child{border-bottom:0}
.service-row .n{font-weight:700;color:var(--accent);font-size:.85rem;letter-spacing:.05em;padding:.35rem .6rem;background:color-mix(in srgb,var(--accent) 10%,transparent);border-radius:6px}
.service-row h4{margin:0 0 .25rem;font-size:1.1rem;letter-spacing:-.005em}
.service-row p{margin:0;color:var(--muted);font-size:.9rem;line-height:1.5}
.phone-mockup{width:260px;height:520px;background:linear-gradient(180deg,var(--accent),var(--accent-2));border-radius:36px;padding:12px;box-shadow:0 20px 60px color-mix(in srgb,var(--accent) 25%,transparent);margin:2rem auto}
.phone-mockup .screen{width:100%;height:100%;background:var(--card);border-radius:26px;padding:2rem 1.5rem;display:flex;flex-direction:column;gap:1rem}
.phone-mockup .screen .bar{width:40%;height:4px;background:var(--accent);border-radius:2px;margin:0 auto}
.phone-mockup .screen h5{margin:0;font-size:.95rem;color:var(--text)}
.phone-mockup .screen .line{height:8px;background:var(--border);border-radius:4px}
.event-row{display:grid;grid-template-columns:auto 1fr;gap:1.25rem;padding:1.1rem 1.25rem;border-bottom:1px solid var(--border);align-items:center}
.event-row:last-child{border:0}
.event-row .pill{padding:.4rem .75rem;border-radius:10px;background:color-mix(in srgb,var(--accent) 15%,transparent);color:var(--accent);font-weight:700;font-size:.8rem;text-align:center;min-width:60px}
.event-row .meta{font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.event-row h4{margin:.15rem 0;font-size:.98rem}
.event-row .who{font-size:.85rem;color:var(--muted)}
.two-col{display:grid;grid-template-columns:1.2fr 1fr;gap:3rem;align-items:center}
@media(max-width:768px){.hero{padding:3rem 0 2rem}.section{padding:2.75rem 0}.nav ul{display:none}.product-grid{grid-template-columns:repeat(2,1fr);gap:.75rem}.schedule-row{grid-template-columns:1fr}.story-card{grid-template-columns:1fr}.service-row{grid-template-columns:1fr}.two-col{grid-template-columns:1fr}.phone-mockup{width:220px;height:440px}}
`;
}

// ── Config ─────────────────────────────────────────────────────
function renderConfig(p) {
    return `/**
 * ${p.brand} — Runtime-configurable Smartseyali template (${p.slug}).
 * Reads config from URL query params, falls back to DEFAULTS standalone.
 */
(function () {
  const qs = new URLSearchParams(window.location.search);
  const qsCompanyId   = qs.get('company_id');
  const qsSupabaseUrl = qs.get('supabase_url');
  const qsAnonKey     = qs.get('anon_key');
  let qsOverrides = {};
  try { const raw = qs.get('overrides'); if (raw) qsOverrides = JSON.parse(decodeURIComponent(raw)); } catch (_) {}

  const DEFAULTS = {
    supabaseUrl: 'https://supabase.smartseyali.tech',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MjAwNTc2LCJleHAiOjIwOTA1NjA1NzZ9.AdbwGkMtZ-aOXM4wlIQ_ZzRTFsJV3i_bIGoTvGb_iDo',
    companyId: 0,
    storeName: ${JSON.stringify(p.brand)},
    storeTagline: ${JSON.stringify(p.tagline)},
  };

  const STORE_CONFIG = Object.assign({}, DEFAULTS, qsOverrides);
  if (qsSupabaseUrl) STORE_CONFIG.supabaseUrl = qsSupabaseUrl;
  if (qsAnonKey)     STORE_CONFIG.supabaseAnonKey = qsAnonKey;
  if (qsCompanyId)   STORE_CONFIG.companyId = Number(qsCompanyId) || qsCompanyId;
  window.STORE_CONFIG = STORE_CONFIG;
})();
`;
}

// ── Nav helpers ────────────────────────────────────────────────
function navPages(p) {
    return [p.pages.second, { slug: "contact", file: "contact.html", title: "Contact" }];
}

function navLinks(p, currentSlug) {
    return navPages(p)
        .filter((page) => page.slug !== currentSlug)
        .map((page) => `<li><a href="${page.file}">${page.title}</a></li>`)
        .join("\n      ");
}

// ── Category-specific section builders ─────────────────────────
function productsSection(p, limit) {
    const items = (p.products || []).slice(0, limit || 8);
    const cards = items.map((it, i) =>
        `<div class="product"><div class="img">${String.fromCharCode(9312 + i)}</div><div class="body"><h4>${it.name}</h4><p class="desc">${it.meta}</p><div class="price">${it.price} <button class="buy">Add</button></div></div></div>`
    ).join("\n        ");
    return `<div class="product-grid">\n        ${cards}\n      </div>`;
}

function programsSection(p, limit) {
    const items = (p.programs || []).slice(0, limit || 6);
    return items.map((it) =>
        `<div class="program-card"><div class="meta-top"><span>${it.track}</span></div><h4>${it.title}</h4><p>${it.desc}</p><div class="foot"><span>${it.meta}</span><a href="contact.html" style="color:var(--accent);font-weight:600">Apply →</a></div></div>`
    ).join("\n        ");
}

function statsSection(p) {
    if (!p.stats) return "";
    const items = p.stats.map((s) => `<div class="stat"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join("");
    return `<div class="stats">${items}</div>`;
}

function speakersSection(p) {
    if (!p.speakers) return "";
    return p.speakers.map((s) =>
        `<div class="speaker"><div class="avatar">${s.initial}</div><h4>${s.name}</h4><div class="role">${s.role}</div></div>`
    ).join("\n        ");
}

function scheduleSection(p) {
    if (!p.schedule) return "";
    return p.schedule.map((s) =>
        `<div class="schedule-row"><div class="time">${s.time}<small>${s.day}</small></div><div><h4>${s.title}</h4><div class="meta">${s.who}</div></div><a class="cta-outline" href="#">RSVP</a></div>`
    ).join("\n      ");
}

function projectsSection(p) {
    if (!p.projects) return "";
    return p.projects.map((pr) =>
        `<a class="project-tile" href="#"><div class="tag">${pr.tag}</div><h4>${pr.title}</h4></a>`
    ).join("\n        ");
}

function storiesSection(p) {
    if (!p.stories) return "";
    return p.stories.map((s) =>
        `<div class="story-card"><div><div class="cat">${s.cat}</div><h4>${s.title}</h4><p>${s.desc}</p></div><time>${s.date}</time></div>`
    ).join("\n      ");
}

function episodesSection(p) {
    if (!p.episodes) return "";
    return p.episodes.map((e) =>
        `<div class="episode"><div class="num">${e.num}</div><div class="body"><h4>${e.title}</h4><p>${e.desc}</p></div><time>${e.date}</time></div>`
    ).join("\n      ");
}

function eventsSection(p) {
    if (!p.events) return "";
    return p.events.map((e) =>
        `<div class="event-row"><div class="pill">${e.day}</div><div><div class="meta">${e.time}</div><h4>${e.title}</h4><div class="who">${e.who}</div></div></div>`
    ).join("\n      ");
}

function caseStudiesSection(p) {
    if (!p.caseStudies) return "";
    return p.caseStudies.map((c) =>
        `<a class="project-tile" href="#"><div class="tag">${c.tag}</div><h4>${c.title}</h4></a>`
    ).join("\n        ");
}

function serviceRows(list) {
    return list.map((s) =>
        `<div class="service-row"><div class="n">${s.n}</div><div><h4>${s.title}</h4><p>${s.body}</p></div><a class="cta-outline" href="contact.html">Learn more</a></div>`
    ).join("\n      ");
}

function featuresGrid(list) {
    return list.map((f) => `<div class="card"><h3>${f.title}</h3><p>${f.body}</p></div>`).join("\n          ");
}

function sponsorsRow(names) {
    return `<div class="sponsor-row">${names.map((n) => `<div>${n}</div>`).join("")}</div>`;
}

function phoneMockup() {
    return `<div class="phone-mockup"><div class="screen"><div class="bar"></div><h5 style="text-align:center">Today's check-in</h5><div class="line"></div><div class="line" style="width:80%"></div><div class="line" style="width:60%"></div><div style="margin-top:auto;text-align:center;color:var(--accent);font-weight:700;font-size:.85rem">Continue →</div></div></div>`;
}

// ── Page renderers ─────────────────────────────────────────────
function topBar(p, currentSlug) {
    return `<header>
  <div class="container nav">
    <a href="index.html" class="brand"><span class="mark">${p.mark}</span><span data-content="brand_name">${p.brand}</span></a>
    <ul>
      ${navLinks(p, currentSlug)}
    </ul>
    <a href="contact.html" class="cta">${p.ctaText || "Get started"}</a>
  </div>
</header>`;
}

function siteFoot(p) {
    return `<footer><div class="container">&copy; <span id="yr"></span> <span data-content="brand_name">${p.brand}</span> · All rights reserved.</div></footer>
<script>document.getElementById('yr').textContent = new Date().getFullYear();</script>
<script src="assets/js/config.js"></script>
<script src="assets/js/content-loader.js"></script>
</body>
</html>`;
}

function renderIndex(p) {
    const hero = p.pages.home;
    const feats = featuresGrid(p.features || []);

    let body = "";
    if (p.kind === "shop") {
        body = `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>${p.slug === "grocery-market" ? "In season now" : "Featured"}</h2><p>Hand-picked selection.</p></div>
      ${productsSection(p, 4)}
      <div style="text-align:center;margin-top:2rem"><a class="cta-outline" href="${p.pages.second.file}">View full catalog →</a></div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Our philosophy</h2></div>
      <div class="grid grid-3">
          ${feats}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Stay in the loop</h2><p>Drops, stories, and occasional notes from the team.</p></div>
      <form class="newsletter" onsubmit="event.preventDefault();alert('Thanks for subscribing!');this.reset();">
        <input type="email" placeholder="your@email.com" required /><button type="submit">Subscribe</button>
      </form>
    </div>
  </section>`;
    } else if (p.kind === "programs") {
        body = `
  <section class="container"><div style="padding-top:1rem">${statsSection(p)}</div></section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Featured programs</h2><p>A taste of what we offer. Browse the full catalog on the Programs page.</p></div>
      <div class="grid grid-2">
        ${programsSection(p, 3)}
      </div>
      <div style="text-align:center;margin-top:2rem"><a class="cta-outline" href="${p.pages.second.file}">Browse all programs →</a></div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Why families choose us</h2></div>
      <div class="grid grid-3">
          ${feats}
      </div>
    </div>
  </section>`;
    } else if (p.kind === "features") {
        body = `
  <section class="section">
    <div class="container two-col">
      <div>
        <h2 style="font-size:2rem;letter-spacing:-.02em;margin:0 0 1rem">Everything you need, nothing you don't.</h2>
        <p style="color:var(--muted);margin:0 0 1.5rem;font-size:1rem">A small, thoughtful feature set. No endless settings, no feature bloat.</p>
        <div class="subscribe-row" style="justify-content:flex-start;margin:0">
          <a href="#">📱 App Store</a><a href="#">🤖 Google Play</a>
        </div>
      </div>
      ${phoneMockup()}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Features</h2><p>Thoughtful details, every one.</p></div>
      <div class="grid grid-3">
        ${featuresGrid(p.featureList || [])}
      </div>
    </div>
  </section>`;
    } else if (p.kind === "casestudies") {
        body = `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Selected work</h2><p>A few recent projects from the studio.</p></div>
      <div class="grid grid-3">
        ${caseStudiesSection(p)}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>What we do</h2></div>
      ${serviceRows(p.services || [])}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Clients we've worked with</h2></div>
      ${sponsorsRow(p.clients || [])}
    </div>
  </section>`;
    } else if (p.kind === "event") {
        body = `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Speakers</h2><p>60 operators, designers, and researchers on one stage.</p></div>
      <div class="grid grid-4">
        ${speakersSection(p)}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Preview the schedule</h2><p>Three days of talks, workshops, and the hallway track.</p></div>
      ${scheduleSection(p).split("\n").slice(0, 9).join("\n")}
      <div style="text-align:center;margin-top:2rem"><a class="cta-outline" href="${p.pages.second.file}">Full schedule →</a></div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Sponsors</h2></div>
      ${sponsorsRow(p.sponsors || [])}
    </div>
  </section>`;
    } else if (p.kind === "services") {
        body = `
  <section class="container"><div style="padding-top:1rem">${statsSection(p)}</div></section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>How we work</h2><p>A four-phase engagement, scoped up front.</p></div>
      ${serviceRows(p.serviceList || [])}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Clients</h2></div>
      ${sponsorsRow(p.clients || [])}
    </div>
  </section>`;
    } else if (p.kind === "projects") {
        body = `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Selected projects</h2></div>
      <div class="grid grid-3">
        ${projectsSection(p)}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Writing</h2><p>Occasional essays and tutorials.</p></div>
      ${(p.writing || []).map((w) => `<div class="story-card"><div><div class="cat">${w.cat}</div><h4>${w.title}</h4></div><time>${w.date}</time></div>`).join("\n      ")}
    </div>
  </section>`;
    } else if (p.kind === "stories") {
        body = `
  <section class="section">
    <div class="container">
      <div class="section-head" style="text-align:left;max-width:none"><h2>Today's digest</h2><p>Ten stories, seven minutes. Click any one to read.</p></div>
      <div class="filters">
        <a class="filter active" href="#">All</a>
        <a class="filter" href="#">Markets</a>
        <a class="filter" href="#">Tech</a>
        <a class="filter" href="#">Politics</a>
        <a class="filter" href="#">Business</a>
        <a class="filter" href="#">Culture</a>
      </div>
      ${storiesSection(p)}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Get the daily digest</h2><p>One email, every morning. Free. Unsubscribe any time.</p></div>
      <form class="newsletter" onsubmit="event.preventDefault();alert('Subscribed!');this.reset();">
        <input type="email" placeholder="your@email.com" required /><button type="submit">Subscribe</button>
      </form>
    </div>
  </section>`;
    } else if (p.kind === "community") {
        body = `
  <section class="container"><div style="padding-top:1rem">${statsSection(p)}</div></section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>This week's events</h2><p>Live sessions for members only.</p></div>
      ${eventsSection(p)}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Why Commons</h2></div>
      <div class="grid grid-3">
          ${feats}
      </div>
    </div>
  </section>`;
    } else if (p.kind === "episodes") {
        body = `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Latest episodes</h2><p>New drops every Tuesday at 6am IST.</p></div>
      ${episodesSection(p).split("\n").slice(0, 16).join("\n")}
      <div style="text-align:center;margin-top:2rem"><a class="cta-outline" href="${p.pages.second.file}">Browse all episodes →</a></div>
    </div>
  </section>
  <section class="section">
    <div class="container" style="text-align:center">
      <div class="section-head"><h2>Subscribe</h2><p>Wherever you get podcasts.</p></div>
      <div class="subscribe-row">
        <a href="#">Apple Podcasts</a>
        <a href="#">Spotify</a>
        <a href="#">Overcast</a>
        <a href="#">Pocket Casts</a>
        <a href="#">RSS</a>
      </div>
    </div>
  </section>`;
    }

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title data-content="title">${p.brand} — ${p.tagline}</title>
<meta name="description" content="${p.tagline}" />
<link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
${topBar(p, "home")}
<main>
  <section class="container hero">
    ${p.heroBadge ? `<span class="badge">${p.heroBadge}</span>` : ""}
    <h1 data-content="hero_title">${hero.hero}</h1>
    <p data-content="hero_subtitle">${hero.sub}</p>
    <div class="hero-actions">
      <a class="cta" href="${p.pages.second.file}">${p.ctaText || "Learn more"}</a>
      <a class="cta-outline" href="contact.html">Contact us</a>
    </div>
  </section>
  ${body}
</main>
${siteFoot(p)}`;
}

function renderSecondary(p) {
    const page = p.pages.second;
    let body = "";

    if (p.kind === "shop") {
        body = `
  <section class="section">
    <div class="container">
      <div class="filters">
        <a class="filter active" href="#">All</a><a class="filter" href="#">New</a><a class="filter" href="#">Bestsellers</a><a class="filter" href="#">Sale</a>
      </div>
      ${productsSection(p, 8)}
    </div>
  </section>`;
    } else if (p.kind === "programs") {
        body = `
  <section class="section">
    <div class="container">
      <div class="filters">
        <a class="filter active" href="#">All tracks</a>
        ${Array.from(new Set(p.programs.map((pr) => pr.track))).map((t) => `<a class="filter" href="#">${t}</a>`).join("")}
      </div>
      <div class="grid grid-2">
        ${programsSection(p, 20)}
      </div>
    </div>
  </section>`;
    } else if (p.kind === "event") {
        body = `
  <section class="section">
    <div class="container">
      <div class="filters">
        <a class="filter active" href="#">All days</a>
        ${Array.from(new Set(p.schedule.map((s) => s.day))).map((d) => `<a class="filter" href="#">${d}</a>`).join("")}
      </div>
      ${scheduleSection(p)}
    </div>
  </section>`;
    } else if (p.kind === "episodes") {
        body = `
  <section class="section">
    <div class="container">
      <div class="filters">
        <a class="filter active" href="#">All</a><a class="filter" href="#">Season 4</a><a class="filter" href="#">Season 3</a>
      </div>
      ${episodesSection(p)}
    </div>
  </section>`;
    } else {
        // about / features / services / projects / stories / community / casestudies
        body = `
  <section class="section">
    <div class="container">
      <div class="grid grid-3">
        ${featuresGrid(p.features || p.featureList || p.services || p.serviceList || [
            { title: "Section one", body: "Edit this from Smartseyali admin → Website → Pages." },
            { title: "Section two", body: "Content is pulled at runtime from your web_pages table." },
            { title: "Section three", body: "Add [data-content=\"key\"] on any element to bind it." },
        ])}
      </div>
    </div>
  </section>`;
    }

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${page.title} — ${p.brand}</title>
<link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
${topBar(p, page.slug)}
<main>
  <section class="container hero">
    <h1 data-content="hero_title">${page.hero}</h1>
    <p data-content="hero_subtitle">${page.sub}</p>
  </section>
  ${body}
</main>
${siteFoot(p)}`;
}

function renderContact(p) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Contact — ${p.brand}</title>
<link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
${topBar(p, "contact")}
<main>
  <section class="container hero">
    <h1 data-content="hero_title">Get in touch</h1>
    <p data-content="hero_subtitle">We typically reply within a business day.</p>
  </section>
  <section class="section">
    <div class="container">
      <form class="form" onsubmit="event.preventDefault();alert('Thanks — we\\'ll be in touch.');this.reset();">
        <input type="text" placeholder="Your name" required />
        <input type="email" placeholder="Your email" required />
        <textarea rows="5" placeholder="Your message" required></textarea>
        <button class="cta" type="submit">Send message</button>
      </form>
    </div>
  </section>
</main>
${siteFoot(p)}`;
}

function renderThumbnail(p) {
    const c1 = p.palette.bg;
    const c2 = p.palette.accent;
    const c3 = p.palette.accent2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="400" height="250">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="400" height="250" fill="url(#g)"/>
  <rect x="25" y="25" width="350" height="26" rx="6" fill="${c2}" opacity="0.2"/>
  <circle cx="42" cy="38" r="8" fill="${c3}"/>
  <rect x="25" y="70" width="190" height="22" rx="4" fill="${c2}" opacity="0.9"/>
  <rect x="25" y="100" width="260" height="10" rx="2" fill="${c2}" opacity="0.55"/>
  <rect x="25" y="116" width="220" height="10" rx="2" fill="${c2}" opacity="0.55"/>
  <rect x="25" y="140" width="100" height="30" rx="6" fill="${c3}"/>
  <rect x="135" y="140" width="100" height="30" rx="6" fill="${c2}" opacity="0.25"/>
  <rect x="25" y="190" width="105" height="40" rx="6" fill="${c2}" opacity="0.14"/>
  <rect x="145" y="190" width="105" height="40" rx="6" fill="${c2}" opacity="0.14"/>
  <rect x="265" y="190" width="110" height="40" rx="6" fill="${c2}" opacity="0.14"/>
</svg>
`;
}

// ── Execute ────────────────────────────────────────────────────
function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }
function writeFile(p, content) { ensureDir(path.dirname(p)); fs.writeFileSync(p, content); }

function main() {
    let created = 0;
    for (const spec of SPECS) {
        const dir = path.join(ROOT, spec.category, spec.slug);
        writeFile(path.join(dir, "index.html"), renderIndex(spec));
        writeFile(path.join(dir, spec.pages.second.file), renderSecondary(spec));
        writeFile(path.join(dir, "contact.html"), renderContact(spec));
        writeFile(path.join(dir, "assets", "css", "style.css"), renderCss(spec));
        writeFile(path.join(dir, "assets", "js", "config.js"), renderConfig(spec));
        writeFile(path.join(dir, "assets", "thumbnail.svg"), renderThumbnail(spec));
        writeFile(path.join(dir, ".htaccess"), HTACCESS);
        console.log(`  ✓ ${spec.category}/${spec.slug}`);
        created += 1;
    }
    console.log(`\nScaffolded ${created} templates (rich mode).`);
}

main();
