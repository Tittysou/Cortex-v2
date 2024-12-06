const fs = require('fs');
const path = require('path');
const { info, warn, error, success, event } = require('../utils/logs');

const loadEvents = (client) => {
  const eventsDirectory = path.join(__dirname, '../events');

  const loadEvent = (filename) => {
    try {
      delete require.cache[require.resolve(`../events/${filename}`)];
      const event = require(`../events/${filename}`);

      if (event && event.name && typeof event.execute === 'function') {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        return event.name;
      } else {
        warn(`Skipped invalid or empty event in ${filename}`);
        return null;
      }
    } catch (err) {
      error(`Failed to load event from ${filename} ${err}`);
      return null;
    }
  };

  const eventFiles = fs.readdirSync(eventsDirectory).filter(file => file.endsWith('.js'));
  const loadedEvents = eventFiles.map(file => loadEvent(file)).filter(Boolean);
  
  event(`Loaded ${loadedEvents.length} event(s).`);

  const debounceMap = new Map();
  const handleEventUpdate = (filename, delay = 500) => {
    const now = Date.now();

    if (debounceMap.has(filename) && now - debounceMap.get(filename) < delay) return;

    debounceMap.set(filename, now);
    const eventName = loadEvent(filename);

    if (eventName) {
      success(`Event updated: ${eventName}`);
    } else {
      const eventNameWithoutExtension = filename.slice(0, -3);
      warn(`Event removed: ${eventNameWithoutExtension}`);
    }
  };

  fs.watch(eventsDirectory, (eventType, filename) => {
    if (filename.endsWith('.js')) {
      handleEventUpdate(filename);
    }
  });
};

module.exports = { loadEvents };
