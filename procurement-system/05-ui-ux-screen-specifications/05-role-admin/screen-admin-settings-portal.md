# Role-Specific Interface: System Administrator
> **Screen Code: UI-ROLE-05 — System Settings & Administration Console**  
> *Dedicated to: System Administrators & Plant Operations Configuration Specialists*  
> *Core Principles: No process hierarchy (peer engineers within Part), Bypassing HW Warehouse Portal (issuance synced from EMS), Strict SG Budget No-Rollover, Beginning-of-Month Review deadlines configured by LEC.*

---

## 1. System Administrator Workspace Anatomy

The **Admin Settings Console** interface functions as the **central command hub for configuring all operational parameters across the system**. Administrators manage computational logic, plant topological hierarchies, budget policies, and the Gateway integration layer without requiring backend source code modifications.

The interface architecture comprises **6 specialized configuration tabs**:
1.  **Tab 1: 🧮 Reorder Logic Rules & Formulas**: Configure purchase quantity calculation formulas across 5 fundamental demand types (`SETUP`, `IMPROVE`, `BREAKDOWN`, `PM`, `SAFETY_STOCK`), consumption baselines by Smart Watch Model (D111, D222, D333), and team-wide unbudgeted Over warning thresholds.
2.  **Tab 2: 🏭 Plant & Line Topology Master Data**: Configure Factory HW (Smart Watch - Org ID: 28753), Buildings H1, H2, H3, Floors 2F, 6F, and Lines `#201` ~ `#210`, `#601`, `#604` using the automated rule `Left(Line, 1) = Floor`. Strictly no process/stage division; machine catalogs and friendly names attach directly to the Line.
3.  **Tab 3: 👥 Organization Hierarchy, Roles & RBAC**: Manage the standard 3-tier organizational hierarchy `Team (PO Module Tech Team 2) => Part (CP/SG Part 1) => Peer Engineers`. Designate specialized accounts for LEC (Pham Duc Long - 658359) and Cost Management (Reviewer & Assistant is 1 single person).
4.  **Tab 4: 💰 SG Budget & LEC Deadlines**: Manage monthly SG budget ceilings, strict **No-Rollover Policy** across calendar months, and provide the interface allowing the LEC to configure operational deadlines (Deadline for engineers to submit beginning-of-month aging inventory justifications, Deadline for LEC to finalize beginning-of-month audit dossiers).
5.  **Tab 5: 🔌 EMS Gateway Connection & Nexacro Protocol (Gateway & Rate Limiting)**: Core EMS server URL (`http://ems.lgdisplay.com:9000`), server load protection parameters (`max_concurrent: 3`, `min_interval: 100ms`, `timeout: 30s`), service whitelist `allowed_services`, and live connection test button `[⚡ TEST CONNECTION INSTANTLY (PING)]`.
6.  **Tab 6: 🏷️ Master Dictionaries & Over Codes**: Manage the dictionary of 6 Over cause codes (`OVR-01` to `OVR-06`), temporary code generation prefix (`TMP-HW-xxxx`), file upload capacity limits, and allowed attachment formats.

---

## 2. Detailed UI Wireframe (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [OPS LOGO]  OPERATIONS SETTINGS & CONFIGURATION CONSOLE — FACTORY HW (SMART WATCH) [🔔 System Normal] [👤 System Administrator]    │
│ Context: Factory HW (Display Module Plant 1 - Org ID: 28753)                   Environment: Production (Live with EMS Gateway)   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ SYSTEM CONFIGURATION TABS:                                                                                                       │
│ [🧮 1. REORDER LOGIC & RULES] [🏭 2. PLANT & LINE TOPOLOGY] [👥 3. ORG & RBAC ROLES]                                              │
│ [💰 4. SG BUDGET & DEADLINES] [🔌 5. EMS GATEWAY CONFIG]    [🏷️ 6. DICTIONARIES & OVER CODES]                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ACTIVE TAB: TAB 4 — SG BUDGET POLICY & TIMELINE MANAGEMENT (LEC-CONFIGURABLE DEADLINES)                                       │
│                                                                                                                                  │
│ 4.1. MONTHLY SG BUDGET POLICY (STRICT NO-ROLLOVER POLICY):                                                                       │
│ • Month-End Balance Carryover Mechanism: [🔴 STRICT NO-ROLLOVER] (Unspent budget in month N automatically expires)               │
│ • SG Budget Input Method:                [ MONTHLY MANUAL ENTRY BY LEC ]                                                         │
│ • Month N Procurement Budget Ceiling:    [ $65,000.00 USD ]      Month N Issuance Expense Budget Ceiling: [ $48,000.00 USD ]     │
│                                                                                                                                  │
│ 4.2. AUDIT TIMELINE & JUSTIFICATION DEADLINES (LEC-CONFIGURABLE DEADLINES):                                                      │
│ • Periodic Cost Audit Window:            [ BEGINNING OF MONTH (DAYS 01 TO 05 MONTHLY) ]                                          │
│ • Engineer Aging Stock Justification Due:[ Day 03 Monthly ] at [ 17:00 ] (Form submission automatically locks thereafter)        │
│ • LEC Audit Dossier Finalization Due:    [ Day 05 Monthly ] at [ 12:00 ] (Data freeze and dossier handover to Cost Management)   │
│ • Cross-Team Stock Warning (agingInterlockFlag): Maintain mandatory task until EMS re-sync confirms flag is 'N'                  │
│                                                                                                                                  │
│ ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── │
│                                                                                  [↩️ Reset Defaults]   [💾 SAVE TAB 4 CONFIG]     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 5 Wireframe: EMS Gateway & Nexacro Server Load Protection

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📌 ACTIVE TAB: TAB 5 — EMS GATEWAY INTEGRATION & NEXACRO SERVER LOAD PROTECTION                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5.1. CORE EMS SERVER CONNECTION PARAMETERS (LG DISPLAY PRODUCTION):                                                              │
│ • EMS Gateway URL:                [ http://ems.lgdisplay.com:9000                                          ]                     │
│ • Organization Code:              [ 28753 ] (Display Module Plant 1 = Factory HW = Smart Watch)                                  │
│ • Designated LEC Employee ID:     [ 658359 ] (Pham Duc Long - PO Module Technology Team 2)                                       │
│ • Current Connection Status:      🟢 CONNECTED (Latency: 42ms | Session Active: 658359)   [⚡ TEST CONNECTION INSTANTLY (PING)]   │
│                                                                                                                                  │
│ 5.2. SERVER LOAD PROTECTION CONFIGURATION (TRAFFIC SHAPING & RATE LIMITING):                                                     │
│ • Maximum Concurrent Requests:    [ 3 ] parallel connections                                                                     │
│ • Minimum Interval Between Calls: [ 100 ] ms (Prevents Nexacro server throttling / crashes)                                      │
│ • Maximum Transaction Timeout:    [ 30 ] seconds (Auto-disconnects on network hang)                                              │
│ • Auto-Relogin on Session Expiry: [☑ Enabled] (Intercepts SESSION_TIMEOUT error codes and auto-authenticates)                    │
│                                                                                  [↩️ Reset Defaults]   [💾 SAVE TAB 5 CONFIG]     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Exclusive Permissions of System Administrator

1. **Modifying Reorder Logic & Formulas**: The Administrator is the sole authority permitted to modify the mathematical expression and parameter weights governing purchase quantities across all engineering teams.
2. **Configuring Nexacro Gateway Parameters**: Fine-tune rate limiting, timeouts, and permitted endpoint whitelists to safeguard core EMS server infrastructure.
3. **Role Provisioning and RBAC Management**: Manage RBAC role allocations across 5 authorized roles: Requestor, Leader, LEC, Cost Management (1 person), and Admin *(Warehouse Keeper role is completely eliminated)*.
