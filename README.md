# React Vite Dashboard Setup

- Vite + React project scaffolded and running.
- Next steps: 
  - Add responsive dashboard UI (convert from templates/dashboard.html).
  - Integrate Axios for API calls (base URL from .env).
  - Ensure good UX/UI and responsiveness (mobile, tablet, laptop, desktop).
  - Prepare for API integration using provided code and openai.json.

## Development
- Run `npm run dev` to start the development server.
- Edit source files in `src/`.

## Environment Variables
- Use `.env` file for Vite (e.g., `VITE_API_BASE_URL`).

---

This README will be updated as features are added.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
