
    const menu = document.querySelector('.menu');
    const navigation = document.querySelector('#navigation');
    function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
    menu.addEventListener('click', () => { const isOpen = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(isOpen)); });
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); } });
    window.matchMedia('(min-width: 1001px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
    document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });
    document.querySelector('#year').textContent = new Date().getFullYear();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.section-head, .bike-card, .about-grid, .detail-grid article, .bike-guide-grid, .contact-grid').forEach(element => {
        element.classList.add('reveal-ready');
        observer.observe(element);
      });
      reducedMotion.addEventListener('change', event => {
        if (event.matches) {
          document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-visible'));
          observer.disconnect();
        }
      });
    }
    const header = document.querySelector('header');
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 15);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
    const recommendations = {
      everyday: ['E-Bike & Trekking', 'Für den Arbeitsweg, entspannte Touren und alles dazwischen. Lass uns gemeinsam über deine Strecken und die passende Ausstattung sprechen.'],
      trails: ['Mountainbike', 'Du möchtest Waldwege und Trails entdecken? Wir beraten dich zu einem passenden Bike für dein Gelände und deinen Fahrstil.'],
      sport: ['Rennrad & Gravel', 'Für sportliche Kilometer auf Asphalt oder wechselnden Wegen. Gemeinsam finden wir heraus, welche Richtung zu dir passt.'],
      family: ['Kinder- & Jugendräder', 'Für die ersten eigenen Abenteuer zählt ein Rad, das passt. Sprich mit uns über Größe, Handhabung und die Bedürfnisse deines Kindes.']
    };
    document.querySelectorAll('[data-ride]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-ride]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
        const [title, description] = recommendations[button.dataset.ride];
        document.querySelector('#guide-title').textContent = title;
        document.querySelector('#guide-description').textContent = description;
      });
    });
    const status = document.querySelector('#shop-status');
    if (status) {
      const updateStatus = () => {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
      const value = type => parts.find(part => part.type === type).value;
      const day = value('weekday');
      const minutes = Number(value('hour')) * 60 + Number(value('minute'));
      const open = day === 'Sat' ? minutes >= 540 && minutes < 780 : day !== 'Sun' && ((minutes >= 540 && minutes < 720) || (minutes >= 780 && minutes < 1080));
      status.textContent = open ? 'Laut regulären Öffnungszeiten jetzt geöffnet' : 'Aktuell außerhalb der regulären Öffnungszeiten';
      status.classList.toggle('closed', !open);
      status.title = 'Feiertage und Sonderöffnungszeiten können abweichen.';
      };
      updateStatus();
      window.setInterval(updateStatus, 60000);
    }
    const lightbox = document.querySelector('.lightbox');
    const galleryItems = Array.from(document.querySelectorAll('[data-gallery]'));
    if (lightbox && typeof lightbox.showModal === 'function') {
      let currentImage = 0;
      let opener;
      const image = lightbox.querySelector('#lightbox-image');
      const showImage = index => {
        currentImage = (index + galleryItems.length) % galleryItems.length;
        const item = galleryItems[currentImage];
        image.src = item.href;
        image.alt = item.querySelector('img').alt;
        lightbox.querySelector('#lightbox-caption').textContent = image.alt;
        lightbox.querySelector('#gallery-count').textContent = `${currentImage + 1} / ${galleryItems.length}`;
      };
      galleryItems.forEach((item, index) => item.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = item;
        showImage(index);
        lightbox.showModal();
        document.body.classList.add('lightbox-open');
      }));
      lightbox.querySelector('[data-close]').addEventListener('click', () => lightbox.close());
      lightbox.querySelector('[data-prev]').addEventListener('click', () => showImage(currentImage - 1));
      lightbox.querySelector('[data-next]').addEventListener('click', () => showImage(currentImage + 1));
      lightbox.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          showImage(currentImage + (event.key === 'ArrowRight' ? 1 : -1));
        }
      });
      lightbox.addEventListener('click', event => {
        const bounds = lightbox.getBoundingClientRect();
        if (event.target === lightbox && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) lightbox.close();
      });
      lightbox.addEventListener('close', () => {
        document.body.classList.remove('lightbox-open');
        opener?.focus();
      });
    }
  
    const catalogDialog = document.querySelector('.catalog-dialog');
    const catalogContent = document.querySelector('#catalog-content');
    if (catalogContent) {
      const search = catalogContent.querySelector('#catalog-search');
      const brandSelect = catalogContent.querySelector('#catalog-brand');
      const catalogCards = Array.from(catalogContent.querySelectorAll('.catalog-card'));
      const normalize = value => value.toLocaleLowerCase('de').trim();
      const filterCatalog = () => {
        let count = 0;
        catalogCards.forEach(card => {
          const matches = normalize(card.dataset.search || card.dataset.brand).includes(normalize(search.value)) && (!brandSelect.value || card.dataset.brand === brandSelect.value);
          card.hidden = !matches;
          if (matches) count++;
        });
        catalogContent.querySelector('#catalog-count').textContent = `${count} ${count === 1 ? 'Fahrrad' : 'Fahrräder'}`;
        catalogContent.querySelector('.catalog-empty').hidden = count > 0;
      };
      search.addEventListener('input', filterCatalog);
      brandSelect.addEventListener('change', filterCatalog);
      catalogContent.querySelector('.catalog-reset').addEventListener('click', () => {
        search.value = '';
        brandSelect.value = '';
        filterCatalog();
        search.focus();
      });
      if (catalogDialog && typeof catalogDialog.showModal === 'function') {
        const originalParent = catalogContent.parentElement;
        let catalogOpener;
        document.querySelectorAll('[data-catalog-open], [data-catalog-brand]').forEach(link => {
          link.setAttribute('aria-haspopup', 'dialog');
          link.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            catalogOpener = link;
            search.value = '';
            brandSelect.value = link.dataset.catalogBrand || '';
            filterCatalog();
            catalogDialog.querySelector('#catalog-dialog-body').append(catalogContent);
            catalogDialog.showModal();
            document.body.classList.add('lightbox-open');
          });
        });
        catalogDialog.querySelector('.catalog-close').addEventListener('click', () => catalogDialog.close());
        catalogDialog.addEventListener('click', event => {
          const bounds = catalogDialog.getBoundingClientRect();
          if (event.target === catalogDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) catalogDialog.close();
        });
        catalogDialog.addEventListener('close', () => {
          originalParent.append(catalogContent);
          search.value = '';
          brandSelect.value = '';
          filterCatalog();
          document.body.classList.remove('lightbox-open');
          catalogOpener?.focus();
        });
      }
    }
    const requestedModel = new URLSearchParams(window.location.search).get('modell');
    const contactSection = document.querySelector('#kontakt .contact-grid > div');
    if (requestedModel && contactSection) {
      const enquiry = document.createElement('div');
      enquiry.className = 'model-enquiry';
      const heading = document.createElement('strong');
      heading.textContent = 'Deine Modellanfrage';
      const description = document.createElement('span');
      description.textContent = `${requestedModel.slice(0, 180)} – ruf uns an, um Größe, Preis und Verfügbarkeit zu besprechen.`;
      enquiry.append(heading, description);
      contactSection.append(enquiry);
    }
    const accountDialog = document.querySelector('.account-dialog');
    const accountOpen = document.querySelector('.account-open');
    if (accountDialog && accountOpen && typeof accountDialog.showModal === 'function') {
      const form = accountDialog.querySelector('form');
      const message = accountDialog.querySelector('#account-message');
      accountOpen.addEventListener('click', () => {
        closeMenu();
        accountDialog.showModal();
        document.body.classList.add('lightbox-open');
      });
      accountDialog.querySelector('.account-close').addEventListener('click', () => accountDialog.close());
      accountDialog.querySelectorAll('[data-account-mode]').forEach(button => button.addEventListener('click', () => {
        const registration = button.dataset.accountMode === 'register';
        accountDialog.querySelectorAll('[data-account-mode]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
        const nameLabel = accountDialog.querySelector('#account-name-label');
        nameLabel.hidden = !registration;
        form.elements.name.disabled = !registration;
        form.elements.name.required = registration;
        form.elements.password.autocomplete = registration ? 'new-password' : 'current-password';
        accountDialog.querySelector('#account-title').textContent = registration ? 'Dein Stöckl-Konto.' : 'Willkommen bei Stöckl.';
        accountDialog.querySelector('#account-submit').textContent = registration ? 'Registrieren ↗' : 'Anmelden ↗';
        message.textContent = '';
      }));
      form.addEventListener('submit', event => {
        event.preventDefault();
        message.textContent = 'Der Anmeldedienst ist noch nicht eingerichtet. Es wurden keine Daten übermittelt und kein Konto erstellt.';
        form.elements.password.value = '';
      });
      accountDialog.addEventListener('close', () => {
        form.reset();
        message.textContent = '';
        document.body.classList.remove('lightbox-open');
        accountOpen.focus();
      });
    }
    const languageButtons = document.querySelectorAll('[data-language]');
    let selectedLanguage = 'de';
    try { selectedLanguage = localStorage.getItem('stoeckl-language') === 'en' ? 'en' : 'de'; } catch {}
    const selectLanguage = language => {
      selectedLanguage = language;
      languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
      try { localStorage.setItem('stoeckl-language', language); } catch {}
      window.dispatchEvent(new CustomEvent('stoeckl:language', { detail: { language } }));
    };
    languageButtons.forEach(button => button.addEventListener('click', () => selectLanguage(button.dataset.language)));
    selectLanguage(selectedLanguage);
    const englishText = window.stoecklEnglish || {};
    const languageOriginals = new WeakMap();
    const attributeOriginals = new WeakMap();
    const translateValue = value => {
      if (englishText[value]) return englishText[value];
      if (/^\d+ Fahrräder?$/.test(value)) return value.replace('Fahrräder', 'bikes').replace('Fahrrad', 'bike');
      if (/^\d{2}:\d{2} – \d{2}:\d{2} Uhr$/.test(value)) return value.replace(' Uhr', '');
      if (value.includes(' · ')) return value.split(' · ').map(part => englishText[part] || ({'Laufrad':'Balance bike','Rennrad':'Road bike','E-Mountainbike':'Electric mountain bike','E-Bike & Trekking':'E-bike & touring'}[part]) || part).join(' · ');
      if (value.startsWith('Einblick in das Radl-Center Stöckl, Aufnahme ')) return value.replace('Einblick in das Radl-Center Stöckl, Aufnahme ', 'Inside Radl-Center Stöckl, photo ');
      if (value.endsWith(' – ruf uns an, um Größe, Preis und Verfügbarkeit zu besprechen.')) return value.replace(' – ruf uns an, um Größe, Preis und Verfügbarkeit zu besprechen.', ' — call us to discuss size, price and availability.');
      return value;
    };
    let activeLanguage = selectedLanguage;
    let translationObserver;
    const applyLanguage = () => {
      translationObserver?.disconnect();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.parentElement?.closest('script, style, .language-switch') || !node.nodeValue.trim()) continue;
        let original = languageOriginals.get(node);
        if (!original || (node.nodeValue !== original.de && node.nodeValue !== original.en)) {
          const de = node.nodeValue;
          const text = de.trim();
          original = { de, en: de.replace(text, translateValue(text)) };
          languageOriginals.set(node, original);
        }
        const value = original[activeLanguage];
        if (node.nodeValue !== value) node.nodeValue = value;
      }
      document.body.querySelectorAll('[aria-label], [placeholder], [title], [alt]').forEach(element => {
        let originals = attributeOriginals.get(element) || {};
        ['aria-label', 'placeholder', 'title', 'alt'].forEach(attribute => {
          const current = element.getAttribute(attribute);
          if (!current) return;
          if (!originals[attribute] || ![originals[attribute].de, originals[attribute].en].includes(current)) originals[attribute] = { de: current, en: translateValue(current) };
          const next = originals[attribute][activeLanguage];
          if (current !== next) element.setAttribute(attribute, next);
        });
        attributeOriginals.set(element, originals);
      });
      const title = document.querySelector('title');
      if (!title.dataset.german) title.dataset.german = title.textContent;
      title.textContent = activeLanguage === 'en' ? translateValue(title.dataset.german) : title.dataset.german;
      document.documentElement.lang = activeLanguage;
      translationObserver?.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label','placeholder','title','alt'] });
    };
    translationObserver = new MutationObserver(applyLanguage);
    window.addEventListener('stoeckl:language', event => { activeLanguage = event.detail.language; applyLanguage(); });
    applyLanguage();
