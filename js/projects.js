/* ==========================================================================
   Maison Clark Drywall — projects.js
   Project data (edit PROJECTS below) + rendering for:
     [data-project-grid] + [data-project-filters]  full gallery (projects.html)
     [data-projects-featured]                       featured projects (index.html)
   Clicking a project opens a <dialog> with its photos and details.
   ========================================================================== */
(function (Draco) {
  'use strict';

  const CATEGORIES = ['Résidentiel', 'Commercial', 'Plafonds', 'Finition', 'Réparation'];

  /* ------------------------------------------------------------------------
     PROJECTS — replace with real projects and photos.
     category  must be one of CATEGORIES
     featured  true = shown on the home page (first 3)
     images    first image is the cover; add as many as needed
     ------------------------------------------------------------------------ */
  const PROJECTS = [
    {
      id: 'sous-sol',
      title: 'Rénovation du sous-sol',
      category: 'Résidentiel',
      featured: true,
      description: 'Aménagement complet du sous-sol : plaques sur une nouvelle charpente, plaques résistantes à l’humidité dans la zone utilitaire et finition lisse prête à peindre.',
      scope: ['Installation', 'Pose de joints et finition', 'Plaques résistantes à l’humidité'],
      images: [
        { src: 'images/projects/IMG_2525.jpg', alt: 'Séjour de sous-sol fini avec murs peints et lisses' },
        { src: 'images/projects/IMG_2526.jpg', alt: 'Murs de sous-sol joints et enduits avant le ponçage' },
        { src: 'images/projects/IMG_2524.jpg', alt: 'Plaques de cloisons placées sur une nouvelle charpente' },
      ],
    },
    {
      id: 'open-plan-living',
      title: 'Espace de vie ouvert',
      category: 'Résidentiel',
      featured: false,
      description: 'Murs et un long plafond continu dans une rénovation ouverte, fini à un niveau élevé pour les grandes fenêtres et la lumière rasante.',
      scope: ['Installation', 'Plafond', 'Finition de niveau 5'],
      images: [
        { src: 'images/projects/es.JPG', alt: 'Pièce ouverte lumineuse avec murs et plafond finis' },
        { src: 'images/projects/ce.JPG', alt: 'Plaques de plafond installées sur l’espace ouvert' },
        { src: 'images/projects/pa.jpg', alt: 'Mur lissé sous la lumière naturelle' },
      ],
    },
    {
      id: 'office-fit-out',
      title: 'Aménagement de bureau',
      category: 'Commercial',
      featured: true,
      description: 'Cloisons de séparation sur montants métalliques pour salles de réunion et bureaux privés, avec isolation acoustique et plaques ignifuges selon les plans.',
      scope: ['Cloisons sur montants acier', 'Plaques ignifuges', 'Isolation acoustique'],
      images: [
        { src: 'images/projects/IMG_2530.jpg', alt: 'Corridor de bureau fini avec nouvelles cloisons' },
        { src: 'images/projects/IMG_2531.jpg', alt: 'Charpente en acier pour cloisons de bureau' },
        { src: 'images/projects/IMG_2532.jpg', alt: 'Murs de salle de réunion joints et prêts à être peints' },
      ],
    },
    {
      id: 'retail-unit',
      title: 'Commerce',
      category: 'Commercial',
      location: '[LIEU DU PROJET]',
      featured: false,
      description: 'Murs de séparation, caissons et cloison d’atelier pour un nouveau locataire commercial, planifiés autour des autres corps de métier sur chantier.',
      scope: ['Murs de séparation', 'Caissons', 'Pose de joints et finition'],
      images: [
        { src: 'images/projects/merce.jpeg', alt: 'Espace commercial avec murs et caissons finis' },
        { src: 'images/projects/me.jpeg', alt: 'Charpente de caisson au-dessus de la façade du commerce' },
        { src: 'images/projects/com.jpeg', alt: 'Cloison de réserve avec plaques installées' },
      ],
    },
    {
      id: 'tray-ceiling',
      title: 'Plafond en caisson',
      category: 'Plafonds',
      featured: true,
      description: 'Plafond en caisson à étages dans une salle à manger avec des cornières nettes sur chaque angle et un renfoncement pour l’éclairage indirect.',
      scope: ['Charpente de plafond', 'Cornières', 'Finition'],
      images: [
        { src: 'images/projects/plafondse.jpeg', alt: 'Plafond en caisson fini avec bords propres' },
        { src: 'images/projects/lafonse.jpeg', alt: 'Charpente du plafond en caisson avant pose' },
        { src: 'images/projects/fondse.jpeg', alt: 'Cornières enduites sur les étages du plafond' },
      ],
    },
  ];

  const esc = Draco.escapeHTML;
  const ICONS = {
    prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  };

  /* ---------- Cards ---------- */
  function cardHTML(project) {
    const count = project.images.length;
    return `
      <li class="project-card" data-category="${esc(project.category)}">
        <button type="button" class="project-trigger" data-project-id="${esc(project.id)}" aria-haspopup="dialog">
          <span class="media media--4x3 project-media">
            <img src="${esc(project.images[0].src)}" alt="" width="1200" height="900" loading="lazy" decoding="async">
          </span>
          <span class="project-info">
            <span class="project-cat">${esc(project.category)}</span>
            <span class="project-title">${esc(project.title)}</span>
            <span class="project-count">${count} ${count === 1 ? 'photo' : 'photos'}</span>
          </span>
        </button>
      </li>`;
  }

  /* ---------- Modal ---------- */
  const modal = {
    el: null,
    project: null,
    index: 0,
    trigger: null,
    refs: {},

    build() {
      const el = document.createElement('dialog');
      el.className = 'modal';
      el.setAttribute('aria-labelledby', 'project-modal-title');
      el.innerHTML = `
        <div class="modal-inner">
          <div class="modal-gallery">
            <div class="modal-stage">
              <img class="modal-image" src="" alt="" width="1600" height="1200">
              <button type="button" class="modal-nav modal-nav--prev" aria-label="Photo précédente">${ICONS.prev}</button>
              <button type="button" class="modal-nav modal-nav--next" aria-label="Photo suivante">${ICONS.next}</button>
              <p class="modal-counter" aria-live="polite"></p>
            </div>
            <ul class="modal-thumbs" aria-label="Photos du projet"></ul>
          </div>
          <div class="modal-body">
            <p class="modal-cat"></p>
            <h2 class="modal-title" id="project-modal-title"></h2>
            <p class="modal-desc"></p>
            <dl class="facts">
              <div><dt>Lieu</dt><dd class="modal-location"></dd></div>
              <div><dt>Portée</dt><dd><ul class="modal-scope"></ul></dd></div>
            </dl>
            <a class="btn btn--primary" href="quote.html">Demander un devis</a>
          </div>
          <button type="button" class="modal-close" aria-label="Fermer">${ICONS.close}</button>
        </div>`;
      document.body.appendChild(el);

      const q = (sel) => el.querySelector(sel);
      this.el = el;
      this.refs = {
        image: q('.modal-image'),
        prev: q('.modal-nav--prev'),
        next: q('.modal-nav--next'),
        counter: q('.modal-counter'),
        thumbs: q('.modal-thumbs'),
        cat: q('.modal-cat'),
        title: q('.modal-title'),
        desc: q('.modal-desc'),
        location: q('.modal-location'),
        scope: q('.modal-scope'),
        stage: q('.modal-stage'),
      };

      this.refs.prev.addEventListener('click', () => this.go(this.index - 1));
      this.refs.next.addEventListener('click', () => this.go(this.index + 1));
      q('.modal-close').addEventListener('click', () => el.close());
      this.refs.thumbs.addEventListener('click', (e) => {
        const thumb = e.target.closest('[data-index]');
        if (thumb) this.go(Number(thumb.dataset.index));
      });

      // Click on the backdrop closes the dialog
      el.addEventListener('click', (e) => { if (e.target === el) el.close(); });

      el.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.go(this.index - 1);
        if (e.key === 'ArrowRight') this.go(this.index + 1);
      });

      el.addEventListener('close', () => {
        document.documentElement.classList.remove('modal-open');
        this.trigger?.focus();
      });

      // Swipe between photos on touch screens
      let startX = null;
      this.refs.stage.addEventListener('pointerdown', (e) => { startX = e.clientX; });
      this.refs.stage.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) this.go(this.index + (dx < 0 ? 1 : -1));
      });
    },

    open(project, trigger) {
      if (!this.el) this.build();
      this.project = project;
      this.trigger = trigger;

      const r = this.refs;
      r.cat.textContent = project.category;
      r.title.textContent = project.title;
      r.desc.textContent = project.description;
      r.location.textContent = project.location;
      r.scope.innerHTML = project.scope.map((s) => `<li>${esc(s)}</li>`).join('');
      r.thumbs.innerHTML = project.images.map((img, i) => `
        <li><button type="button" class="modal-thumb" data-index="${i}" aria-label="Show photo ${i + 1}">
          <img src="${esc(img.src)}" alt="" width="176" height="132" loading="lazy">
        </button></li>`).join('');

      const multiple = project.images.length > 1;
      r.prev.hidden = !multiple;
      r.next.hidden = !multiple;
      r.thumbs.hidden = !multiple;

      this.go(0);
      document.documentElement.classList.add('modal-open');
      this.el.showModal();
      this.el.querySelector('.modal-inner').scrollTop = 0;
    },

    go(i) {
      const images = this.project.images;
      this.index = (i + images.length) % images.length; // wraps around
      const img = images[this.index];
      this.refs.image.src = img.src;
      this.refs.image.alt = img.alt;
      this.refs.counter.textContent = `${this.index + 1} / ${images.length}`;
      this.refs.thumbs.querySelectorAll('.modal-thumb').forEach((t, n) => {
        t.setAttribute('aria-current', String(n === this.index));
      });
    },
  };

  function bindTriggers(container) {
    container.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-project-id]');
      if (!trigger) return;
      const project = PROJECTS.find((p) => p.id === trigger.dataset.projectId);
      if (project) modal.open(project, trigger);
    });
  }

  /* ---------- Full gallery with filters ---------- */
  const grid = document.querySelector('[data-project-grid]');
  const filterBar = document.querySelector('[data-project-filters]');
  const status = document.querySelector('[data-project-status]');
  const empty = document.querySelector('[data-project-empty]');

  if (grid) {
    grid.innerHTML = PROJECTS.map(cardHTML).join('');
    bindTriggers(grid);
  }

  function applyFilter(category) {
    let shown = 0;
    grid.querySelectorAll('.project-card').forEach((card) => {
      const match = category === 'All' || card.dataset.category === category;
      card.hidden = !match;
      if (match) shown += 1;
    });
    filterBar.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === category));
    });
    if (empty) empty.hidden = shown > 0;
    if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'}`;

    // Keep the filter in the URL so a filtered view can be shared
    const url = new URL(location.href);
    if (category === 'All') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    history.replaceState(null, '', url);
  }

  if (grid && filterBar) {
    const counts = PROJECTS.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {});
    const filters = ['All', ...CATEGORIES];
    filterBar.innerHTML = filters.map((cat) => `
      <button type="button" class="filter-btn" data-filter="${esc(cat)}" aria-pressed="false">
        ${esc(cat)}<span class="filter-count">${cat === 'All' ? PROJECTS.length : counts[cat] || 0}</span>
      </button>`).join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (btn) applyFilter(btn.dataset.filter);
    });

    const requested = new URLSearchParams(location.search).get('category');
    applyFilter(filters.includes(requested) ? requested : 'All');
  }

  /* ---------- Featured projects (home) ---------- */
  const featured = document.querySelector('[data-projects-featured]');
  if (featured) {
    const limit = Number(featured.dataset.limit) || 3;
    const items = PROJECTS.filter((p) => p.featured).slice(0, limit);
    featured.innerHTML = items.map(cardHTML).join('');
    bindTriggers(featured);
  }
})(window.Draco);
