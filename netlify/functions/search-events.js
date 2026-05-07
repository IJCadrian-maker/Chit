const EVENTBRITE_PRIVATE_TOKEN = process.env.EVENTBRITE_PRIVATE_TOKEN;

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!EVENTBRITE_PRIVATE_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing Eventbrite private token' }) };
  }

  const { lat, lon, query } = event.queryStringParameters || {};

  if (!lat || !lon) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing lat or lon' }) };
  }

  try {
    const params = new URLSearchParams({
      'location.latitude': String(lat),
      'location.longitude': String(lon),
      'location.within': '15km',
      sort_by: 'date',
      expand: 'venue',
      token: EVENTBRITE_PRIVATE_TOKEN
    });
    if (query) params.set('q', query);

    const url = `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${EVENTBRITE_PRIVATE_TOKEN}`
      }
    });

    if (!res.ok) {
      const message = await res.text().catch(() => res.statusText);
      return { statusCode: res.status, body: JSON.stringify({ error: message || 'Eventbrite error' }) };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
