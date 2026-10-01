/* ==========================================================================
   Draco Prestige Drywall — training.js
   Training catalogue (edit TRAININGS below) + rendering for:
     [data-training-list]     full catalogue (training.html)
     [data-training-preview]  short list (index.html)
   Also exposes Draco.trainings for the registration form (forms.js).
   ========================================================================== */
(function (Draco) {
  'use strict';

  /* ------------------------------------------------------------------------
     TRAININGS — edit here to add, change or remove courses and sessions.

     price       number in Draco.config.currency (set to null to show [PRICE])
     location    default location; a session can override it with its own
     sessions    startDate / endDate as "YYYY-MM-DD"
                 capacity = total seats, enrolled = seats already taken
                 seats left = capacity - enrolled (calculated automatically)
                 sessions whose end date has passed are hidden automatically

     Prices, dates and seat numbers below are EXAMPLES — replace them.
     ------------------------------------------------------------------------ */
  const TRAININGS = [
    {
      id: 'installation-fundamentals',
      name: 'Drywall Installation Fundamentals',
      level: 'Beginner',
      duration: '2 days (16 hours)',
      price: 450,
      location: '[TRAINING LOCATION]',
      description:
        'Learn to measure, cut, hang and fasten drywall on walls and ceilings. You work on full-size framed assemblies and leave able to hang a room cleanly and safely.',
      prerequisites: 'No experience required.',
      curriculum: [
        'Tools, materials and board types',
        'Reading a layout and planning joints',
        'Measuring and cutting around openings and outlets',
        'Hanging walls and ceilings',
        'Screw patterns, spacing and depth',
        'Installing corner bead',
        'Lifting, handling and job-site safety',
      ],
      sessions: [
        { id: 'if-2026-11', startDate: '2026-11-07', endDate: '2026-11-08', schedule: '8:00 AM – 4:00 PM', capacity: 10, enrolled: 4 },
        { id: 'if-2026-12', startDate: '2026-12-05', endDate: '2026-12-06', schedule: '8:00 AM – 4:00 PM', capacity: 10, enrolled: 9 },
        { id: 'if-2027-01', startDate: '2027-01-16', endDate: '2027-01-17', schedule: '8:00 AM – 4:00 PM', capacity: 10, enrolled: 0 },
      ],
    },
    {
      id: 'taping-finishing',
      name: 'Drywall Taping & Finishing',
      level: 'Intermediate',
      duration: '3 days (24 hours)',
      price: 650,
      location: '[TRAINING LOCATION]',
      description:
        'Taping, coating and sanding to a paint-ready surface. Covers paper and mesh tape, compound choice, feathering, corners and finish levels 1 to 5.',
      prerequisites: 'Recommended: basic hanging experience or the Installation Fundamentals course.',
      curriculum: [
        'Compound types and mixing',
        'Paper tape versus mesh tape',
        'Taping flat seams, butt joints and inside corners',
        'Coating corner bead',
        'Feathering and sanding technique',
        'Finish levels 1 to 5 and when to use each',
        'Spotting and fixing defects before paint',
      ],
      sessions: [
        { id: 'tf-2026-11', startDate: '2026-11-18', endDate: '2026-11-20', schedule: '8:00 AM – 4:00 PM', capacity: 8, enrolled: 8 },
        { id: 'tf-2026-12', startDate: '2026-12-09', endDate: '2026-12-11', schedule: '8:00 AM – 4:00 PM', capacity: 8, enrolled: 3 },
      ],
    },
    {
      id: 'repair-patching',
      name: 'Drywall Repair & Patching',
      level: 'Beginner',
      duration: '1 day (8 hours)',
      price: 180,
      location: '[TRAINING LOCATION]',
      description:
        'Fix holes, cracks, nail pops and water damage so the repair disappears after paint. Suited to new tradespeople, maintenance staff and property managers.',
      prerequisites: 'No experience required.',
      curriculum: [
        'Assessing damage and finding the cause',
        'Small holes, dents and cracks',
        'Patch methods for medium holes',
        'Cutting out and replacing damaged sections',
        'Matching texture and blending into the existing finish',
      ],
      sessions: [
        { id: 'rp-2026-11', startDate: '2026-11-28', endDate: '2026-11-28', schedule: '9:00 AM – 5:00 PM', capacity: 12, enrolled: 5 },
      ],
    },
  ];

  const LOW_SEATS_THRESHOLD = 3;
  const esc = Draco.escapeHTML;

  /* ---------- Data helpers ---------- */
  function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function seatsLeft(session) {
    return Math.max(0, session.capacity - session.enrolled);
  }

  function seatStatus(session) {
    const left = seatsLeft(session);
    if (left === 0) return { left, state: 'full', label: 'Full' };
    const label = `${left} ${left === 1 ? 'seat' : 'seats'} left`;
    return { left, state: left <= LOW_SEATS_THRESHOLD ? 'low' : 'open', label };
  }

  function upcomingSessions(training) {
    const today = startOfToday();
    return training.sessions
      .filter((s) => Draco.parseDate(s.endDate || s.startDate) >= today)
      .sort((a, b) => Draco.parseDate(a.startDate) - Draco.parseDate(b.startDate));
  }

  function getTraining(id) {
    return TRAININGS.find((t) => t.id === id) || null;
  }

  function getSession(training, sessionId) {
    return training?.sessions.find((s) => s.id === sessionId) || null;
  }

  function sessionLocation(training, session) {
    return session.location || training.location;
  }

  function registerUrl(training, session) {
    const params = new URLSearchParams({ training: training.id });
    if (session) params.set('session', session.id);
    return `register.html?${params}`;
  }

  /* ---------- Rendering: full catalogue ---------- */
  function seatsHTML(session) {
    const status = seatStatus(session);
    const filled = session.capacity ? Math.round((session.enrolled / session.capacity) * 100) : 100;
    return `
      <span class="seats seats--${status.state}">${esc(status.label)}</span>
      <span class="seats-bar" aria-hidden="true"><span style="width:${Math.min(filled, 100)}%"></span></span>`;
  }

  function sessionHTML(training, session) {
    const status = seatStatus(session);
    const action = status.state === 'full'
      ? `<span class="btn btn--outline btn--sm" aria-disabled="true">Full</span>`
      : `<a class="btn btn--primary btn--sm" href="${esc(registerUrl(training, session))}"
            aria-label="Register for ${esc(training.name)}, ${esc(Draco.formatDateRange(session.startDate, session.endDate))}">Register</a>`;

    return `
      <li class="session">
        <span class="session-date">${esc(Draco.formatDateRange(session.startDate, session.endDate))}</span>
        <span class="session-cell">${esc(session.schedule)}</span>
        <span class="session-cell">${esc(sessionLocation(training, session))}</span>
        <span>${seatsHTML(session)}</span>
        <span>${action}</span>
      </li>`;
  }

  function courseHTML(training) {
    const sessions = upcomingSessions(training);
    const sessionsBlock = sessions.length
      ? `<ul class="sessions">
           <li class="sessions-head" aria-hidden="true">
             <span>Date</span><span>Schedule</span><span>Location</span><span>Availability</span><span></span>
           </li>
           ${sessions.map((s) => sessionHTML(training, s)).join('')}
         </ul>`
      : `<p class="empty-state">No sessions are scheduled right now.
           <a class="text-link" href="contact.html">Contact us</a> to hear about the next dates.</p>`;

    return `
      <article class="course" id="${esc(training.id)}" aria-labelledby="${esc(training.id)}-title">
        <div class="course-main">
          <p class="course-meta">${esc(training.level)} level, ${esc(training.duration)}</p>
          <h3 class="course-title" id="${esc(training.id)}-title">${esc(training.name)}</h3>
          <p class="course-desc">${esc(training.description)}</p>
          ${training.prerequisites ? `<p class="course-note">${esc(training.prerequisites)}</p>` : ''}
          <h4>What the course covers</h4>
          <ul class="dash-list curriculum">
            ${training.curriculum.map((item) => `<li>${esc(item)}</li>`).join('')}
          </ul>
        </div>
        <aside class="course-facts" aria-label="Course details">
          <p class="price">${esc(Draco.formatPrice(training.price))}</p>
          <p class="price-note">per participant</p>
          <dl class="facts">
            <div><dt>Level</dt><dd>${esc(training.level)}</dd></div>
            <div><dt>Duration</dt><dd>${esc(training.duration)}</dd></div>
            <div><dt>Location</dt><dd>${esc(training.location)}</dd></div>
            <div><dt>Sessions</dt><dd>${sessions.length || 'None scheduled'}</dd></div>
          </dl>
        </aside>
        <div class="course-sessions">
          <h4>Sessions</h4>
          ${sessionsBlock}
        </div>
      </article>`;
  }

  /* ---------- Rendering: home preview ---------- */
  function previewHTML(training) {
    const next = upcomingSessions(training).find((s) => seatsLeft(s) > 0);
    const nextText = next
      ? `Next session ${Draco.formatDateRange(next.startDate, next.endDate)}, ${seatStatus(next).label.toLowerCase()}`
      : 'New dates coming soon';

    return `
      <li class="preview-item">
        <div>
          <h3><a href="training.html#${esc(training.id)}">${esc(training.name)}</a></h3>
          <p class="preview-meta">${esc(training.level)} level, ${esc(training.duration)}</p>
          <p class="preview-meta">${esc(nextText)}</p>
        </div>
        <div class="preview-side">
          <span class="preview-price">${esc(Draco.formatPrice(training.price))}</span>
          ${next ? `<a class="btn btn--light btn--sm" href="${esc(registerUrl(training, next))}" aria-label="Register for ${esc(training.name)}">Register</a>` : ''}
        </div>
      </li>`;
  }

  /* ---------- Mount ---------- */
  const list = document.querySelector('[data-training-list]');
  if (list) {
    list.innerHTML = TRAININGS.map(courseHTML).join('');
    // Re-apply the #anchor scroll now that the target exists
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  const preview = document.querySelector('[data-training-preview]');
  if (preview) {
    preview.innerHTML = `<ul class="preview-list">${TRAININGS.map(previewHTML).join('')}</ul>`;
  }

  /* ---------- Public API ---------- */
  Draco.trainings = {
    all: TRAININGS,
    get: getTraining,
    getSession,
    seatsLeft,
    seatStatus,
    upcomingSessions,
    sessionLocation,
  };
})(window.Draco);
