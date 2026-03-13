# Cardly - Branching Strategy

## Branches

| Branch      | Purpose                             | Protected                         |
| ----------- | ----------------------------------- | --------------------------------- |
| `main`      | Production-ready code               | Yes — PR required, no direct push |
| `dev`       | Development and integration testing | Yes — PR required, no direct push |
| `feature/*` | Individual feature/bug/chore work   | No                                |

## Flow

```
main ─────────────────────────────────────●─────────
  \                                      /
   └── feature/sc-123/my-feature ──●────┘
                                    \
dev ─────────────────────────────────●───────────────
```

1. **Create** a feature branch from `main`
2. **Develop** the feature on the branch
3. **Merge** the feature branch into `dev` via PR (integration testing with other features)
4. **Test** the feature in `dev` alongside other in-progress work
5. **Merge** the feature branch into `main` via PR (production release)

## Rules

- Feature branches are **always created from `main`**, never from `dev`
- `dev` is a testing ground only — it **never merges into `main`**
- Features go to `main` **individually** after being validated in `dev`
- `dev` may contain multiple untested features at once — that's expected
- If `dev` gets too messy, it can be reset from `main` without losing anything

## Branch Naming

Branches are auto-generated from Shortcut stories:

```
[story_type]/[story_id]/[story_name]
```

Examples:

```
feature/sc-123/card-editor
bug/sc-456/fix-auth-redirect
chore/sc-789/docker-setup
```

## PR Process

### Feature -> dev

- Open PR from feature branch to `dev`
- At least one code review approval required
- Shortcut story moves to "In Review" automatically

### Feature -> main

- Only after the feature has been tested in `dev`
- Open PR from the **same feature branch** to `main`
- At least one code review approval required
- Shortcut story moves to "Done" when merged to `main`

## Example Workflow

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch (or use Shortcut's "Create branch" button)
git checkout -b feature/sc-123/card-editor

# 3. Develop...
git add .
git commit -m "Implement card editor [sc-123]"
git push -u origin feature/sc-123/card-editor

# 4. Open PR: feature/sc-123/card-editor -> dev
# 5. After review, merge to dev

# 6. Once tested, open PR: feature/sc-123/card-editor -> main
# 7. After review, merge to main (production)
```
