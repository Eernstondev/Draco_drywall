/* ==========================================================================
   Draco Prestige Drywall — forms.js
   Validation and submission for every form marked [data-form]:
     quote         quote.html
     contact       contact.html
     registration  register.html (needs training.js loaded first)
   ========================================================================== */
(function (Draco) {
  'use strict';

  /* ------------------------------------------------------------------------
     Where each form is sent. Leave empty during development: the form then
     works locally and shows a notice that nothing was sent.
     Any endpoint accepting multipart/form-data works (your own API, a
     serverless function, Formspree, etc.).
     ------------------------------------------------------------------------ */
  const FORM_ENDPOINTS = {
    quote: '',
    contact: '',
    registration: '',
  };

  /* ------------------------------------------------------------------------
     Online payment (Stripe) — disabled until a backend exists.
     To enable: create a server endpoint that receives the registration,
     creates a Stripe Checkout Session with your SECRET key and returns
     { "url": "https://checkout.stripe.com/..." }. Then set enabled: true
     and checkoutEndpoint. Never put a Stripe secret key in this file.
     ------------------------------------------------------------------------ */
  const PAYMENT = {
    enabled: false,
    provider: 'stripe',
    checkoutEndpoint: '', // e.g. '/api/create-checkout-session'
  };

  const QUOTE_UPLOADS = {
    maxFiles: 8,
    maxSizeMB: 10,
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  };

  const esc = Draco.escapeHTML;

  /* ======================================================================
     Validation
     ====================================================================== */
  function isPhone(value) {
    const digits = value.replace(/\D/g, '');
    return /^[0-9+().\-\s]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }

  function errorMessage(el) {
    const v = el.validity;
    if (v.valueMissing) {
      if (el.dataset.msgRequired) return el.dataset.msgRequired;
      if (el.type === 'radio' || el.tagName === 'SELECT') return 'Choose an option.';
      if (el.type === 'checkbox') return 'Check this box to continue.';
      return 'This field is required.';
    }
    if (v.typeMismatch && el.type === 'email') return 'Enter a valid email address, like name@example.com.';
    if (v.tooShort) return `Enter at least ${el.minLength} characters.`;
    if (v.customError) return el.validationMessage;
    if (!v.valid) return 'Check this field.';
    return '';
  }

  function runCustomChecks(el) {
    if (el.dataset.validate === 'phone') {
      el.setCustomValidity(el.value.trim() && !isPhone(el.value.trim()) ? 'Enter a valid phone number, digits only or with + ( ) -.' : '');
    }
  }

  function errorKey(el) {
    return el.type === 'radio' ? el.name : el.id || el.name;
  }

  function setError(el, message) {
    const wrap = el.closest('.field');
    if (!wrap) return;
    let err = wrap.querySelector(':scope > .field-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.id = `${errorKey(el)}-error`;
      wrap.appendChild(err);
    }
    err.textContent = message;
    wrap.classList.toggle('has-error', Boolean(message));

    const targets = el.type === 'radio' ? wrap.querySelectorAll(`input[name="${el.name}"]`) : [el];
    targets.forEach((t) => {
      const described = new Set((t.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
      if (message) {
        t.setAttribute('aria-invalid', 'true');
        described.add(err.id);
      } else {
        t.removeAttribute('aria-invalid');
        described.delete(err.id);
      }
      if (described.size) t.setAttribute('aria-describedby', [...described].join(' '));
      else t.removeAttribute('aria-describedby');
    });
  }

  function validateField(el) {
    if (el.disabled || el.type === 'submit' || el.type === 'button' || el.type === 'file') return true;
    runCustomChecks(el);
    const message = errorMessage(el);
    setError(el, message);
    return !message;
  }

  function validateForm(form) {
    const seenRadios = new Set();
    let firstInvalid = null;
    form.querySelectorAll('input, select, textarea').forEach((el) => {
      if (el.type === 'radio') {
        if (seenRadios.has(el.name)) return;
        seenRadios.add(el.name);
      }
      if (!validateField(el) && !firstInvalid) firstInvalid = el;
    });
    return firstInvalid;
  }

  function wireLiveValidation(form) {
    // Validate on blur; once a field shows an error, re-check it as the user types
    form.addEventListener('focusout', (e) => {
      const el = e.target;
      if (el.matches('input:not([type="radio"]):not([type="checkbox"]), select, textarea') && el.value) validateField(el);
    });
    form.addEventListener('input', (e) => {
      if (e.target.closest('.field.has-error')) validateField(e.target);
    });
    form.addEventListener('change', (e) => {
      if (e.target.matches('input[type="radio"], input[type="checkbox"], select')) validateField(e.target);
    });
  }

  /* ======================================================================
     Submission
     ====================================================================== */
  async function send(formKey, formData) {
    const endpoint = FORM_ENDPOINTS[formKey];
    if (!endpoint) {
      console.info(`[forms] No endpoint configured for "${formKey}". Data was not sent:`, Object.fromEntries(formData));
      return { sent: false };
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return { sent: true };
  }

  function notSentNotice(sent) {
    return sent
      ? ''
      : `<p class="form-alert form-alert--info">This form is not connected yet, so nothing was sent.
           Set FORM_ENDPOINTS in js/forms.js before going live.</p>`;
  }

  function setLoading(button, loading, idleLabel) {
    button.classList.toggle('is-loading', loading);
    button.disabled = loading;
    button.textContent = loading ? 'Sending…' : idleLabel;
  }

  function showFormError(form, message) {
    const alert = form.querySelector('[data-form-alert]');
    if (!alert) return;
    alert.textContent = message;
    alert.hidden = false;
    alert.focus();
  }

  function clearFormError(form) {
    const alert = form.querySelector('[data-form-alert]');
    if (alert) alert.hidden = true;
  }

  /* ======================================================================
     Quote — photo uploads
     ====================================================================== */
  function setupUploads(form) {
    const input = form.querySelector('[data-upload-input]');
    const zone = form.querySelector('[data-dropzone]');
    const list = form.querySelector('[data-upload-list]');
    if (!input || !zone || !list) return null;

    let files = [];
    const previews = new Map(); // file -> object URL

    function sync() {
      // Mirror the managed list back into the input so FormData includes it
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    }

    function render() {
      list.innerHTML = '';
      files.forEach((file, i) => {
        const li = document.createElement('li');
        li.className = 'file-preview';
        const thumb = document.createElement('div');
        thumb.className = 'file-thumb';
        thumb.textContent = file.name.split('.').pop().toUpperCase();

        const url = previews.get(file);
        if (url) {
          const img = document.createElement('img');
          img.src = url;
          img.alt = '';
          img.addEventListener('error', () => img.remove()); // e.g. HEIC in browsers that can't display it
          thumb.appendChild(img);
        }

        const name = document.createElement('span');
        name.className = 'file-name';
        name.textContent = file.name;

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'file-remove';
        remove.textContent = 'Remove';
        remove.setAttribute('aria-label', `Remove ${file.name}`);
        remove.dataset.index = String(i);

        li.append(thumb, name, remove);
        list.appendChild(li);
      });
    }

    function addFiles(incoming) {
      const errors = [];
      for (const file of incoming) {
        const duplicate = files.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
        if (duplicate) continue;
        if (files.length >= QUOTE_UPLOADS.maxFiles) {
          errors.push(`You can add up to ${QUOTE_UPLOADS.maxFiles} photos.`);
          break;
        }
        const typeOk = QUOTE_UPLOADS.accept.includes(file.type) || /\.(heic|heif)$/i.test(file.name);
        if (!typeOk) { errors.push(`${file.name} is not a JPG, PNG, WebP or HEIC image.`); continue; }
        if (file.size > QUOTE_UPLOADS.maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name} is larger than ${QUOTE_UPLOADS.maxSizeMB} MB.`);
          continue;
        }
        files.push(file);
        previews.set(file, URL.createObjectURL(file));
      }
      sync();
      render();
      setError(input, errors.join(' '));
    }

    function removeAt(index) {
      const [file] = files.splice(index, 1);
      if (file && previews.has(file)) {
        URL.revokeObjectURL(previews.get(file));
        previews.delete(file);
      }
      sync();
      render();
      setError(input, '');
      input.focus();
    }

    input.addEventListener('change', () => {
      // input.files is replaced by the picker; merge it into the managed list
      const picked = [...input.files].filter((f) => !files.includes(f));
      addFiles(picked);
    });

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.file-remove');
      if (btn) removeAt(Number(btn.dataset.index));
    });

    ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (e) => {
      e.preventDefault();
      zone.classList.add('is-dragover');
    }));
    ['dragleave', 'dragend', 'drop'].forEach((type) => zone.addEventListener(type, (e) => {
      if (type === 'dragleave' && zone.contains(e.relatedTarget)) return;
      zone.classList.remove('is-dragover');
    }));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer?.files?.length) addFiles([...e.dataTransfer.files]);
    });

    return {
      count: () => files.length,
      reset() {
        previews.forEach((url) => URL.revokeObjectURL(url));
        previews.clear();
        files = [];
        sync();
        render();
      },
    };
  }

  /* ======================================================================
     Quote & contact
     ====================================================================== */
  function setupSimpleForm(form, key, successHTML) {
    const submit = form.querySelector('[type="submit"]');
    const idleLabel = submit.textContent;
    const uploads = key === 'quote' ? setupUploads(form) : null;
    wireLiveValidation(form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormError(form);
      const invalid = validateForm(form);
      if (invalid) { invalid.focus(); return; }

      setLoading(submit, true, idleLabel);
      try {
        const data = new FormData(form);
        const { sent } = await send(key, data);
        const container = form.closest('[data-form-container]') || form.parentElement;
        const success = document.createElement('div');
        success.className = 'form-success';
        success.tabIndex = -1;
        success.innerHTML = successHTML(Object.fromEntries(data), uploads?.count() ?? 0) + notSentNotice(sent);
        uploads?.reset();
        form.replaceWith(success);
        container.scrollIntoView({ block: 'start' });
        success.focus({ preventScroll: true });
      } catch (err) {
        console.error(err);
        showFormError(form, 'Your message could not be sent. Check your connection and try again, or contact us by phone or email.');
        setLoading(submit, false, idleLabel);
      }
    });
  }

  const CONTACT_METHOD_LABELS = { email: 'email', phone: 'phone', text: 'text message' };

  const quoteForm = document.querySelector('[data-form="quote"]');
  if (quoteForm) {
    setupSimpleForm(quoteForm, 'quote', (d, photos) => `
      <h2>Quote request sent</h2>
      <p>Thank you, ${esc(d.firstName)}. We will review your project${photos ? ` and the ${photos} ${photos === 1 ? 'photo' : 'photos'} you added` : ''}
         and contact you by ${esc(CONTACT_METHOD_LABELS[d.contactMethod] || 'email')}.</p>
      <div class="btn-row"><a class="btn btn--outline" href="index.html">Back to home</a></div>`);
  }

  const contactForm = document.querySelector('[data-form="contact"]');
  if (contactForm) {
    setupSimpleForm(contactForm, 'contact', (d) => `
      <h2>Message sent</h2>
      <p>Thank you, ${esc(d.firstName)}. We will reply to ${esc(d.email)}.</p>`);
  }

  /* ======================================================================
     Training registration
     ====================================================================== */
  const regForm = document.querySelector('[data-form="registration"]');
  if (regForm && Draco.trainings) setupRegistration(regForm);

  function setupRegistration(form) {
    const T = Draco.trainings;
    const trainingSelect = form.querySelector('#reg-training');
    const sessionSelect = form.querySelector('#reg-session');
    const summary = document.querySelector('[data-registration-summary]');
    const layout = document.querySelector('[data-registration-layout]');
    const confirmation = document.querySelector('[data-registration-confirmation]');
    const submit = form.querySelector('[type="submit"]');
    const idleLabel = submit.textContent;

    wireLiveValidation(form);

    // Courses
    trainingSelect.insertAdjacentHTML('beforeend', T.all.map((t) => {
      const open = T.upcomingSessions(t).some((s) => T.seatsLeft(s) > 0);
      return `<option value="${esc(t.id)}"${open ? '' : ' disabled'}>${esc(t.name)}${open ? '' : ' (no open sessions)'}</option>`;
    }).join(''));

    function fillSessions(training, preselect) {
      sessionSelect.innerHTML = '<option value="">Choose a session</option>';
      if (!training) {
        sessionSelect.disabled = true;
        return;
      }
      const sessions = T.upcomingSessions(training);
      sessionSelect.insertAdjacentHTML('beforeend', sessions.map((s) => {
        const status = T.seatStatus(s);
        const label = `${Draco.formatDateRange(s.startDate, s.endDate)}, ${s.schedule} (${status.label})`;
        return `<option value="${esc(s.id)}"${status.state === 'full' ? ' disabled' : ''}>${esc(label)}</option>`;
      }).join(''));
      sessionSelect.disabled = false;

      const target = sessions.find((s) => s.id === preselect && T.seatsLeft(s) > 0)
        || (sessions.filter((s) => T.seatsLeft(s) > 0).length === 1 ? sessions.find((s) => T.seatsLeft(s) > 0) : null);
      sessionSelect.value = target ? target.id : '';
    }

    function renderSummary() {
      if (!summary) return;
      const training = T.get(trainingSelect.value);
      const session = T.getSession(training, sessionSelect.value);
      if (!training) {
        summary.innerHTML = `<h2>Your course</h2><p>Choose a course and a session to see the details here.</p>`;
        return;
      }
      const status = session ? T.seatStatus(session) : null;
      summary.innerHTML = `
        <h2>${esc(training.name)}</h2>
        <dl class="facts">
          <div><dt>Level</dt><dd>${esc(training.level)}</dd></div>
          <div><dt>Duration</dt><dd>${esc(training.duration)}</dd></div>
          <div><dt>Date</dt><dd>${session ? esc(Draco.formatDateRange(session.startDate, session.endDate)) : 'Choose a session'}</dd></div>
          <div><dt>Schedule</dt><dd>${session ? esc(session.schedule) : '–'}</dd></div>
          <div><dt>Location</dt><dd>${esc(session ? T.sessionLocation(training, session) : training.location)}</dd></div>
          <div><dt>Availability</dt><dd>${status ? `<span class="seats seats--${status.state}">${esc(status.label)}</span>` : '–'}</dd></div>
          <div><dt>Price</dt><dd>${esc(Draco.formatPrice(training.price))}</dd></div>
        </dl>
        <p class="form-note">Your seat is confirmed once registration and payment are complete.</p>`;
    }

    trainingSelect.addEventListener('change', () => {
      fillSessions(T.get(trainingSelect.value));
      setError(sessionSelect, '');
      renderSummary();
    });
    sessionSelect.addEventListener('change', renderSummary);

    // Preselect from register.html?training=…&session=…
    const params = new URLSearchParams(location.search);
    const preTraining = T.get(params.get('training'));
    if (preTraining && !trainingSelect.querySelector(`option[value="${CSS.escape(preTraining.id)}"]`).disabled) {
      trainingSelect.value = preTraining.id;
      fillSessions(preTraining, params.get('session'));
    } else {
      fillSessions(null);
    }
    renderSummary();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormError(form);
      const invalid = validateForm(form);
      if (invalid) { invalid.focus(); return; }

      const training = T.get(trainingSelect.value);
      const session = T.getSession(training, sessionSelect.value);
      if (!session || T.seatsLeft(session) === 0) {
        setError(sessionSelect, 'This session is full. Choose another date.');
        sessionSelect.focus();
        return;
      }

      const data = new FormData(form);
      const registration = buildRegistration(data, training, session);
      data.set('reference', registration.reference);
      data.set('trainingName', training.name);
      data.set('amount', String(registration.amount ?? ''));
      data.set('currency', registration.currency);

      setLoading(submit, true, idleLabel);
      try {
        const { sent } = await send('registration', data);
        showConfirmation(registration, sent);
      } catch (err) {
        console.error(err);
        showFormError(form, 'Your registration could not be sent. Check your connection and try again, or contact us by phone or email.');
      } finally {
        setLoading(submit, false, idleLabel);
      }
    });

    function buildRegistration(data, training, session) {
      return {
        reference: createReference(),
        createdAt: new Date().toISOString(),
        status: 'pending_payment',
        participant: {
          firstName: data.get('firstName').trim(),
          lastName: data.get('lastName').trim(),
          email: data.get('email').trim(),
          phone: data.get('phone').trim(),
          address: data.get('address').trim(),
        },
        training: { id: training.id, name: training.name, level: training.level, duration: training.duration },
        session: {
          id: session.id,
          startDate: session.startDate,
          endDate: session.endDate,
          schedule: session.schedule,
          location: T.sessionLocation(training, session),
        },
        amount: training.price,
        currency: Draco.config.currency,
      };
    }

    function showConfirmation(reg, sent) {
      const p = reg.participant;
      const s = reg.session;
      const paymentBlock = PAYMENT.enabled
        ? `<div class="payment-box">
             <h3>Payment</h3>
             <p>Complete payment to confirm your seat. You will be redirected to a secure payment page.</p>
             <button type="button" class="btn btn--primary" data-pay>Pay ${esc(Draco.formatPrice(reg.amount))}</button>
             <p class="form-alert" data-pay-error hidden></p>
           </div>`
        : `<div class="payment-box">
             <h3>Payment</h3>
             <p>Online payment is not available yet. We will contact you at ${esc(p.email)} to confirm your seat and arrange payment of ${esc(Draco.formatPrice(reg.amount))}.</p>
           </div>`;

      confirmation.innerHTML = `
        <h2>Registration received</h2>
        <p class="lead">Thank you, ${esc(p.firstName)}. Keep your reference number for any questions about this registration.</p>
        ${notSentNotice(sent)}
        <div class="summary-block">
          <h3>Course</h3>
          <dl class="facts">
            <div><dt>Reference</dt><dd>${esc(reg.reference)}</dd></div>
            <div><dt>Course</dt><dd>${esc(reg.training.name)}</dd></div>
            <div><dt>Level</dt><dd>${esc(reg.training.level)}</dd></div>
            <div><dt>Date</dt><dd>${esc(Draco.formatDateRange(s.startDate, s.endDate))}</dd></div>
            <div><dt>Schedule</dt><dd>${esc(s.schedule)}</dd></div>
            <div><dt>Location</dt><dd>${esc(s.location)}</dd></div>
            <div><dt>Price</dt><dd>${esc(Draco.formatPrice(reg.amount))}</dd></div>
          </dl>
        </div>
        <div class="summary-block">
          <h3>Participant</h3>
          <dl class="facts">
            <div><dt>Name</dt><dd>${esc(`${p.firstName} ${p.lastName}`)}</dd></div>
            <div><dt>Email</dt><dd>${esc(p.email)}</dd></div>
            <div><dt>Phone</dt><dd>${esc(p.phone)}</dd></div>
            <div><dt>Address</dt><dd>${esc(p.address)}</dd></div>
          </dl>
        </div>
        ${paymentBlock}
        <div class="btn-row">
          <button type="button" class="btn btn--outline" data-edit>Edit registration</button>
          <button type="button" class="btn btn--outline" data-print>Print summary</button>
        </div>`;

      layout.hidden = true;
      confirmation.hidden = false;
      confirmation.scrollIntoView({ block: 'start' });
      confirmation.focus({ preventScroll: true });

      confirmation.querySelector('[data-edit]').addEventListener('click', () => {
        confirmation.hidden = true;
        layout.hidden = false;
        trainingSelect.focus();
      });
      confirmation.querySelector('[data-print]').addEventListener('click', () => window.print());
      confirmation.querySelector('[data-pay]')?.addEventListener('click', (e) => startCheckout(reg, e.currentTarget));
    }
  }

  // Short, readable reference such as DPD-LZ4K2-7QX9
  function createReference() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const random = crypto.getRandomValues(new Uint8Array(4));
    const suffix = [...random].map((n) => alphabet[n % alphabet.length]).join('');
    return `DPD-${Date.now().toString(36).toUpperCase().slice(-5)}-${suffix}`;
  }

  /* ---------- Payment hook (active only when PAYMENT.enabled) ---------- */
  async function startCheckout(registration, button) {
    const error = button.parentElement.querySelector('[data-pay-error]');
    const label = button.textContent;
    error.hidden = true;
    setLoading(button, true, label);
    try {
      const response = await fetch(PAYMENT.checkoutEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(registration),
      });
      if (!response.ok) throw new Error(`Checkout failed with status ${response.status}`);
      const { url } = await response.json();
      if (!url) throw new Error('Checkout URL missing from response');
      window.location.assign(url);
    } catch (err) {
      console.error(err);
      error.textContent = 'The payment page could not be opened. Try again in a moment.';
      error.hidden = false;
      setLoading(button, false, label);
    }
  }
})(window.Draco);
