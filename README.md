
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure Overview:
- my-app/ serves as the root directory aka its the main nextjs app.
- app/ contains all routes, components, and logic. Its the main folder we're gonna be working out of. Any code you touch will mainly be under this folder.
- /app/lib contains any functions we use, primarily reusable utility functions and data fetching ones.
- /app/ui contains all ui components like cards, tables, etc.

## General Notes:
- Difference between ts and tsx: ts is TypeScript which is what we'll be using to write logic related code, whereas tsx is TypeScript XML which we'll be using to write/format components.
- Database is between everyone who works on this project, so be careful of the code you write that interacts with it

# Setup:
- Install node, ideally v.22, then run "node -v" to confirm node is installed  Note: You prolly have to add the path to node to your environment variables as well if you're on Windows
- Run "npm install -g pnpm"
- Clone this repo with "git clone {repo url}"
- Run "pnpm install" while in the root directory of the app
- Create .env.local file in root directory of app and add it to your .gitignore file
- Ask Bruhshane to give you database environment variables and insert them into .env.local
- Done
- To run the website locally: Run "pnpm run dev" to build the app and start the server on local host
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
