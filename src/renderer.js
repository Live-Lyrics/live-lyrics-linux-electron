// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { CssBaseline, ThemeProvider, Container, MenuItem, InputLabel, Select, FormControl } = MaterialUI;

const dbus = require('dbus-next');
const axios = require('axios');
const cheerio = require('cheerio');

const { getNowPlaying, listAll } = require('./hepers/mpris');
const { getArtistTitle, slugifySongName, getUrl } = require('./hepers/urlBuilder');

const MPRIS_IFACE = 'org.mpris.MediaPlayer2.Player';
const MPRIS_PATH = '/org/mpris/MediaPlayer2';
const PROPERTIES_IFACE = 'org.freedesktop.DBus.Properties';

function App() {
  const [title, setTitle] = React.useState('');
  const [properties, setProperties] = React.useState();
  const [html, setHtml] = React.useState('');

  const [availablePlayers, setAvailablePlayers] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState('');

  React.useEffect(async () => {
    const players = await listAll();
    setAvailablePlayers(players);
  }, []);

  React.useEffect(async () => {
    if (selectedPlayer) {
      if (properties) {
        properties.removeAllListeners();
      }

      const bus = dbus.sessionBus();
      const obj = await bus.getProxyObject(selectedPlayer, MPRIS_PATH);
      const props = obj.getInterface(PROPERTIES_IFACE);

      const metadata = await props.Get(MPRIS_IFACE, 'Metadata');
      const nowPlaying = getNowPlaying(metadata);
      setTitle(nowPlaying);
      await listenNowPlaying(obj);
    }
  }, [selectedPlayer]);

  React.useEffect(async () => {
    const url = getUrl(slugifySongName(getArtistTitle(title)));
    axios.get(url).then((data) => {
      const $ = cheerio.load(data.data);
      const textHtml = $('.texts.col').html();
      setHtml(textHtml);
    });
  }, [title]);

  async function listenNowPlaying(obj) {
    return new Promise((resolve) => {
      const props = obj.getInterface(PROPERTIES_IFACE);
      setProperties(props);
      props.on('PropertiesChanged', (iface, changed, invalidated) => {
        if (changed.hasOwnProperty('Metadata')) {
          const nowPlaying = getNowPlaying(changed['Metadata']);
          setTitle(nowPlaying);
        }
      });
    });
  }

  return (
    <Container>
      <div>{title}</div>

      <FormControl>
        <InputLabel id="demo-simple-select-label">Player</InputLabel>
        <Select
          style={{ minWidth: '350px' }}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedPlayer}
          onChange={(event) => setSelectedPlayer(event.target.value)}
        >
          {availablePlayers.map((player) => (
            <MenuItem value={player} key={player}>
              {player}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Container>
  );
}

ReactDOM.render(
  <ThemeProvider>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.querySelector('#root')
);
