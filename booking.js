'use strict';
(() => {
  const config=window.PAINTING_CONFIG||{},U=window.PaintBookingUtils;
  const business=config.businessName||'Stillwell Painting',email=(config.contactEmail||'').trim();
  const horizon=Math.max(1,Math.min(365,Number(config.bookingHorizonDays)||90));
  const form=document.getElementById('booking-form'),card=document.querySelector('.booking-card');
  const panels=[...document.querySelectorAll('.booking-panel')],progress=[...document.querySelectorAll('[data-goto-step]')];
  const back=document.getElementById('booking-back'),next=document.getElementById('booking-next'),submit=document.getElementById('booking-submit');
  const error=document.getElementById('booking-error'),result=document.getElementById('booking-result');
  const serviceInputs=[...form.querySelectorAll('input[name="services"]')];
  const flexible=document.getElementById('flexible-date'),visitTime=form.elements.visitTime,dateInput=document.getElementById('preferred-date');
  const monthTitle=document.getElementById('calendar-month'),days=document.getElementById('calendar-days');
  const photoInput=document.getElementById('project-photos'),previews=document.getElementById('photo-previews'),photoStatus=document.getElementById('photo-status');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const detailServices=new Map();let photos=[],step=0,maxVisited=0,selectedDate='',summary='',requestData=null;
  let viewMonth=new Date(U.todayISO()+'T12:00:00Z');viewMonth.setUTCDate(1);
  const get=name=>form.elements[name].value.trim();
  const services=()=>serviceInputs.filter(el=>el.checked).map(el=>el.value);
  const field=name=>form.elements[name];
  const slotLabel=()=>visitTime.selectedOptions[0]?.textContent||'Arrange with team';
  function dateText(){return flexible.checked?'Arrange a day with the team':(selectedDate?U.label(selectedDate):'No preferred day chosen');}
  let invalidField=null,previousDescription='';
  function clearFieldError(){
    document.getElementById('booking-field-error')?.remove();
    if(invalidField){invalidField.removeAttribute('aria-invalid');if(previousDescription)invalidField.setAttribute('aria-describedby',previousDescription);else invalidField.removeAttribute('aria-describedby');}
    invalidField=null;previousDescription='';
  }
  function setError(message,target){
    clearFieldError();error.hidden=false;error.textContent=message;
    if(target){
      invalidField=target;previousDescription=target.getAttribute('aria-describedby')||'';target.setAttribute('aria-invalid','true');target.setAttribute('aria-describedby',(previousDescription+' booking-field-error').trim());
      const note=document.createElement('p');note.id='booking-field-error';note.className='field-error';note.textContent=message;
      const anchor=target.type==='checkbox'?(target.name==='services'?form.querySelector('.booking-services'):target.closest('label')):target;
      anchor.insertAdjacentElement('afterend',note);target.focus();
    }
  }
  function clearError(){error.hidden=true;error.textContent='';clearFieldError();}
  function updateSnapshot(){
    document.getElementById('snapshot-property').textContent=get('propertyType')||'Tell us about your property';
    document.getElementById('snapshot-services').textContent=services().join(', ')||'Choose a service to begin';
    document.getElementById('snapshot-location').textContent=[get('projectSuburb'),get('postcode')].filter(Boolean).join(' · ')||'Where is the project?';
    document.getElementById('snapshot-visit').textContent=(selectedDate||flexible.checked)?dateText()+(get('visitTime')?' · '+slotLabel():''):'We’ll find a time that suits';
    document.getElementById('snapshot-step').textContent=String(step+1).padStart(2,'0')+' / 03';
    document.getElementById('snapshot-track-fill').style.transform='scaleX('+((step+1)/3)+')';
  }
  form.addEventListener('input',e=>{if(e.target===invalidField)clearError();updateSnapshot();});
  form.addEventListener('change',e=>{if(e.target===invalidField)clearError();updateSnapshot();});
  function renderDetails(){
    const holder=document.getElementById('detail-chips');holder.replaceChildren();
    document.getElementById('selected-details').hidden=detailServices.size===0;
    detailServices.forEach((category,name)=>{const b=document.createElement('button');b.type='button';b.textContent=name+' ×';b.setAttribute('aria-label','Remove '+name);b.addEventListener('click',()=>{detailServices.delete(name);renderDetails();});holder.append(b);});
  }
  document.querySelectorAll('[data-pick-service]').forEach(a=>a.addEventListener('click',()=>{
    const target=serviceInputs.find(el=>el.value===a.dataset.pickService);if(target)target.checked=true;
    if(a.dataset.detailService)detailServices.set(a.dataset.detailService,a.dataset.pickService);
    renderDetails();if(!result.hidden)editRequest();go(0,false);updateSnapshot();
  }));
  serviceInputs.forEach(input=>input.addEventListener('change',()=>{if(!input.checked)detailServices.forEach((category,name)=>{if(category===input.value)detailServices.delete(name);});renderDetails();clearError();}));
  document.querySelectorAll('[data-property]').forEach(a=>a.addEventListener('click',()=>{field('propertyType').value=a.dataset.property;if(!result.hidden)editRequest();go(0,false);}));
  function renderCalendar(){
    const today=U.todayISO(),last=U.addDays(today,horizon);
    dateInput.min=today;dateInput.max=last;dateInput.value=selectedDate;
    const y=viewMonth.getUTCFullYear(),m=viewMonth.getUTCMonth();
    monthTitle.textContent=new Intl.DateTimeFormat('en-AU',{month:'long',year:'numeric',timeZone:'UTC'}).format(viewMonth);
    days.replaceChildren();const offset=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7;
    for(let i=0;i<offset;i++){const span=document.createElement('span');span.className='blank-day';span.setAttribute('aria-hidden','true');days.append(span);}
    const total=new Date(Date.UTC(y,m+1,0)).getUTCDate();
    for(let day=1;day<=total;day++){
      const iso=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      const b=document.createElement('button');b.type='button';b.textContent=day;b.dataset.date=iso;b.disabled=!U.inRange(iso,today,horizon);
      b.setAttribute('aria-label',U.label(iso));b.setAttribute('aria-pressed',String(iso===selectedDate&&!flexible.checked));
      if(iso===today)b.classList.add('today');
      b.addEventListener('click',()=>{selectedDate=iso;flexible.checked=false;visitTime.required=true;clearError();renderCalendar();updateDateText();const picked=days.querySelector('[data-date="'+iso+'"]');if(picked)picked.focus({preventScroll:true});});days.append(b);
    }
    const firstCurrent=new Date(today+'T12:00:00Z');firstCurrent.setUTCDate(1);
    const lastMonth=new Date(last+'T12:00:00Z');lastMonth.setUTCDate(1);
    document.getElementById('month-prev').disabled=viewMonth<=firstCurrent;
    document.getElementById('month-next').disabled=viewMonth>=lastMonth;
    [...visitTime.options].forEach(option=>option.disabled=!flexible.checked&&U.isPastWindow(selectedDate,option.value));
    if(visitTime.selectedOptions[0]?.disabled)visitTime.value='';
    const enabled=[...days.querySelectorAll('button:not(:disabled)')];const focusDay=enabled.find(b=>b.dataset.date===selectedDate)||enabled.find(b=>b.dataset.date===today)||enabled[0];
    enabled.forEach(b=>b.tabIndex=b===focusDay?0:-1);
  }
  days.addEventListener('keydown',e=>{
    if(!e.target.matches('button[data-date]'))return;
    const move={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];if(!move)return;e.preventDefault();
    const iso=U.addDays(e.target.dataset.date,move);if(!U.inRange(iso,U.todayISO(),horizon))return;
    const d=new Date(iso+'T12:00:00Z');viewMonth=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1));renderCalendar();
    const target=days.querySelector('[data-date="'+iso+'"]');days.querySelectorAll('button').forEach(b=>b.tabIndex=b===target?0:-1);target?.focus({preventScroll:true});
  });
  dateInput.addEventListener('change',()=>{
    selectedDate=dateInput.value;
    if(selectedDate&&!U.inRange(selectedDate,U.todayISO(),horizon)){selectedDate='';setError('Choose a date from today through '+U.label(U.addDays(U.todayISO(),horizon))+'.',dateInput);updateSnapshot();return;}
    flexible.checked=false;visitTime.required=true;renderCalendar();updateDateText();clearError();
  });
  document.getElementById('month-prev').addEventListener('click',()=>{viewMonth.setUTCMonth(viewMonth.getUTCMonth()-1);renderCalendar();});
  document.getElementById('month-next').addEventListener('click',()=>{viewMonth.setUTCMonth(viewMonth.getUTCMonth()+1);renderCalendar();});
  function updateDateText(){document.getElementById('date-selection').textContent=flexible.checked?'We’ll arrange a suitable day with you.':selectedDate?'Preferred day: '+U.label(selectedDate):'Choose a preferred day, or arrange one with the team.';updateSnapshot();}
  flexible.addEventListener('change',()=>{if(flexible.checked){selectedDate='';visitTime.value='flexible';visitTime.required=false;}else visitTime.required=true;renderCalendar();updateDateText();clearError();});
  function renderPhotos(){
    previews.replaceChildren();photos.forEach((p,i)=>{const box=document.createElement('div');box.className='photo-preview';const img=document.createElement('img');img.src=p.url;img.alt='Selected project photo: '+p.file.name;const name=document.createElement('p');name.textContent=p.file.name;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove photo '+p.file.name);remove.addEventListener('click',()=>{URL.revokeObjectURL(p.url);photos.splice(i,1);renderPhotos();photoStatus.textContent=photos.length+' photo(s) selected.';});box.append(img,remove,name);previews.append(box);});
  }
  photoInput.addEventListener('change',()=>{
    const files=[...photoInput.files];photoInput.value='';
    const unique=files.filter(f=>!photos.some(p=>p.file.name===f.name&&p.file.size===f.size&&p.file.lastModified===f.lastModified));
    if(photos.length+unique.length>5){photoStatus.textContent='Choose up to 5 photos in total. Remove one before adding more.';return;}
    const bad=unique.find(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>5*1024*1024);
    if(bad){photoStatus.textContent='Please use JPG, PNG or WebP photos no larger than 5 MB each. No new photos were added.';return;}
    unique.forEach(file=>photos.push({file,url:URL.createObjectURL(file)}));renderPhotos();photoStatus.textContent=photos.length+' photo(s) selected. They have not been uploaded.';
  });
  function checkRequired(panel){
    for(const el of panel.querySelectorAll('input,select,textarea')){
      if(['file','hidden'].includes(el.type))continue;
      if(el.required&&el.type!=='checkbox'&&!el.value.trim()){
        const messages={propertyType:'Choose the type of property.',projectSuburb:'Add the suburb where the painting is needed.',scope:'Choose an approximate project size.',notes:'Tell us a little about the work you have in mind.',visitTime:'Choose a preferred time window, or arrange one with the team.',timeframe:'Choose when you would like the painting done.',contactName:'Add your name so the team knows who to contact.',email:'Add an email address for your request.',phone:'Add a phone number for your preferred callback.'};
        setError(messages[el.name]||'Please complete this field.',el);return false;
      }
      if(!el.checkValidity()){setError(el.validationMessage||'Please check this field.',el);el.reportValidity();return false;}
    }return true;
  }
  function validDate(){
    if(!flexible.checked&&!U.inRange(selectedDate,U.todayISO(),horizon)){setError('Choose a current or future visit day, or ask the team to arrange one.',dateInput.getClientRects().length?dateInput:document.getElementById('flexible-date'));return false;}
    if(!flexible.checked&&U.isPastWindow(selectedDate,get('visitTime'))){setError('That time window has already started. Choose a future window or arrange a time with the team.',visitTime);return false;}
    return true;
  }
  function validateStep(index){
    clearError();
    if(index===0&&services().length===0){setError('Choose at least one painting service.',serviceInputs[0]);return false;}
    if(index===1&&!validDate())return false;
    return checkRequired(panels[index]);
  }
  function review(){
    const pairs=[['PROPERTY',get('propertyType')],['SERVICES',services().join(', ')],['DETAILS',[...detailServices.keys()].join(', ')||'Discuss at assessment'],['LOCATION',get('projectSuburb')+(get('postcode')?' '+get('postcode'):'')],['VISIT',dateText()+' · '+slotLabel()],['TIMING',get('timeframe')],['COLOUR',window.PAINTING_COLOUR||'Warm linen'],['PHOTOS',photos.length+' selected on this device']];
    const dl=document.createElement('dl');pairs.forEach(([label,value])=>{const row=document.createElement('div');row.className='review-line';const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;row.append(dt,dd);dl.append(row);});document.getElementById('booking-review').replaceChildren(dl);
  }
  function go(index,scroll=true){
    step=index;maxVisited=Math.max(maxVisited,index);panels.forEach((p,i)=>p.hidden=i!==step);
    progress.forEach((b,i)=>{b.disabled=i>maxVisited;b.classList.toggle('done',i<step);if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    document.getElementById('step-caption').textContent='STEP '+(step+1)+' OF 3';back.hidden=step===0;next.hidden=step===2;submit.hidden=step!==2;
    next.firstChild.textContent=step===0?'Choose a visit time ':'Review your request ';if(step===1)renderCalendar();if(step===2)review();clearError();updateSnapshot();
    if(scroll){const legend=panels[step].querySelector('legend');legend.tabIndex=-1;legend.focus({preventScroll:true});card.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});}
  }
  next.addEventListener('click',()=>{if(validateStep(step))go(step+1);});back.addEventListener('click',()=>go(step-1));
  progress.forEach(b=>b.addEventListener('click',()=>{const index=Number(b.dataset.gotoStep),origin=step;if(index>origin){for(let i=origin;i<index;i++){if(i!==step)go(i,false);if(!validateStep(i))return;}}go(index);}));
  field('contactMethod').addEventListener('change',()=>{const required=get('contactMethod')==='Phone';field('phone').required=required;document.getElementById('phone-optional').textContent=required?'(required)':'(optional)';});
  window.addEventListener('paint:colour',()=>{if(step===2&&result.hidden)review();});
  form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='file'&&e.target.type!=='checkbox'){e.preventDefault();if(step<2)next.click();else submit.click();}});
  function buildSummary(){
    return business+' — Quote / site-visit request\nSTATUS: PREPARED, NOT SENT OR CONFIRMED\n\n'+[
      'Name: '+get('contactName'),'Email: '+get('email'),'Phone: '+(get('phone')||'Not provided'),'Preferred contact: '+get('contactMethod'),
      '\nProperty: '+get('propertyType'),'Location: '+get('projectSuburb')+' '+get('postcode'),'Services: '+services().join(', '),
      'Specific work: '+([...detailServices.keys()].join(', ')||'To discuss'),'Approximate scope: '+get('scope'),
      '\nPreferred visit day: '+dateText(),'Preferred time: '+slotLabel(),'Time zone: Australia/Brisbane','Painting timeframe: '+get('timeframe'),
      'Colour direction: '+(window.PAINTING_COLOUR||'Warm linen'),'Photos: '+(photos.length?photos.map(p=>p.file.name).join(', ')+' (attach manually when emailing)':'None selected'),
      '\nProject notes:\n'+get('notes'),'\nPreferred visit times are subject to direct confirmation from the team.'
    ].join('\n');
  }
  form.addEventListener('submit',e=>{
    e.preventDefault();if(step!==2){if(validateStep(step))go(step+1);return;}
    if(!validateStep(2))return;
    if(!validDate()){go(1);setError('Your preferred day or time has passed. Choose another preference or arrange one with the team.');return;}
    if(get('contactMethod')==='Phone'&&get('phone').replace(/\D/g,'').length<7){setError('Please add a phone number the team can reach you on.',field('phone'));return;}
    summary=buildSummary();requestData={day:selectedDate,slot:get('visitTime'),location:get('projectSuburb')+' '+get('postcode'),business,description:summary};
    document.getElementById('booking-summary').textContent=summary;form.hidden=true;result.hidden=false;document.querySelector('.booking-progress').hidden=true;
    document.getElementById('step-caption').textContent='REQUEST PREPARED';document.getElementById('request-status').textContent='';
    document.getElementById('download-calendar').hidden=flexible.checked||!selectedDate||get('visitTime')==='flexible';
    const emailLink=document.getElementById('booking-email');emailLink.hidden=!email;
    if(email){emailLink.href='mailto:'+email+'?subject='+encodeURIComponent('Painting request — '+get('projectSuburb'))+'&body='+encodeURIComponent(summary);document.getElementById('result-message').textContent='Your request is prepared. Open the email draft to review and send it, and attach any photos. The team must confirm your visit time directly.';}
    result.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  });
  if(email){document.getElementById('booking-privacy').textContent='Your details stay on this device until you choose to send an email draft. Photos must be attached in your email app.';}
  function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  document.getElementById('download-request').addEventListener('click',()=>{if(summary)download(summary,'brendale-painting-request.txt','text/plain;charset=utf-8');});
  document.getElementById('download-calendar').addEventListener('click',()=>{if(requestData?.day&&requestData.slot!=='flexible'){const uid=(window.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(16).slice(2))+'@painting-request';download(U.calendar({...requestData,uid}),'tentative-brendale-visit.ics','text/calendar;charset=utf-8');}});
  document.getElementById('copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary);document.getElementById('request-status').textContent='Request copied. It has not been sent.';}catch{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(document.getElementById('booking-summary'));selection.removeAllRanges();selection.addRange(range);document.getElementById('request-status').textContent='Text selected. Use your device’s copy command, or download the text file.';}});
  function editRequest(){form.hidden=false;result.hidden=true;document.querySelector('.booking-progress').hidden=false;go(0);}
  document.getElementById('edit-request').addEventListener('click',editRequest);
  document.getElementById('clear-request').addEventListener('click',()=>{
    form.reset();photos.forEach(p=>URL.revokeObjectURL(p.url));photos=[];previews.replaceChildren();photoStatus.textContent='';detailServices.clear();renderDetails();selectedDate='';summary='';requestData=null;flexible.checked=false;visitTime.required=true;field('phone').required=false;document.getElementById('phone-optional').textContent='(optional)';document.getElementById('booking-summary').textContent='';maxVisited=0;viewMonth=new Date(U.todayISO()+'T12:00:00Z');viewMonth.setUTCDate(1);updateDateText();editRequest();progress.forEach((b,i)=>b.disabled=i>0);
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&step===1)renderCalendar();});
  renderCalendar();go(0,false);
})();
