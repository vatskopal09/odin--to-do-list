import './index.css';

import createElement from '../../helpers/createElement.js';
import TodoListEvents from '../../helpers/TodoListEvents.js';
import Button from '../Button';

/**
 * Creates form for edit project or make new one.
 * @param {string?} project - If preset, then, it will be edit project form
 * @returns {HTMLFormElement}
 */
export default function ProjectForm(project) {
  // Characters limits
  const TITLE_MAX_CHARS = 50;

  // Form
  const projectForm = createElement(
    'form',
    'project-form',
    null,
    ['action', ''],
    ['method', 'get'],
  );

  // Project title
  const titleDiv = createElement('div', 'title');
  const titleLabel = createElement('label', 'title', 'Title ', [
    'for',
    'title',
  ]);
  const titleCharLimitSpan = createElement('span', 'char-limit');
  const titleTypedCharsSpan = createElement('span', 'typed-chars', '0');
  const titleCharLimitSepSpan = createElement('span', 'char-limit-sep', ' / ');
  const titleRemainCharsSpan = createElement(
    'span',
    'remain-chars',
    '' + TITLE_MAX_CHARS,
  );
  const titleInput = createElement(
    'input',
    'title',
    null,
    ['id', 'title'],
    ['name', 'title'],
    ['type', 'text'],
    ['value', project ? project : ''],
    ['autocomplete', 'on'],
    ['autofocus', ''],
    ['maxlength', '' + TITLE_MAX_CHARS],
    ['required', ''],
  );
  titleCharLimitSpan.append(
    titleTypedCharsSpan,
    titleCharLimitSepSpan,
    titleRemainCharsSpan,
  );
  titleLabel.append(titleCharLimitSpan);
  titleDiv.append(titleLabel, titleInput);
  titleInput.addEventListener('input', () => {
    if (titleInput.value.length > TITLE_MAX_CHARS) {
      titleInput.value = titleInput.value.slice(0, TITLE_MAX_CHARS);
    }
    titleTypedCharsSpan.textContent = titleInput.value.length;
    titleRemainCharsSpan.textContent =
      TITLE_MAX_CHARS - titleInput.value.length;
  });

  // Submit
  const submitDiv = createElement('div', 'submit');
  const submitButton = Button({
    className: 'submit',
    type: 'submit',
    textContent: project ? 'Confirm Project Edit' : 'Create New Project',
  });
  submitDiv.appendChild(submitButton);

  // Append all controls to form
  projectForm.append(titleDiv, submitDiv);

  // Handle form submission
  projectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    // Validate title field
    if (!form['title'].value) {
      form['title'].setCustomValidity("Todo's title cannot be empty!");
      form['title'].addEventListener('input', () => {
        form['title'].setCustomValidity('');
      });
    }
    // Emit new project created/edited event
    if (project) {
      TodoListEvents.emit(TodoListEvents.PROJECT_EDITED, form['title'].value);
    } else {
      TodoListEvents.emit(
        TodoListEvents.CREATE_NEW_PROJECT,
        form['title'].value,
      );
    }
  });

  return projectForm;
}

export { ProjectForm };
