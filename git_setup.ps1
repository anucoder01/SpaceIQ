git init
git add LICENSE .gitignore
git commit -m "docs: Add proprietary license and gitignore"
git add frontend/
git commit -m "feat: Initialize frontend with Vite and Tailwind"
git add backend/
git commit -m "feat: Initialize backend server and models"
git branch -M main
git remote add origin https://github.com/anucoder01/SpaceIQ.git
git push -u origin main
