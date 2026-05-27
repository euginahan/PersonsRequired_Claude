# 이메일 도우미 — Email Helper for My Mom
**AI 201: Creative Coding — Project 3: Persons Required**
SCAD · Spring 2026 · Due May 27, 2026

**Live URL (web simulation):** https://euginahan.github.io/PersonsRequired_Claude/

---

## Try the Chrome Extension (for the professor)

The live URL above is the **web simulation** used for First Contact testing. To see the **real Chrome extension** running on live Gmail, follow these steps. The whole thing takes about 30 seconds.

1. **Download the repo** — either clone it (`git clone https://github.com/euginahan/PersonsRequired_Claude.git`) or download the ZIP from the GitHub page and unzip it somewhere easy to find.
2. **Open Chrome** and type `chrome://extensions` into the address bar.
3. **Turn on "Developer mode"** using the toggle in the top-right corner of that page.
4. **Click "Load unpacked"** on the top-left.
5. **Select the `extension/` folder** inside the repo you just downloaded.
6. **Open Gmail** at `mail.google.com`.
7. The 도우미 (Doumi) panel will appear on top of any email you open. You can drag it by the header, resize it from any edge, and minimize it to a small chip.

The extension reads the real subject, sender, and body of whichever email is open, classifies it, and shows the same panel from the simulation, just running on your actual inbox. Reminders persist in browser storage so they survive page reloads.

If you'd rather not load the extension, the live simulation URL above gives you the full panel experience on a static DDS renewal email.

---

## Design Argument

My mom receives important emails about bills, permits, franchise logistics, documents, and official notices, but because of language barriers and low tech confidence, she struggles to understand what the email is asking her to do. She often calls me to translate, explain next steps, forward attachments, or help her write a simple reply.

This project turns that confusion into a clear Korean summary, action steps, deadline reminders, safety checks, and a guided walkthrough that runs on top of the email she already has open. It meets her *inside* her existing inbox instead of asking her to learn a new system.

The final deliverable ships in **two paired forms**:

1. **A web-based simulation** — a Vite + React app hosted on GitHub Pages, used for First Contact testing because she could open a URL on her own laptop without installing anything.
2. **A real Chrome extension** (manifest v3) — built after the simulation validated the interaction model, this is what she actually uses on her real Gmail inbox. The extension reads the live email DOM (subject, sender, body) and renders the same panel feature-for-feature, with reminders that persist across sessions.

Both share the same classifier, the same bilingual data model, and the same UI grammar so the experience she validated in testing is the experience she gets in production.

**The Person**
My mom is a first-generation Korean immigrant who helps my dad manage franchise-related logistics. Some emails she receives are high-stakes and time-sensitive: permits, bills, forms, renewals, document requests, official notices. She is not very comfortable with technology and often faces language barriers when reading emails in English. I am usually the person she calls when she doesn't understand an email.

**The Problem**
My mom can sometimes translate individual words, but she struggles to understand what the email means, what matters most, and what action she needs to take next. Translation alone does not answer the question she is actually asking: *what do I do now?*

**Current Workaround**
She calls or texts me. Sometimes she uses Google Translate, but that only gives her words — not purpose or next steps. She also asks me to help with simple actions like forwarding attachments or drafting a short reply.

**What "Helped" Looks Like**
She opens an important email on her own laptop. The extension classifies it, surfaces the Korean summary and the action steps, lets her set a real-dated reminder, and walks her through the renewal/payment/appointment task one step at a time. She closes the tab without calling me. The very first time she did exactly this in testing — Georgia DDS renewal email, set a reminder, didn't ask me to translate — is the moment that defines what this project succeeded at.

**Why I'm Building This**
I am the person she calls. I have direct access to the problem, I understand where it breaks down, and I speak both languages. I also know how she reads: she skims, she trusts simple language, and she shuts down when something looks complicated.

**Non-Negotiables**
- The tool must feel simple and non-intimidating
- It must not require copy and paste
- It must work inside the email context (i.e., on top of Gmail itself, not as a separate app)
- It must explain next steps, not just translate
- Korean must be the primary support language
- The interface must avoid technical language
- It must make her feel more confident, not dependent on another complicated tool
- The first screen must be very clear and not overloaded
- Reminders must always have a real *when* attached, not a generic "saved" state

**What This Project Is Not**
- Not a generic translation app
- Not a full email client replacement
- Not designed for all users — specifically for my mom's needs
- Not focused on visual polish or complexity over clarity
- Not trying to solve every type of communication, only important action-based emails

---

## Research Documentation

> *Field research conducted with permission. First name withheld per ethical guidelines.*
> *Full research PDF: [`docs/AI201 Research Documentation.pdf`](docs/AI201%20Research%20Documentation.pdf)*

### Research Goal

For this project, I wanted to better understand how my mom deals with stressful or overwhelming emails in her everyday life. Instead of designing for a broad audience, I focused on one real person and tried to understand what actually causes frustration, hesitation, and avoidance when she checks her inbox.

The goal wasn't just to "make email easier." It was to understand what makes certain messages emotionally exhausting and figure out what *feeling supported* could realistically look like for her.

### Participant Background

My mom regularly receives emails related to appointments, scheduling, bills, school information, and other important tasks. A lot of the stress comes from not immediately understanding what the email is asking her to do, especially when the language feels formal, long, or overwhelming.

During the research process, I focused on:
- how she currently reads emails
- where confusion starts happening
- what causes her to delay responding
- what tools or workarounds she already uses
- what kind of support would actually feel useful to her

### Research Methods

**Interview** — I had a casual conversation with my mom while she walked me through how she normally handles emails. Instead of asking scripted questions the entire time, I let the conversation flow naturally so I could understand her habits and frustrations more honestly.

**Observation** — I observed her opening and reading real emails on her laptop and phone while taking notes on moments where she paused, reread sections, switched tabs, or verbally reacted to something confusing.

**Follow-Up Questions** — As she interacted with emails, I asked follow-up questions to better understand what she was thinking in those moments and why certain emails felt stressful.

### Questions Asked

> **"What part of this email feels confusing?"**
> "I don't know what they actually want me to do. There's too much extra wording and I feel like I'm missing something important."

> **"What usually makes you decide to respond later instead of now?"**
> "If I don't understand it right away, I get tired thinking about it and tell myself I'll do it later… but then I forget."

> **"How do you normally remember to come back to emails like this?"**
> "Honestly, I usually don't. I either leave the tab open or mark it unread and hope I remember later."

> **"What kinds of emails stress you out the most?"**
> "Anything official. Appointments, school emails, bills, forms… especially if it sounds serious."

> **"What would make this feel easier or less overwhelming?"**
> "If someone could just break it down simply and tell me what actually matters."

> **"Do you usually know what action you're supposed to take right away?"**
> "Not always. Sometimes I can tell it's important, but I don't know what they expect from me."

> **"What makes an email feel urgent to you?"**
> "Usually the tone. Even if it's not actually urgent, if it sounds formal I assume I did something wrong or forgot something."

### Environment Notes

<p align="center">
  <img src="docs/testing/mom-01-overshoulder.jpeg" width="280" alt="Mom reading email at kitchen counter" />
  &nbsp;
  <img src="docs/testing/mom-03-thinking.jpeg" width="280" alt="Mom reading the helper panel" />
</p>

She does most of her email reading at the kitchen island — laptop open on the marble counter, water bottle nearby, phone within reach. It's not a focused desk environment; she's often mid-task (cooking, cleaning, switching to the phone) when she opens an email. That context matters: the tool has to work in a *distracted, interrupted* setting, not a quiet office.

**General Observations:**
- She usually has multiple tabs open at once while checking email
- Important emails often stay unread for long periods if they feel stressful
- She switches between email, Google Translate, calendar, and notes frequently
- Long paragraphs immediately make her slow down or avoid responding
- She tends to miss action items if they're buried inside large blocks of text

### Interview Quotes (Translated to English)

> "Sometimes I read the same email over and over and still don't really know what they want."

> "If it looks stressful, I leave it and tell myself I'll come back later."

> "I get nervous responding because I don't want to say the wrong thing."

> "I wish someone could just explain the important part to me."

> "A lot of times I ask you to read it first before I answer."

> "Some emails feel bigger or scarier than they actually are."

### Behavioral Notes

**Avoidance** — When emails looked long or formal, she often opened them briefly, skimmed the beginning, then closed them without taking action.

**Re-reading** — She reread the same sentences multiple times trying to figure out:
- what was important
- whether something needed action
- how urgent it actually was

### Existing Workarounds

Some of the ways she currently manages this include:
- sending screenshots to family members
- using Google Translate
- marking emails unread as reminders
- leaving tabs open so she doesn't forget
- writing reminders separately after reading emails

### Emotional Reactions

Emails related to scheduling, payments, or official communication created the most visible stress and hesitation.

### Main Pain Points

| Pain Point | What I Observed |
|---|---|
| Hard to identify the important part | Frequently asked *"What are they actually asking me to do?"* |
| Overwhelmed by long/formal emails | Delayed opening or responding |
| Trouble keeping track of follow-ups | Relied on memory or handwritten reminders |
| Constantly switching between apps | Moved between email, calendar, notes, and Translate |
| Fear of making mistakes | Hesitated before replying or taking action |

### Key Insights

One of the biggest things I realized was that the issue wasn't just comprehension. A lot of the stress came from **uncertainty and emotional pressure**.

She didn't just need help reading emails — she needed reassurance, clarity, and a better sense of what actually mattered.

Another important insight was that support needed to exist **directly inside her current workflow**. If the tool lived somewhere separate, it would probably never become part of her normal routine.

### Design Direction

After the research phase, the project started evolving into a lightweight plugin experience that could:
- simplify emails into clearer actions
- reduce emotional overwhelm
- highlight what actually needs attention
- help track reminders and follow-ups
- make the experience feel supportive rather than robotic

I chose a plugin format because the support needed to happen directly inside the email experience instead of requiring her to open a separate app.

### Research-Phase Reflection

Doing research with a real person instead of designing for a hypothetical user completely changed how I approached the project. Watching someone hesitate, reread messages, and avoid stressful emails made the problem feel much more human and specific.

A lot of the final design decisions came directly from these observations — especially around emotional clarity, reminders, simplified actions, and creating a calmer experience overall.

---

## Platform Rationale

The problem happens **inside email**. A separate translation app would mean copy-paste, context-switch, and another tool to learn — three things that already kill mom's follow-through. The right platform is one that lives directly on top of Gmail, the way Grammarly lives on top of whatever text editor you're already in.

The project ships in two paired platform forms, in deliberate order:

### Phase 1, the simulation (built first, used for First Contact testing)

A Vite + React web app hosted on GitHub Pages that simulates the Gmail UI and renders the helper panel as a draggable, resizable, minimizable floating window on top of it. The simulation uses static mock data (a real DDS Georgia driver's license renewal email) so I could put a working URL in front of mom on her own laptop in Session 16 *without* asking her to install anything, grant any permissions, or trust a Chrome extension I made.

This isn't a placeholder — it's the test harness. The whole point of the simulation is that it lets me validate the interaction model (does the bilingual summary land? does the walkthrough reduce hesitation? does the reminder picker get used?) before I write a single line of Gmail DOM-scraping code. Field-testing UX *and* code reliability at the same time would have made it impossible to know whether a failure was a design problem or a Gmail-selector bug.

**Live URL:** https://euginahan.github.io/PersonsRequired_Claude/

### Phase 2, the real Chrome extension (built second, what mom actually uses)

After First Contact and the iteration round, I built the actual deliverable: a real Chrome extension (`manifest_v3`) that injects the same panel into live `mail.google.com`. The extension reads the real Gmail DOM — `h2.hP` for the subject, `.gD[email]` for the sender, `.a3s.aiL` / `.aXjCH` for the body — runs the same classifier as the simulation, and renders the same UI feature-for-feature. Reminders persist across browser sessions in `localStorage`. Panel position and size also persist so she never has to re-place the window.

This is the version actually in mom's hands. It's loaded as an unpacked extension on her Chrome (`chrome://extensions → Load unpacked → /extension`) and works on her actual inbox emails — not a mock. The brief reads *"It must be in the hands of the person you designed it for"* — and "it" has to mean a tool that works on her *real* email, not a simulation she has to imagine onto her inbox.

### Why these two forms specifically, and not just one

Going simulation-first, extension-second turned out to be the right sequencing decision in retrospect. Going extension-only would have meant testing UX and Gmail-DOM reliability at the same time, with no way to share a URL. Going simulation-only would have meant the case study evidence stopped at "she liked the demo" instead of "she used it on her real Gmail and stopped calling me." The project specifically needed both. The simulation is the URL submission for First Contact; the extension is the artifact in her hands for the actual case study evidence.

### What I rejected, and why

**Mobile app** — she reads email on both phone and laptop, but the "what do I do now" problem isn't mobile-specific. A native iOS app would have meant app store submission, longer feedback loops, and a separate codebase. A responsive web app + extension covers both surfaces with one codebase.

**Standalone translation app** — Google Translate already gives her words. Words aren't her problem. She needs purpose and next steps, which requires the email *in context*, not a chat window where she pastes English in and gets Korean out.

**Discord / Slack / WhatsApp bot** — moving the solution to a different platform than the problem adds steps instead of removing them. Every existing workaround she has (screenshot to me, leave the tab open, ask later) is already a context-switch tax. Adding another one is the opposite of help.

**Physical kiosk / installation** — the problem is private and recurring; an installation is public and one-time. Doesn't fit.

---

## System Architecture Diagram (Mermaid)

> *Required deliverable per the brief: "Mermaid Diagram — Full system architecture. What receives input, how the system processes it, what it outputs."*

The project ships in **two parallel forms** that share the same classifier, the same bilingual data model, and the same UI grammar:

1. **Simulation** — a Vite + React app on GitHub Pages, used for First Contact testing. Reads static mock data from `src/data/mockEmail.js`.
2. **Chrome Extension** — a real `manifest_v3` content script that injects the same panel into live `mail.google.com` and reads the actual open email from the Gmail DOM.

Both pipelines enter the same classifier (`analyze()`), pass through the same enrichment layer (`enrichAnalysis()`), and render the same panel — only the *input source* differs (mock data vs live DOM) and the rendering surface (React components vs vanilla DOM in the extension).

### The diagram

```mermaid
flowchart TD

  %% ─── INPUT LAYER ───
  subgraph INPUT[" INPUT — what the system receives "]
    direction TB
    A1[Simulation path<br/>mockEmail.js<br/>static DDS renewal data]
    A2[Extension path<br/>live Gmail DOM<br/>h2.hP · .gD email · .a3s.aiL]
  end

  %% ─── PROCESSING LAYER ───
  subgraph PROCESS[" PROCESSING — how the system thinks "]
    direction TB
    CL[analyze subject sender body<br/>routes to type-specific analyzer:<br/>DDS · Bill · Appt · Delivery · Generic]
    ENR[enrichAnalysis<br/>adds classifier meta priority deadline risk<br/>caseData · walkthrough confirm labels<br/>glossary emailContext]
    STATE[Panel State Object<br/>language · tab · walkthrough · reminders<br/>a11y · pos · size · pickers]
    PERSIST[(localStorage<br/>doumi_reminders<br/>doumi_pos · doumi_size)]
    CL --> ENR --> STATE
    STATE <-.-> PERSIST
  end

  A1 --> CL
  A2 --> CL

  %% ─── OUTPUT LAYER ───
  subgraph OUTPUT[" OUTPUT — what the user sees "]
    direction TB
    PANEL{Floating Panel<br/>drag · 8 resize handles<br/>minimize to pill}
    LANG[Language Resolver t getText<br/>한국어 · English · 둘 다 · 쉬운 English]
    PANEL --> LANG

    LANG --> T1[Summary Tab]
    LANG --> T2[Safety Tab]
    LANG --> T3[Reply Tab]
    LANG --> T4[Ask Tab]

    T1 --> S1[Status Card<br/>icon · priority · deadline · risk]
    T1 --> S2[Summary Card<br/>what this email is]
    T1 --> S3[Key Details list]
    T1 --> S4[Action Checklist<br/>Show me where · Why?<br/>Save email as reminder]
    T1 --> S5[Dates Panel<br/>inline picker:<br/>Tomorrow · Next week · custom]
    T1 --> S6[Warnings]
    T1 --> S7[Glossary<br/>per-term expand · email context]
    T1 --> S8[Case Memory<br/>related emails · progress]

    T2 --> SAF[Safety Verdict<br/>findings · what if I ignore]
    T3 --> REP[Reply Helper<br/>template chips · textarea · copy]
    T4 --> CHAT[Chat Presets<br/>Q+A bubbles · scroll history]

    A11Y[Accessibility Menu<br/>text size · high contrast<br/>simplified view · read-aloud TTS]
    PANEL --> A11Y
  end

  STATE --> PANEL

  %% ─── INTERACTIVE OVERLAYS ───
  S4 -.->|Start guide| WT[Walkthrough Bar<br/>step counter · slow mode<br/>back · pause · confirm]
  WT --> GUIDE[Guide Overlay on Gmail<br/>spotlight on real DOM target<br/>enhanced mode: brighter + bouncing arrow]
  WT -.->|I Need More Help| ESC[Escalation Overlay<br/>5 modes:<br/>cant-find · slower · scared<br/>dont-understand · human]
  ESC -.->|sets| STATE

  %% ─── REMINDER LOOP ───
  S5 -.->|Add reminder| RC[Reminder Center<br/>filter pills · grouped by:<br/>Overdue · Today · This Week · Upcoming]
  S4 -.->|Save email as reminder| RC
  RC -.->|Restart guide| WT
  RC <-.-> PERSIST

  classDef inputBox fill:#dbeafe,stroke:#2563eb,stroke-width:2px
  classDef processBox fill:#fef3c7,stroke:#d97706,stroke-width:2px
  classDef outputBox fill:#dcfce7,stroke:#16a34a,stroke-width:2px
  class INPUT inputBox
  class PROCESS processBox
  class OUTPUT outputBox
```

### How to read the diagram

The three colored regions map to the brief's input/processing/output requirement:

- **🟦 INPUT (blue):** The classifier accepts data from two sources. In the simulation, it's a static mock object from `mockEmail.js`. In the extension, it's a live DOM read of the currently open Gmail email — subject from `h2.hP`, sender from `.gD[email]`, body from `.a3s.aiL` or `.aXjCH` (Gmail uses both depending on view mode). Same data shape either way.

- **🟧 PROCESSING (orange):** `analyze()` routes the email by content keywords to a type-specific analyzer (DDS renewal, Bill/Payment, Appointment, Delivery, or Generic). Each analyzer produces a structured analysis object. `enrichAnalysis()` is the post-processor that attaches the StatusCard meta (priority/deadline/risk), case-memory data, walkthrough confirm labels, and glossary email-context blocks — so downstream UI never needs to do conditional rendering based on email type. The state object holds all panel state and is bidirectionally synced with `localStorage` for reminders and panel pos/size.

- **🟩 OUTPUT (green):** The floating panel is the root surface; everything else is downstream of it. The language layer resolves every visible string from a `{korean, english}` bilingual object — there is *zero* hardcoded text inside any component. Four tabs (Summary, Safety, Reply, Ask) route to their content. Summary has eight stacked sections in a deliberate order: classifier card, summary, key details, action checklist, dates, warnings, glossary, case memory.

The dashed arrows are **interactive triggers**: clicking "Start guide" or a reminder's "Restart guide" launches the walkthrough; "I Need More Help" inside the walkthrough opens the escalation overlay, which can write back to state (slow mode, enhanced guide); adding a reminder from either the dates panel or the checklist routes through the same `addReminder()` flow.

### State architecture

The simulation and the extension use the same state shape, just different containers:

- **Simulation:** state lives in React `useState` hooks in `App.jsx`, passed down as props. No global store.
- **Extension:** state lives in a single `ST` object literal in `content.js`. Mutations call `rerender()` which calls `el.innerHTML = renderPanel()`. Vanilla DOM, every class `doumi-` prefixed to avoid Gmail CSS collisions, max-int `z-index` on the panel + spotlight overlay so they always win against Gmail's chrome.

| State key | Purpose |
|---|---|
| `language` | One of `korean` / `english` / `bilingual` / `simple` — single source of truth for every visible string |
| `tab` / `activeTab` | Which of the 4 tabs is open |
| `analysis` | The current enriched analysis object for the open email |
| `walkthrough` / `wtStep` / `wtPaused` / `slowMode` | Active guided-step state |
| `guideActive` / `guideInfo` / `guideEnhanced` | Spotlight overlay state on the email DOM |
| `escOpen` / `escMode` | Escalation overlay (which of 5 modes) |
| `reminders` | Array of `{id, title, dueDate, urgency, category, walkthroughId, completed}` — persisted to `localStorage` |
| `rcFilter` / `rcShowCompleted` | Reminder Center filter pill + completed-section toggle |
| `pickingDate` / `customDate` / `confirmedDates` / `doneDates` | Per-date inline picker state |
| `pickingEmailReminder` / `emailReminderCustom` | "Save email as reminder" picker state |
| `a11y` | `{fontSize, highContrast, reduceMotion, simplified}` |
| `pos` / `size` / `minimized` | Floating-panel geometry — persisted as `doumi_pos` / `doumi_size` in extension |
| `readState` / `readIdx` | Read-aloud TTS state |
| `chatHistory` / `replyIdx` / `replyText` | Q+A and reply-tab state |

The text resolver — `getText(item, language)` in the simulation, `t(item)` in the extension — is the single function that knows about language. Every bilingual data field is a `{korean, english}` object, and adding the fourth reading level ("쉬운 English") cost exactly one line in the resolver, not a 50-file find-and-replace.

---

## AI Direction Log

> *8 entries documenting what was asked, what AI produced, and what was kept, changed, or rejected across the full build.*

**Entry 1, May 11, 2026 (Session 15, Project scaffold)**

*Asked:* Set up a Vite and React scaffold ready to deploy to GitHub Pages. The repo name means the live URL will sit under a sub-path, not the root, so the base path needs to be configured correctly so assets resolve. Set up the GitHub Actions workflow for Pages, lay out a clean source directory with a components folder and a data folder, and put the initial mock email skeleton in place so the build doesn't error on first run.

*Produced:* A full scaffold ready to push. The Vite config used the right base path so the Pages sub-path resolves correctly. A deploy workflow using the official Pages artifact and deploy actions, triggered on push to main. A minimal source shell with the app entry, the main entry, the global stylesheet, and a placeholder components directory. The HTML entry had the right meta tags and a Korean lang attribute. The mock email skeleton had the basic shape (subject, sender, body) but no real content yet.

*Decision:* Kept the entire scaffold as produced. The base-path config and Pages workflow were both correct on first try and matched the repo name exactly, so no path-bug debugging was needed. The only thing I added was an empty Jekyll-skip file in the workflow so Pages wouldn't try to Jekyll-process the build output. Locking in the deploy pipeline this early meant I could verify a live URL existed before writing any actual feature code, which removed "Is the deploy even working?" from the variables I had to debug later in the project.

---

**Entry 2, May 13, 2026 (Session 16, Initial prototype build)**

*Asked:* Build the full v1 prototype from the design intent doc. A Gmail simulation including the header bar, sidebar with the standard Gmail labels, the email list view, and the open-email view. A helper panel that slides in on the right with three tabs: Summary, Reply, Chat. The Summary tab analyzes a real DDS Georgia driver's license renewal email and surfaces it as a clean Korean explanation with action steps. The language toggle should support Korean, English, and Bilingual side-by-side, and every visible string has to flow through a single resolver, not be hardcoded into components. Add preset chat chips for the most common follow-up questions she'd ask me.

*Produced:* An 11-file React component structure, broken out into a Gmail wrapper, the sidebar, the email view, the helper panel, and tab-specific views for Summary, Reply, and Chat. A language resolver that takes a Korean/English object and returns the right string based on the language state, so the toggle is one prop deep. Korean copy in 해요체 throughout, polite but not stiff. The DDS analysis included a "What is this email?" card, a key-details list, action steps, and warnings about driving with an expired license. The chat tab pre-loaded 6 preset chip questions.

*Decision:* Kept the component structure and the state architecture (the app component as the single source of truth, every component receives the current language as a prop). Reviewed the Korean tone carefully. 해요체 was the right call for mom; 합쇼체 would have felt formal and bureaucratic and 반말 would have been weird. Made one revision: the chat tab's first message was a 3-sentence welcome paragraph that read like a chatbot greeting. Replaced it with a single-line prompt because the welcome paragraph was just noise. Mom would tap a chip immediately and never read the intro.

---

**Entry 3, May 22, 2026 (Session 17, Gmail simulation CSS + icon fix)**

*Asked:* After deploying the v1 prototype, opened the live URL and noticed words and text were weirdly formatted and mixed together in the actual Gmail simulation. The inbox list rendered as raw text with no spacing, and the email view's icons appeared as the literal text "inbox", "label_important", "schedule", and so on. Figure out what's broken and fix it without throwing out the existing design.

*Produced:* Root cause was two separate bugs stacked on top of each other. First, a class-naming mismatch. The committed stylesheet used a new naming convention but the component files were still using the old class names from a previous draft, so almost no styles were applying. Second, the Gmail simulation was loading Google's Material Symbols font for icons, but the Pages deploy was being served over a strict referrer policy that blocked the Material Symbols stylesheet, so every icon span rendered as the literal word "inbox" instead of an icon glyph.

*Decision:* Fixed both. Rewrote the Gmail simulation components to use the committed class names, a quick find-and-replace across the wrapper, sidebar, and email view files. For the icon problem, created a Gmail icons component with hand-inlined SVG icons for every Gmail symbol I was using (inbox, star, important, snoozed, sent, drafts, archive, delete, mark-as-read, and so on). Replaced every Material Symbols span with the inline SVG components. The win: zero external font dependency, no flicker, no chance of a network-policy issue breaking icons in production. Cost: a slightly bigger bundle, but the SVGs are tiny and the difference is invisible.

---

**Entry 4, May 25, 2026 (Session 19, v2 expansion, 13 features)**

*Asked:* Expand the prototype from a 3-tab summarizer into a full AI guidance system. Specifically: an Email Action Classifier surfaced as a status card at the top of the Summary tab with icon, priority badge, deadline, and risk level. Deadline and date detection with an inline date picker that supports Tomorrow, Next week, custom date, and no date. Smart Action Checklist with checkboxes, a "Show me where" button that spotlights the exact element on the email, and a "Why?" button that expands an explanation block. Guided Walkthrough Mode anchored at the bottom of the panel that drives a per-step overlay on the email body. A scam and link safety check as a separate tab with a verdict, findings list, and "what if I ignore this" reasoning. Reply Helper with template chips, an editable textarea, and a copy button. Translation Toggle expanded from 3 to 4 reading levels (add "쉬운 English"). Personal Glossary with per-term expansion and email-context blocks. Case Memory section showing related emails and a progress tracker. Enhanced Ask tab with 10 preset chips and a scrolling chat history. Full Accessibility menu: font size (Normal, Large, XL), high contrast, reduce motion, simplified view, and a "Read aloud" feature.

*Produced:* A new component graph. A rich classifier card, an action checklist with checkboxes plus "Show me where" plus "Why", a walkthrough bar with per-step navigation, a safety view with verdict and findings, an inline date picker on every detected date, a glossary section with per-term expansion, a case section with related emails and progress, a reply helper with chips and textarea and copy, and an accessibility menu gear dropdown. Added the fourth language ("쉬운 English") routed through the same resolver so no component had to change. Accessibility implemented as styling modifiers on the app root for large text, high contrast, and simplified view. Read-aloud used the browser's built-in speech synthesis, scoped to Korean or English based on the language toggle.

*Decision:* Kept the component graph wholesale. Pushed back on two specific things. First, AI's first pass gated almost every secondary section behind the simplified toggle. The entire glossary, dates panel, and case memory disappeared when the toggle was on, which made the simplified view feel broken rather than calmer. Narrowed simplified to hide only the dense list-style cards (Key Details, Warnings) and let the supportive sections stay. Second, the first version of the walkthrough rendered its highlight overlay *inside* the helper panel, a decorative animation on a panel-internal mockup. Moved the overlay to a root-level fixed layer that mounts on the document body and queries the real email for the target element, because mom's eyes go to the email itself, not the panel.

---

**Entry 5, May 25, 2026 (Session 19, Round 2: Escalation flow + Reminder/Calendar)**

*Asked:* Two more major features on top of v2. First, an "I Need More Help" escalation hatch on the walkthrough bar. When mom is stuck mid-step, she clicks it and gets a calm, emotionally supportive modal with five distinct help modes: "I still can't find it" goes into enhanced spotlight with a stronger highlight and a bouncing arrow, "Show me slower" puts the walkthrough into slow mode with an explicit indicator, "I'm scared to click the wrong thing" shows a reassurance overlay explaining what will happen and that the step is reversible, "I don't understand what this means" shows a plain-words context explanation, and "I need someone to help me" shows human-help options (save for later, copy details to send to family, copy issue details, community-help number). Second, a full Reminder and Calendar System: a bell icon in the panel header with a badge count, an inline date picker when adding reminders, a Reminder Center grouped by Overdue, Today, This Week, Upcoming, and Completed, countdown labels like "⚠ Overdue", "Due today", "Due in 3 days", filter pills (All, Urgent, Renewals, Appointments, Bills), toast notifications, snooze-one-day, and restart-walkthrough from inside a reminder card.

*Produced:* Two new components plus state additions. An escalation overlay with a choice screen showing all 5 modes as labeled buttons with icons and a content router that picks which mode is showing. Per-step simplified, reassurance, and context data added to walkthrough step definitions so each mode reads from real step data, not generic copy. A reminder center with a countdown helper that computes the right label and level from the due date, a grouping helper that bins by date, filter pill state, and a completed-section toggle. A reminder toast for the "Reminder added" confirmation that auto-dismisses after 3.5 seconds. Reminders persist to browser storage so they survive page reloads.

*Decision:* Kept the architecture. Made two corrections. First, AI's first draft of the human-help mode included a hardcoded phone number (the DDS customer service line). Replaced it with the generic 211 community-help line, which works for any email type and includes free interpreter services. DDS-specific only made sense for the renewal email and would have been confusing on a bill or appointment. Second, the walkthrough "confirm" button used a generic "Done →" label for every step. Re-wrote each walkthrough step to have its own confirm label ("Click the link", "Pay $32", and so on) so the button is contextually accurate to what mom is actually about to do. The escalation overlay only opens from inside the walkthrough bar, which is intentional. It's a recovery hatch, not a primary navigation surface.

---

**Entry 6, May 26, 2026 (Session 19 continued, Chrome extension v1)**

*Asked:* Convert the simulation into a real Chrome extension that injects the same panel into live Gmail and reads the actual currently-open email instead of static mock data. Use the modern manifest version, a content script that runs after the page is idle, a panel that survives Gmail's frequent reshuffles, and a toolbar action that toggles the panel visibility.

*Produced:* A working but stripped-down extension. A manifest declaring host permission for Gmail, a content-script entry, and a background service worker that listens for the toolbar click and sends a toggle message to the active tab. The content script read the live Gmail page (the subject heading, the sender's email tag, the body container) and rendered a panel. But: the panel was missing most of the v2 features. It only had a summary card and a 2-option escalation overlay ("more explanation" / "human help"). No inline date picker, no per-term glossary, no case memory, a minimal reminder list with no filters or countdown, no read-aloud, no accessibility menu. The styling was also a fixed full-height sidebar pinned to the right, not the floating panel from the simulation.

*Decision:* Rejected the minimal version. The whole reason to build a Chrome extension is so mom can use the tool on her *actual* Gmail. If the extension is weaker than the simulation she'd already seen in First Contact, the case study collapses because her real-world experience would be worse than the demo she'd already responded to. Directed AI to rebuild the extension to exact feature parity with the simulation. Also flagged the fixed-sidebar layout as breaking the trust the simulation built. The panel needs to be floating, draggable, and minimizable like the simulation's window. This kicked off Entry 7.

---

**Entry 7, May 27, 2026 (Session 20, Chrome extension feature-parity rebuild)**

*Asked:* Rebuild the extension to be a 1:1 functional copy of the simulation. Every component in the simulation source needs a working equivalent inside the extension. The full status card with classifier meta (priority, deadline, risk). The full glossary with per-term expand and email-context blocks. Case memory with progress checklist. Inline date picker on every detected date. All 5 escalation modes, not the 2-mode version. Reminder center with filter pills, grouping (Overdue, Today, This Week, Upcoming, Completed), countdown, snooze, and restart-walkthrough. Accessibility menu with text size, high contrast, simplified view, and read-aloud. The guide overlay has to spotlight elements on the real Gmail page with the highest possible stacking order so it wins against Gmail's own chrome.

*Produced:* The content script grew from around 700 lines to around 1700 lines, almost all of it rendering plus Gmail page-reading logic. A single state object mirroring the simulation's React state (language, tab, walkthrough, reminders, accessibility settings, panel position and size, picker states). A classifier function that branches between DDS, Bill, Appointment, Delivery, and Generic analyzers based on email content. A post-processor that adds the classifier meta (icon, priority, deadline, risk), case data, walkthrough confirm labels, and glossary email-context blocks to every analysis, so the structure is identical across email types. The guide overlay mounts to the page body at one below the panel's stacking order, with a darkening cutout effect on everything around the spotlighted element. Selectors target real Gmail elements like the DDS site link, the sender's email, and the body container.

*Decision:* Verified parity by walking through every component in the simulation source and confirming an equivalent render path in the extension. The trickiest part was the Gmail selectors. Gmail reshuffles classes between conversation-view and threaded-view, so I used multi-selector fallbacks and a mutation observer on the page body to catch hash-route changes. Also discovered that Gmail's compose overlay has its own high stacking order, so the panel needed the maximum possible value to always win. Bumped the version to 1.0.0 and verified it loads via Chrome's extensions page in unpacked mode.

---

**Entry 8, May 27, 2026 (Session 20, Floating panel + 8 resize handles + reminder date picker)**

*Asked:* Make the extension panel a real floating window like the simulation. Drag-by-header, resizable from all sides, minimize-to-pill state. Also: the "Save this email as a reminder" button currently auto-saves with no date prompt. Make it open the same picker the date cards use (Tomorrow, Next week, custom date, no date).

*Produced:* For the floating panel: a drag handler attached to the panel header that updates the position state on mouse down, move, and up. A single bottom-right resize handle that updated the size state. A minimize-to-pill state showing a small chip with the language label, the bell, and the reminder count. For the reminder picker: an inline picker block that drops in below the action checklist when the button is clicked. Three quick buttons (Tomorrow, Next week, No date), a date input with a Set button, and a Cancel link. Saves through the same add-reminder path as the date cards so reminders land in the Reminder Center with a real countdown.

*Decision:* Pushed back on the resize implementation. A single bottom-right handle isn't discoverable and only resizes one direction. The simulation uses an 8-handle resize library, which gives you handles on all 4 corners and all 4 edges. Directed AI to add all 8, with the correct cursor for each (diagonal cursors on the corners, vertical and horizontal cursors on the edges). The non-obvious part was the math for the top and left edges. Those resize from the top or left, which means you have to update both the position and the size simultaneously so the panel grows toward the cursor instead of jumping. The bottom-right corner is the visible grip (a diagonal stripe pattern); the other 7 are invisible until hover so the panel doesn't look like it has hairs growing off it. Both position and size persist to browser storage so mom doesn't have to re-place the panel every time she opens Gmail. For the reminder picker, AI's first draft saved every reminder with a "renewal" category regardless of email type, which meant the Reminder Center filter pills were broken. Clicking "Bills" or "Appointments" showed nothing. Fixed the category to map from the analyzer's email type (a bill goes to payments, an appointment goes to appointments, a delivery goes to deliveries, and so on) so the filter pills actually do real work.

---

## Records of Resistance

> *5 documented moments where AI output was rejected or significantly revised. Each names what AI gave, what was done instead, and why.*

**Record 1, May 27, 2026 — The panel was fixed to the right side, not floating**

*What AI produced:* The first version of the Chrome extension pinned the panel to the right edge of the viewport with a full-height fixed sidebar (about 430 pixels wide), a left border, and a drop shadow. No drag, no resize, no minimize. AI's reasoning was that this "matches Grammarly and Gmail's native side panels, so users will recognize the pattern."

*Why I rejected it:* The Grammarly comparison sounds clean on paper but breaks the moment you sit it in front of a real user. Mom's MacBook isn't a 27-inch monitor. A full-height panel literally *covered the email she was trying to read*. Gmail already puts Calendar, Tasks, and Keep on the right, so the panel was either fighting with those for the same real estate or completely hiding the email body. Worse, the *simulation* she'd seen during First Contact had a floating draggable window. Switching to a fixed sidebar for the "real" version made the extension feel like a downgrade and broke the trust she'd built with the demo. The brief says the deliverable is *evidence that you helped someone*, not a tool she has to wrestle with before it helps.

*What I did instead:* Rebuilt the panel as a true floating window. Drag-by-header, with the position remembered across page reloads. Eight resize handles, on all 4 corners and all 4 edges, matching the same resize behavior the simulation uses. The corner handles use diagonal cursors and the edge handles use the matching vertical and horizontal cursors. The trick on the top and left edges is that they resize from the top or left, which means the panel has to update both its position and its size at the same time, so the panel grows toward the cursor instead of jumping. Minimize-to-pill state shrinks the panel into a small chip showing the language label, the bell, and a count badge. The pill is also draggable. Both position and size persist, so mom never has to re-place the panel between page navigations.

---

**Record 2, May 26, 2026 — There was no walkthrough or reminder system**

*What AI produced:* The first cut of the extension had a summary card, an action checklist with checkboxes, and a tiny safety verdict. That was it. No walkthrough mode, no reminder system at all. AI's logic: "Mom can read the summary and check things off, that's the core loop. Walkthroughs and reminders are nice-to-haves we can add later." It even tried to argue that adding more features would clutter the panel and overwhelm her.

*Why I rejected it:* Both features came directly out of the research, not out of feature-creep. From the interview transcript: *"If I don't understand it right away, I get tired thinking about it and tell myself I'll do it later… but then I forget."* That's not a comprehension problem, that's a forgetting problem, and a checklist doesn't solve it. Same with the walkthrough. She'd often *understand* an email and still freeze at "which thing do I actually click?" Stripping these out doesn't simplify the tool; it removes the parts that addressed her *actual* pain points. Calling them "nice-to-haves" was AI optimizing for a clean codebase instead of for mom.

*What I did instead:* Built both as first-class features. **Walkthrough Mode**: a bottom-anchored bar with a step counter, instruction text, Back / Pause / Confirm buttons, and a per-step spotlight that highlights the matching element in the live Gmail email. Has a "🐢 Slow mode" indicator and an "I Need More Help" escalation hatch. **Reminder System**: every detected date in an email gets an inline picker (Tomorrow, Next week, custom date, no date), plus a "Save this email as a reminder" button on every action checklist. A full Reminder Center with filter pills (All, Urgent, Renewals, Appointments, Bills), grouped by Overdue, Today, This Week, Upcoming, Completed, with countdown labels like "⚠ Overdue" and "Due in 3 days", snooze-one-day, and a restart-walkthrough button that re-launches the guided flow from inside a reminder card.

---

**Record 3, May 27, 2026 — "Show me where" didn't actually highlight on the email**

*What AI produced:* The first implementation of "Show me where" rendered the spotlight *inside the panel*, not over the Gmail email body. Clicking the button would draw a fake outline around a placeholder area inside the helper. AI defended this as "showing the pattern", implying mom would mentally map the panel mockup onto the real email. There was also a version where the highlight did try to render over Gmail but stacked under Gmail's compose overlay, so the spotlight was effectively invisible behind other UI.

*Why I rejected it:* The entire reason mom needs the feature is because she *can't* mentally map an abstract pointer to the right pixel. That's the comprehension gap. A spotlight that lives inside the helper panel is just a description of a button, not a pointer to it. From the testing notes: "she still hesitated even after reading the summary." That's the moment the spotlight is supposed to resolve, and a panel-internal indicator does nothing for it. Also, a fancy highlight that loses the stacking-order fight with Gmail is worse than no highlight, because she'll click the button, see nothing change, and assume the tool is broken.

*What I did instead:* Moved the guide overlay completely outside the panel. It now mounts directly to the page body at one stacking level below the panel itself (which sits at the maximum possible value), so it always wins against Gmail's chrome. It queries the live Gmail page to find the actual target element (the renewal link, the sender's email, the body container), scrolls it into view, then draws a pulsing blue border with a dimming cutout effect (everything around the target darkens, the target glows). A tooltip with a multi-line label appears to the left of the helper panel so it never covers the email. For the "I still can't find it" escalation, the highlight enters enhanced mode, with a thicker border, brighter glow, and a bouncing arrow above the target, so mom can find it on a second pass without me sitting next to her.

---

**Record 4, May 26, 2026 — The plugin wasn't transferring all the simulation's features**

*What AI produced:* When I asked for the Chrome extension version of the panel I'd built in the simulation, AI shipped a stripped-down translation. Just a summary card and a 2-option escalation overlay ("more explanation" / "human help"). Missing entirely: the full status card with priority, deadline, and risk meta, the per-term glossary expansion with email-context blocks, the case-memory section with progress checklist, the inline date picker, the 5-mode escalation flow, the read-aloud, and the simplified-view toggle. AI defended this as "the right scope for a v1, ship something working first, expand later."

*Why I rejected it:* This is the most consequential resistance moment in the whole project, because if I'd accepted it, the case study would have collapsed. The simulation is what mom already saw in First Contact. That's the version that earned her trust. Installing a *weaker* extension on her real Gmail would have meant her actual lived experience of the tool was worse than the demo she'd already responded to. The brief reads *"It must be in the hands of the person you designed it for"*, and "it" has to mean the version she's already validated, not a fork of it. Also, "ship v1 first, expand later" is a startup heuristic that doesn't survive contact with an academic deliverable due in 48 hours. There was no "later." There was only "ship the real thing or ship a tool that loses the case study."

*What I did instead:* Rebuilt the extension to exact feature parity with the simulation. Every component in the simulation got a working equivalent inside the extension: full status card with classifier meta, full glossary with per-term expand and email-context, case memory with progress tracking, inline date picker on every detected date, all 5 escalation modes (cant-find, slower, scared, dont-understand, human), reminder center with filter pills, grouping, snooze, and restart-walkthrough, accessibility menu with read-aloud, walkthrough bar with slow-mode indicator. The extension content script grew from around 700 lines to around 1700 lines, almost all of that being the rendering layer plus the live Gmail page-reading logic (selectors that survive Gmail's conversation-view reshuffles). The state graph mirrors the simulation's React state exactly, just held in a single state object.

---

**Record 5, May 27, 2026 — Accessibility settings weren't actually working**

*What AI produced:* The first pass at the accessibility menu had four toggles: text size (Normal, Large, XL), high contrast, reduce motion, and simplified view. UI-wise the menu looked fine. Switches flipped, sizes selected. But: the text-size buttons added a styling class to the panel that only had a font-size bump on a couple of specific elements, so most text didn't actually scale. High contrast added a class but the panel still pulled colors from variables that didn't get overridden under that class, so the panel stayed white-on-light-gray. And the simplified-view toggle was the worst case. It gated almost *every* secondary section behind the simplified check, so flipping it on hid the entire glossary, case memory, key details, AND warnings cards, leaving an empty-looking panel that felt broken.

*Why I rejected it:* This is the accessibility-theater failure: settings that *look* like they work in the menu but don't actually change the experience. For mom that's worse than no settings at all, because she'll toggle one, see no difference, and assume she did something wrong. The simplified-view failure was the most insulting: the goal of "simplified" is *calmer*, not *emptier*. Hiding the supportive sections (glossary, case memory) leaves only the high-pressure parts (Status, Actions) visible, which is the opposite of what someone overwhelmed by an email needs. Accessibility settings have to be the most reliable thing in the panel because the people who turn them on are the people who can least afford to debug them.

*What I did instead:* Three fixes. First, **text size** now applies a real zoom on the panel root directly, which scales every child element uniformly without me having to thread a font-size override through every individual element. Second, **high contrast** uses a dedicated mode that overrides every panel surface to near-black backgrounds with high-contrast text. Header, body, cards, list items, section headers, all of it, verified by toggling and watching every section flip. Third, **simplified view** got narrowed to *only* hide the two dense list-style cards (Key Details, Warnings). Glossary, case memory, and the action checklist all stay visible. The supportive sections aren't the noise, they're the support. Also added "Read aloud" using the browser's built-in speech, scoped to Korean or English based on the current language setting, with a yellow highlight on the currently-spoken element so she can follow along visually.

---

## User Testing Evidence

> *Documented evidence of the real person using the prototype.*

### Initial Reactions

After mom interacted with the working prototype:
- She immediately understood the simplified action sections
- She responded positively to calmer, more conversational language
- The reminder feature felt intuitive without explanation
- She wanted a clearer place to revisit saved reminders later
- She asked for additional guidance options when she still felt unsure about what to do next

### Field Testing Documentation

Mom testing the prototype on her actual laptop in her actual environment — the helper panel visible on the right side of Gmail, with the bilingual summary, action checklist, and reminder picker open.

<p align="center">
  <img src="docs/testing/mom-02-reading-panel.jpeg" width="320" alt="Mom reading the bilingual summary in the helper panel" />
  &nbsp;
  <img src="docs/testing/mom-04-clicking.jpeg" width="320" alt="Mom interacting with the action checklist" />
</p>

<p align="center">
  <img src="docs/testing/mom-05-panel-closeup.jpeg" width="500" alt="Close-up of the helper panel: bilingual summary on the left, action checklist with reminder picker on the right" />
</p>

The third image shows what she was actually reading: the Korean/English summary of a DDS license-renewal email on the left side of the panel, with the action checklist + reminder options on the right. This is the moment the tool had to work — not a demo, not me explaining it, just her looking at a real email and the panel telling her what mattered.

### What the Testing Changed

Each of the observations above mapped to a specific change in the build:

| What I observed | What changed in the prototype |
|---|---|
| She immediately understood simplified action sections | Kept simplified mode but narrowed it to hide only dense list-style cards (Key Details, Warnings), not the supportive sections (Glossary, Case Memory) |
| Calmer language worked | Korean tone locked to 해요체 — polite but not stiff. Emoji used sparingly to signal type, not decorate |
| Reminder feature felt intuitive without explanation | Date picker promoted from a hidden secondary action to a prominent button on every detected date + a "Save this email as a reminder" button at the bottom of every action checklist |
| Wanted a clearer place to revisit saved reminders | Built the full Reminder Center with filter pills (All / Urgent / Renewals / Appointments / Bills), grouped by Overdue / Today / This Week / Upcoming, with countdown labels and snooze |
| Asked for more guidance when unsure | Added the "I Need More Help" escalation flow with 5 modes (cant-find, slower, scared, dont-understand, human) — including a slow-mode walkthrough and enhanced guide highlight with a bouncing arrow |

---

## Five Questions Reflection

### Can I defend this?

Yes. Almost every major decision came directly from observing how my mom actually interacts with stressful emails. The bilingual support exists because she naturally switches between Korean and English while reading. The simplified summaries came from watching her reread the same paragraph multiple times trying to figure out what actually mattered. The walkthrough mode happened because she often understands the information, but still feels unsure about what to physically click or do next. Even the calmer tone and simple interface came from noticing that she shuts down when something feels visually overwhelming or too technical. I can trace the features back to specific observations and conversations instead of just adding things because they sounded impressive.

---

### Is this mine?

Yes. AI helped me build faster, but the direction of the project was always based on my own understanding of my mom and the problem space. A lot of the core decisions existed before building started, especially the focus on emotional clarity, action steps, and reducing intimidation instead of just translating text. There were multiple moments where I adjusted or simplified AI outputs because they felt too robotic, too visually busy, or disconnected from how my mom actually thinks. I wasn't asking AI to invent the experience for me. I was using it to help execute and iterate on ideas that came from my own research and lived experience.

---

### Did I verify?

I did. The project was tested with my mom directly, not just in browser or with classmates pretending to be users. Watching her interact with the prototype changed a lot of my assumptions. Some features that I thought were obvious needed more guidance, while other things worked immediately without explanation. The walkthrough flow especially evolved after seeing moments where she still hesitated even after reading the summary. Testing with the real person made the project feel much more grounded because I could see where confusion, confidence, and hesitation were actually happening in real time.

---

### Would I teach this?

I think I could. One of the biggest things I learned during this project was how important it is to connect research directly to interaction decisions. I understand why the state architecture works the way it does, why the language system was centralized, and why the experience needed to live inside the email context instead of becoming a separate app. I could also explain the reasoning behind the walkthrough system, the escalation support, and the emotional design decisions because they all came from real observations instead of abstract UX language. More than anything, this project taught me how much stronger design decisions become when they are tied to a real person instead of a hypothetical user.

---

### Is my disclosure honest?

Yes. The AI Direction Log reflects the actual process pretty honestly. AI played a large role in helping build and iterate on the prototype quickly, especially on the technical side, but the project wasn't generated automatically. The research, problem framing, testing observations, and many of the design corrections came from me. I also documented moments where I rejected or changed outputs because they didn't align with the experience I was trying to create for my mom. I think the final project reflects both the reality of using AI as a design and build tool and the importance of still making intentional human decisions throughout the process.

---

## Post-Mortem

### What worked

One of the biggest things that worked was designing for a real person instead of trying to make something for everyone. Because I already understood my mom's habits, frustrations, and comfort level with technology, a lot of the design decisions felt much more intentional and grounded. The bilingual summaries, walkthrough mode, safety checks, and calmer interface all came directly from things I observed during research and testing.

The walkthrough system especially ended up becoming more important than I originally expected. During testing, I realized that understanding the email was only part of the problem. She still needed reassurance while taking action, especially when dealing with official websites or forms. Breaking actions into smaller guided steps made the experience feel much less intimidating.

Another thing that worked well was keeping the tool inside the email context instead of making a separate app. The project became much stronger once I stopped thinking about "translation" and started thinking about reducing emotional and cognitive overload during real moments of stress.

### What failed

One thing that did not work initially was assuming that summaries alone would solve the problem. Early versions focused mostly on explaining the email, but during testing I realized there was still hesitation around what to click, whether something was safe, and whether she was doing the right thing. The experience needed more guidance and reassurance than I originally planned for.

I also underestimated how difficult it is to keep a tool feeling simple while still adding meaningful functionality. Some early interface ideas became too visually busy or too feature-heavy, which actually made the experience feel more stressful instead of supportive. A lot of the iteration process became about simplifying and removing things.

### What I would do differently

If I had more time, I would continue developing the extension beyond the prototype environment and integrate it directly into real external websites and live email workflows. Right now, the project successfully simulates the Gmail experience, but I would want the extension to function seamlessly across actual inbox environments where my mom already spends her time. I think testing the system in fully live situations would reveal even more about how people interact with stressful emails in real moments.

I would also expand the reminder and follow-up system because testing showed that remembering to return to tasks was a major pain point.

I would spend more time testing with additional immigrant parents or older adults with similar challenges as well. Even though the project was intentionally designed around one person, broader testing could help identify other behaviors and accessibility needs I may not have considered.

Another thing I would improve is the escalation support system. The "I Need More Help" feature started becoming one of the strongest parts of the experience because it acknowledged that technology cannot solve every moment of confusion independently. I would continue exploring how the extension could offer support without making users feel dependent or embarrassed.

### What I learned about designing for a real person vs. a hypothetical user

Designing for a real person completely changed the way I approached the project. With hypothetical users, it is easy to make assumptions or design around generalized UX patterns. But with my mom, I could immediately see when something felt unrealistic, overwhelming, or disconnected from how she actually behaves.

The project became less about making something visually impressive and more about creating something emotionally supportive and usable in real situations. Small decisions mattered much more because I could directly observe their impact during testing.

I also learned that real problems are usually more emotional than they first appear. At the beginning, I thought the issue was mostly language translation. But through research and testing, I realized the larger problem was uncertainty, fear of making mistakes, and feeling overwhelmed by important communication.

Working with a real person made the project feel much more honest, personal, and meaningful than designing for a generic audience ever could.

---

## Case Study Presentation

> *Portfolio-ready slide deck for Session 20. Not a demo — a defense.*

**Open:**
- **PDF (18 pages, 16:9):** [`docs/case-study/AI201- CaseStudyPres.pdf`](docs/case-study/AI201-%20CaseStudyPres.pdf)
- **Interactive HTML:** [`docs/case-study/index.html`](docs/case-study/index.html) — open in browser, use → / ← arrow keys to navigate, press `F` for fullscreen

**18 slides covering:**
1. Cover
2. Outline
3. The Person (mom)
4. The Problem (big quote)
5. Pain Points (5 cards)
6. Direct Quotes
7. Platform Decision
8. The Build — overview (laptop mockup of final extension)
9. The Build — Show Me Where + Walkthrough (laptop mockup)
10. The Build — Reminder Center (laptop mockup)
11. **Prototype Failures** (section divider)
12. Failure 01 — Minimal extension (laptop mockup of stripped v1)
13. Failure 02 — Fixed sidebar covering email (laptop mockup of v2)
14. Failure 03 — Silent reminders (laptop mockup of v3)
15. First Contact (4-photo grid of mom testing)
16. What Testing Changed (observation → fix table)
17. What I Learned
18. Closing

**Style:** clean blue theme (matches the panel's accent), heavy sans-serif headlines with terminal periods, vertical brand label on the right edge, MacBook-frame mockups for the build and the prototype failures so the failures are *visible* not just described.

---

## Marketing Minute

> *A 60-second commercial for the tool, formatted for YouTube.*

| Platform | Format | File | Dimensions | Duration |
|---|---|---|---|---|
| **YouTube** | 16:9 horizontal | [`marketing-minute-youtube.mp4`](docs/marketing-minute/marketing-minute-youtube.mp4) | 2698 × 1486 | 63s |

**Source:** Generated with ElevenLabs AI video and voiceover.

---

## Submission Checklist

- [ ] Live URL verified in incognito window
- [ ] Git history clean
- [x] Design Argument written
- [x] Research documentation complete (quotes, environment, workarounds)
- [x] Platform Rationale written
- [x] System Architecture Diagram (Mermaid) accurate to final build
- [x] AI Direction Log — 5+ entries (6 entries)
- [x] Records of Resistance — 3+ entries
- [x] User Testing Evidence uploaded (5 photos in `docs/testing/`)
- [x] Five Questions Reflection complete
- [x] Post-Mortem complete
- [x] Marketing Minute (60-second video, YouTube 16:9)
- [x] Case study presentation built (`docs/case-study/index.html` — 18 slides)
- [ ] Case study presentation rehearsed
- [ ] Submitted to Blackboard
