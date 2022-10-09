import onChange from 'on-change';

export default (elements, i18n, state) =>
  onChange(state, (path, value) => {
    const { input, feedback, button, form } = elements;
    switch (path) {
      case 'form.process':
        switch (value) {
          case 'success':
            input.classList.remove('is-invalid');
            feedback.classList.replace('text-secondary', 'text-success');
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
        break;
      case 'links':
        form.reset();
        input.focus();
        button.disabled = false;
        break;
      case 'form.errors':
        switch (value) {
          case 'errors.urlError':
            break;
          case 'errors.alreadyExist':
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  });
