/* ==========================================================================
   Maison Clark Drywall — forms.js
   Validation and submission for every form marked [data-form]:
     quote         quote.html
     contact       contact.html
     registration  register.html (needs training.js loaded first)
   ========================================================================== */
(function (Draco) {
  'use strict';

  const SUPABASE = {
    url: 'https://nuidkenlkqdjfcwymndg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51aWRrZW5sa3FkamZjd3ltbmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTgwODMsImV4cCI6MjEwNjUzNDA4M30.JmblDpx4J6SFijgJQ08xF2rgrNaYOepp2N3rrh6dDJU',
    storageBucket: 'training-receipts',
  };

  const REGISTRATION_FEES = {
    registration: 1500,
    initialPayment: 13500,
  };

  const FORM_ENDPOINTS = {
    quote: '',
    contact: '',
    registration: `${SUPABASE.url}/rest/v1/training_registrations`,
  };

  const PAYMENT = {
    enabled: false,
    provider: 'stripe',
    checkoutEndpoint: '',
  };

  const QUOTE_UPLOADS = {
    maxFiles: 8,
    maxSizeMB: 10,
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  };

  const esc = Draco.escapeHTML;

  function isPhone(value) {
    const digits = value.replace(/\D/g, '');
    return /^[0-9+().\-\s]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }

  function errorMessage(el) {
    const v = el.validity;
    if (v.valueMissing) {
      if (el.dataset.msgRequired) return el.dataset.msgRequired;
      if (el.type === 'radio' || el.tagName === 'SELECT') return 'Choisissez une option.';
      if (el.type === 'checkbox') return 'Cochez cette case pour continuer.';
      return 'Ce champ est obligatoire.';
    }
    if (v.typeMismatch && el.type === 'email') return 'Saisissez une adresse courriel valide, par exemple nom@exemple.com.';
    if (v.tooShort) return `Saisissez au moins ${el.minLength} caractères.`;
    if (v.customError) return el.validationMessage;
    if (!v.valid) return 'Vérifiez ce champ.';
    return '';
  }

  function runCustomChecks(el) {
    if (el.dataset.validate === 'phone') {
      el.setCustomValidity(el.value.trim() && !isPhone(el.value.trim()) ? 'Saisissez un numéro de téléphone valide, uniquement des chiffres ou avec + ( ) -.' : '');
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
    if (el.disabled || el.type === 'submit' || el.type === 'button') return true;
    if (el.type === 'file') {
      const hasFile = !!(el.files && el.files.length > 0);
      const message = el.required && !hasFile ? 'Ajoutez le reçu de paiement pour confirmer votre place.' : '';
      setError(el, message);
      return !message;
    }
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
      : `<p class="form-alert form-alert--info">Ce formulaire n’est pas encore branché, donc rien n’a été envoyé. Configurez FORM_ENDPOINTS dans js/forms.js avant la mise en ligne.</p>`;
  }

  function setLoading(button, loading, idleLabel) {
    button.classList.toggle('is-loading', loading);
    button.disabled = loading;
    button.textContent = loading ? 'Envoi…' : idleLabel;
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

  function setupUploads(form) {
    const input = form.querySelector('[data-upload-input]');
    const zone = form.querySelector('[data-dropzone]');
    const list = form.querySelector('[data-upload-list]');
    if (!input || !zone || !list) return null;

    let files = [];
    const previews = new Map();

    function sync() {
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
          img.addEventListener('error', () => img.remove());
          thumb.appendChild(img);
        }

        const name = document.createElement('span');
        name.className = 'file-name';
        name.textContent = file.name;

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'file-remove';
        remove.textContent = 'Retirer';
        remove.setAttribute('aria-label', `Retirer ${file.name}`);
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
          errors.push(`Vous pouvez ajouter jusqu’à ${QUOTE_UPLOADS.maxFiles} photos.`);
          break;
        }
        const typeOk = QUOTE_UPLOADS.accept.includes(file.type) || /\.(heic|heif)$/i.test(file.name);
        if (!typeOk) { errors.push(`${file.name} n’est pas une image JPG, PNG, WebP ou HEIC.`); continue; }
        if (file.size > QUOTE_UPLOADS.maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name} est plus grand que ${QUOTE_UPLOADS.maxSizeMB} Mo.`);
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
        showFormError(form, 'Votre message n’a pas pu être envoyé. Vérifiez votre connexion puis réessayez, ou contactez-nous par téléphone ou par courriel.');
        setLoading(submit, false, idleLabel);
      }
    });
  }

  const CONTACT_METHOD_LABELS = { email: 'courriel', phone: 'téléphone', text: 'message texte' };

  const quoteForm = document.querySelector('[data-form="quote"]');
  if (quoteForm) {
    setupSimpleForm(quoteForm, 'quote', (d, photos) => `
      <h2>Demande de devis envoyée</h2>
      <p>Merci, ${esc(d.firstName)}. Nous allons examiner votre projet${photos ? ` et les ${photos} ${photos === 1 ? 'photo' : 'photos'} que vous avez ajoutées` : ''}
         et vous contacter par ${esc(CONTACT_METHOD_LABELS[d.contactMethod] || 'courriel')}.</p>
      <div class="btn-row"><a class="btn btn--outline" href="index.html">Retour à l’accueil</a></div>`);
  }

  const contactForm = document.querySelector('[data-form="contact"]');
  if (contactForm) {
    setupSimpleForm(contactForm, 'contact', (d) => `
      <h2>Message envoyé</h2>
      <p>Merci, ${esc(d.firstName)}. Nous vous répondrons à ${esc(d.email)}.</p>`);
  }

  const regForm = document.querySelector('[data-form="registration"]');
  if (regForm && Draco.trainings) setupRegistration(regForm);

  function formatGDS(value) {
    return `${Number(value).toLocaleString('fr-FR')} GDS`;
  }

  async function uploadReceiptToSupabase(file) {
    if (!file) return null;
    const safeName = file.name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    const path = `receipts/${Date.now()}-${safeName}`;
    const response = await fetch(`${SUPABASE.url}/storage/v1/object/${SUPABASE.storageBucket}/${path}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE.anonKey,
        'Authorization': `Bearer ${SUPABASE.anonKey}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: file,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Storage upload failed (${response.status}): ${body}`);
    }

    return `${SUPABASE.url}/storage/v1/object/public/${SUPABASE.storageBucket}/${path}`;
  }

  async function insertRegistrationInSupabase(payload) {
    const response = await fetch(FORM_ENDPOINTS.registration, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': SUPABASE.anonKey,
        'Authorization': `Bearer ${SUPABASE.anonKey}`,
      },
      body: JSON.stringify([payload]),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase insert failed (${response.status}): ${body}`);
    }

    return true;
  }

  function setupRegistration(form) {
    const T = Draco.trainings;
    const trainingSelect = form.querySelector('#reg-training');
    const sessionSelect = form.querySelector('#reg-session');
    const summary = document.querySelector('[data-registration-summary]');
    const submit = form.querySelector('[type="submit"]');
    const idleLabel = submit.textContent;
    const paymentRadios = form.querySelectorAll('input[name="paymentMethod"]');
    const paymentAccount = form.querySelector('#reg-payment-account');
    const receiptInput = form.querySelector('#reg-receipt');
    const paymentByMethod = {
      'Mon Cash': '+509 37 01 0055',
      Natcash: '+509 44 45 4869',
    };

    wireLiveValidation(form);

    trainingSelect.insertAdjacentHTML('beforeend', T.all.map((t) => {
      const open = T.upcomingSessions(t).some((s) => T.seatsLeft(s) > 0);
      return `<option value="${esc(t.id)}"${open ? '' : ' disabled'}>${esc(t.name)}${open ? '' : ' (aucune session disponible)'}</option>`;
    }).join(''));

    function fillSessions(training, preselect) {
      sessionSelect.innerHTML = '<option value="">Choisissez une session</option>';
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
        summary.innerHTML = '<h2>Votre cours</h2><p>Choisissez un cours et une session pour voir les détails ici.</p>';
        return;
      }
      const status = session ? T.seatStatus(session) : null;
      const registrationFee = REGISTRATION_FEES.registration;
      const participationFee = Number(training.price || REGISTRATION_FEES.initialPayment);
      const firstPayment = REGISTRATION_FEES.initialPayment;
      summary.innerHTML = `
        <h2>${esc(training.name)}</h2>
        <dl class="facts">
          <div><dt>Niveau</dt><dd>${esc(training.level)}</dd></div>
          <div><dt>Durée</dt><dd>${esc(training.duration)}</dd></div>
          <div><dt>Date</dt><dd>${session ? esc(Draco.formatDateRange(session.startDate, session.endDate)) : 'Choisissez une session'}</dd></div>
          <div><dt>Horaire</dt><dd>${session ? esc(session.schedule) : '–'}</dd></div>
          <div><dt>Lieu</dt><dd>${esc(session ? T.sessionLocation(training, session) : training.location)}</dd></div>
          <div><dt>Disponibilité</dt><dd>${session ? esc(status.label) : '–'}</dd></div>
          <div><dt>Inscription</dt><dd>${esc(formatGDS(registrationFee))}</dd></div>
          <div><dt>Participation</dt><dd>${esc(formatGDS(participationFee))}</dd></div>
          <div><dt>Premier versement</dt><dd>${esc(formatGDS(firstPayment))}</dd></div>
        </dl>`;
    }

    function updatePaymentAccount() {
      const selected = form.querySelector('input[name="paymentMethod"]:checked');
      if (!selected) {
        paymentAccount.value = '';
        paymentAccount.placeholder = 'Sélectionnez un moyen de paiement';
        return;
      }
      paymentAccount.value = paymentByMethod[selected.value] || '';
      paymentAccount.placeholder = paymentByMethod[selected.value] || '';
    }

    paymentRadios.forEach((radio) => {
      radio.addEventListener('change', updatePaymentAccount);
    });

    trainingSelect.addEventListener('change', () => {
      fillSessions(T.get(trainingSelect.value), null);
      renderSummary();
    });

    sessionSelect.addEventListener('change', renderSummary);
    fillSessions(T.get(trainingSelect.value), null);
    renderSummary();
    updatePaymentAccount();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormError(form);
      const invalid = validateForm(form);
      if (invalid) { invalid.focus(); return; }

      const chosenTraining = T.get(trainingSelect.value);
      const chosenSession = T.getSession(chosenTraining, sessionSelect.value);
      const chosenPayment = form.querySelector('input[name="paymentMethod"]:checked');
      if (!chosenTraining || !chosenSession || !chosenPayment) {
        showFormError(form, 'Choisissez un cours, une session et un moyen de paiement avant de continuer.');
        return;
      }

      setLoading(submit, true, idleLabel);

      try {
        const receiptFile = receiptInput.files && receiptInput.files[0] ? receiptInput.files[0] : null;
        const receiptUrl = await uploadReceiptToSupabase(receiptFile);
        const payload = {
          first_name: form.elements.firstName.value.trim(),
          last_name: form.elements.lastName.value.trim(),
          email: form.elements.email.value.trim(),
          phone: form.elements.phone.value.trim(),
          address: form.elements.address.value.trim(),
          training_id: chosenTraining.id,
          training_name: chosenTraining.name,
          session_id: chosenSession.id,
          session_label: `${Draco.formatDateRange(chosenSession.startDate, chosenSession.endDate)} • ${chosenSession.schedule}`,
          payment_method: chosenPayment.value,
          payment_account: paymentAccount.value,
          payment_amount: REGISTRATION_FEES.initialPayment,
          registration_fee: REGISTRATION_FEES.registration,
          participation_fee: Number(chosenTraining.price || REGISTRATION_FEES.initialPayment),
          receipt_file_name: receiptFile ? receiptFile.name : null,
          receipt_url: receiptUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        };

        await insertRegistrationInSupabase(payload);

        const whatsappText = encodeURIComponent(
          `Bonjour Maison Clark Drywall,\n\nNouvelle inscription reçue :\n- Prénom : ${payload.first_name}\n- Nom : ${payload.last_name}\n- Courriel : ${payload.email}\n- Téléphone : ${payload.phone}\n- Cours : ${payload.training_name}\n- Session : ${payload.session_label}\n- Paiement : ${payload.payment_method}\n- Compte : ${payload.payment_account}\n- Premier versement : ${formatGDS(payload.payment_amount)}\n\nMerci d’envoyer à nouveau le reçu de paiement pour confirmer le suivi rapide de l’inscription.`
        );

        window.open(`https://wa.me/50937010055?text=${whatsappText}`, '_blank');

        const confirmation = document.querySelector('[data-registration-confirmation]');
        if (confirmation) {
          confirmation.hidden = false;
          confirmation.innerHTML = `
            <h2>Inscription enregistrée</h2>
            <p>Merci, ${esc(payload.first_name)}. Votre inscription a bien été enregistrée et le message a été envoyé sur WhatsApp pour confirmation.</p>
            <p>Merci d’envoyer à nouveau le reçu de paiement afin que le suivi soit plus rapide.</p>
          `;
          confirmation.focus();
        }

        form.reset();
        trainingSelect.value = '';
        fillSessions(null, null);
        updatePaymentAccount();
        renderSummary();
      } catch (error) {
        console.error(error);
        showFormError(form, 'L’inscription n’a pas pu être envoyée. Vérifiez votre connexion ou réessayez plus tard.');
      } finally {
        setLoading(submit, false, idleLabel);
      }
    });
  }
})(window.Draco);
