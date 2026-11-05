STILLWELL PAINTING — BRENDALE TEAM WEBSITE / REFINED EDITION

OPEN
Open index.html in a modern browser, keeping the supplied CSS, JavaScript
and assets folders together. No installation is required.
The separately supplied Painting_Contractor_One_Page.html embeds all assets
and works as an offline review copy.

WHAT CHANGED
Refined wide-photo hero, bundled local typography, editorial service rows,
asymmetric image gallery, redesigned team section and a stronger footer.
The booking sidebar shows a live project snapshot. Mobile uses the native
date picker; the desktop calendar supports arrow keys and Enter.
Field-specific inline errors identify missing information. Scroll animation
keeps content visible while introducing each section.

15 content sections, a Brendale focus, team-based copy and 8 unique custom
photographs. The proposed service directory has 6 categories / 30 entries.
New content covers teamwork, property types, business spaces, preparation,
quote scope, service areas, project readiness and an expanded FAQ.

BOOKING REQUESTS
The three-step form supports multiple service categories and specific tasks,
property details, a preferred visit calendar, Brisbane time windows, flexible
visits, project timeframe, local photo previews, contact preferences and review.
Past dates and time-window starts are disabled. The default request horizon
is 90 days. Contact-by-phone requires a phone number. Fields are retained
while editing the request; Clear details removes the entered information.

No data is sent to a server and no appointment is reserved by this preview.
No availability feed or external calendar is connected. Text downloads and
copying work locally. A tentative .ics reminder is available only for a
specific selected day and window; it is explicitly NOT CONFIRMED.
Photos are previewed locally (JPG/PNG/WebP, up to 5 files at 5 MB each).
They are not uploaded, embedded in the request or automatically attached to email.
The visitor must attach them in their email app if sending a request.

CONNECT THE CLIENT
Edit config.js with the approved business name, phone, email and service area.
Setting contactEmail shows an Open email draft action after review. The
visitor reviews and sends in their own email app. Very long drafts may exceed
an email application's URL limit; copying or downloading the request remains
available. Direct submissions, live availability, admin notifications and
confirmed appointments need an integrated form/booking backend.
Never place SMTP passwords or private API keys in browser-side code.

BEFORE LAUNCH
Stillwell is sample branding. All 8 photos are generated concept images,
including the team photo; they are not verified staff or completed projects.
The 30 service entries are a proposed menu based on the brief, not a verified
inventory of this particular client's capabilities. Confirm the actual
services, team identity, contact details, areas, workflow and copy before launch.
No reviews, ratings, licensing claims, awards or business statistics are invented.

EDIT & REBUILD
Edit index.html for content, styles.css / extended.css for design,
polish.css for the latest visual refinements, site.js for general interactions and booking.js / booking-utils.js for booking.
To update the single-file copy after edits, run:
python3 build-standalone.py
Optional output location:
python3 build-standalone.py --output /absolute/path/preview.html

VALIDATION
Desktop browser, 320px and 390px mobile iframe layouts checked without
horizontal overflow. Service filters, service-to-booking selection, required
fields, dated and flexible requests, phone requirements, review data and edit
retention tested. Date boundaries, Brisbane timezone, request horizon,
past time windows and tentative ICS output checked programmatically.
No live email delivery or external calendar integration was tested.
Live publication was unavailable; this package can be used on static hosting.

IMAGE DETAILS
All photos were created with built-in image generation. See
assets/ for the optimized photos and generated-image-prompts.txt for prompts.

FONT FILES
Three local webfonts are bundled under assets/fonts/ so the design works
without external font requests. The supplied license is in that folder.
