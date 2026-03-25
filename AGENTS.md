# AGENTS.md – Agent Instructions for market-gr

This file provides guidance for AI coding agents (e.g. GitHub Copilot, OpenAI Codex) working in this repository. Read it carefully before making any changes.

---

## Project Overview

**market-gr** is the fiskaltrust Greek market implementation repository. It contains:

- **Government API** (`government-api/`): A .NET/Aspire service that communicates with the Greek AADE (tax authority) myDATA REST API.
- **Source utilities** (`src/`): Supporting tooling such as the `KeyVaultConsole` for key/certificate management.
- **Documentation** (`doc/`): Mapping tables, payment type references, and myDATA tax category summaries for the Greek fiscal context.
- **Open questions / WIP items** (`items/`, `open_questions_adee.md`): Tracked open issues and mismatches under investigation.

---

## Repository Structure

```
market-gr/
├── AGENTS.md                        # This file
├── README.md                        # Human-readable project overview
├── market-gr.sln                    # Visual Studio solution
├── doc/                             # Greek-market documentation
│   ├── middleware/                  # Middleware payment and income mappings
│   └── mydata/                     # myDATA tax category summaries
├── government-api/                  # Government API (.NET Aspire)
│   └── src/
│       └── fiskaltrust.Api.Government.GR/
├── src/                             # Utility source projects
│   └── KeyVaultConsole/
├── items/                           # Tracked mismatches and open items
└── res/                             # Resources
```

---

## Basic Rules

1. **Stay in scope**: Only modify files relevant to the task at hand. Do not refactor unrelated code.
2. **No secrets**: Never commit credentials, API keys, certificates, or any secrets to the repository.
3. **Follow existing conventions**: Match the coding style, naming conventions, and file structure already present in the codebase.
4. **Document changes**: Update relevant documentation in `doc/` when you change behaviour that is described there.
5. **Preserve existing tests**: Do not delete or modify existing tests unless the task explicitly requires it.
6. **One concern per PR**: Keep pull requests focused. A single PR should address one issue or feature.
7. **Greek fiscal compliance first**: All changes to the Government API or middleware mappings must remain compliant with AADE myDATA specifications.

---

## Basic Behavior

- **Before changing code**: Read the relevant documentation in `doc/` to understand the fiscal and mapping context.
- **Building**: The solution can be built with `dotnet build market-gr.sln` from the repository root. The Government API project has its own solution at `government-api/src/fiskaltrust.Api.Government.GR/fiskaltrust.Api.Government.GR.sln`.
- **Testing**: Run `dotnet test` from the repository root or from within the relevant project directory.
- **Mapping changes**: When updating `doc/middleware/mappings.md` or `doc/middleware/payment_mappings.md`, verify that the changes align with the official myDATA REST API documentation.
- **WIP items**: If you resolve an open question tracked in `open_questions_adee.md` or `items/`, update or remove the entry accordingly.
- **Commit messages**: Use short, imperative messages (e.g. `add VAT mapping for category 3`, `fix payment type 07 handling`).

---

## Labels and Their Usage

The following labels are used on issues and pull requests in this repository:

| Label | Description | When to Apply |
|---|---|---|
| `bug` | Something is not working correctly | A mapping, API call, or fiscal rule produces an incorrect result |
| `enhancement` | New feature or improvement | Adding support for a new myDATA invoice type, payment type, or tax category |
| `documentation` | Documentation-only changes | Changes or additions to files in `doc/`, `README.md`, or `AGENTS.md` |
| `question` | Clarification needed | An open fiscal or API question that must be answered before work can proceed |
| `wip` | Work in progress | A draft PR or an item actively under development |
| `compliance` | Fiscal/regulatory compliance | Changes required to meet updated AADE myDATA specification or Greek tax law |
| `mapping` | FT API ↔ myDATA mapping | Changes to payment type, income category, or tax category mappings |
| `government-api` | Government API service | Changes to the `government-api/` project |
| `infrastructure` | Build, CI/CD, or tooling | Changes to solution files, Dockerfiles, or CI configuration |
| `duplicate` | Already tracked elsewhere | Issue or PR duplicates an existing one |
| `invalid` | Not a valid issue | Issue does not apply to this repository or market |
| `wontfix` | Will not be addressed | Intentionally out of scope or deferred indefinitely |

---

## Key Contacts and References

- **myDATA REST API documentation**: Published by AADE (Ανεξάρτητη Αρχή Δημοσίων Εσόδων) — the Greek Independent Authority for Public Revenue.
- **fiskaltrust middleware API**: See the FT API documentation for `ftChargeItemCase`, `ftPayItemCase`, and related fields.
- **Internal mapping tables**: `doc/middleware/mappings.md`, `doc/middleware/payment_mappings.md`.

---

## Out of Scope for Agents

- Do **not** modify `.gitignore` or solution/project GUIDs unless explicitly instructed.
- Do **not** change or remove entries in `open_questions_adee.md` unless the question has been formally resolved.
- Do **not** introduce new NuGet dependencies without review.
- Do **not** alter Dockerfile or deployment configuration without explicit instruction.
