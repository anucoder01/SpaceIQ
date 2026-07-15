git add backend/models/Venue.js backend/seed.js
git commit -m "feat: add schema coordinates to Venue model and backend seed script"
git push origin main

git add backend/controllers/bookingController.js backend/routes/api.js
git commit -m "feat: implement backend routes for users search and today bookings"
git push origin main

git add frontend/src/components/EmployeeSearch.jsx
git commit -m "feat: add EmployeeSearch component for wayfinding"
git push origin main

git add frontend/src/components/BookingForm.jsx
git commit -m "feat: implement interactive booking modal"
git push origin main

git add frontend/src/components/FloorPlanMap.jsx
git commit -m "feat: update floor plan map to use database venues and add animations"
git push origin main

git add frontend/src/pages/Dashboard.jsx
git commit -m "feat: integrate employee search and interactive floor plan into dashboard"
git push origin main
