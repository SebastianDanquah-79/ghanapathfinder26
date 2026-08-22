# Ghana Future Guide

Build a visually stunning, animated, lively single-page web application called "GhanaPath" — the ultimate AI-powered college and career guidance platform for Ghanaian SHS students. This should feel like the most premium product ever built for African students. Alive. Fast. Inspiring.

CORE FEATURES:

1. AI College Recommender

Interactive form where students input:

Intended major/field of study

Expected or actual WASSCE aggregate

Career goal

Preferred region (Accra, Kumasi, Cape Coast, etc.)

Public or private university preference

Use the Claude API (claude-sonnet-4-20250514) to return top 3 personalized university recommendations with: why it fits them, program name, required aggregate, tuition range, and a match confidence score. Response should typewriter-animate in real time.

2. Full Ghana University Directory

Searchable, filterable card grid of ALL major Ghanaian universities including:

University of Ghana (UG) Legon

KNUST Kumasi

University of Cape Coast (UCC)

Ghana Communication Technology University (GCTU)

Ashesi University

UPSA

Central University

Regent University College

Academic City University

UENR

SD Dombo University

C.K. Tedam University

Each card shows: location, public/private, top programs, tuition estimate, admission aggregate, and a campus vibe description.

3. Career & Job Opportunities

AI-generated per major:

Top 5 job roles in Ghana

Top Ghanaian companies hiring

Average salary in GHS

Remote/international opportunities for Ghanaians

LinkedIn search tips

4. Single Student City Guide

AI-generated practical survival guide for students moving alone to Accra, Kumasi, or Cape Coast:

Monthly budget breakdown (rent, food, transport, data)

Best affordable neighborhoods per university

Money management tips

Safety tips

How to network and build a social life

5. Ghanaian Startup Stories

Dynamic card section featuring 8–10 inspiring Ghanaian founder stories (use realistic illustrative examples if real data unavailable, clearly labeled). Each card: founder name, university attended, what they built, key lesson.

6. Startup Preparation Roadmap

Interactive year-by-year timeline for all 4 university years:

Year 1: Mindset, reading list, communities

Year 2: First project, co-founder search, hackathons

Year 3: MVP, customer conversations, grants

Year 4: Launch, pitch competitions, ecosystem map

7. SOCIAL SHARING SYSTEM — CRITICAL FEATURE

After ANY AI result is generated (college recommendation, career guide, city guide), display a shareable results card with the student's name and results beautifully designed. Include one-tap share buttons for:

WhatsApp — share as text link with preview message: "I just found my perfect university match on GhanaPath 🇬🇭"

Facebook — open share dialog with page URL and og:image preview

Instagram — generate a downloadable 1080x1080px graphic card of their results they can post as a story or post (use html2canvas to render and download)

Snapchat — share via Snapchat Creative Kit web link

LinkedIn — share with professional caption: "Exploring my career path in Ghana with AI — check out GhanaPath"

Add a "Copy Link" button and a "Download My Results" button that saves a beautiful PNG card of their AI recommendation.

DESIGN:

Colors: Deep navy, Ghana gold, white — modern and tech-forward

Hero section with animated cycling text: "Find Your University" → "Build Your Career" → "Start Your Company" → "Own Your Future"

Floating particle background animation on hero

Smooth scroll, micro-interactions, hover effects on all cards

Fully mobile responsive

All AI responses typewriter-animate

TECH STACK:

React + Tailwind CSS + Framer Motion

Claude API (claude-sonnet-4-20250514) for all AI content

html2canvas for Instagram card generation

Web Share API for native mobile sharing

No backend needed — all frontend

Make every student who lands on this feel like their future in Ghana just became INEVITABLE.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ghanapathfinder26.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/63cd9f88-72ef-470d-a0e4-ff0f6c149ccf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
