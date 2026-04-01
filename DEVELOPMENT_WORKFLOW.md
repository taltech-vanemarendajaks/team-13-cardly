# Cardly - Development Workflow

Step-by-step guide for working on features using Shortcut and GitHub.

## 1. Pick up a story

- Open the [Shortcut board](https://app.shortcut.com/cardly)
- Look at stories assigned to you in the **To Do** column
- Move the story to **In Progress**

## 2. Create a branch

- Open the story and click the **git branch icon** next to the Story ID
- Copy the generated branch name (e.g., `feature/sc-123/card-editor`)
- In your terminal:

```bash
git checkout main
git pull origin main
git checkout -b feature/sc-123/card-editor
```

Shortcut will automatically link the branch to the story.

## 3. Develop

- Make your changes on the feature branch
- Commit often with meaningful messages, include the story ID:

```bash
git add <files>
git commit -m "Implement card template selector [sc-123]"
```

- Push your branch:

```bash
git push -u origin feature/sc-123/card-editor
```

## 4. Open PR to dev

When the feature is ready for integration testing:

- Go to GitHub and open a Pull Request
- **Base branch:** `dev`
- **Compare branch:** your feature branch
- **Title:** include `[sc-123]` so Shortcut links the PR
- **Description:** explain what the PR does and how to test it
- Assign at least one teammate as reviewer on GitHub
- In Shortcut: move the story to **Code Review** and assign the reviewer as **Owner**

## 5. Code review

**As a reviewer:**

- Check the code for correctness, readability, and edge cases
- Leave comments or approve
- If changes are needed, request changes on the PR and move the story to **Reopened** in Shortcut

**As the author:**

- When your story is in **Reopened**, move it back to **In Progress**
- Address review comments and push fixes to the same branch
- Re-request review and move the story back to **Code Review**

## 6. Merge to dev

- Once approved, merge the PR into `dev`
- Test your feature in `dev` alongside other in-progress work
- Fix any integration issues on the same feature branch and push again

## 7. Open PR to main

After the feature is tested in `dev`:

- Open a **new Pull Request** from the **same feature branch** to `main`
- Get it reviewed and approved
- Merge to `main`
- Move the story to **Done** in Shortcut

## 8. Clean up

- Delete the feature branch on GitHub (GitHub offers this after merge)
- Locally:

```bash
git checkout main
git pull origin main
git branch -d feature/sc-123/card-editor
```

## Local Auth Testing

Google OAuth now uses a cookie-based refresh flow:
evokes the stored refresh-token hash in the database

- `GET /auth/google` starts the OAuth flow
- `GET /auth/google/callback` sets the refresh token as an `HttpOnly` cookie and redirects to the frontend
- `POST /auth/refresh` reads the refresh token from the cookie and returns only a short-lived access token
- `POST /auth/logout` clears the refresh-token cookie and r
Local development defaults:

- refresh-token cookie uses `secure=false`
- refresh-token cookie uses `SameSite=Lax`
- frontend requests to the backend must include credentials, for example `fetch(..., { credentials: 'include' })`

Production defaults:

- refresh-token cookie must use `secure=true`
- backend must be served over HTTPS
- for cross-site frontend/backend deployments, use `SameSite=None`
- frontend requests must still include credentials

When testing locally, expect `/auth/refresh` responses to return only:

- `accessToken`
- `accessTokenExpiresIn`

## Quick Reference

| Step           | Action                              | Where               |
| -------------- | ----------------------------------- | ------------------- |
| Pick story     | Move to In Progress                 | Shortcut            |
| Create branch  | Copy from Git Helpers               | Shortcut + Terminal |
| Develop        | Commit with `[sc-XX]`               | Terminal            |
| PR to dev      | Open PR, assign reviewer            | GitHub + Shortcut   |
| Code review    | Review and approve                  | GitHub              |
| Changes needed | Reviewer moves story to Reopened    | Shortcut            |
| Fix & resubmit | Move to In Progress, fix, then back to Code Review | Shortcut + Terminal |
| Merge to dev   | Test integration                    | GitHub              |
| PR to main     | Open PR from same branch            | GitHub              |
| Done           | Move story, delete branch           | Shortcut + Terminal |

## Commit Message Format

```
<short description> [sc-XX]
```

Examples:

```
Implement card editor layout [sc-123]
Fix Google OAuth callback URL [sc-456]
Set up Docker Compose for PostgreSQL [sc-789]
```

Keep messages concise and in imperative mood ("Add", "Fix", "Update", not "Added", "Fixed", "Updated").

## Tips

- **Always branch from `main`**, never from `dev`
- **Never merge `dev` into `main`** — features go to main individually
- **Keep PRs focused** — one feature per PR, avoid mixing unrelated changes
- **Pull `main` before creating a new branch** to avoid merge conflicts
- **Include `[sc-XX]`** in branch names, commits, and PR titles for automatic Shortcut linking
