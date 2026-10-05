# Plan: daily-fact

## Files

| File | Change | Why |
|---|---|---|
| `app/src/components/DailyFact.tsx` | add | The card. Picks today's fact. |
| `app/src/App.tsx` | change | Render the card on Home after the Learn and Quiz tile. |

## Components

- `DailyFact()`: loads quiz.json (small, precached), picks `items[dayNumber % items.length]`, renders the quote, the FAQ question, and a link to `#/learn/<slug>`.
- Reuses `useData` and `slugOf`.

## Data

- quiz.json `source_quote`, `faq_question`, `faq_url`.
- Day number: whole days since 1970-01-01 in the device's local time zone.

## Steps

- [ ] 1. Card and placement on Home. (AC 1 to 6)

## Test cases

1. AC 1: open home. Expect the card with a quote, the FAQ question, and the link.
2. AC 2: read the quote and question. Find the FAQ in faqs.json. Expect the answer to contain the quote.
3. AC 3: tap the link. Expect the lesson for that FAQ.
4. AC 4: set the clock to two dates a day apart. Expect different quotes. Set the first date again. Expect the first quote.
5. AC 5: load once with the service worker, go offline, reload. Expect the card.
6. AC 6: check scroll width and the link height.

Every acceptance criterion has a test case. No gaps. No new dependency.
