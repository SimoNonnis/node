const axios = require('axios');

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
  }).join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', (e) => {
    if (!e.target.value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    axios
      .get(`/api/search?q=${e.target.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = searchResultsHTML(res.data);
        }
      })
      .catch(err => console.error(err));
  });

  // Handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // We are interested if they are pressing arrows up or down or enter
    if (![38, 40, 13].includes(e.keyCode)) return;
    console.log(e.keyCode);
  });
}

export default typeAhead;
