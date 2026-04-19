## 2024-05-24 - [Fix CI Failure]
**Learning:** The CI workflow `gemini-review.yml` fails when executed from a fork because the required API keys (e.g., `secrets.GEMINI_API_KEY`) are not available in the fork's environment, causing the `run-gemini-cli` action to error out with 'No authentication method provided'.
**Action:** When updating GitHub Actions workflows that rely on secrets (like `GEMINI_API_KEY`), conditionally skip the specific step using `if: ${{ secrets.GEMINI_API_KEY != '' }}` to prevent failures on PRs from external forks where secrets are unavailable.
