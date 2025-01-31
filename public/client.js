// public/client.js
async function loadShows() {
  try {
    const response = await fetch("/api/shows");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const shows = await response.json();

    // Datumskonvertierung
    const processedShows = shows.map((show) => ({
      ...show,
      date: new Date(show.date),
    }));

    renderShows(processedShows);
  } catch (error) {
    console.error("Error loading shows:", error);
    showErrorToUser();
  }
}

function showErrorToUser() {
  const container = document.getElementById("shows-container");
  container.innerHTML = `
    <div class="error-message">
      <p>⚠️ Es gab ein Problem beim Laden der Daten</p>
      <button onclick="loadShows()">Erneut versuchen</button>
    </div>
  `;
}

function renderShows(shows) {
  const container = document.getElementById("shows-container");
  
  // Group shows by date
  const showsByDate = shows.reduce((groups, show) => {
    const dateKey = show.date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(show);
    return groups;
  }, {});

  // Sort dates chronologically
  const sortedDates = Object.keys(showsByDate).sort((a, b) => {
    return new Date(a.split('.').reverse().join('-')) - 
           new Date(b.split('.').reverse().join('-'));
  });

  container.innerHTML = sortedDates.map(date => {
    const dateShows = showsByDate[date]
      .filter(show => show.date > new Date())
      .sort((a, b) => a.date - b.date);

    return dateShows.length ? `
      <div class="date-group">
        <div class="date-header">${date}</div>
        ${dateShows.map(show => `
          <div class="show-item">
            <div class="show-time">
              ${show.date.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div class="show-title">${show.title}</div>
            <div class="show-channel">${show.channel}</div>
            ${show.description ? `
              <div class="show-description">
                ${show.description.replace(/<\/?[^>]+(>|$)/g, "")}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';
  }).join('') || '<div class="error">Keine anstehenden Talkshows</div>';
}

  function formatDate(date) {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      weekday: 'short'
    }).replace(/,/, '');
  }

  function formatTime(date) {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }


// Hilfsfunktion für Datumsformatierung
function formatGermanDateTime(date) {
  return date.toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

// Auto-Refresh alle 10 Minuten (korrigiertes Intervall)
setInterval(loadShows, 600000); // 600.000 ms = 10 Minuten
loadShows(); // Initial load
