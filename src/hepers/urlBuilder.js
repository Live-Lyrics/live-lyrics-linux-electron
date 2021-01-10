const slugify = require('@sindresorhus/slugify');

const defaultReplacement = [
  ['$', 's'],
  ['+', 'and'],
];

const slugOptions = {
  customReplacements: [['.', ''], ...defaultReplacement],
  separator: '_',
};

const slugTheOptions = {
  customReplacements: [['.', '_'], ...defaultReplacement],
  separator: '_',
};

function getUrl([artistSlug, titleSlug]) {
  return `https://www.amalgama-lab.com/songs/${artistSlug[0]}/${artistSlug}/${titleSlug}.html`;
}

function slugifySongName([artist, title]) {
  const titleSlug = slugify(title, slugOptions);
  if (artist.startsWith('the ')) {
    artist = artist.replace('the', '');
    const artistSlug = slugify(artist, slugTheOptions);
    return [artistSlug, titleSlug];
  } else {
    const artistSlug = slugify(artist, slugOptions);
    return [artistSlug, titleSlug];
  }
}

function getArtistTitle(title) {
  const parentheses = title.substring(title.indexOf('('), title.indexOf(')') + 1);
  const sqBrackets = title.substring(title.indexOf('['), title.indexOf(']') + 1);
  title = title.replace(parentheses, '');
  title = title.replace(sqBrackets, '');
  return title.split('-').map((s) => s.trim().toLowerCase());
}

module.exports = {
  getUrl,
  getArtistTitle,
  slugifySongName,
};
