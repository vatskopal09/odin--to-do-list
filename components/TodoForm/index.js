import './index.css';

import { format as formatDate, isEqual, isAfter, addHours } from 'date-fns';
import createElement from '../../helpers/createElement.js';
import TodoListEvents from '../../helpers/TodoListEvents.js';
import Button from '../Button';

/**
 * Creates form for edit todo's info or make new todo.
 * @param {{
 *  id: string,
 *  title: string,
 *  description: string,
 *  dueDate: Date,
 *  priority: string
 * }?} todoInfo - If preset, then, it will be edit todo form
 * @returns {HTMLFormElement}
 */
export default function TodoForm(todoInfo) {
  // Current time
  const currentDateTime = formatDate(new Date(), "yyyy-MM-dd'T'HH:mm");
  const defaultDateTime = todoInfo
    ? formatDate(todoInfo.dueDate, "yyyy-MM-dd'T'HH:mm")
    : formatDate(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm");

  // Characters limits
  const TITLE_MAX_CHARS = 50;
  const DESC_MAX_CHARS = 250;

  // Form
  const todoForm = createElement(
    'form',
    'todo-form',
    null,
    ['action', ''],
    ['method', 'get'],
  );

  // Title
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
    ['value', todoInfo ? todoInfo.title : ''],
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

  // Description
  const descriptionDiv = createElement('div', 'description');
  const descriptionLabel = createElement(
    'label',
    'description',
    'Description ',
    ['for', 'description'],
  );
  const descCharLimitSpan = createElement('span', 'char-limit');
  const descTypedCharsSpan = createElement('span', 'typed-chars', '0');
  const descCharLimitSepSpan = createElement('span', 'char-limit-sep', ' / ');
  const descRemainCharsSpan = createElement(
    'span',
    'remain-chars',
    '' + DESC_MAX_CHARS,
  );
  const descriptionText = createElement(
    'textarea',
    'description',
    todoInfo ? todoInfo.description : null,
    ['id', 'description'],
    ['name', 'description'],
    ['maxlength', '' + DESC_MAX_CHARS],
  );
  descCharLimitSpan.append(
    descTypedCharsSpan,
    descCharLimitSepSpan,
    descRemainCharsSpan,
  );
  descriptionLabel.append(descCharLimitSpan);
  descriptionDiv.append(descriptionLabel, descriptionText);
  descriptionText.addEventListener('input', () => {
    if (descriptionText.value.length > DESC_MAX_CHARS) {
      descriptionText.value = descriptionText.value.slice(0, DESC_MAX_CHARS);
    }
    descTypedCharsSpan.textContent = descriptionText.value.length;
    descRemainCharsSpan.textContent =
      DESC_MAX_CHARS - descriptionText.value.length;
  });

  // Due date
  const dueDateDiv = createElement('div', 'due-date');
  const dueDateLabel = createElement('label', 'due-date', 'Due Date ', [
    'for',
    'due-date',
  ]);
  const dueDateInput = createElement(
    'input',
    'due-date',
    null,
    ['id', 'due-date'],
    ['name', 'due-date'],
    ['type', 'datetime-local'],
    ['value', defaultDateTime],
    ['min', currentDateTime],
    ['required', ''],
  );
  dueDateDiv.append(dueDateLabel, dueDateInput);

  // Priority
  const priorityFieldset = createElement('fieldset', 'priority');
  const priorityLegend = createElement('legend', 'priority', 'Priority ');
  const highPriorityDiv = createElement('div', 'priority');
  const highPriorityLabel = createElement('label', 'priority', 'High ', [
    'for',
    'high-priority',
  ]);
  const highPriorityRadio = createElement(
    'input',
    'priority',
    null,
    ['id', 'high-priority'],
    ['name', 'priority'],
    ['value', 'high'],
    ['type', 'radio'],
  );
  highPriorityDiv.append(highPriorityRadio, highPriorityLabel);
  const mediumPriorityDiv = createElement('div', 'priority');
  const mediumPriorityLabel = createElement('label', 'priority', 'Medium ', [
    'for',
    'medium-priority',
  ]);
  const mediumPriorityRadio = createElement(
    'input',
    'priority',
    null,
    ['type', 'radio'],
    ['id', 'medium-priority'],
    ['name', 'priority'],
    ['value', 'medium'],
  );
  mediumPriorityDiv.append(mediumPriorityRadio, mediumPriorityLabel);
  const lowPriorityDiv = createElement('div', 'priority');
  const lowPriorityLabel = createElement('label', 'priority', 'Low ', [
    'for',
    'low-priority',
  ]);
  const lowPriorityRadio = createElement(
    'input',
    'priority',
    null,
    ['id', 'low-priority'],
    ['name', 'priority'],
    ['value', 'low'],
    ['type', 'radio'],
  );
  lowPriorityDiv.append(lowPriorityRadio, lowPriorityLabel);
  if (todoInfo) {
    switch (todoInfo.priority) {
      case 'low':
        lowPriorityRadio.checked = true;
        break;
      case 'high':
        highPriorityRadio.checked = true;
        break;
      default:
        mediumPriorityRadio.checked = true;
        break;
    }
  } else {
    mediumPriorityRadio.checked = true;
  }
  priorityFieldset.append(
    priorityLegend,
    highPriorityDiv,
    mediumPriorityDiv,
    lowPriorityDiv,
  );

  // Submit
  const submitDiv = createElement('div', 'submit');
  const submitButton = Button({
    className: 'submit',
    type: 'submit',
    textContent: todoInfo ? 'Confirm Todo Edit' : 'Create New Todo',
  });
  submitDiv.appendChild(submitButton);

  // Append all controls to form
  todoForm.append(
    titleDiv,
    descriptionDiv,
    dueDateDiv,
    priorityFieldset,
    submitDiv,
  );

  // Handle form submission
  todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    // Validate title field
    if (!form['title'].value) {
      form['title'].setCustomValidity("Todo's title cannot be empty!");
      form['title'].addEventListener('input', () => {
        form['title'].setCustomValidity('');
      });
    }
    // Validate due date field
    if (
      !isEqual(new Date(form['due-date'].value), new Date(currentDateTime)) &&
      !isAfter(new Date(form['due-date'].value), new Date(currentDateTime))
    ) {
      form['due-date'].setCustomValidity(
        'The date/time must be after or equal to the current date/time!',
      );
      form['due-date'].addEventListener('change', () => {
        form['due-date'].setCustomValidity('');
      });
    }
    // Emit create new Todo event
    const newTodoInfo = {
      title: form['title'].value,
      description: form['description'].value,
      dueDate: new Date(form['due-date'].value),
      priority: form['priority'].value,
    };
    if (todoInfo) {
      TodoListEvents.emit(
        TodoListEvents.TODO_EDITED,
        Object.assign({}, todoInfo, newTodoInfo),
      );
    } else {
      TodoListEvents.emit(TodoListEvents.CREATE_NEW_TODO, newTodoInfo);
    }
  });

  return todoForm;
}

export { TodoForm };
