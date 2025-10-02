Acme Cybersecurity Agency — Lab Worksheet
Duration: 60 minutes
Objective: Explore application behavior, validate authentication, and identify insecure patterns (instructor will instruct when insecure endpoints are enabled).

Prerequisites:
- Basic web browser & ability to run Node.js locally (or provided VM)
- Instructor will provide access to the lab instance

Steps:

1. Start the app (instructor will provide or run):
   - npm install
   - npm run seed
   - npm start
   - Open http://localhost:3000

2. Sign in:
   - Try user accounts: alice / password123
   - Try admin account: carol / adminpass
   - Observe how the UI changes for admin vs user.

3. Inspect announcements:
   - Browse Announcements page and navigate pages.
   - Note how content is loaded (paginated API).

4. Admin console:
   - As admin, publish a new announcement (title + body).
   - Refresh announcements and confirm your new item appears.

5. User listing (admin-only):
   - Click "Refresh User List" and examine the returned user list.

6. Search:
   - Use the Search field to find terms present in announcements.
   - (Instructor may enable the insecure search endpoint; follow instructor instructions before trying any injection payloads.)

7. Reporting:
   - Write a one-paragraph observation describing one security improvement you would recommend and why (e.g., avoid returning all users, secure secret storage, parameterized queries).

Deliverable:
- Submit a short report (1 page) with your observation and one remediation recommendation.
