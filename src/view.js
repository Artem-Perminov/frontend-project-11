import onChange from 'on-change';

const renderErrorss = (elements, i18n, value) => {
  if (!value) {
    return;
  }
  const { feedback } = elements;

  switch (value) {
    case 'errors.urlError':
      feedback.textContent = i18n.t(value);
      break;

    case 'errors.alreadyExist':
      feedback.textContent = i18n.t(value);
      break;

    default:
      break;
  }
};

const handleProcessSubmit = (elements) => {
  const { form, input, button } = elements;
  form.reset();
  input.focus();
  button.disabled = false;
};

const renderStatus = (elements, i18n, value) => {
  const { input, feedback, button } = elements;

  switch (value) {
    case null:
      break;
    case 'success':
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t(value);
      break;
    case 'failed':
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-secondary');
      feedback.classList.add('text-danger');
      button.disabled = false;
      break;
    default:
      break;
  }
};

export default (elements, i18n, state) =>
  onChange(state, (path, value) => {
    switch (path) {
      case 'form.process':
        renderStatus(elements, i18n, value);
        break;

      case 'links':
        handleProcessSubmit(elements);
        break;

      case 'form.errors':
        renderErrorss(elements, i18n, value);
        break;

      default:
        break;
    }
  });
