/* ==========================================================================
   Maison Clark Drywall — training.js
   Training catalogue (edit TRAININGS below) + rendering for:
     [data-training-list]     full catalogue (training.html)
     [data-training-preview]  short list (index.html)
   Also exposes Draco.trainings for the registration form (forms.js).
   ========================================================================== */
(function (Draco) {
  'use strict';

  const TRAININGS = [
    {
      id: 'installation-fondamentaux',
      name: 'Fondamentaux de la pose de cloisons sèches',
      level: 'Débutant',
      duration: '4 week-ends (8 jours) + 15 jours de pratique supervisée',
      price: 21500,
      location: 'Amérique, Pétion-Ville, Berthé',
      description:
        'Les cours débuteront le 7 novembre au 29 novembre en week-ends. Les pratiques se dérouleront durant toute la semaine. Vous apprendrez à mesurer, couper, poser et fixer les plaques de cloison sèche sur les murs et plafonds, puis vous quitterez le cours en sachant poser proprement et en toute sécurité.',
      prerequisites: 'Aucune expérience requise.',
      curriculum: [
        'Outils, matériaux et types de plaques',
        'Lecture d’un plan et organisation des joints',
        'Mesure et découpe autour des ouvertures et prises',
        'Pose de murs et de plafonds',
        'Motifs de vis, espacement et profondeur',
        'Installation des cornières',
        'Levage, manutention et sécurité sur chantier',
      ],
      sessions: [
        { id: 'if-2026-11-w1', startDate: '2026-11-07', endDate: '2026-11-29', schedule: 'Week-end • 8:00 – 16:00', capacity: 51, enrolled: 1 },
      ],
    },
    
  ];
  const LOW_SEATS_THRESHOLD = 3;
  const esc = Draco.escapeHTML;

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
    if (left === 0) return { left, state: 'full', label: 'Complet' };
    const label = `${left} ${left === 1 ? 'place' : 'places'} restante${left === 1 ? '' : 's'}`;
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
      ? `<span class="btn btn--outline btn--sm" aria-disabled="true">Complet</span>`
      : `<a class="btn btn--primary btn--sm" href="${esc(registerUrl(training, session))}"
            aria-label="S’inscrire à ${esc(training.name)}, ${esc(Draco.formatDateRange(session.startDate, session.endDate))}">S’inscrire</a>`;

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
             <span>Date</span><span>Horaire</span><span>Lieu</span><span>Disponibilité</span><span></span>
           </li>
           ${sessions.map((s) => sessionHTML(training, s)).join('')}
         </ul>`
      : `<p class="empty-state">Aucune session n’est prévue pour le moment. <a class="text-link" href="contact.html">Contactez-nous</a> pour connaître les prochaines dates.</p>`;

    return `
      <article class="course" id="${esc(training.id)}" aria-labelledby="${esc(training.id)}-title">
        <div class="course-main">
          <p class="course-meta">Niveau ${esc(training.level)}, ${esc(training.duration)}</p>
          <h3 class="course-title" id="${esc(training.id)}-title">${esc(training.name)}</h3>
          <p class="course-desc">${esc(training.description)}</p>
          ${training.prerequisites ? `<p class="course-note">${esc(training.prerequisites)}</p>` : ''}
          <h4>Ce que couvre le cours</h4>
          <ul class="dash-list curriculum">
            ${training.curriculum.map((item) => `<li>${esc(item)}</li>`).join('')}
          </ul>
        </div>
        <aside class="course-facts" aria-label="Détails du cours">
          <p class="price">${esc(Draco.formatPrice(training.price))}</p>
          <p class="price-note">par participant</p>
          <dl class="facts">
            <div><dt>Niveau</dt><dd>${esc(training.level)}</dd></div>
            <div><dt>Durée</dt><dd>${esc(training.duration)}</dd></div>
            <div><dt>Lieu</dt><dd>${esc(training.location)}</dd></div>
            <div><dt>Sessions</dt><dd>${sessions.length || 'Aucune date prévue'}</dd></div>
          </dl>
        </aside>
        <div class="course-sessions">
          <h4>Sessions</h4>
          ${sessionsBlock}
        </div>
      </article>`;
  }

  function previewHTML(training) {
    const next = upcomingSessions(training).find((s) => seatsLeft(s) > 0);
    const nextText = next
      ? `Prochaine session ${Draco.formatDateRange(next.startDate, next.endDate)}, ${seatStatus(next).label.toLowerCase()}`
      : 'Nouvelles dates prochainement';

    return `
      <li class="preview-item">
        <div>
          <h3><a href="training.html#${esc(training.id)}">${esc(training.name)}</a></h3>
          <p class="preview-meta">Niveau ${esc(training.level)}, ${esc(training.duration)}</p>
          <p class="preview-meta">${esc(nextText)}</p>
        </div>
        <div class="preview-side">
          <span class="preview-price">${esc(Draco.formatPrice(training.price))}</span>
          ${next ? `<a class="btn btn--light btn--sm" href="${esc(registerUrl(training, next))}" aria-label="S’inscrire à ${esc(training.name)}">S’inscrire</a>` : ''}
        </div>
      </li>`;
  }

  const list = document.querySelector('[data-training-list]');
  if (list) {
    list.innerHTML = TRAININGS.map(courseHTML).join('');
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  const preview = document.querySelector('[data-training-preview]');
  if (preview) {
    preview.innerHTML = `<ul class="preview-list">${TRAININGS.map(previewHTML).join('')}</ul>`;
  }

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
