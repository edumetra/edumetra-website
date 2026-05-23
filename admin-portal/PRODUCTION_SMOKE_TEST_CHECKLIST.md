# Production Smoke Test Checklist (Admin Portal)

Run this checklist after deploying SQL/policy fixes and before opening full portal usage.

## 1. Access and Login
- Admin login works with valid credentials.
- Non-admin user cannot access admin pages.

## 2. Rankings (Critical)
- Create a new ranking entry.
- Edit the ranking.
- Delete the ranking.
- Bulk import a small CSV (2-3 records).
- Confirm new records are visible in list view.

## 3. Events (Critical)
- Create a new event.
- Edit the event.
- Delete the event.
- Open registrations modal for an event.

## 4. Premium Locks
- Toggle at least one free and one premium section.
- Use "Apply Globally" and verify the update is reflected for multiple colleges.

## 5. College Data
- Edit one college profile field and save.
- Update one course record and one cutoff record.

## 6. Media Uploads
- Upload one article image.
- Upload one college image.
- Confirm image URL is saved and renders.

## 7. Public Site Validation
- Open one updated college on public site and verify latest admin changes appear.
- Open events/webinar page and verify new event appears.

## 8. Error Monitoring
- Keep browser console open during test.
- Record any failed request (status code, endpoint, error text).
- Verify no Row-Level Security violation appears for admin actions.

## 9. Rollback Readiness
- If any critical create/update path fails, pause rollout.
- Revert to previous deployment and fix SQL policy before re-test.
