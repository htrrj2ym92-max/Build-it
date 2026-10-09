# Build It

A browser city-building game inspired by Build-a-lot. React + TypeScript + Vite.

Buy unowned lots for $25,000, then build one of six home types or a workshop or sawmill on owned land using materials and the required number of workers. Workshops cost 900 materials and 3 workers; sawmills cost 1,250 materials and 5 workers, and halve material prices and delivery times once built. Each building upgrade costs 20% of its construction materials per star level (for example, 500, 1,000, then 1,500 materials for a 2,500-material castle). Painting and landscaping each cost 10% of the home's construction materials; maintenance restores a home's condition for 20%. Order materials in six quantities. Sell completed homes at any time, collect rent, and complete each level's goals. Progress is saved automatically to localStorage.

## Develop
```
npm install
npm run dev
npm run build
```

## Deploy
Pushes to `main` deploy via GitHub Pages (Settings → Pages → Source: GitHub Actions). The build uses a relative base so it works under any repo path.
