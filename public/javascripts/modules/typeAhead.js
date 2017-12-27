const axios = require('axios');

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function(e) {
    if (!e.target.value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';
    axios
      .get(`/api/search?q=${e.target.value}`)
      .then(res => {
        if (res.data.length) {
          console.log('Hey');
        }
      })
  })
}

export default typeAhead;
