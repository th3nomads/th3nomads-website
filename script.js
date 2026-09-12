'use strict';

// Preserve the existing site behavior from the previous script file.
document.write('<script src="script-base.js"><\/script>');

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
              <li>3 edited highlight reels</li>
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
              <li>4 edited highlight reels</li>
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
              <li>5 edited highlight reels</li>
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
});
