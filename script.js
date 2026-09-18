'use strict';

// Preserve the existing site behavior from the previous script file.
document.write('<script src="script-base.js?v=20260917-streamlined-home1"><\/script>');

document.addEventListener('DOMContentLoaded', () => {
  const pricingGroups = document.querySelector('#pricing .pricing-groups');
  if (pricingGroups && !document.querySelector('[data-content-creation-only]')) {
    pricingGroups.insertAdjacentHTML('beforeend', `
      <article class="pricing-group reveal visible" data-content-creation-only>
        <div class="pricing-group-heading">
          <p class="eyebrow">Content Creation Only</p>
          <h3>Social-first event coverage made for sharing while the moment still feels fresh.</h3>
        </div>
        <div class="pricing-cards">
          <div class="pricing-card">
            <p class="package-label">Social Mini</p>
            <h4>Content creation only · Starting at <strong>$350</strong></h4>
            <ul>
              <li>Up to 2 hours of coverage</li>
              <li>20+ edited vertical clips</li>
              <li>2 edited highlight reels</li>
              <li>Behind-the-scenes moments</li>
              <li>48–72 hour delivery</li>
            </ul>
            <a href="#contact">Book content coverage ↗</a>
          </div>
          <div class="pricing-card featured">
            <span class="popular">Most popular</span>
            <p class="package-label">Event Story</p>
            <h4>Content creation only · Starting at <strong>$550</strong></h4>
            <ul>
              <li>Up to 4 hours of coverage</li>
              <li>40+ edited vertical clips</li>
              <li>3 edited highlight reels</li>
              <li>Behind-the-scenes + key moments</li>
              <li>48–72 hour delivery</li>
            </ul>
            <a href="#contact">Book content coverage ↗</a>
          </div>
          <div class="pricing-card">
            <p class="package-label">Full Experience</p>
            <h4>Content creation only · Starting at <strong>$800</strong></h4>
            <ul>
              <li>Up to 6 hours of coverage</li>
              <li>60+ edited vertical clips</li>
              <li>4 edited highlight reels</li>
              <li>Extended behind-the-scenes coverage</li>
              <li>48–72 hour delivery</li>
            </ul>
            <a href="#contact">Book content coverage ↗</a>
          </div>
        </div>
      </article>
    `);
  }

  const packageSelect = document.querySelector('#inquiryForm select[name="package"]');
  if (packageSelect && !packageSelect.querySelector('optgroup[data-content-packages]')) {
    const group = document.createElement('optgroup');
    group.label = 'Content Creation Only';
    group.dataset.contentPackages = 'true';
    group.innerHTML = `
      <option>Social Mini — up to 2 hours</option>
      <option>Event Story — up to 4 hours</option>
      <option>Full Experience — up to 6 hours</option>
    `;
    const customOption = [...packageSelect.options].find(option => option.textContent === 'Custom Coverage');
    if (customOption) packageSelect.insertBefore(group, customOption);
    else packageSelect.appendChild(group);
  }

  const coverageSelect = document.querySelector('#inquiryForm select[name="videography_addon"]');
  if (coverageSelect && ![...coverageSelect.options].some(option => option.textContent.includes('Content Creation only'))) {
    const option = document.createElement('option');
    option.textContent = 'Content Creation only';
    const notSure = [...coverageSelect.options].find(item => item.textContent.startsWith('Not sure'));
    if (notSure) coverageSelect.insertBefore(option, notSure);
    else coverageSelect.appendChild(option);
  }

  // Turn the package categories into accessible tabs so one section is shown at a time.
  const pricingTabsHost = document.querySelector('#pricing .pricing-groups');
  if (pricingTabsHost && !document.querySelector('.pricing-tabs')) {
    const groups = [...pricingTabsHost.querySelectorAll(':scope > .pricing-group')];
    const tabList = document.createElement('div');
    tabList.className = 'pricing-tabs';
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Photography package categories');

    const activateTab = (index, moveFocus = false) => {
      groups.forEach((group, groupIndex) => {
        const isActive = groupIndex === index;
        group.hidden = !isActive;
        group.classList.toggle('active', isActive);
        if (isActive) group.classList.add('visible');
      });

      [...tabList.children].forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
        if (isActive) {
          // Only scroll the tab strip after an explicit keyboard navigation action.
          // Running scrollIntoView during initial page setup can move the entire page
          // down to Pricing before the browser restores the top position.
          if (moveFocus) {
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            tab.focus();
          }
        }
      });
    };

    groups.forEach((group, index) => {
      const label = group.querySelector('.pricing-group-heading .eyebrow')?.textContent.trim() || `Package category ${index + 1}`;
      const panelId = `pricing-panel-${index + 1}`;
      const tabId = `pricing-tab-${index + 1}`;
      const tab = document.createElement('button');

      group.id = panelId;
      group.setAttribute('role', 'tabpanel');
      group.setAttribute('aria-labelledby', tabId);
      tab.type = 'button';
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.textContent = label;
      tab.addEventListener('click', () => activateTab(index));
      tab.addEventListener('keydown', event => {
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % groups.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + groups.length) % groups.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = groups.length - 1;
        else return;
        event.preventDefault();
        activateTab(nextIndex, true);
      });
      tabList.appendChild(tab);
    });

    pricingTabsHost.before(tabList);
    activateTab(0);
  }


  // Reduce visual density while keeping every service and bundle detail available.
  document.querySelectorAll('.service-card').forEach(card => {
    const list = card.querySelector(':scope > ul');
    if (!list || card.querySelector('.service-details')) return;
    const details = document.createElement('details');
    details.className = 'service-details';
    const summary = document.createElement('summary');
    summary.textContent = 'View service details';
    details.append(summary, list);
    const link = card.querySelector(':scope > a');
    card.insertBefore(details, link);
  });

  document.querySelectorAll('#pricing .pricing-card').forEach(card => {
    const bundles = [...card.querySelectorAll(':scope > .video-bundle, :scope > .content-bundle')];
    if (!bundles.length || card.querySelector('.package-options')) return;
    const details = document.createElement('details');
    details.className = 'package-options';
    const summary = document.createElement('summary');
    summary.textContent = 'View bundle options';
    card.insertBefore(details, bundles[0]);
    details.append(summary, ...bundles);
  });


  // Live package + travel estimate for booking inquiries.
  const inquiryForm = document.querySelector('#inquiryForm');
  if (inquiryForm) {
    const packageField = inquiryForm.querySelector('[name="package"]');
    const coverageField = inquiryForm.querySelector('[name="videography_addon"]');
    const cityField = inquiryForm.querySelector('[name="city"]');
    const hoursField = inquiryForm.querySelector('[name="hours"]');
    const stateField = inquiryForm.querySelector('[name="state"]');
    const totalEl = document.querySelector('#estimateTotal');
    const breakdownEl = document.querySelector('#estimateBreakdown');
    const priceInput = document.querySelector('#estimatedPriceInput');
    const travelInput = document.querySelector('#estimatedTravelInput');
    const distanceInput = document.querySelector('#estimatedDistanceInput');

    // Travel policy: first 15 estimated one-way miles are included, then $1/mile
    // for each additional one-way mile. Change TRAVEL_RATE_PER_MILE here if desired.
    const INCLUDED_MILES = 15;
    const TRAVEL_RATE_PER_MILE = 1;
    const ROAD_DISTANCE_FACTOR = 1.18;
    const ADDITIONAL_HOUR_RATE = 200;
    const HOME = { lat: 40.5793, lon: -74.4115 }; // South Plainfield, NJ

    const packagePrices = {
      'Intimate — up to 3 hours': { photo: 850, video: 1450, content: 1200 },
      'Signature — up to 6 hours': { photo: 1650, video: 2700, content: 2300 },
      'Full Story — up to 8 hours': { photo: 2200, video: 3600, content: 3100 },
      'Mini Story — 30 minutes': { photo: 250, video: 450, content: 375 },
      'Classic Story — 60 minutes': { photo: 400, video: 700, content: 600 },
      'Editorial Story — up to 90 minutes': { photo: 550, video: 950, content: 825 },
      'Mini — 30 minutes': { photo: 250, video: 450, content: 375 },
      'Signature — 60 minutes': { photo: 400, video: 700, content: 600 },
      'Extended Family — up to 90 minutes': { photo: 600, video: 1000, content: 875 },
      'Essential — up to 3 hours': { photo: 500, video: 1100, content: 850 },
      'Celebration — up to 4 hours': { photo: 700, video: 1450, content: 1200 },
      'Complete Event — up to 5 hours': { photo: 1100, video: 2000, content: 1750 },
      'Social Mini — up to 2 hours': { contentOnly: 350 },
      'Event Story — up to 4 hours': { contentOnly: 550 },
      'Full Experience — up to 6 hours': { contentOnly: 800 }
    };

    const money = value => '$' + Math.round(value).toLocaleString('en-US');
    const radians = degrees => degrees * Math.PI / 180;
    const straightLineMiles = (a, b) => {
      const R = 3958.7613;
      const dLat = radians(b.lat - a.lat);
      const dLon = radians(b.lon - a.lon);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };

    const includedHours = {
      'Intimate — up to 3 hours': 3, 'Signature — up to 6 hours': 6, 'Full Story — up to 8 hours': 8,
      'Mini Story — 30 minutes': 0.5, 'Classic Story — 60 minutes': 1, 'Editorial Story — up to 90 minutes': 1.5,
      'Mini — 30 minutes': 0.5, 'Signature — 60 minutes': 1, 'Extended Family — up to 90 minutes': 1.5,
      'Essential — up to 3 hours': 3, 'Celebration — up to 4 hours': 4, 'Complete Event — up to 5 hours': 5,
      'Social Mini — up to 2 hours': 2, 'Event Story — up to 4 hours': 4, 'Full Experience — up to 6 hours': 6
    };

    const requestedHours = () => {
      const value = hoursField?.value || '';
      if (value.startsWith('Full Day')) return 8;
      const match = value.match(/^(\d+) Hour/);
      return match ? Number(match[1]) : null;
    };

    const selectedBasePrice = () => {
      const prices = packagePrices[packageField?.value];
      if (!prices) return null;
      const coverage = coverageField?.value || '';
      if (coverage === 'Photography only') return prices.photo ?? null;
      if (coverage === 'Photography + Videography package' || coverage.includes('Photo + video package')) return prices.video ?? null;
      if (coverage === 'Photography + Content Creation package') return prices.content ?? null;
      if (coverage === 'Content Creation only') return prices.contentOnly ?? null;
      if (coverage.startsWith('Videography only')) return 750;
      return null;
    };

    let estimateRequest = 0;
    const updateEstimate = async () => {
      const requestId = ++estimateRequest;
      const packageBase = selectedBasePrice();
      const included = includedHours[packageField?.value] ?? null;
      const requested = requestedHours();
      const extraHours = packageBase != null && included != null && requested != null ? Math.max(0, requested - included) : 0;
      const additionalHoursFee = extraHours * ADDITIONAL_HOUR_RATE;
      const base = packageBase == null ? null : packageBase + additionalHoursFee;
      const city = cityField?.value.trim();
      const state = stateField?.value;
      priceInput.value = '';
      travelInput.value = '';
      distanceInput.value = '';

      if (base == null) {
        totalEl.textContent = 'Select a package and coverage option';
        breakdownEl.textContent = '';
        return;
      }
      if (!city || !state) {
        totalEl.textContent = money(base) + ' + travel';
        breakdownEl.textContent = (additionalHoursFee ? 'Package + additional hours: ' + money(base) + '. ' : '') + 'Enter the event city and state to estimate travel.';
        return;
      }

      totalEl.textContent = 'Calculating estimate…';
      breakdownEl.textContent = '';
      try {
        const url = 'https://api.zippopotam.us/us/' + encodeURIComponent(state.toLowerCase()) + '/' + encodeURIComponent(city);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Location not found');
        const data = await response.json();
        if (requestId !== estimateRequest) return;
        const places = (data.places || []).filter(place => place.latitude && place.longitude);
        if (!places.length) throw new Error('Location not found');
        const destination = {
          lat: places.reduce((sum, place) => sum + Number(place.latitude), 0) / places.length,
          lon: places.reduce((sum, place) => sum + Number(place.longitude), 0) / places.length
        };
        const miles = Math.max(0, Math.round(straightLineMiles(HOME, destination) * ROAD_DISTANCE_FACTOR));
        const travelFee = Math.max(0, miles - INCLUDED_MILES) * TRAVEL_RATE_PER_MILE;
        const total = base + travelFee;
        totalEl.textContent = 'Estimated total: ' + money(total);
        breakdownEl.innerHTML = '<span>Package: <strong>' + money(packageBase) + '</strong></span>' + (additionalHoursFee ? '<span>Additional hours (' + extraHours + '): <strong>' + money(additionalHoursFee) + '</strong></span>' : '') + '<span>Estimated travel distance: <strong>' + miles + ' miles</strong></span><span>Estimated travel fee: <strong>' + (travelFee ? money(travelFee) : 'Included') + '</strong></span>';
        priceInput.value = money(total);
        travelInput.value = travelFee ? money(travelFee) : 'Included';
        distanceInput.value = miles + ' estimated one-way miles';
      } catch (error) {
        if (requestId !== estimateRequest) return;
        totalEl.textContent = money(base) + ' + travel';
        breakdownEl.textContent = 'We could not estimate travel for that city. Your package price is shown; travel will be confirmed with your quote.';
        priceInput.value = money(base) + ' + travel TBD';
      }
    };

    [packageField, coverageField, hoursField, stateField].forEach(field => field?.addEventListener('change', updateEstimate));
    cityField?.addEventListener('change', updateEstimate);
    cityField?.addEventListener('blur', updateEstimate);
  }

});
