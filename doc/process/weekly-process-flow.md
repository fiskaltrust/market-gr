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

   Items reviewed on Friday are released to production on Monday unless blocking feedback is raised in time.

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
4. Prioritization (Christian + Martin)
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

### Weekend – Testing Window

- Automated integration tests run
- Viva performs end‑to‑end testing against sandbox
- No scope changes

---

### Monday – Production Release

**Objective:** Move reviewed work to production predictably.

**Process:**

1. Middleware team releases reviewed items to production
2. If blocking issues are reported Monday morning:
   - Item is moved back from Review to In Progress
3. If no blocking feedback arrives by Monday mid‑day:
   - Item is considered successfully released
   - Issue can be closed or marked Done

---

## Communication Rules

- GitHub issues are the primary communication channel
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
