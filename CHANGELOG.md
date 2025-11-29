# Changelog

## 📋 Project Information

- **Team Number:** 10
- **Project Name:** Tand Travel Agency
- **Repository:** https://github.com/httpcatalin/TandTravelAgency

## [v2.0.0] - 2025-11-29

### 🔐 Authentication System (authentication branch)

This release introduces a completely refactored authentication system with new sign-up, sign-in, and sign-out functionality, along with major architectural improvements.

#### Added - Profile & Account Management

**Commit:** `b0349ad` by **davidfl10** on 2025-11-29

- ✅ Added `AccountDetails` component for user profile management
- ✅ Created `ProfileData` component for displaying user information
- Updated signup flow with improved user experience
- Enhanced `signUpAction` with additional validation and error handling
- **Locations:**
  - `components/pages/profile/AccountDetails.jsx` (110 lines)
  - `components/pages/profile/ProfileData.jsx` (41 lines)
  - `components/pages/signup/SignupForm.jsx` (updated)
  - `lib/actions/signUpAction.js` (enhanced)
- **Commit:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/b0349ad)

#### Added - User Authentication Components

**Commit:** `9d6eca9` by **Corina Cosneanu** on 2025-11-29

- ✅ Created `SignupForm` component for user registration
- Implemented comprehensive form validation
- Added user-friendly registration UI with form fields
- **Location:** `components/pages/signup/SignupForm.jsx`
- **Commit:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/9d6eca9479fc6b3168255fb74e3d7c8cb2730c36)

**Commit:** `9375317` by **Alexandrina Ciur** on 2025-11-29

- ✅ Created `LoginForm` component for user authentication
- Designed responsive login interface
- Integrated with authentication actions
- **Location:** `components/pages/login/LoginForm.jsx`
- **Commit:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/9375317dff5b39e9750a2e32c214d096611d14ae)

#### Added - Authentication Actions

**Commit:** `e5eb75c` by **rotaruanastasia242** on 2025-11-29

- ✅ Created sign-up action function with full validation
- Implemented user registration logic
- Added error handling for registration process
- **Location:** `lib/actions/signUpAction.js`
- **Commit:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/e5eb75c26171d792f0d1724d47fd671985b7db7f)

**Commit:** `9fbf40f` by **alo42** on 2025-11-29

- ✅ Implemented sign-in authentication function
- Created sign-out functionality
- Added session management capabilities
- **Locations:**
  - `lib/actions/authenticateActions.js` (79 lines)
  - `lib/actions/signOutAction.js` (10 lines)
- **Commit:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/9fbf40f85512df2a1d48e462ea635b1efc987a9f)

#### Removed - Stripe Payment Integration

**Commit:** `e54116a` by **Catalin** on 2025-11-29

- Removed Stripe payment and card management features
- Simplified payment flow for initial release
- Cleaned up unused payment-related code
- **Major Changes:**
  - Removed `app/api/stripe/` endpoints (payment intents, setup intents, webhooks)
  - Removed `PayWithNewCardForm` and `PayWithSavedCard` components
  - Removed `AddPaymentCard` and `SavedCards` components
  - Removed `useFetchCards` hook
  - Cleaned up `lib/paymentIntegration/stripe/` services
  - Updated `lib/services/flights.js` and `lib/services/hotels.js`
  - Removed payment-related database schemas
- **Commit:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/e54116a752d0b4590e500454ff4e17e92d92e5a8)

---

### 🏨 Dynamic Hotel Page Enhancement

**Commit:** `06470f8` by **Catalin** on 2025-11-29

- ✅ Added dynamic hotel page with improved routing
- Refactored project structure for better maintainability
- Enhanced `PackageResultCard` component with new features
- Updated Next.js configuration
- Improved rating display component
- **Key Changes:**
  - Updated `app/(pages)/hotels/[hotelSearchParams]/@hotelResult/page.js`
  - Enhanced `components/local-ui/ratingShow.js`
  - Improved `components/pages/hotels.search/ui/PackageResultCard.jsx`
  - Updated `next.config.mjs` configuration
- **Branch:** `hotel-page`
- **Commit:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/06470f814066e73902535e53e57c18c88c7d2031)

---

## [v1.2.0] - 2025-11-02

### 🏨 Hotel Booking Page

**Commit:** `e05755a` by **anastasia** on 2025-11-02

- ✅ Created new hotel booking page with authentication
- Added validation for booking forms
- Implemented booking flow at `/hotels/[slug]/book/page.js`

---

### 🏨 Hotel Details Page

**Commit:** `b66bb82` by **alo42** on 2025-11-02

- ✅ Implemented comprehensive hotel details page
- Added room information display
- Integrated review information section
- Created dynamic slug-based routing for hotels
- **Location:** `app/(pages)/hotels/[slug]/page.js`
- **Pull Request:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/b66bb82)

---

### 🔒 Security Enhancement

**Commit:** `ebf0798` by **davidfl10** on 2025-11-02

#### Added - External API Authentication

- ✅ Merged security branch into main
- Implemented external API authentication system
- Added `ApiAuthInitializer` component for API initialization
- Created external authentication route handler
- Added external API hooks (`useExternalApi`)
- Implemented external API authentication service

#### Changed

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

#### Added - Assets

- Added new logo image: `public/images/logo.png` (933KB)

#### Dependencies

- Added 1 new package dependency
- Updated `package-lock.json` with security improvements
- **Pull Request:** [View Commit](https://github.com/httpcatalin/TandTravelAgency/commit/ebf0798)

---

## [v1.1.0] - 2025-10-27

### 🔍 Hotel Search Enhancement - Advanced Filtering System

**Commit:** `375bd07` by **Catalin** on 2025-10-27
**Branch:** `filtering`

#### New API Endpoints

- ✅ Created hotel categories filtering API: `app/api/v2/search/package_templates/[template_id]/hotel_categories/route.js` (82 lines)
- ✅ Created locations filtering API: `app/api/v2/search/package_templates/[template_id]/locations/route.js` (92 lines)
- ✅ Created meals filtering API: `app/api/v2/search/package_templates/[template_id]/meals/route.js` (72 lines)

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
- **Pull Request:** [View Branch](https://github.com/httpcatalin/TandTravelAgency/tree/filtering)

---

## [Minor Updates] - 2025-10-02

### Changed - Footer Cleanup

**Commit:** `281c867` by Catalin on 2025-10-02

- Removed 24 lines of code from Footer component
- Code cleanup and optimization

### Changed - Layout Adjustment

**Commit:** `bc2e932` by Catalin on 2025-10-02

- Minor adjustment to app layout configuration

### Changed - Package Configuration

**Commit:** `7f94f94` by Catalin on 2025-10-02

- Updated package.json configuration
- Added 3 new lines, modified 1 line

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

### Added - Hotel Components

**Commit:** `15caf79` by Catalin on 2025-09-25

- Created `PackageResultCard` component (142 lines)
- Enhanced GIATA hotel API route (86 lines)
- Added GIATA image route handler (49 lines)
- Improved hotel search results page (146 lines expanded from 49 lines)

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

**Key Areas:** Signup form UI, registration form design
