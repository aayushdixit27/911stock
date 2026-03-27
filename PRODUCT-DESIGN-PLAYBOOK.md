# The Product Builder's Playbook
### Distilled from Ethereum Unblock Design Sprint — San Francisco, March 2026

---

## PART 1: THE IDEO FRAMEWORK — Design Thinking from First Principles

### Design Is Not UI

Product design is not about screens, colors, or layouts. It's a methodology for creating products that matter — originally developed by IDEO (the group that invented the mouse). The core insight: **most engineers build products that are interesting from an engineering standpoint but never think about the full product lifecycle** — who's the user, what problem are we solving, and why would anyone care.

### The Emotional Rollercoaster

Product development is a rollercoaster. You think you have a good idea, someone tells you it won't sell, and you have to iterate. This is normal. The framework maps the journey:

```
Hope → Confidence → Doubt → Despair → Breakthrough → Validation
         ↑                                    |
         └────────── iterate ─────────────────┘
```

> "The only way out is through. Build through. That's the only way."

### The Build-Measure-Learn Gap

Product-market fit (build → measure → learn) is incomplete. The most critical missing piece is **empathy** — deeply understanding who your customer is, what their motivations are, what they aspire to, what they're scared about. Literally putting yourself in their shoes.

---

## PART 2: THE USER JOURNEY — Your First Exercise

### How to Map It

1. **Start with a real persona** — Give them a name, draw them, define their role
2. **Identify the pain point** — What's broken in their life right now?
3. **Map the steps** — What happens from pain → discovery → action → resolution?
4. **Find the Hero Moment** — Where does the user say "holy fuck, this is amazing"?
5. **Pull the hero moment forward** — Great products make you feel the value as early as possible

### Example: Uber Eats
- Pain: Sarah is hungry
- Journey: Opens app → browses → orders → gets notification → food arrives
- Hero moment: Food at her door. But Uber Eats pulls it forward — discounts, fast delivery promises, visual animations — so the "wow" hits before the food even arrives

### The Hero Moment Test

> "If it's not FUCK YES, it's FUCK NO."

That is the bar. Whether you like it or not, introducing new products into the world requires a 9/10 or 10/10 reaction to overcome:
- The inertia of doing nothing
- The switching cost from existing alternatives
- The effort of adopting something new

**When you nail it, you'll know.** People will say:
- "Can I use this now?"
- "When is this ready?"
- "Can I pay for it?"
- "Can I invest in your company?"
- "Can you send me the API key right now?"
- They'll literally stand up in a meeting, walk to a corner, call someone and say, "You have to come see this."

**When you don't have it yet, don't fake it.** Iterate until you do.

---

## PART 3: UX RESEARCH — The Art and Science

### What UX Research Is NOT
- It's not a customer survey
- It's not a feedback session
- It's not asking people what they want (stated preferences ≠ revealed preferences)

### What UX Research IS
The goal is to **put a future product that doesn't exist into someone's hands right now** and see if they want to buy it. If they don't, that's okay — the secondary goal is finding **secrets you can only discover through revealed preferences** (what people *do*, not what they *say*).

### The 30-Minute UX Research Session (Best Practice Structure)

```
┌─────────────────────────────────────────────────────┐
│  Minutes 0–10:  LEARN ABOUT THEM (33% of time)      │
│  Minutes 10–13: SET THE CONTEXT (10% of time)       │
│  Minutes 13–18: WALK THROUGH PROTOTYPE (17% of time)│
│  Minutes 18–27: OBSERVE + DISCUSS (30% of time)     │
│  Minutes 27–30: OPEN SPACE (10% of time)            │
└─────────────────────────────────────────────────────┘
```

#### Phase 1: Learn About Them (0–10 min) — THE MOST IMPORTANT PHASE

Spend the first third NOT showing them anything. Ask about them:
- "Tell me about yourself"
- "How did you get into [their field]?"
- "What do you do day-to-day?"
- "What are you most excited about?"

**Why this matters:**
- Helps you build personas and user archetypes
- Some of the biggest product breakthrough insights come from this phase, NOT the prototype phase
- This is the closest virtual proxy to IDEO's "walking in their shoes" methodology

**The Swiffer Sweeper Story:** IDEO followed people into their homes for an entire day. They noticed people would sweep with a broom, then take a wet paper towel and wipe the floor. "Why?" "To get a deep clean." That observation created the Swiffer Sweeper — one of the most successful consumer products ever.

**The Acorns Story:** People would come home, empty their pockets, put spare change in a jar, and deposit it monthly into savings. IDEO saw this pattern and it became Acorns — rounding up every transaction to the nearest dollar and investing the difference.

#### Phase 2: Set the Context (10–13 min)

Before showing the prototype, transport them into the moment:
- "Imagine you're a commodities trader in copper..."
- "It's 9 AM, you open your computer, and this is the first thing you see..."
- "You've already signed up — I'm skipping that boring part..."

**Why context matters:**
Even if they ARE the perfect user, you have to get them in the right headspace. They're sitting in a meeting room with you — not in the moment where they'd actually use this product. You need to recreate that emotional and situational context to get genuine reactions.

If they're NOT the exact user, context-setting becomes even more critical to get usable signal.

#### Phase 3: Walk Through the Prototype (13–18 min)

**CRITICAL RULE: Timebox to 5 minutes. Do NOT spend 30 minutes talking about features.**

Walk through it fast. Don't explain every detail. Don't say "I didn't model this, but imagine..." Don't describe what isn't built. Show what is.

**While walking through:**
- Watch their face and body language (this tells you more than words)
- Look for confusion signals: furrowed brow, squinting, head tilting
- Look for excitement signals: eyes widening, leaning forward, spontaneous reactions
- If you see either, pause and ask: "What are you feeling right now?"

#### Phase 4: Observe and Discuss (18–27 min)

This is where revealed preferences emerge. Watch for:

**RED FLAGS:**
- Rationalizing: "I'm probably not who this is for, but I can imagine who it could be useful for" (translation: they don't want it)
- Polite nodding without enthusiasm
- Trying to explain your product back to you (confusion masked as engagement)
- Face twitching, slight grimacing — somatic responses they can't hide

**GREEN FLAGS:**
- "Is this built yet?"
- "Can I try it?"
- "When is the beta?"
- Pulling out their phone to show someone else
- Asking about pricing unprompted
- Wanting to know the technical details (because they're already planning integration)

#### Phase 5: Open Space (27–30 min)

Leave room for them to say anything. Could be random, could be on point. This creates space for surprise discoveries you didn't anticipate.

### Best Practices

1. **Do UX research in pairs** — One leads the conversation, one silently observes and takes notes (IDEO always does this)
2. **Watch their face and body language** — It tells you more than what they say
3. **Empathize with emotions, not just words** — The worst sign is when they rationalize
4. **Don't confuse politeness with enthusiasm** — In UX research, "that's interesting" is a red flag
5. **After each session, synthesize** — Update your persona database, note patterns

---

## PART 4: GETTING TO A BUY SIGNAL

### The Hierarchy of Demand Signals (strongest to weakest)

1. **Unprompted demand** — They ask to buy/use it before you even finish demoing (10/10)
2. **Time commitment** — They're willing to use a shitty early product and give ongoing feedback (8/10)
3. **Prompted demand** — You force the issue and they say yes (7/10)
4. **Polite enthusiasm** — "This is cool" with no action (3/10)
5. **Redirection** — "I know someone who would love this" (2/10)

### How to Force the Signal

If you're not getting organic demand, manufacture a decision moment:

> "We're launching the beta next week with a handful of customers. There's only a few spots. Do you want to be a part of it or not? Totally fine either way."

This may or may not be real. The point is forcing them to commit or decline. Most say no — be prepared. But it reveals truth.

### The Time-as-Currency Test

At the concept stage, you often can't ask "will you pay $X?" Instead ask: **are they willing to invest their time in a shitty product that's rapidly changing?**

If someone will spend hours using something that barely works, giving you feedback, staying engaged — that's one of the strongest signals that you'll eventually find a way to price it and sell it.

---

## PART 5: THE ONE-PROBLEM RULE

### The #1 Feedback from Every Mentor, Judge, and User

The single most repeated critique across all demos and feedback sessions:

> **"You're mixing too many problems and solutions."**

This was said by:
- Pablo (Ethereum Foundation): "The bounty thing feels like a nice-to-have... it doesn't really fix my problem"
- Ian (Mentor): "You're mixing Kai-specific stuff with tower-wide stuff... you gotta choose one"
- Speaker 2 (Pablo demo): "I would build something just around that [one problem]"

### How to Apply This

1. **Pick ONE problem** — Not three related problems. One.
2. **Pick ONE persona** — Not "everyone in the tower." One person with one pain.
3. **Pick ONE hero moment** — Not a dashboard with six features. One "holy shit" screen.
4. **Everything else is a distraction** — If it doesn't serve the one problem, cut it.

### The Pablo Test

Pablo from Frontier DAO gave the sharpest feedback:

- **What excited him:** Identity and reputation — being able to demonstrate a track record of contributions, rank against other people, and take it to another tower
- **What didn't:** The bounty board ("it's a nice-to-have"), the treasury view ("data that doesn't add value to the core issue"), the mixed dashboard
- **His reframe:** "Reputation for the tower. Not only floor leads, but everyone. How can people prove how much they contribute?"
- **His pitch in one sentence:** "A shortcut to identifying high-value people in the tower"

### The Ian Test

Ian pushed on the same theme from a different angle:

- **The confusion:** "This is a personal dashboard for Kai that no one else sees. Where am I actually being recognized?"
- **The expectation:** "A public leaderboard showing contributions across the tower — almost like employee of the month"
- **The reframe:** "If the problem is recognition, show me recognition. If it's bounties, show me bounties. But choose."
- **On bounties specifically:** "The flow was pretty standard. People know how to do bounties. They've been around forever. Push a NEW experience that makes people go 'whoa, this is fresh.'"

---

## PART 6: PROTOTYPING RULES

### Wizard of Oz Everything

> "AI with Claude Code Wizard-of-Oz's things so well — fake databases, live data, JavaScript animations. That is WAY more valuable than actually building the real thing before putting it in front of customers."

The priority hierarchy:
1. Get it in front of users → learn → iterate
2. Build the real thing ← (this comes much later)

### The Half-Day Rule

> "If you can't build and test this with a real customer in a half day or less, you're not pushing yourself hard enough on Wizard-of-Oz thinking."

You can literally prototype anything and put it in a user's hands within 4 hours. If you think you can't, ask:
- Do I actually need to build this technically?
- Can I fake the backend and just show the experience?
- What's the minimum that communicates the value proposition?

### Three Screens, Not Thirty

The design sprint methodology: **build three screens** that capture the full user journey from pain to hero moment. Not a complete app. Three screens:
1. The first screen they see (context + hook)
2. The action screen (where they DO the thing)
3. The resolution screen (where they FEEL the value)

### Users Care About Benefits, Not Mechanisms

Don't explain how it works. Show what it does for them.
- Bad: "This uses on-chain attestations via EAS on Base L2"
- Good: "Your work is permanently recorded and you can prove it to anyone, anywhere"

### Live Piloting > Demo'ing

If you can get real users in a real context using your prototype, that signal is 10x stronger than any demo conversation. When someone said "if you have something we can try, we'll try it" — that's gold. A signed contract can come from a live pilot. It never comes from a slide deck.

---

## PART 7: REAL-WORLD PROBLEM DISCOVERY

### The Frontier Tower Case Study — What User Research Actually Uncovered

By talking to actual floor leads and tower members, these hidden truths emerged:

**The Incentive Misalignment:**
- Tower management gets SF-rate salaries
- Floor leads are volunteers who get 20% of membership fees (~$3K/month for 100 members)
- $3K doesn't even cover SF rent. It's unsustainable.
- The only KPI is "bring more members" — but some floors (gym, wellness) provide value that isn't member-count-driven

**The Quiet Quit Cycle:**
- Volunteer → get asked to do more → burn out → quietly stop → pass it to the next person
- "Volunteering is punishment" — multiple floor leads said this independently
- Floor leads rotate because the role is unsustainable, not because anyone chooses to leave

**The Visibility Paradox:**
- The only way floor leads get recognized is by hosting big public events and building a personal brand
- All the internal work (fixing things, onboarding, organizing) is invisible
- When they leave, six months of work disappears completely

**The Black Box Budget:**
- Floor leads manage 20% of budget but can't see where money goes
- Some leads create side-hustle businesses to supplement income
- Some hide sponsorship revenue to avoid the 20% tower take
- The tower lost money during Tech Week despite high attendance — events alone aren't sustainable

### What This Teaches About Problem Discovery

None of these insights came from the prototype. They came from:
1. **Sitting down with real people** and asking about their actual lives
2. **Listening for emotional weight** — the floor lead who "doesn't want to pay membership fees as a rebellion"
3. **Following the money** — understanding the actual financial structure revealed the real tensions
4. **Noticing workarounds** — people hiding sponsorship revenue = a system that punishes honesty

---

## PART 8: THE REPEATABLE CHECKLIST

### Before You Build Anything

- [ ] Can I name ONE person (real or archetype) who has this problem?
- [ ] Can I describe their pain in ONE sentence?
- [ ] Have I talked to at least ONE person who actually has this pain?
- [ ] Can I describe the hero moment in ONE sentence?
- [ ] Is this hero moment so good that it would make someone say "holy fuck"?

### Before You Demo

- [ ] Am I solving ONE problem, not three?
- [ ] Does my demo take under 5 minutes to walk through?
- [ ] Am I showing benefits, not mechanisms?
- [ ] Have I practiced setting the context (the 3-minute scene-setting)?
- [ ] Do I know what "body language to watch for" means in practice?

### During the Demo / UX Research

- [ ] Did I spend the first 10 minutes learning about THEM, not showing my product?
- [ ] Did I set the emotional context before showing anything?
- [ ] Did I walk through the prototype in under 5 minutes?
- [ ] Did I watch their face, not my screen?
- [ ] Did I pause when I saw confusion or excitement?
- [ ] Did I leave open space at the end?

### After the Demo

- [ ] Did they express unprompted desire to use/buy it?
- [ ] Did they offer their time (want to be in the beta)?
- [ ] Or did they rationalize, redirect, or politely nod?
- [ ] What ONE thing would I change based on their reaction?
- [ ] Did I update my persona/archetype notes?
- [ ] Am I still solving the same ONE problem, or did I just add three more?

### The Meta-Rule

> **"Talk less. Do more. Stop thinking and planning. Start building, shipping, and talking to users. The answers are not in your head or your computer. They're in conversations with real people."**

---

## PART 9: KEY QUOTES TO REMEMBER

**On Demand:**
> "If it's not fuck yes, it's fuck no. That is the bar you need to clear for introducing new products into the world."

**On Focus:**
> "You've identified a good problem or a few good problems. But you're mixing too many problems and solutions. Build something just around ONE."

**On Prototyping:**
> "Wizard of Oz everything. If you can't build and test this with a real customer in a half day, you're not pushing hard enough."

**On Research:**
> "Watch their face and body language. It's gonna tell you a lot more than what they say."

**On the Real Test:**
> "Some of the biggest product insights don't come from the prototype session. They come from the first 10 minutes when you're just learning about the person."

**On Building Through:**
> "90% of the time it doesn't happen. But you keep pushing through and iterating. When it does happen, it's undeniable."

**On What Matters:**
> "Users care about benefits. They don't care about how it works."

---

*Compiled from five sessions: Pablo Demo, Ian Feedback, Demo Fair 2, Day 2 Talk (UX Research Workshop), and Day 2 Intro (Design Sprint Overview). Ethereum Unblock Hackathon, Frontier Tower, San Francisco.*
