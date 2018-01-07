import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  e.preventDefault();

  axios
    .post(this.action)
    .then(res => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = res.data.hearts.length;
    })
    .catch( err => console.log(err))
}

export default ajaxHeart;
