# PantryPal

PantryPal is a mobile-friendly Next.js app that turns the ingredients you already have into realistic meal ideas with short instructions, dietary-aware generation, favorites, and a checklist grocery panel for missing items.

## Tech Stack

- Next.js 16 with the App Router
- React + TypeScript
- Tailwind CSS
- OpenAI API for meal generation

## Features

- Comma-separated ingredient input
- `Lazy Mode` for the fastest meal ideas
- `Struggle Mode` for meals that work with very few ingredients
- Dietary filters for `Vegetarian`, `Dairy-free`, `Gluten-free`, and `High protein`
- 3 to 5 AI-generated meal cards
- Labels for `Uses most ingredients` and `Requires 1-2 extra items`
- Loading states and empty-input validation
- Regenerate button
- Recent searches saved in local storage
- Saved favorite meals in local storage
- Grocery checklist for common missing items
- Vercel-ready deployment config and app metadata
- Automatic demo fallback when the live OpenAI API is unavailable or out of quota

## Project Structure

```text
pantrypal/
|-- .env.example
|-- .eslintrc.json
|-- .gitignore
|-- README.md
|-- next.config.mjs
|-- next-env.d.ts
|-- package.json
|-- postcss.config.js
|-- tailwind.config.ts
|-- tsconfig.json
|-- vercel.json
`-- src/
    |-- app/
    |   |-- api/
    |   |   `-- generate/
    |   |       `-- route.ts
    |   |-- globals.css
    |   |-- layout.tsx
    |   |-- manifest.ts
    |   |-- robots.ts
    |   `-- page.tsx
    |-- components/
    |   |-- favorites-section.tsx
    |   |-- filter-summary.tsx
    |   |-- grocery-list.tsx
    |   |-- history-list.tsx
    |   |-- ingredient-form.tsx
    |   |-- meal-card.tsx
    |   |-- mode-toggle.tsx
    |   `-- results-section.tsx
    |-- lib/
    |   |-- constants.ts
    |   `-- ingredients.ts
    `-- types/
        `-- meal.ts
```

## Local Setup

### 1. Install Node.js

Install Node.js 18.18+ or 20+ first.

### 2. Install dependencies

```bash
npm install
```

### 3. Add your OpenAI API key

Create `.env.local` in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the app

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deployment

### Vercel

1. Push the project to GitHub
2. Import the repo into [Vercel](https://vercel.com/)
3. Add the `OPENAI_API_KEY` environment variable in the Vercel project settings
4. Deploy

The included [vercel.json](C:/Users/kgb19/OneDrive/Documents/New%20project/vercel.json) adds a small baseline of security headers, and the app already builds cleanly in production mode.

## How It Works

1. Enter ingredients like `chicken, rice, cheese, tortillas`
2. Pick `Lazy Mode` or `Struggle Mode`
3. Add any dietary filters you want applied
4. Click `Generate meals`
5. PantryPal calls the Next.js API route at `/api/generate`
6. The OpenAI API returns structured meal suggestions for the UI cards
7. Save favorites or check off missing grocery items

## Notes

- The app stores recent ingredient searches in browser local storage.
- The regenerate button reuses the last successful ingredient list and active filters.
- Favorite meals and grocery checklist state are saved in local storage.
- The API sanitizes the AI response before returning it to the UI.
- If the OpenAI API key is missing or the API returns quota/auth errors, PantryPal switches to a local demo generator so presentations can continue.

## Next Improvements

- Add user accounts and synced meal history
- Add pantry staple profiles and servings
- Add shopping export and sharing
