# Database backup and rollback runbook

Use this runbook before applying any schema migration to a non-disposable
NextHop database. Stage 0 does not authorize or perform these commands against
an external database.

## Preconditions

1. Confirm the exact target database and environment with the operator.
2. Stop or place the application in maintenance mode for migrations that can
   conflict with writes.
3. Confirm `pg_dump`, `pg_restore`, and `psql` are installed.
4. Create a local `.backups` directory inside the repository. It is ignored by
   Git and must not be committed.
5. Set `DATABASE_URL` in the current shell without printing it.

## Create and verify a backup

From the repository root in PowerShell:

```powershell
$backupDirectory = Join-Path (Get-Location).Path ".backups"
New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$backupPath = Join-Path $backupDirectory "nexthop-pre-migration.dump"
pg_dump --format=custom --no-owner --no-privileges --file $backupPath $env:DATABASE_URL
pg_restore --list $backupPath | Select-Object -First 20
```

Keep a copy outside the deployment host according to the project's data
retention policy. Do not store the dump in Git or application artifacts.

## Baseline migration rules

The first checked-in migration describes a fresh database. Do not apply it to
an existing database that already contains these tables.

For an existing database:

1. Back it up.
2. Compare its live schema with `db/schema.ts` and the baseline SQL.
3. Resolve drift explicitly.
4. Mark/adopt the baseline only after an operator has confirmed that the live
   schema is equivalent.

Never use `pnpm db:push` against production. Future changes must be generated,
reviewed, backed up, and applied as migrations.

## Rollback order

1. Stop writes.
2. Roll back the application deployment to the previous compatible version.
3. Prefer a reviewed forward-fix when it preserves data.
4. If restoration is required, create a new empty recovery database and restore
   the dump there first:

```powershell
pg_restore --clean --if-exists --no-owner --no-privileges --dbname $env:RECOVERY_DATABASE_URL $backupPath
```

5. Validate row counts, foreign keys, representative learner progress, and
   subscription records in the recovery database.
6. Switch production only after explicit operator approval.

Restoring with `--clean` is destructive to the selected recovery target. Never
run it until the resolved database target has been independently verified.
