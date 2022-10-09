import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import watcher from './view.js';
import elements from './page-elements.js';

const validate = (url, feeds) => {
  const schema = yup.string().required().url().notOneOf(feeds);
  return schema.validate(url, { abortEarly: false });
};

const getProxiedUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const params = { disableCache: true, url };
  const proxyUrl = new URL('/get', proxy);
  proxyUrl.search = new URLSearchParams(params);
  return proxyUrl.toString();
};

export default () => {
  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();

  i18n
    .init({
      lng: defaultLanguage,
      debug: true,
      resources: {
        ru: {
          translation: {
            errors: {
              urlError: 'Ссылка должна быть валидным URL',
              alreadyExist: 'RSS уже существует',
              rssError: 'Ресурс не содержит валидный RSS',
              networkError: 'Ошибка сети, попробуйте позже',
              somethingWrong: 'Что-то пошло не так',
            },
            loading: 'Идет загрузка',
            success: 'RSS успешно загружен',
            posts: 'Посты',
            feeds: 'Фиды',
            inspect: 'Просмотр',
          },
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
    feeds: [],
    posts: [],
    currentPosts: {},
    alreadyReadPosts: [],
  };

  const watchedState = watcher(elements, i18n, state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.process = 'loading';
    watchedState.form.errors = null;

    const form = new FormData(e.target);
    const url = form.get('url');

    validate(url, watchedState.links)
      .then((validUrl) => {
        axios
          .get(getProxiedUrl(validUrl))
          .then(() => {
            watchedState.links.push(validUrl);
            watchedState.form.process = 'success';
          })
          .catch((err) => {
            watchedState.form.process = 'failed';
            watchedState.form.errors = err.name;
          });
      })
      .catch((err) => {
        watchedState.form.process = 'failed';
        watchedState.form.errors = err.errors.join();
      });
  });
};
