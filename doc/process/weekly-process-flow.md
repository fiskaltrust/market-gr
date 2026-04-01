# Market GR – Weekly Planning, Review & Release Process

This document describes the **agreed weekly delivery cadence** for the Market GR / Viva setup. It is derived from the *market‑gr planning* meeting discussion and the associated whiteboard, and defines **how work flows from intake to production every week**.

---

## Purpose & Scope

The purpose of this process is to:

- Stabilize delivery for the Greek market under high escalation pressure
- Eliminate ad‑hoc prioritization and uncontrolled ETA commitments
- Establish a **predictable, repeatable weekly rhythm** from intake to production
- Separate **communication, prioritization, execution, and review** clearly

This cadence applies to:

- Production bugs
- Feature requests / business‑case driven changes
- Viva‑specific adaptations (incl. Viva proxy logic)

---

## Core Principles (Non‑Negotiable)

1. **GitHub is the single source of truth**

   All work items live in the `market-gr` GitHub repository (issues + project/board).  
   External lists or emails must be translated into GitHub issues.

2. **No ETAs**

   We do not commit to calendar dates. Progress is communicated via:
   - Priority order in the backlog
   - Weekly review outcomes
   - (Optional) story points as a *relative* forecasting mechanism

3. **Business‑case first**

   Any item that represents a business scenario must be backed by a **concrete business‑case example**.

4. **Show, don’t debate**

   The Friday review is a demo and status update, not a discussion forum.  
   Feedback is written back into GitHub issues.

5. **Fixed release rhythm**

   Items reviewed on Friday are released to production on **Tuesday**.
   Monday is a dedicated blocking window — the partner can test and raise objections.
   If no blocking feedback is received by EOD Monday, the release proceeds automatically.

---

## Roles & Ownership

### Overall Flow & Backlog Ownership

- **Christian Kreutzer**
  - Owns the weekly cadence
  - Maintains backlog visibility and prioritization
  - Runs planning & review structure
  - Ensures communication discipline

### Business & Partner Interface

- **Martin Grubinger**
  - Owns the business relationship with Viva
  - Aligns commercial and partner priorities
  - Works with Christian on backlog prioritization

### Business Case Ownership

- **Mijo Milicevic**
  - Owns the Business Case Repository
  - Ensures every relevant issue has a concrete example
  - Coordinates example creation with Greek team / Theo

### Technical Execution

- **Stefan Kert + Development Team**
  - Execute implementation
  - Maintain developer tools and sample execution
  - Ensure items move cleanly through the board states

---

## Artifacts Used

- **GitHub** `market-gr` **repository**  
  Issues, priorities, status, feedback

- **Business Case Repository**  
  Canonical definition of supported scenarios

- **Developer Sample / Execution Tool**  
  Used to run and demonstrate exact payloads against sandbox

- **(Optional) Knowledge Base Articles**  
  For portal‑ or user‑facing behavior explanations

---

## Definition Gates

### Definition of Ready (for Planning)

An item can be planned only if:

- It exists as a GitHub issue
- It is classified (bug vs feature vs usage issue)
- For business features: a **business‑case example exists or is explicitly assigned**

### Definition of Reviewable (for Friday)

An item can be reviewed only if:

- A business‑case example is linked
- The example can be executed in the developer tool
- Request & response can be demonstrated

---

## Backlog Management

### Single Source of Truth

The GitHub project board at <https://github.com/orgs/fiskaltrust/projects/83> is the single source of truth for all work.  
Anything not on the board will not be worked on.

### Board Columns

The backlog board (<https://github.com/orgs/fiskaltrust/projects/83/views/1>) uses the following columns:

| Column          | Meaning |
|-----------------|---------|
| **Undefined**   | Newly created, not yet assessed |
| **Refined**     | Assessed and understood |
| **Ready**       | Prioritized and ready to be picked up — worked in priority order |
| **In Progress** | Actively being worked on this week — should move to Review; may still block |
| **Review**      | Done and shown at Friday review — goes live Tuesday |

### Inbox Triage

Everything filed in the repo lands in the **Inbox** view (<https://github.com/orgs/fiskaltrust/projects/83/views/9>).

- Triage happens **Tuesday** before the planning call with Costas
- For each item, **Importance** (how critical) and **Ambiguity** (how unclear) are assessed
- This gives a rough effort estimate
- Items with **Ambiguity > 5** cannot be worked on until clarified

### Review & Release Cycle

- Everything in **Review** is shown on **Friday** and goes live on **Tuesday**
- **Monday** is a dedicated blocking window — the partner can test and raise objections
- If no block is raised by EOD Monday, the release proceeds automatically on Tuesday
- Blocking applies **per issue** by default; full rollback of the entire release requires an explicit decision
- Issues in Review must include a closing comment describing how/where things were tested, what the business case is, and a link to the developer portal
- Everything in **In Progress** should move to Review within the current week — it can always block back if needed
- Everything in **Ready** is picked up in priority order — all tasks there are already prioritized

---

## Weekly Cadence

### Tuesday – Planning & Prioritization

**Objective:** Decide *what matters next* and ensure it is implementable.

**Activities:**

1. Intake of new requests from Viva and internal findings
2. Translation of all input into GitHub issues
3. Classification:
   - Production bug
   - Feature / business case
   - Usage or payload issue
4. Prioritization (FT:Christian, Martin - VIVA:Costas)
5. Enforcement of the **business‑case gate**
6. Agreement on which items are expected to reach **Review** this week

**Output:**

- Updated GitHub board with stable priorities
- Clear ownership for business‑case examples

---

### Wednesday – Internal Execution Planning (Optional but Recommended)

**Objective:** Turn priorities into executable work.

**Activities:**

- Align developers on scope and dependencies
- Ensure missing business‑case examples are created
- Remove technical blockers early

This meeting is internal and not partner‑facing.

---

### Friday – Review / Demo

**Objective:** Transparently show what is done and usable.

**Format:**

1. Walk through items in the **Review** column
2. For each item:
   - Open the business‑case example
   - Execute it in the developer tool
   - Show request and response
   - (If applicable) show rendered receipt or artifact
3. Capture evidence (screenshots / links) in the GitHub issue

**Rules:**

- No architectural deep dives
- No extended discussions
- No reprioritization in the meeting
- Feedback is written into GitHub after testing

Meeting recordings and transcripts must be enabled.

---

### Weekend – Automated Testing

- Automated integration tests run
- No scope changes

---

### Monday – Blocking Window

**Objective:** Give the partner a dedicated window to test and block individual items before release.

**Process:**

1. Partner (Viva) performs end‑to‑end testing against sandbox
2. To **block** an item, the partner must raise it **explicitly and in writing** — via **email** or **GitHub issue**
3. Blocking is **per issue**, not per release:
   - A blocked issue is moved back to In Progress (or a new issue is created)
   - Remaining unblocked items proceed to release
4. Full rollback of the entire release is an exceptional, explicit decision — not the default
5. **No feedback by EOD Monday = release proceeds** — silence is treated as no objection

**Authoritative channels for blocking:**
- Email
- GitHub Issues

---

### Tuesday – Production Release

**Objective:** Move reviewed work to production predictably.

**Process:**

1. Check for any blocks raised during Monday's blocking window
2. Middleware team releases all unblocked items to production
3. Blocked issues remain in progress; everything else goes live
4. Released issues can be closed or marked Done

---

## Communication Rules

- GitHub issues are the primary communication channel
- **Release approvals and blocking decisions** must be communicated via **email** or **GitHub issues** only
- Teams chats (including external partner chats) are **not** authoritative for release decisions
- No ad‑hoc chat‑based escalation for non‑incidents
- Friday review feedback goes into issues, not meetings
- Support and integration questions will later be routed via SupportYourApp (once staffed)

---

## Expected Outcome

If followed consistently, this process ensures:

- Predictable weekly delivery
- Reduced escalation noise
- Clear accountability
- Traceability from request → example → implementation → release
