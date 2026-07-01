---
globs: "**/*.{ts,tsx}"
description: This rule ensures that the migration from Flashcards to
  KnowledgeNodes is done incrementally and without breaking changes.
alwaysApply: true
---

KnowledgeNode must become the primary entity for flashcards. Flashcards should be a view of KnowledgeNodes. The SM-2 algorithm metadata must be moved to KnowledgeNode's metadata. Maintain backward compatibility and do not break existing functionality.