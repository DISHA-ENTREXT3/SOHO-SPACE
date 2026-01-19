---
description: Standard development and deployment workflow for Soho Space
---

This workflow defines the mandatory steps for making changes to the Soho Space codebase, ensuring quality and developer approval before any code reaches the remote repository.

### **Mandatory Steps:**

1. **Implement Changes**:

   - Write or modify code based on the user's request.
   - Fix any immediate linting or type errors.

2. **Local Verification**:
   // turbo

   - Ensure the development server is running (`npm run dev`).
   - Use the `browser_subagent` or `read_browser_page` to verify the changes visually and functionally on `http://localhost:3000`.
   - Run local tests if applicable (`npm run test`).

3. **Developer Approval**:

   - Report the findings from the local verification to the developer.
   - **Ask explicitly**: "Is this working as expected on your end?"
   - **Ask explicitly**: "Are there any other changes or refinements you would like to make before we push this?"

4. **Iterate**:

   - If the developer requests changes, go back to Step 1.

5. **Deployment Confirmation**:

   - Only after the developer confirms everything is "OK", ask: "Shall I push these changes to GitHub now?"

6. **Push to GitHub**:
   - Once approved, run `git add`, `git commit`, and `git push`.
