# Changelog

All notable changes to the T&T Travel Agency project will be documented in this file.

---

## [Unreleased] - 2025-11-02

### Added - Hotel Booking Page

**Commit:** `e05755a` by anastasia on 2025-11-02

- Created new hotel booking page with authentication
- Added validation for booking forms
- Implemented booking flow at `/hotels/[slug]/book/page.js`
- **Files Changed:** 1 file, 69 insertions(+)

---

## [Hotel Details Page] - 2025-11-02

### Added - Hotel Details

**Commit:** `b66bb82` by alo42 on 2025-11-02

- Implemented comprehensive hotel details page
- Added room information display
- Integrated review information section
- Created dynamic slug-based routing for hotels
- **Files Changed:** 1 file, 418 insertions(+)
- **Location:** `app/(pages)/hotels/[slug]/page.js`

---

## [Security Enhancement] - 2025-11-02

### Added - External API Authentication

**Commit:** `ebf0798` by davidfl10 on 2025-11-02

- Merged security branch into main
- Implemented external API authentication system
- Added `ApiAuthInitializer` component for API initialization
- Created external authentication route handler
- Added external API hooks (`useExternalApi`)
- Implemented external API authentication service

### Changed

- Updated app layout with new authentication integration
- Modified Logo component (reduced from complex implementation)
- Updated multiple API routes with authentication headers:
  - GIATA hotel API routes
  - GIATA image routes
  - Hotel countries and package templates
  - Hotel package search
  - Search package templates (locations, meals, hotel categories)
- Enhanced navigation and quick links components
- Updated authentication utilities in `lib/auth.js`
- Modified user forms layout

### Added - Assets

- Added new logo image: `public/images/logo.png` (933KB)

### Dependencies

- Added 1 new package dependency
- Updated `package-lock.json` with security improvements

---

## [Hotel Search Enhancement] - 2025-10-27

### Added - Advanced Filtering System

**Commit:** `375bd07` by Catalin on 2025-10-27

#### New API Endpoints

- Created hotel categories filtering API: `app/api/v2/search/package_templates/[template_id]/hotel_categories/route.js` (82 lines)
- Created locations filtering API: `app/api/v2/search/package_templates/[template_id]/locations/route.js` (92 lines)
- Created meals filtering API: `app/api/v2/search/package_templates/[template_id]/meals/route.js` (72 lines)

#### New Components & Hooks

- Added `PackageSearchResults` component (212 lines)
- Implemented `useDebounce` hook for optimized search performance (33 lines)
- Created `useHotelCategories` hook (64 lines)
- Created `useHotelNames` hook (24 lines)
- Created `useLocations` hook (50 lines)
- Created `useMeals` hook (44 lines)
- Created `usePackagePriceRange` hook (34 lines)

#### Enhanced Features

- Significantly improved `HotelsFilter` component (596 lines expanded from 136 lines)
- Enhanced hotel search results page with better filtering
- Added Redux state management for additional filter options

**Files Changed:** 13 files, 1,197 insertions(+), 136 deletions(-)

---

## [Minor Updates] - 2025-10-02

### Changed - Footer Cleanup

**Commit:** `281c867` by Catalin on 2025-10-02

- Removed 24 lines of code from Footer component
- Code cleanup and optimization
- **Files Changed:** 1 file, 24 deletions(-)

### Changed - Layout Adjustment

**Commit:** `bc2e932` by Catalin on 2025-10-02

- Minor adjustment to app layout configuration
- **Files Changed:** 1 file, 1 insertion(+), 1 deletion(-)

### Changed - Package Configuration

**Commit:** `7f94f94` by Catalin on 2025-10-02

- Updated package.json configuration
- Added 3 new lines, modified 1 line
- **Files Changed:** 1 file, 3 insertions(+), 1 deletion(-)

---

## [Photo Integration] - 2025-09-25

### Added - Google Places Photo Integration

**Commit:** `eaa0360` by Catalin on 2025-09-25

- Implemented Google Places API for hotel photos
- Created photo image proxy route: `app/api/google/places/photo/image/route.js` (64 lines)
- Created photo metadata route: `app/api/google/places/photo/route.js` (83 lines)
- Enhanced GIATA hotel API integration
- Updated GIATA image handling
- Improved hotel search results display with photo integration

**Files Changed:** 5 files, 161 insertions(+), 34 deletions(-)

### Added - Hotel Components

**Commit:** `15caf79` by Catalin on 2025-09-25

- Created `PackageResultCard` component (142 lines)
- Enhanced GIATA hotel API route (86 lines)
- Added GIATA image route handler (49 lines)
- Improved hotel search results page (146 lines expanded from 49 lines)

**Files Changed:** 4 files, 374 insertions(+), 49 deletions(-)

---

## [Package Search Implementation] - 2025-09-25

### Added - Package Search Features

**Commit:** `3f3167a` by Catalin on 2025-09-25

#### New API Routes

- Hotel package search endpoint: `app/api/hotels/packages/search/route.js` (346 lines)
- Country-specific package templates: `app/api/hotels/countries/[country_id]/package_templates/route.js` (69 lines)

#### New Components

- `PackageTemplatesPopover` component (90 lines)
- Enhanced `SearchStaysForm` (235 lines expanded)

#### Enhanced Features

- Added hotel packages page routing
- Improved hotel destination popover
- Enhanced hotels filter with 52 additional lines
- Updated hotel search parameters schema

#### Redux State Management

- Added package template support to stay form slice

### Key Contributors:

1. **Catalin** - Lead developer, core features, initial setup
2. **davidfl10** - Security features, bug fixes
3. **alo42** - Hotel details implementation
4. **anastasia** - Hotel booking page
