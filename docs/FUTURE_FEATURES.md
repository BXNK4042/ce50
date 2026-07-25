<!-- ponytail: minimalist template and feature tracking for project improvements -->
# Future Improvement Features & Proposals

## Overview
Proposals, feature tracking, and architectural enhancements for the project.

---

## Active Proposals

### [FEAT-001] Graduated Students & Alumni Support

- **Category**: `Core | UI/UX`
- **Priority**: `High`
- **Status**: `Proposed`
- **Estimated Effort**: `Medium`
- **Target Version/Milestone**: `v1.2.0`

#### 1. Overview & Motivation
- **Problem Statement**: Currently, student directory and navbar filters only account for active undergrad cohorts (Years 1-4 / CE04-CE07). Once a cohort graduates, there is no designated status, archive section, or filter tab to view alumni profiles.
- **Proposed Solution**: Introduce an "Alumni / Graduated" classification for cohorts that have completed their studies. Add dedicated UI tabs/filters in `/people/students` and `/people/students/[cohort]`, badge indicators for graduated status, and separate handling in cohort calculation logic.

#### 2. Expected Impact & Benefits
- **User Value**: Prospective students, faculty, and employers can browse past cohorts and alumni achievements.
- **Developer/Operational Impact**: Clean separation of active enrollment data vs. historical alumni archives; dynamic cohort status determination based on current academic year.

#### 3. Technical Specifications & Dependencies
- **Components Affected**: 
  - `lib/cohort.ts`: Update cohort helper functions to flag cohorts past Year 4 as `graduated`.
  - `app/[lang]/people/students/page.tsx`: Add "Active Cohorts" and "Alumni / Graduated" tabs or section grid.
  - `components/people/student-cohort-grid.tsx` & `student-grid-client.tsx`: Render graduated badge and status filters.
  - `components/layout/student-cohort-dropdown.tsx`: Group active vs. graduated cohorts in dropdown menu.
- **Prerequisites / Dependencies**: API student response contract support for `isGraduated` boolean or graduation year.
- **Implementation Strategy**:
  1. Add dynamic calculation logic in `lib/cohort.ts` based on current year vs. cohort entry year.
  2. Update frontend student directory to group cohorts into "Current Students" (Years 1-4) and "Alumni / Graduated".
  3. Update search/filter components to filter by active vs. alumni status.

#### 4. Non-Goals / Out of Scope
- Full alumni network portal with user login/authentication (separate feature proposal).
- Job tracking / career portal integration for alumni.

#### 5. Acceptance Criteria
- [ ] Cohorts older than 4 academic years automatically default to "Graduated / Alumni" status.
- [ ] UI displays distinct visual tags/badges for active vs. graduated cohorts.
- [ ] `/people/students` splits cohorts into active and alumni sections.
- [ ] Student detail grid displays graduation year if applicable.

---

### [FEAT-002] Automatic English Translation & Localization Engine

- **Category**: `Core | DX | AI`
- **Priority**: `High`
- **Status**: `Proposed`
- **Estimated Effort**: `Medium`
- **Target Version/Milestone**: `v1.3.0`

#### 1. Overview & Motivation
- **Problem Statement**: Admins are forced to manually enter content twice (Thai and English) when creating or updating news, student bios, course descriptions, room specs, or announcements. This leads to missing English content, delays, and admin friction.
- **Proposed Solution**: Build an auto-translation and EN content generation engine integrated into admin creation drawers (`LinearCrudDrawer`) and API routes. When Thai text is typed or saved, the engine auto-populates English fields using a lightweight translation pipeline, while still permitting manual admin overrides.

#### 2. Expected Impact & Benefits
- **User Value**: Ensures 100% bilingual parity across the site without blank English pages.
- **Developer/Operational Impact**: Cuts admin data entry effort in half; standardizes terminology mapping across dictionary files and API payloads.

#### 3. Technical Specifications & Dependencies
- **Components Affected**:
  - `components/admin/LinearCrudDrawer.tsx`: Add "Auto-Translate to EN" button and instant auto-fill triggers on blur/submit.
  - `app/api/translate/route.ts`: API endpoint wrapping translation provider (e.g. Cloud Translation API / LLM translation / local fallback engine).
  - `lib/translation.ts`: Translation caching layer and terminology dictionary mapping (e.g., preserving CE terms like "สาขาวิชา", "อาจารย์ประจำสาขา", "โครงงานวิศวกรรม").
- **Prerequisites / Dependencies**: Translation provider service API key or server-side fetch route.
- **Implementation Strategy**:
  1. Create `/api/translate` endpoint supporting TH -> EN translation with terminology dictionary preservation.
  2. Integrate an "Auto-Generate English" button and optional auto-translate toggle on input blur in admin form controls.
  3. Support fallback logic: if EN fields are null in database, generate on read or serve fallback during rendering.

#### 4. Non-Goals / Out of Scope
- Real-time client-side live browser translation widget (Google Translate banner).
- Automatic audio translation or voiceover generation.

#### 5. Acceptance Criteria
- [ ] Admin forms feature a working "Auto-Translate EN" button next to English fields.
- [ ] Saving Thai content with empty EN fields automatically triggers background EN translation generation.
- [ ] Technical terms (e.g., CE, Cohort, CPE, KMUTT) are correctly mapped without bad literal translations.
- [ ] Admin retains capability to edit and override auto-generated English text at any time.

---

## Summary Index

| Feature ID | Title | Category | Priority | Status | Target |
|------------|-------|----------|----------|--------|--------|
| `FEAT-001` | Graduated Students & Alumni Support | Core / UI | High | Proposed | v1.2.0 |
| `FEAT-002` | Automatic English Translation Engine | Core / DX | High | Proposed | v1.3.0 |
