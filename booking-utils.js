/* Date-only calculations and tentative calendar export for Brendale requests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PaintBookingUtils=api;})(typeof window!=='undefined'?window:this,function(){
  'use strict';
  const zone='Australia/Brisbane';
  function todayISO(now=new Date()){
    const p=new Intl.DateTimeFormat('en-AU',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const get=t=>p.find(x=>x.type===t).value;return get('year')+'-'+get('month')+'-'+get('day');
  }
  function isISO(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day||''))return false;const d=new Date(day+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===day;}
  function addDays(day,count){if(!isISO(day))throw new Error('Invalid date');const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+count);return d.toISOString().slice(0,10);}
  function inRange(day,today,horizon){return isISO(day)&&day>=today&&day<=addDays(today,horizon);}
  function isPastWindow(day,slot,now=new Date()){if(!isISO(day)||!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(slot||''))return false;return Date.parse(day+'T'+slot.split('-')[0]+':00+10:00')<=now.getTime();}
  function label(day){return isISO(day)?new Intl.DateTimeFormat('en-AU',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(day+'T12:00:00Z')):'';}
  function escapeICS(s){return String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
  function fold(line){let row='',n=0;const rows=[];for(const char of line){const len=new TextEncoder().encode(char).length;if(n+len>73){rows.push(row);row=' '+char;n=1+len;}else{row+=char;n+=len;}}rows.push(row);return rows.join('\r\n');}
  function calendar({day,slot,business,location,description,uid,now=new Date()}){
    if(!isISO(day)||!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(slot))throw new Error('A date and a time window are required');
    const times=slot.split('-');
    if(!times.every(t=>Number(t.slice(0,2))<24&&Number(t.slice(3))<60)||times[1]<=times[0])throw new Error('Invalid time window');
    const compact=day.replace(/-/g,'');const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Stillwell concept//Tentative visit request//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VTIMEZONE','TZID:'+zone,'BEGIN:STANDARD','DTSTART:19700101T000000','TZOFFSETFROM:+1000','TZOFFSETTO:+1000','TZNAME:AEST','END:STANDARD','END:VTIMEZONE','BEGIN:VEVENT','UID:'+escapeICS(uid||stamp+'-painting-request'),'DTSTAMP:'+stamp,'DTSTART;TZID='+zone+':'+compact+'T'+times[0].replace(':','')+'00','DTEND;TZID='+zone+':'+compact+'T'+times[1].replace(':','')+'00','SUMMARY:'+escapeICS('Requested painting visit - NOT CONFIRMED'),'LOCATION:'+escapeICS(location||'Brendale'),'DESCRIPTION:'+escapeICS((business||'Painting team')+'\nPreferred time only. Contact the team to confirm.\n\n'+(description||'')),'STATUS:TENTATIVE','TRANSP:TRANSPARENT','END:VEVENT','END:VCALENDAR'];
    return lines.map(fold).join('\r\n')+'\r\n';
  }
  return {zone,todayISO,isISO,addDays,inRange,isPastWindow,label,calendar};
});
