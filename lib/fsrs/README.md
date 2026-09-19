# Reusable FSRS module

`index.ts` is the public API and `types.ts` contains its storage-neutral types. The module schedules opaque string item IDs and has no knowledge of vocabulary, courses, UI, or databases.

Use `createFsrsCard(itemId)` when an item becomes eligible, `reviewFsrsCard(card, outcome)` after an answer, and `selectDueItems(items)` to select a session. The application passes only `correct` or `incorrect`; these map internally to FSRS **Good** and **Again**. Hard/Easy are never exposed.

A storage adapter converts its rows to/from `FsrsCard`, persists the returned card, and optionally stores the returned review event. In this app that adapter is `lib/fsrs-drizzle.ts`, outside this reusable folder.

To move the scheduler, copy this entire folder and install `ts-fsrs`.
