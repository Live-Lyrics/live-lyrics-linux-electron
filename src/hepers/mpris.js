async function listAll() {
  const bus = dbus.sessionBus();
  const obj = await bus.getProxyObject('org.freedesktop.DBus', '/org/freedesktop/DBus');
  const iface = obj.getInterface('org.freedesktop.DBus');
  const names = await iface.ListNames();
  return names.filter((name) => name.startsWith('org.mpris.MediaPlayer2.'));
}

function getNowPlaying(metadata) {
  const artistVariant = metadata.value['xesam:artist'];
  const trackidVariant = metadata.value['mpris:trackid'];
  const titleVariant = metadata.value['xesam:title'];
  const urlVariant = metadata.value['xesam:url'];
  const artist = artistVariant ? artistVariant.value : 'unknown';
  const title = titleVariant ? titleVariant.value : 'unknown';
  const url = urlVariant ? urlVariant.value : 'unknown';
  const trackid = trackidVariant ? trackidVariant.value : 'unknown';

  let nowPlaying = '';
  if (url.includes('music.youtube')) {
    nowPlaying = `${artist.split('-')[0]} - ${title}`;
  } else if (url.includes('spotify.com')) {
    if (trackid.includes('spotify')) {
      nowPlaying = `${artist[0]} - ${title}`;
    } else {
      nowPlaying = title.replace('·', '-').split('-').reverse().join(' - ');
    }
  } else {
    nowPlaying = title;
  }
  return nowPlaying;
}

module.exports = {
  listAll,
  getNowPlaying,
};
