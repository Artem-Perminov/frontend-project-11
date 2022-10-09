import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import watcher from './view.js';
import elements from './page-elements.js';

const getProxiedUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.search = new URLSearchParams({ disableCache: true, url });
  return proxyUrl.toString();
};

export default () => {
  const i18n = i18next.createInstance();
  i18n
    .init({
      lng: `ru`,
      resources: {
        errors: {
          urlError: 'Ссылка должна быть валидным URL',
          alreadyExist: 'RSS уже существует',
        },
      },
    })
    .then(() => {
      yup.setLocale({
        string: {
          url: 'errors.urlError',
        },
        mixed: {
          notOneOf: 'errors.alreadyExist',
        },
      });
    });

  const state = {
    form: {
      process: '',
      errors: '',
    },
    links: [],
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const url = form.get('url');
    const schema = yup.string().required().url().notOneOf(watcher(elements, i18n, state).links);
    schema
      .validate(url)
      .then((validUrl) => {
        axios
          .get(getProxiedUrl(validUrl))
          .then(() => {
            watcher(elements, i18n, state).links.push(validUrl);
            watcher(elements, i18n, state).form.process = 'success';
          })
          .catch((err) => {
            watcher(elements, i18n, state).form.process = 'failed';
            watcher(elements, i18n, state).form.errors = err.name;
          });
      })
      .catch((err) => {
        watcher(elements, i18n, state).form.process = 'failed';
        watcher(elements, i18n, state).form.errors = err.errors.join();
      });
  });
};
