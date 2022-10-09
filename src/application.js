import i18next from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import watcher from './view.js';
import languages from './translations/languages.js';
import parser from './parser.js';
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
  const delay = 5000;
  const i18n = i18next.createInstance();

  i18n
    .init({
      lng: defaultLanguage,
      debug: true,
      resources: languages,
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

  const updatePosts = () => {
    const { feeds, posts } = state;

    const promise = feeds.map((feed) => {
      const url = getProxiedUrl(feed.link);

      return axios.get(url).then((response) => {
        const data = parser(response.data.contents);
        const currentPosts = data.posts.map((post) => ({
          ...post,
          id: feed.id,
        }));
        const oldPosts = posts.filter((post) => post.id === feed.id);
        const newPosts = _.differenceWith(currentPosts, oldPosts, _.isEqual);

        if (newPosts.length > 0) {
          newPosts.forEach((post) => {
            watchedState.posts.push(post);
          });
        }
      });
    });

    Promise.all(promise)
      .catch((err) => {
        watchedState.form.process = 'failed';
        watchedState.form.errors = err.name;
      })
      .finally(() => {
        setTimeout(updatePosts, delay);
      });
  };

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
          .then((response) => {
            const { feed, posts } = parser(response.data.contents);

            watchedState.links.push(validUrl);
            watchedState.form.process = 'success';

            const id = _.uniqueId();
            watchedState.feeds.push({ ...feed, id, link: validUrl });

            posts.forEach((post) => watchedState.posts.push({ ...post, id }));
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

  elements.posts.addEventListener('click', (e) => {
    const currentLink = e.target.href ?? e.target.previousElementSibling.href;
    const currentPost = state.posts.find((item) => item.link === currentLink);
    watchedState.currentPosts = currentPost;

    if (!state.alreadyReadPosts.includes(currentPost)) {
      state.alreadyReadPosts.push(currentPost);
    }
  });

  updatePosts();
};
