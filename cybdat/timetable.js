let currentDate = new Date();

function fetchTimetable(date) {
  fetch('planer.ics')
    .then(response => response.text())
    .then(data => {
      const events = parseICal(data, date);
      displayTimetable(events, date);
    })
    .catch(error => {});
}

function parseICal(data, date) {
  const events = [];
  const lines = data.split('\n');
  let event = null;
  let currentKey = null;

  lines.forEach(line => {
    if (line.startsWith('BEGIN:VEVENT')) {
      event = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (event) events.push(event);
      event = null;
    } else if (event) {
      if (line.startsWith(' ') && currentKey) {
        event[currentKey] += line.trim();
      } else {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        event[key] = value;
        currentKey = key;
      }
    }
  });

  return events.filter(event => {
    const dtstart = event['DTSTART;TZID=CET'] || event['DTSTART'];
    return dtstart && isSameDay(dtstart, date);
  });
}

function isSameDay(dateString, date) {
  if (!dateString) return false;
  const match = dateString.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) return false;
  const [_, year, month, day, hour, minute, second] = match;
  const eventDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  return (
    eventDate.getDate() === date.getDate() &&
    eventDate.getMonth() === date.getMonth() &&
    eventDate.getFullYear() === date.getFullYear()
  );
}

function parseEventDate(dateString) {
  const match = dateString.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const [_, year, month, day, hour, minute, second] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

function extractLocationLink(description) {
  if (!description) return null;
  const match = description.match(/https:\/\/ntnu\.1024\.no\/r\/\d+/i);
  if (!match) return null;
  return match[0].trim();
}

function displayTimetable(events, date) {
  const timetableContent = document.getElementById('timetable-content');
  const timetableHeader = document.getElementById('timetable-header');
  timetableContent.innerHTML = '';
  timetableHeader.innerHTML = `${date.toLocaleDateString()} - ${date.toLocaleDateString('nb-NO', { weekday: 'long' })}`;
  
  if (events.length === 0) {
    timetableContent.innerHTML += '<p>Ingen aktiviteter denne dagen.</p>';
  } else {
    events.sort((a, b) => {
      const dtstartA = a['DTSTART;TZID=CET'] || a['DTSTART'];
      const dtstartB = b['DTSTART;TZID=CET'] || b['DTSTART'];
      const dateA = parseEventDate(dtstartA);
      const dateB = parseEventDate(dtstartB);
      return dateA - dateB;
    });

    events.forEach(event => {
      const dtstart = event['DTSTART;TZID=CET'] || event['DTSTART'];
      const eventDate = parseEventDate(dtstart);
      
      if (!eventDate) {
        console.error('Invalid DTSTART for event:', event);
        timetableContent.innerHTML += `<p>Invalid Date - ${event['SUMMARY'] || 'Unknown Event'}</p>`;
        return;
      }

      const time = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const summary = (event['SUMMARY'] || '').replace(/\\n/g, '<br>');
      const locationLink = extractLocationLink(event['DESCRIPTION']);
      const locationHtml = locationLink ? `<a href="${locationLink}" target="_blank">📍</a>` : '';
      timetableContent.innerHTML += `<p>${time} - ${summary} ${locationHtml}</p>`;
    });
  }
}

document.getElementById('prev-day').addEventListener('click', function() {
  currentDate.setDate(currentDate.getDate() - 1);
  fetchTimetable(currentDate);
});

document.getElementById('next-day').addEventListener('click', function() {
  currentDate.setDate(currentDate.getDate() + 1);
  fetchTimetable(currentDate);
});
