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
  if (packageSelect && !packageSelect.querySelector('[data-content-packages]')) {
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
 
document.addEventListener('DOMContentLoaded', () => {
  // Live package + travel estimate for booking inquiries.
  const inquiryForm = document.querySelector('#inquiryForm');
  if (inquiryForm) {
    inquiryForm.querySelectorAll('input[type="date"], input[type="time"]').forEach(pickerField => {
      pickerField.addEventListener('click', () => {
        if (pickerField.disabled || typeof pickerField.showPicker !== 'function') return;
        try { pickerField.showPicker(); } catch (error) {}
      });
    });
    const emailField = inquiryForm.querySelector('[name="email"]');
    if (emailField) {
      emailField.required = true;
      emailField.setAttribute('aria-required', 'true');
      const emailLabel = emailField.closest('label');
      emailLabel?.querySelector('.optional')?.remove();
      if (emailLabel && !emailLabel.querySelector('.required-field')) {
        const requiredLabel = document.createElement('span');
        requiredLabel.className = 'required-field';
        requiredLabel.textContent = 'Required';
        emailLabel.insertBefore(requiredLabel, emailField);
      }
      let emailAlertOpen = false;
      const showEmailAlert = () => {
        if (emailAlertOpen) return;
        emailAlertOpen = true;
        const message = emailField.validity.valueMissing
          ? 'Please provide your email address before submitting your inquiry.'
          : 'Please enter a valid email address before submitting your inquiry.';
        window.alert(message);
        emailAlertOpen = false;
        emailField.focus();
      };
      emailField.addEventListener('invalid', event => {
        event.preventDefault();
        showEmailAlert();
      });
      inquiryForm.addEventListener('submit', event => {
        if (!emailField.checkValidity()) {
          event.preventDefault();
          showEmailAlert();
        }
      });
    }
    const packageField = inquiryForm.querySelector('[name="package"]');
    const additionalPackageFields = [2,3,4].map(n => inquiryForm.querySelector('[name="package_' + n + '"]')).filter(Boolean);
    const additionalCoverageFields = [2,3,4].map(n => inquiryForm.querySelector('[name="videography_addon_' + n + '"]')).filter(Boolean);
    const addPackageButton = inquiryForm.querySelector('#addPackageButton');
    const additionalPackageRows = [...inquiryForm.querySelectorAll('.additional-package-row')];
    const updateAddPackageButton = () => {
      if (addPackageButton) addPackageButton.hidden = !additionalPackageRows.some(row => row.hidden);
    };
    additionalPackageFields.forEach((field, index) => {
      if (field.value && additionalPackageRows[index]) additionalPackageRows[index].hidden = false;
    });
    addPackageButton?.addEventListener('click', () => {
      const nextRow = additionalPackageRows.find(row => row.hidden);
      if (!nextRow) return;
      nextRow.hidden = false;
      nextRow.querySelector('select')?.focus();
      updateAddPackageButton();
    });
    updateAddPackageButton();
    const formatTimeRange = (start, end) => start && end ? start + ' to ' + end : '';
    const calculateDuration = (start, end) => {
      if (!start || !end) return null;
      const [startHour,startMinute]=start.split(':').map(Number);
      const [endHour,endMinute]=end.split(':').map(Number);
      let minutes=(endHour*60+endMinute)-(startHour*60+startMinute);
      if(minutes<=0) minutes+=24*60;
      return minutes/60;
    };
    const formatDuration = hours => hours==null ? '' : (Number.isInteger(hours)?hours:Math.round(hours*100)/100) + ' Hours';
    const primaryStartTime = inquiryForm.querySelector('[name="event_start_time"]');
    const primaryEndTime = inquiryForm.querySelector('[name="event_end_time"]');
    const primaryCombinedTime = inquiryForm.querySelector('[name="event_time"]');
    const primaryHoursInput = inquiryForm.querySelector('[name="hours"]');
    const syncPrimaryTime = () => {
      if (primaryCombinedTime) primaryCombinedTime.value = formatTimeRange(primaryStartTime?.value, primaryEndTime?.value);
      if (primaryHoursInput) primaryHoursInput.value = formatDuration(calculateDuration(primaryStartTime?.value, primaryEndTime?.value));
    };
    primaryStartTime?.addEventListener('input', syncPrimaryTime);
    primaryEndTime?.addEventListener('input', syncPrimaryTime);

    const additionalPackageTimeFields = [2,3,4].map(n => ({
      date: inquiryForm.querySelector('[name="date_' + n + '"]'),
      start: inquiryForm.querySelector('[name="event_start_time_' + n + '"]'),
      end: inquiryForm.querySelector('[name="event_end_time_' + n + '"]'),
      combined: inquiryForm.querySelector('[name="event_time_' + n + '"]'),
      hours: inquiryForm.querySelector('[name="hours_' + n + '"]')
    }));
    additionalPackageFields.forEach((field, index) => {
      const timeFields = additionalPackageTimeFields[index];
      const additionalCoverageField = additionalCoverageFields[index];
      if (!timeFields?.date || !timeFields?.start || !timeFields?.end || !timeFields?.combined || !timeFields?.hours) return;
      const syncCombinedTime = () => {
        timeFields.combined.value = formatTimeRange(timeFields.start.value, timeFields.end.value);
        timeFields.hours.value = formatDuration(calculateDuration(timeFields.start.value, timeFields.end.value));
      };
      const syncPackageTime = () => {
        const hasPackage = Boolean(field.value);
        [timeFields.date, timeFields.start, timeFields.end].forEach(timeField => {
          timeField.disabled = false;
          timeField.required = hasPackage;
          timeField.setAttribute('aria-required', String(hasPackage));
        });
        if (additionalCoverageField) {
          additionalCoverageField.disabled = !hasPackage;
          additionalCoverageField.required = hasPackage;
          additionalCoverageField.setAttribute('aria-required', String(hasPackage));
        }
        timeFields.combined.disabled = !hasPackage;
        timeFields.hours.disabled = !hasPackage;
        syncCombinedTime();
      };
      field.addEventListener('change', syncPackageTime);
      timeFields.start.addEventListener('input', syncCombinedTime);
      timeFields.end.addEventListener('input', syncCombinedTime);
      syncPackageTime();
    });
    const coverageField = inquiryForm.querySelector('[name="videography_addon"]');
    const cityField = inquiryForm.querySelector('[name="city"]');
    const stateField = inquiryForm.querySelector('[name="state"]');
    const totalEl = document.querySelector('#estimateTotal');
    const totalDisplay = document.querySelector('#estimateTotalDisplay');
    const citySuggestions = document.querySelector('#citySuggestions');
    const breakdownEl = document.querySelector('#estimateBreakdown');
    const priceInput = document.querySelector('#estimatedPriceInput');
    const travelInput = document.querySelector('#estimatedTravelInput');
    const distanceInput = document.querySelector('#estimatedDistanceInput');

    const INCLUDED_MILES = 15;
    const TRAVEL_RATE_PER_MILE = 1;
    const ROAD_DISTANCE_FACTOR = 1.18;
    const ADDITIONAL_HOUR_RATE = 150;
    const NEW_YORK_TOLL_FEE = 30;
    const HOME = { lat: 40.5793, lon: -74.4115 };

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
    const includedHours = {
      'Intimate — up to 3 hours':3,'Signature — up to 6 hours':6,'Full Story — up to 8 hours':8,
      'Mini Story — 30 minutes':.5,'Classic Story — 60 minutes':1,'Editorial Story — up to 90 minutes':1.5,
      'Mini — 30 minutes':.5,'Signature — 60 minutes':1,'Extended Family — up to 90 minutes':1.5,
      'Essential — up to 3 hours':3,'Celebration — up to 4 hours':4,'Complete Event — up to 5 hours':5,
      'Social Mini — up to 2 hours':2,'Event Story — up to 4 hours':4,'Full Experience — up to 6 hours':6
    };

    const money = value => '$' + Math.round(value).toLocaleString('en-US');
    const showTotal = value => { if (totalEl) totalEl.textContent=value; if (totalDisplay) totalDisplay.value=value; };
    const radians = d => d*Math.PI/180;
    const straightLineMiles = (a,b) => {
      const R=3958.7613,dLat=radians(b.lat-a.lat),dLon=radians(b.lon-a.lon);
      const h=Math.sin(dLat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dLon/2)**2;
      return 2*R*Math.asin(Math.sqrt(h));
    };
    const priceForCoverage = (prices, selectedCoverage = coverageField?.value || '', allowFallback = true) => {
      if(!prices) return null;
      const coverage=selectedCoverage;
      if(coverage==='Photography only') return prices.photo??null;
      if(coverage==='Photography + Videography package'||coverage.includes('Photo + video package')) return prices.video??null;
      if(coverage==='Photography + Content Creation package') return prices.content??null;
      if(coverage==='Content Creation only') return prices.contentOnly??null;
      if(coverage.startsWith('Videography only')) return 750;
      return allowFallback ? prices.photo??prices.contentOnly??null : null;
    };
    const displayHours = value => Number.isInteger(value)?String(value):String(Math.round(value*100)/100);
    let estimateRequest=0;
    const updateEstimate=async()=>{
      const requestId=++estimateRequest;
      syncPrimaryTime();
      const packageBase=priceForCoverage(packagePrices[packageField?.value]);
      const primaryIncluded=includedHours[packageField?.value]??null;
      const primaryRequested=calculateDuration(primaryStartTime?.value,primaryEndTime?.value);
      const primaryExtraHours=packageBase!=null&&primaryIncluded!=null&&primaryRequested!=null?Math.max(0,primaryRequested-primaryIncluded):0;
      const primaryAdditionalFee=primaryExtraHours*ADDITIONAL_HOUR_RATE;
      let additionalPackagesTotal=0;
      const additionalDetails=[];
      additionalPackageFields.forEach((field,index)=>{
        if(!field.value)return;
        const selectedCoverage=additionalCoverageFields[index]?.value||'';
        const base=priceForCoverage(packagePrices[field.value],selectedCoverage,false);
        const timeFields=additionalPackageTimeFields[index];
        const requested=calculateDuration(timeFields?.start?.value,timeFields?.end?.value);
        const included=includedHours[field.value]??null;
        const extra=included!=null&&requested!=null?Math.max(0,requested-included):0;
        const extraFee=extra*ADDITIONAL_HOUR_RATE;
        if(base!=null) additionalPackagesTotal+=base+extraFee;
        additionalDetails.push({number:index+2,name:field.value,coverage:selectedCoverage,base,extra,extraFee});
      });
      const subtotal=packageBase==null?null:packageBase+primaryAdditionalFee+additionalPackagesTotal;
      const city=cityField?.value.trim(),state=stateField?.value;
      if(priceInput) priceInput.value=''; if(travelInput) travelInput.value=''; if(distanceInput) distanceInput.value='';
      if(subtotal==null){showTotal('Select package details');if(breakdownEl)breakdownEl.innerHTML='';return;}
      const baseRows=[['Package 1: '+packageField.value,money(packageBase)]];
      if(primaryAdditionalFee)baseRows.push(['Package 1 additional time ('+displayHours(primaryExtraHours)+' hrs × '+money(ADDITIONAL_HOUR_RATE)+')',money(primaryAdditionalFee)]);
      additionalDetails.forEach(detail=>{
        if(detail.base!=null)baseRows.push(['Package '+detail.number+': '+detail.name+(detail.coverage?' — '+detail.coverage:''),money(detail.base)]);
        if(detail.extraFee)baseRows.push(['Package '+detail.number+' additional time ('+displayHours(detail.extra)+' hrs × '+money(ADDITIONAL_HOUR_RATE)+')',money(detail.extraFee)]);
      });
      const renderRows=rows=>rows.map(row=>'<div class="estimate-row"><span>'+row[0]+'</span><strong>'+row[1]+'</strong></div>').join('');
      if(!city||!state){showTotal(money(subtotal)+' + travel');if(breakdownEl)breakdownEl.innerHTML=renderRows(baseRows);if(priceInput)priceInput.value=money(subtotal)+' + travel';return;}
      showTotal('Calculating…'); if(breakdownEl)breakdownEl.innerHTML=renderRows(baseRows);
      try{
        const response=await fetch('https://api.zippopotam.us/us/'+encodeURIComponent(state.toLowerCase())+'/'+encodeURIComponent(city));
        if(!response.ok) throw new Error();
        const data=await response.json(); if(requestId!==estimateRequest)return;
        const places=(data.places||[]).filter(p=>p.latitude&&p.longitude); if(!places.length)throw new Error();
        const destination={lat:places.reduce((sum,place)=>sum+Number(place.latitude),0)/places.length,lon:places.reduce((sum,place)=>sum+Number(place.longitude),0)/places.length};
        const miles=Math.max(0,Math.round(straightLineMiles(HOME,destination)*ROAD_DISTANCE_FACTOR));
        const mileageFee=Math.max(0,miles-INCLUDED_MILES)*TRAVEL_RATE_PER_MILE;
        const tollFee=state==='NY'?NEW_YORK_TOLL_FEE:0;
        const travelFeePerTrip=mileageFee+tollFee;
        // Charge travel once for each unique event date. Multiple packages on the
        // same date share a single trip charge because this form uses one event location.
        const primaryDate=inquiryForm.querySelector('[name="date"]')?.value||'';
        const eventDates=new Set();
        if(packageField?.value&&primaryDate) eventDates.add(primaryDate);
        additionalPackageFields.forEach((field,index)=>{
          if(field.value&&additionalPackageTimeFields[index]?.date?.value) eventDates.add(additionalPackageTimeFields[index].date.value);
        });
        // Before all selected dates are entered, keep one trip in the estimate rather
        // than accidentally multiplying incomplete package rows.
        const tripCount=Math.max(1,eventDates.size);
        const travelFee=travelFeePerTrip*tripCount,total=subtotal+travelFee;
        showTotal(money(total));
        const travelLabel=tripCount>1?'Travel fee ('+tripCount+' event dates)':'Travel fee';
        const rows=[...baseRows,[travelLabel,travelFee?money(travelFee):'Included']];
        if(breakdownEl)breakdownEl.innerHTML=renderRows(rows);
        if(priceInput)priceInput.value=money(total);
        if(travelInput)travelInput.value=travelFee?money(travelFee):'Included';
        if(distanceInput)distanceInput.value=miles+' estimated one-way miles';
      }catch(error){
        if(requestId!==estimateRequest)return;
        showTotal(money(subtotal)+' + travel TBD');
        if(breakdownEl)breakdownEl.innerHTML=renderRows(baseRows)+'<div class="estimate-message">Travel will be confirmed with your quote.</div>';
      }
    };
    let cityLookupTimer;
    cityField?.addEventListener('input',()=>{clearTimeout(cityLookupTimer);const q=cityField.value.trim(),state=stateField?.value;if(!state||q.length<2||!citySuggestions)return;cityLookupTimer=setTimeout(async()=>{try{const response=await fetch('https://api.zippopotam.us/us/'+encodeURIComponent(state.toLowerCase())+'/'+encodeURIComponent(q));if(!response.ok)return;const data=await response.json();const names=[...new Set((data.places||[]).map(p=>p['place name']).filter(Boolean))];citySuggestions.innerHTML=names.map(n=>'<option value="'+n.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"></option>').join('');}catch(e){}},250);});
    [packageField,...additionalPackageFields,coverageField,...additionalCoverageFields,stateField].forEach(field=>field?.addEventListener('change',updateEstimate));
    [inquiryForm.querySelector('[name="date"]'),primaryStartTime,primaryEndTime,...additionalPackageTimeFields.flatMap(fields=>[fields.date,fields.start,fields.end])].forEach(field=>{
      field?.addEventListener('input',updateEstimate);
      field?.addEventListener('change',updateEstimate);
    });
    cityField?.addEventListener('change',updateEstimate); cityField?.addEventListener('blur',updateEstimate);
    updateEstimate();
  }
});
+Math.round(travelFee).toLocaleString('en-US'):'Included']];
        if(breakdownEl)breakdownEl.innerHTML=renderRows(rows);
        if(priceInput)priceInput.value=money(total); if(travelInput)travelInput.value=travelFee?money(travelFee):'Included'; if(distanceInput)distanceInput.value=miles+' estimated one-way miles';
      }catch(error){
        if(requestId!==estimateRequest)return;
        showTotal(money(subtotal)+' + travel TBD');
        if(breakdownEl)breakdownEl.innerHTML=renderRows(baseRows)+'<div class="estimate-message">Travel will be confirmed with your quote.</div>';
      }
    };
    let cityLookupTimer;
    cityField?.addEventListener('input',()=>{clearTimeout(cityLookupTimer);const q=cityField.value.trim(),state=stateField?.value;if(!state||q.length<2||!citySuggestions)return;cityLookupTimer=setTimeout(async()=>{try{const response=await fetch('https://api.zippopotam.us/us/'+encodeURIComponent(state.toLowerCase())+'/'+encodeURIComponent(q));if(!response.ok)return;const data=await response.json();const names=[...new Set((data.places||[]).map(p=>p['place name']).filter(Boolean))];citySuggestions.innerHTML=names.map(n=>'<option value="'+n.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"></option>').join('');}catch(e){}},250);});
    [packageField,...additionalPackageFields,coverageField,...additionalCoverageFields,stateField].forEach(field=>field?.addEventListener('change',updateEstimate));
    [primaryStartTime,primaryEndTime,...additionalPackageTimeFields.flatMap(fields=>[fields.start,fields.end])].forEach(field=>{
      field?.addEventListener('input',updateEstimate);
      field?.addEventListener('change',updateEstimate);
    });
    cityField?.addEventListener('change',updateEstimate); cityField?.addEventListener('blur',updateEstimate);
    updateEstimate();
  }
});
