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

});
