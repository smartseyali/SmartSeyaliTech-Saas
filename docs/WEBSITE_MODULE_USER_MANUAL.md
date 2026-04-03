# Website Module — User Manual

## What is the Website Module?

The Website Module is the **complete engine** that powers your company's public-facing website and manages the business behind it. It handles everything from static pages (About, Contact) to dynamic business operations (selling services, collecting registrations, processing payments, issuing credentials).

**One module, any business:**

| Business Type | How They Use It |
|---|---|
| Education Institute | Offerings = Courses, Groups = Batches, Registrations = Enrollments, Credentials = Certificates |
| Coaching Center | Offerings = Programs, Groups = Batches, Schedules = Classes, Credentials = Completion Certificates |
| Yoga Studio | Offerings = Classes, Groups = Morning/Evening Slots, Registrations = Memberships |
| Consulting Firm | Offerings = Services, Groups = Engagement Teams, Registrations = Client Bookings |
| Training Company | Offerings = Training Programs, Groups = Cohorts, Credentials = Certifications |
| School | Offerings = Academic Programs, Groups = Sections/Terms, Credentials = Report Cards |
| Event Company | Events = Conferences, Offerings = Workshops, Registrations = Tickets |
| Clinic / Hospital | Offerings = Treatments, Groups = OPD Slots, Schedules = Appointments |
| SaaS Product | Offerings = Plans, Pricing = Subscription Tiers, Registrations = Signups |

---

## Real-World Example: Sparkle Allied Health Science

Sparkle is an education institution that teaches medical lab technology, radiology, and allied health courses. Here is exactly how they use every screen in the Website Module.

---

## SECTION 1: CONTENT (Static CMS)

### 1.1 Web Pages

**What:** Create and manage the static pages on your website — Home, About Us, Contact, Terms & Conditions, etc.

**Sparkle Example:**
- Creates a page titled **"About Us"** with slug `about-us`
- Writes their institution history, mission, and vision in the content field
- Sets template to **"Content Page"**
- Toggles **Published = Yes**
- The public website renders `sparkle.com/about-us` from this data

**How to use:**
1. Go to **Website > Content > Web Pages**
2. Click **New**
3. Fill in:
   - **Page Title:** About Us
   - **URL Slug:** about-us
   - **Template:** Content Page
   - **Content:** (your page HTML/text)
4. Under Config tab:
   - **SEO Title:** About Sparkle Allied Health Science
   - **Meta Description:** Leading health science education institute...
   - **Published:** Yes
5. Save

**Advanced — Page Sections:**
Each page can have multiple sections (hero banner, content blocks, CTAs, gallery strips). The `web_page_sections` table stores these. Your frontend developer builds the renderer that reads sections by `page_id` and renders them in `sort_order`.

---

### 1.2 Blog Posts

**What:** Publish articles, news, guides, and announcements.

**Sparkle Example:**
- Publishes articles like:
  - "Top 5 Careers in Medical Lab Technology" (category: Guide)
  - "Sparkle Students Win National Award" (category: News)
  - "How to Choose the Right Allied Health Course" (category: Tutorial)
- Each post has a cover image, author, excerpt, and full content
- Tags: "health, education, careers"

**How to use:**
1. Go to **Website > Content > Blog Posts**
2. Create post with title, slug, author, category, cover image
3. Write content (supports HTML)
4. Set **Published = Yes**
5. Your public website fetches all published posts and renders them at `/blog`

---

### 1.3 Media Library

**What:** Central storage for all images, videos, and documents used across the website.

**Sparkle Example:**
- Uploads campus photos (folder: "campus")
- Uploads course brochures as PDFs (folder: "brochures")
- Uploads student testimonial videos (folder: "videos")
- These are referenced in pages, blog posts, offerings, and gallery

**How to use:**
1. Go to **Website > Content > Media Library**
2. Upload files with title, alt text, folder name
3. Use the `file_url` in your pages, blog posts, or offerings

---

### 1.4 Components

**What:** Reusable content blocks — headers, footers, banners, CTA sections, pricing tables that can be embedded in any page.

**Sparkle Example:**
- Creates a **"Main Header"** component (type: header) with logo, navigation HTML, and contact number
- Creates a **"CTA Banner"** component (type: cta) — "Apply Now for 2026 Admissions"
- Creates a **"Footer"** component (type: footer) with address, social links, quick links
- These components are shared across all pages

---

## SECTION 2: DESIGN

### 2.1 Templates

**What:** Page layout templates that control how content is rendered.

**Sparkle Example:**
- **"Landing Page"** template — hero section + features grid + CTA + testimonials
- **"Content Page"** template — simple header + rich text body + sidebar
- **"Contact Page"** template — contact form + map + info cards
- **"Certificate"** template — formatted certificate design for PDF generation

Each template has HTML structure, CSS styles, and a config JSON that controls colors, fonts, and layout options.

---

### 2.2 Navigation Menu

**What:** Configure header and footer navigation links.

**Sparkle Example:**

| Label | URL | Position |
|---|---|---|
| Home | / | header |
| Programs | /programs | header |
| About Us | /about-us | header |
| Gallery | /gallery | header |
| Blog | /blog | header |
| Contact | /contact | header |
| Apply Now | /apply | header |
| Privacy Policy | /privacy | footer |
| Terms | /terms | footer |

---

## SECTION 3: OFFERINGS (Business Engine)

This is the core business section. The same screens serve every business type.

### 3.1 Offerings

**What:** Your catalog of services, products, courses, or anything you sell/provide.

**Sparkle Example — Creating a course:**

| Field | Value |
|---|---|
| Name | BSc Medical Lab Technology |
| Code | BSC-MLT-2026 |
| Type | Course |
| Category | Undergraduate |
| Delivery Mode | Offline |
| Duration | 3 |
| Duration Unit | Years |
| Level | Beginner |
| Max Capacity | 60 |
| Description | A comprehensive 3-year program covering clinical biochemistry, microbiology, pathology... |
| Highlights | "NAAC Accredited", "100% Placement", "Hands-on Lab Training" |
| Eligibility | 12th pass with Physics, Chemistry, Biology |
| Status | Active |
| Published | Yes |

**Other business examples:**

| Business | Offering Name | Type | Mode | Duration |
|---|---|---|---|---|
| Yoga Studio | Morning Power Yoga | Service | Offline | 1 hour |
| Consulting Firm | Digital Transformation | Consultation | Hybrid | 3 months |
| Coaching Center | IIT-JEE Crash Course | Training | Offline | 6 months |
| Clinic | Full Body Checkup | Service | Offline | 2 hours |
| SaaS Company | Enterprise Plan | Subscription | Online | 1 year |

---

### 3.2 Groups

**What:** Subdivisions of an offering — batches, time slots, sections, cohorts.

**Sparkle Example — Creating a batch:**

| Field | Value |
|---|---|
| Offering | BSc Medical Lab Technology |
| Group Name | Batch 2026-A |
| Code | MLT-2026-A |
| Start Date | 2026-08-01 |
| End Date | 2029-05-31 |
| Schedule | Mon-Fri, 9:00 AM - 3:30 PM |
| Max Capacity | 60 |
| Facilitator | Dr. Priya Sharma |
| Venue | Main Campus, Building A |
| Delivery Mode | Offline |
| Status | Upcoming |
| Registration Open | Yes |

**Other business examples:**

| Business | Group Name | Parent Offering |
|---|---|---|
| Yoga Studio | Morning 6AM Slot | Morning Power Yoga |
| Yoga Studio | Evening 7PM Slot | Morning Power Yoga |
| Coaching Center | Weekend Batch | IIT-JEE Crash Course |
| Coaching Center | Weekday Batch | IIT-JEE Crash Course |
| Clinic | Monday OPD | Full Body Checkup |
| Event Company | Day 1 - Workshop Track | Annual Conference 2026 |

---

### 3.3 Schedules

**What:** Individual time-based entries within a group — classes, appointments, meetings, sessions.

**Sparkle Example — Class schedule within Batch 2026-A:**

| Title | Date | Time | Type | Facilitator | Status |
|---|---|---|---|---|---|
| Orientation Day | 2026-08-01 | 10:00-12:00 | Session | Dr. Priya | Scheduled |
| Clinical Biochemistry - Intro | 2026-08-04 | 09:00-10:30 | Class | Prof. Kumar | Scheduled |
| Microbiology Lab 1 | 2026-08-04 | 11:00-13:00 | Class | Dr. Anita | Scheduled |
| Internal Assessment 1 | 2026-09-15 | 09:00-12:00 | Exam | -- | Scheduled |
| Guest Lecture: AI in Diagnostics | 2026-10-10 | 14:00-15:30 | Webinar | Dr. External | Scheduled |

**Other business examples:**

| Business | Schedule Title | Type |
|---|---|---|
| Yoga Studio | Mon 6AM Hatha Session | Session |
| Consulting Firm | Kickoff Meeting | Meeting |
| Clinic | Patient #1245 Appointment | Appointment |
| Coaching Center | Physics - Mechanics Ch1 | Class |

---

## SECTION 4: REGISTRATIONS (Transactions)

### 4.1 Registrations

**What:** When someone signs up for your offering. Could be an enrollment, booking, appointment, or RSVP.

**Sparkle Example — Student enrollment:**

| Field | Value |
|---|---|
| Registration No | REG-2026-0045 |
| Name | Arun Kumar |
| Email | arun@gmail.com |
| Phone | 9876543210 |
| Offering | BSc Medical Lab Technology |
| Group | Batch 2026-A |
| Registration Date | 2026-06-15 |
| Source | Website |
| Status | Confirmed |
| Total Amount | 1,50,000 |
| Discount | 10,000 (Merit scholarship) |
| Paid | 50,000 |
| Balance | 90,000 |
| Payment Status | Partial |

**The typical flow:**

```
Enquiry (from website form)
    ↓ Admin reviews, qualifies the lead
Registration (admin creates, links to enquiry)
    ↓ Student pays
Payment recorded → payment_status updates
    ↓ Student completes offering
Credential issued (certificate/badge)
```

---

### 4.2 Pricing Plans

**What:** Define pricing structures for your offerings — with line items, installments, and validity periods.

**Sparkle Example:**

**Plan: "Standard Fee" for BSc MLT**

| Item Label | Amount | Optional |
|---|---|---|
| Tuition Fee | 1,20,000 | No |
| Lab Fee | 15,000 | No |
| Library Fee | 5,000 | No |
| Hostel Fee | 30,000 | Yes |
| Transport Fee | 12,000 | Yes |
| **Total** | **1,82,000** | |

Settings: Installments allowed = Yes, Count = 6, Tax inclusive = Yes

**Another plan: "Merit Scholarship"**
- Same items but Total Amount = 1,40,000 (discounted)
- Valid from: 2026-05-01, Valid to: 2026-07-31

---

### 4.3 Payments

**What:** Record payments against registrations.

**Sparkle Example — Arun Kumar's payment history:**

| Receipt No | Date | Amount | Mode | Status |
|---|---|---|---|---|
| PAY-2026-0089 | 2026-06-15 | 50,000 | Online (Razorpay) | Completed |
| PAY-2026-0134 | 2026-09-01 | 25,000 | UPI | Completed |
| PAY-2026-0178 | 2026-12-01 | 25,000 | Bank Transfer | Completed |
| PAY-2026-0201 | 2027-03-01 | 40,000 | -- | Pending |

Each payment links to the registration. When a payment is recorded, the registration's `paid_amount` and `balance_amount` should be recalculated.

---

### 4.4 Credentials

**What:** Issue certificates, badges, licenses, or achievements upon completion.

**Sparkle Example:**

| Field | Value |
|---|---|
| Credential No | CERT-2029-0045 |
| Type | Certificate |
| Recipient | Arun Kumar |
| Offering | BSc Medical Lab Technology |
| Issue Date | 2029-06-15 |
| Grade | First Class with Distinction |
| Score | 82.5 |
| Verification Code | SPK-29-AK-7834 |
| Template | Degree Certificate Template |
| Document URL | /certificates/CERT-2029-0045.pdf |
| Status | Issued |

The verification code allows anyone to verify the credential at `sparkle.com/verify/SPK-29-AK-7834`.

---

## SECTION 5: ENGAGEMENT

### 5.1 Enquiries

**What:** Leads captured from website forms. This is where business starts.

**Sparkle Example — Enquiry from website:**

| Field | Value |
|---|---|
| Name | Priya Menon |
| Email | priya.m@gmail.com |
| Phone | 9012345678 |
| Subject | Admission enquiry |
| Source | Website |
| Program/Service | BSc Medical Lab Technology |
| Message | I completed 12th with 85% in science stream. When does the next batch start? |
| Status | New |

**Admin workflow:**
1. New enquiry comes in → Status: **New**
2. Admin calls the student → Status: **Contacted**
3. Student is interested and eligible → Status: **Qualified**
4. Admin creates a Registration linked to this enquiry → Status: **Enrolled**
5. If not interested → Status: **Closed / Rejected**

---

### 5.2 Form Builder

**What:** Create custom forms for any purpose — not just enquiries. Feedback forms, surveys, registration forms, quiz forms.

**Sparkle Example:**
- **"Campus Visit Booking"** form — Name, Email, Phone, Preferred Date, Program Interest
- **"Alumni Feedback"** form — Graduation Year, Current Employer, Rating (1-5), Suggestions
- **"Scholarship Application"** form — Name, 12th Marks, Family Income, Upload Marksheet

Each form has:
- Custom fields defined in JSON
- A success message
- Optional email notification to admin
- Optional max submissions and close date

---

### 5.3 Form Responses

**What:** View and manage submissions from custom forms.

Each submission stores the form data as JSON, so any form structure is supported without schema changes.

---

### 5.4 Events

**What:** Public events — webinars, workshops, open houses, conferences.

**Sparkle Example:**

| Event | Type | Date | Mode | Attendees |
|---|---|---|---|---|
| Open Day 2026 | Open House | 2026-07-15 | Offline | 200 |
| Webinar: Careers in Radiology | Webinar | 2026-06-20 | Online | 500 |
| Annual Sports Day | Event | 2026-12-10 | Offline | 300 |
| Industry Expert Talk Series | Workshop | 2026-08-05 | Hybrid | 100 |

Events can be free or paid. When published, they appear on the public website.

---

### 5.5 Event Registrations

**What:** Track who signed up for events.

| Attendee | Event | Status | Ticket No |
|---|---|---|---|
| Ramesh S | Open Day 2026 | Confirmed | OD-2026-0001 |
| Lakshmi V | Careers in Radiology | Registered | WEB-2026-0234 |

---

### 5.6 Testimonials

**What:** Success stories and reviews displayed on the website.

**Sparkle Example:**

| Author | Title | Content | Rating |
|---|---|---|---|
| Arun Kumar | BSc MLT 2026 Graduate | "The labs here are world-class. I got placed at Apollo Hospitals before graduation." | 5 |
| Dr. Priya | Faculty, Biochemistry | "Sparkle produces students who are ready for the industry from day one." | 5 |
| Meena R | Parent | "My daughter's transformation has been incredible. Best decision we made." | 4 |

Each testimonial can be linked to an offering and has a `is_featured` flag for homepage display.

---

### 5.7 FAQs

**What:** Frequently asked questions displayed on the website.

**Sparkle Example:**

| Question | Category |
|---|---|
| What are the eligibility criteria for BSc MLT? | Admission |
| Is hostel accommodation available? | Facilities |
| What is the fee structure? | Fees |
| Do you provide placement assistance? | Placements |
| Can I pay fees in installments? | Fees |

---

### 5.8 Gallery

**What:** Image and video gallery for the public website.

**Sparkle Example:**
- Campus photos (category: "Campus")
- Lab equipment photos (category: "Labs")
- Student activities (category: "Events")
- Graduation ceremony videos (category: "Graduation", type: video)

---

## SECTION 6: CONFIGURATION

### 6.1 SEO Manager

**What:** Manage SEO metadata for any page, blog post, offering, or event.

**Sparkle Example:**

| Entity | Meta Title | Focus Keyphrase |
|---|---|---|
| Web Page: About Us | About Sparkle Allied Health Science - Chennai | allied health science chennai |
| Blog: Top 5 Careers | Top 5 Careers in Medical Lab Technology - 2026 | medical lab technology careers |
| Offering: BSc MLT | BSc Medical Lab Technology Course - Sparkle | bsc mlt course chennai |

Each entry stores: meta title, meta description, OG tags (for social sharing), canonical URL, structured data (JSON-LD for Google), and a computed SEO score.

---

### 6.2 Translations

**What:** Multi-language content. Store translated versions of any content field.

**Sparkle Example:**

| Entity | Field | Locale | Translation |
|---|---|---|---|
| Web Page: About Us | title | ta (Tamil) | எங்களைப் பற்றி |
| Offering: BSc MLT | description | hi (Hindi) | चिकित्सा प्रयोगशाला प्रौद्योगिकी में बीएससी... |
| FAQ: Eligibility | answer | ta (Tamil) | 12ம் வகுப்பில் அறிவியல்... |

Your frontend checks the user's language preference and fetches translations from this table.

---

### 6.3 Automations

**What:** Rules that trigger actions automatically.

**Sparkle Example:**

| Rule | Trigger | Action |
|---|---|---|
| Welcome Email | Registration created | Send welcome email to registrant |
| Payment Reminder | Registration.balance > 0 AND 30 days passed | Send SMS reminder |
| Certificate Auto-issue | Registration status = completed | Create credential draft |
| Enquiry Follow-up | Enquiry created AND 24 hours passed AND status = new | Send email to admin |
| Event Reminder | Event starts in 24 hours | Send reminder to all registered attendees |

Each rule has: trigger event, conditions (JSON), and actions (JSON).

---

### 6.4 API Keys

**What:** Generate API tokens so external systems can read/write your website data.

**Sparkle Example:**
- **"Mobile App"** key — permissions: read:offerings, read:schedules, write:registrations
- **"Marketing Tool"** key — permissions: read:blog, read:events
- **"Payment Gateway Webhook"** key — permissions: write:payments

---

### 6.5 Content Versions

**What:** Track change history for pages, blog posts, and templates. Restore previous versions if needed.

Every time a page is saved, a version snapshot is stored. Admins can view history and restore.

---

### 6.6 Website Settings

**What:** Global website configuration — site name, logo, colors, contact info, social links.

**Sparkle Example:**

| Setting | Value |
|---|---|
| Site Name | Sparkle Allied Health Science |
| Logo | /media/sparkle-logo.png |
| Primary Color | #2563EB |
| Contact Email | admissions@sparkle.edu.in |
| Contact Phone | +91 44 2345 6789 |
| Address | 123 Health Ave, Chennai 600001 |
| WhatsApp | +91 98765 43210 |
| Facebook | facebook.com/sparklehealth |
| Instagram | instagram.com/sparklehealth |

---

## COMPLETE DATA FLOW: Enquiry to Credential

Here is how data moves through the entire module, using Sparkle as an example:

```
STEP 1: ATTRACT
  Admin publishes Offerings, Blog Posts, Events on the website
  Website displays: sparkle.com/programs, sparkle.com/blog, sparkle.com/events
      ↓
STEP 2: CAPTURE
  Visitor browses BSc MLT program page
  Clicks "Apply Now" → Enquiry form
  Fills: Name, Email, Phone, Message
  Submitted → saved to web_enquiries (status: "new")
      ↓
STEP 3: QUALIFY
  Admin views Enquiries in dashboard
  Calls the student, verifies eligibility
  Updates enquiry status: new → contacted → qualified
      ↓
STEP 4: REGISTER
  Admin creates Registration:
    - Links to the Offering (BSc MLT)
    - Links to a Group (Batch 2026-A)
    - Links to the Enquiry
    - Sets total_amount from Pricing Plan
  Status: pending → confirmed
      ↓
STEP 5: COLLECT PAYMENT
  Admin records Payment against the Registration
    - Amount: 50,000 (first installment)
    - Mode: Online (Razorpay)
    - Registration's paid_amount updates, payment_status: unpaid → partial
  Repeat for each installment until paid in full
      ↓
STEP 6: DELIVER
  Student attends classes (tracked via Schedules)
  Admin marks schedule entries as completed
  Attendance tracked
      ↓
STEP 7: COMPLETE
  Student finishes the program
  Admin updates Registration status: active → completed
      ↓
STEP 8: CREDENTIAL
  Admin issues Credential:
    - Type: Certificate
    - Grade: First Class
    - Verification Code: SPK-29-AK-7834
    - Generates PDF from Template
  Status: issued
      ↓
STEP 9: SHOWCASE
  Student writes Testimonial
  Admin publishes it on the website
  The cycle continues — new visitors see the testimonial and enquire
```

---

## How Different Businesses Use the Same Flow

| Step | Education (Sparkle) | Yoga Studio | Consulting Firm | Event Company |
|---|---|---|---|---|
| **Offering** | BSc MLT Course | Morning Yoga Class | Strategy Consulting | Annual Tech Conference |
| **Group** | Batch 2026-A | 6AM Weekday Slot | Project Team Alpha | Workshop Track A |
| **Schedule** | Mon 9AM - Biochemistry | Mon 6AM Session | Kickoff Meeting | Day 1 - 10AM Talk |
| **Registration** | Student Enrollment | Membership Signup | Client Engagement | Ticket Purchase |
| **Pricing** | Tuition + Lab + Hostel | Monthly ₹2,000 | ₹5,00,000 retainer | ₹5,000 per ticket |
| **Payment** | Installments over 3 years | Monthly auto-debit | Milestone payments | One-time payment |
| **Credential** | Degree Certificate | 200-Hour Certification | Project Completion Letter | Attendance Certificate |
| **Testimonial** | Student success story | Member transformation | Client case study | Speaker quote |

---

## Database Table Reference

| Table | Purpose | Records Created By |
|---|---|---|
| `web_pages` | Static website pages | Admin |
| `web_page_sections` | Page builder blocks | Admin |
| `blog_posts` | Blog articles | Admin |
| `web_media` | Images, videos, documents | Admin |
| `web_templates` | Page/email/certificate templates | Admin |
| `web_components` | Reusable content blocks | Admin |
| `web_forms` | Custom form definitions | Admin |
| `web_form_submissions` | Form responses | Public visitors |
| `web_seo_meta` | SEO metadata per entity | Admin |
| `web_content_versions` | Version history | System (auto) |
| `web_menu_items` | Navigation menus | Admin |
| `web_offerings` | Services/courses/products catalog | Admin |
| `web_groups` | Batches/slots/cohorts | Admin |
| `web_schedules` | Classes/appointments/meetings | Admin |
| `web_registrations` | Signups/bookings/enrollments | Admin (or public) |
| `web_pricing` | Pricing plans per offering | Admin |
| `web_pricing_items` | Price breakdown line items | Admin |
| `web_payments` | Payment records | Admin |
| `web_credentials` | Certificates/badges issued | Admin |
| `web_events` | Public events/webinars | Admin |
| `web_event_registrations` | Event attendees | Public visitors |
| `web_testimonials` | Reviews and success stories | Admin |
| `web_enquiries` | Contact/enquiry form submissions | Public visitors |
| `web_faqs` | Frequently asked questions | Admin |
| `gallery_items` | Photo/video gallery | Admin |
| `web_automation_rules` | IF-THEN automation rules | Admin |
| `web_api_keys` | API tokens for integrations | Admin |
| `web_translations` | Multi-language translations | Admin |

---

## Sidebar Navigation

```
Website Module
│
├── Content
│   ├── Web Pages          — Build and manage website pages
│   ├── Blog Posts         — Publish articles and news
│   ├── Media Library      — Upload and organize files
│   └── Components         — Reusable content blocks
│
├── Design
│   ├── Templates          — Page and email templates
│   └── Navigation Menu    — Header/footer links
│
├── Offerings
│   ├── Offerings          — Your services/courses/products
│   ├── Groups             — Batches, slots, cohorts
│   └── Schedules          — Sessions, appointments, classes
│
├── Registrations
│   ├── Registrations      — Signups, bookings, enrollments
│   ├── Pricing Plans      — Fee structures per offering
│   ├── Payments           — Payment records and tracking
│   └── Credentials        — Certificates, badges, licenses
│
├── Engagement
│   ├── Enquiries          — Website form submissions
│   ├── Form Builder       — Create custom forms
│   ├── Form Responses     — View form submissions
│   ├── Events             — Public events and webinars
│   ├── Event Registrations — Event attendee tracking
│   ├── Testimonials       — Reviews and success stories
│   ├── FAQs               — Frequently asked questions
│   └── Gallery            — Photo and video gallery
│
└── Configuration
    ├── SEO Manager        — Meta tags and search optimization
    ├── Translations       — Multi-language content
    ├── Automations        — Trigger-based rules
    ├── API Keys           — External integration tokens
    ├── Content Versions   — Change history and rollback
    └── Website Settings   — Global site configuration
```
