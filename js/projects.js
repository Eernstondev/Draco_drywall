/* ==========================================================================
   Draco Prestige Drywall — projects.js
   Project data (edit PROJECTS below) + rendering for:
     [data-project-grid] + [data-project-filters]  full gallery (projects.html)
     [data-projects-featured]                       featured projects (index.html)
   Clicking a project opens a <dialog> with its photos and details.
   ========================================================================== */
(function (Draco) {
  'use strict';

  const CATEGORIES = ['Residential', 'Commercial', 'Ceiling', 'Finishing', 'Repair'];

  /* ------------------------------------------------------------------------
     PROJECTS — replace with real projects and photos.
     category  must be one of CATEGORIES
     featured  true = shown on the home page (first 3)
     images    first image is the cover; add as many as needed
     ------------------------------------------------------------------------ */
  const PROJECTS = [
    {
      id: 'basement-finish',
      title: 'Basement finishing',
      category: 'Residential',
      location: '[PROJECT LOCATION]',
      featured: true,
      description: 'Full basement build-out: board on new framing, moisture-resistant board in the utility area and a smooth finish ready for paint.',
      scope: ['Installation', 'Taping & finishing', 'Moisture-resistant board'],
      images: [
        { src: 'images/projects/basement-finish-1.jpg', alt: 'Finished basement living area with smooth painted walls' },
        { src: 'images/projects/basement-finish-2.jpg', alt: 'Basement walls taped and coated before sanding' },
        { src: 'images/projects/basement-finish-3.jpg', alt: 'Drywall hung on new basement framing' },
      ],
    },
    {
      id: 'open-plan-living',
      title: 'Open-plan living area',
      category: 'Residential',
      location: '[PROJECT LOCATION]',
      featured: false,
      description: 'Walls and a long continuous ceiling in an open-plan renovation, finished to a high level for large windows and raking light.',
      scope: ['Installation', 'Ceiling', 'Level 5 finish'],
      images: [
        { src: 'images/projects/open-plan-living-1.jpg', alt: 'Bright open-plan room with finished walls and ceiling' },
        { src: 'images/projects/open-plan-living-2.jpg', alt: 'Ceiling board installed across the open-plan space' },
        { src: 'images/projects/open-plan-living-3.jpg', alt: 'Skim-coated wall under natural light' },
      ],
    },
    {
      id: 'office-fit-out',
      title: 'Office fit-out',
      category: 'Commercial',
      location: '[PROJECT LOCATION]',
      featured: true,
      description: 'Partition walls on steel studs for meeting rooms and private offices, with acoustic insulation and fire-rated board where required by the drawings.',
      scope: ['Steel stud partitions', 'Fire-rated board', 'Acoustic insulation'],
      images: [
        { src: 'images/projects/office-fit-out-1.jpg', alt: 'Finished office corridor with new partition walls' },
        { src: 'images/projects/office-fit-out-2.jpg', alt: 'Steel stud framing for office partitions' },
        { src: 'images/projects/office-fit-out-3.jpg', alt: 'Meeting room walls taped and ready for paint' },
      ],
    },
    {
      id: 'retail-unit',
      title: 'Retail unit',
      category: 'Commercial',
      location: '[PROJECT LOCATION]',
      featured: false,
      description: 'Demising walls, bulkheads and a stockroom partition for a new retail tenant, scheduled around the other trades on site.',
      scope: ['Demising walls', 'Bulkheads', 'Taping & finishing'],
      images: [
        { src: 'images/projects/retail-unit-1.jpg', alt: 'Retail space with finished walls and bulkheads' },
        { src: 'images/projects/retail-unit-2.jpg', alt: 'Bulkhead framing above the shop front' },
        { src: 'images/projects/retail-unit-3.jpg', alt: 'Stockroom partition with board installed' },
      ],
    },
    {
      id: 'tray-ceiling',
      title: 'Tray ceiling',
      category: 'Ceiling',
      location: '[PROJECT LOCATION]',
      featured: true,
      description: 'Stepped tray ceiling in a dining room with crisp corner bead on every edge and a recess for indirect lighting.',
      scope: ['Ceiling framing', 'Corner bead', 'Finishing'],
      images: [
        { src: 'images/projects/tray-ceiling-1.jpg', alt: 'Finished tray ceiling with clean stepped edges' },
        { src: 'images/projects/tray-ceiling-2.jpg', alt: 'Tray ceiling framing before board' },
        { src: 'images/projects/tray-ceiling-3.jpg', alt: 'Corner bead coated on the ceiling steps' },
      ],
    },
    {
      id: 'suspended-ceiling',
      title: 'Suspended office ceiling',
      category: 'Ceiling',
      location: '[PROJECT LOCATION]',
      featured: false,
      description: 'Suspended drywall ceiling on a steel grid, with access panels and openings coordinated with lighting and ventilation.',
      scope: ['Suspended grid', 'Access panels', 'Finishing'],
      images: [
        { src: 'images/projects/suspended-ceiling-1.jpg', alt: 'Finished suspended ceiling in an office' },
        { src: 'images/projects/suspended-ceiling-2.jpg', alt: 'Steel suspension grid before board' },
        { src: 'images/projects/suspended-ceiling-3.jpg', alt: 'Access panel set flush into the ceiling' },
      ],
    },
    {
      id: 'feature-wall',
      title: 'Level 5 feature wall',
      category: 'Finishing',
      location: '[PROJECT LOCATION]',
      featured: false,
      description: 'Full skim coat over a tall wall lit by wall-washer lights, where any joint or ridge would show.',
      scope: ['Skim coat', 'Level 5 finish'],
      images: [
        { src: 'images/projects/feature-wall-1.jpg', alt: 'Tall smooth wall under grazing light' },
        { src: 'images/projects/feature-wall-2.jpg', alt: 'Skim coat being applied across the wall' },
        { src: 'images/projects/feature-wall-3.jpg', alt: 'Sanded wall checked with a work light' },
      ],
    },
    {
      id: 'stairwell',
      title: 'Stairwell finishing',
      category: 'Finishing',
      location: '[PROJECT LOCATION]',
      featured: false,
      description: 'Taping and finishing a double-height stairwell, with scaffolding and many outside corners to keep straight and true.',
      scope: ['Taping & finishing', 'Corner bead'],
      images: [
        { src: 'images/projects/stairwell-1.jpg', alt: 'Finished double-height stairwell' },
        { src: 'images/projects/stairwell-2.jpg', alt: 'Stairwell corners with bead installed' },
        { src: 'images/projects/stairwell-3.jpg', alt: 'Stairwell walls coated and ready to sand' },
      ],
    },
    {
      id: 'water-damage-repair',
      title: 'Water damage repair',
      category: 'Repair',
      location: '[PROJECT LOCATION]',
      featured: false,
      description: 'Damaged ceiling and wall sections removed after a leak, replaced and blended into the surrounding finish.',
      scope: ['Section replacement', 'Blending', 'Finishing'],
      images: [
        { src: 'images/projects/water-damage-repair-1.jpg', alt: 'Repaired ceiling with no visible patch' },
        { src: 'images/projects/water-damage-repair-2.jpg', alt: 'Damaged ceiling section cut out' },
        { src: 'images/projects/water-damage-repair-3.jpg', alt: 'New board patched into the ceiling' },
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
              <button type="button" class="modal-nav modal-nav--prev" aria-label="Previous photo">${ICONS.prev}</button>
              <button type="button" class="modal-nav modal-nav--next" aria-label="Next photo">${ICONS.next}</button>
              <p class="modal-counter" aria-live="polite"></p>
            </div>
            <ul class="modal-thumbs" aria-label="Project photos"></ul>
          </div>
          <div class="modal-body">
            <p class="modal-cat"></p>
            <h2 class="modal-title" id="project-modal-title"></h2>
            <p class="modal-desc"></p>
            <dl class="facts">
              <div><dt>Location</dt><dd class="modal-location"></dd></div>
              <div><dt>Scope</dt><dd><ul class="modal-scope"></ul></dd></div>
            </dl>
            <a class="btn btn--primary" href="quote.html">Request a Quote</a>
          </div>
          <button type="button" class="modal-close" aria-label="Close">${ICONS.close}</button>
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
