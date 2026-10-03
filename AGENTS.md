<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git & Versioning Strategy

1. **Production Branch (`main`)**:
   - Represents the stable released production version (currently v1.0).
   - **NEVER** make direct commits, pushes, or merges to `main` autonomously.
   - Any updates or merges to `main` require explicit written confirmation from the user.

2. **Development / Test Branch (`develop`)**:
   - Default destination for all daily work, tests, and new features.
   - When asked to commit, save, or push, the target is ALWAYS `develop` (or a `feature/...` branch derived from it), never `main`.

3. **Execution Guardrails**:
   - Before executing any `git commit` or `git push`, always verify that the active branch is NOT `main`.
   - If a Pull Request is needed, ensure the target base branch is `develop`.
