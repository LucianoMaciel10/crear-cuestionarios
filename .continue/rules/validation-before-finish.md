---
description: Always validate the project before considering a task finished.
---

Before finishing any task execute:

npm run build

npm run lint

npx tsc --noEmit

If any command fails:

continue fixing the project.

Do not finish until every validation succeeds.