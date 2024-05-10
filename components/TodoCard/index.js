import './index.css';

import createElement from '../../helpers/createElement.js';
import capitalize from '../../helpers/capitalize.js';
import {
  isDate,
  isToday,
  isTomorrow,
  isPast,
  formatDate,
  formatDistanceToNow,
} from 'date-fns';
import Button from '../Button';
import TodoListEvents from '../../helpers/TodoListEvents.js';

/**
 *
 * @param {{
 *  id: string,
 *  title: string,
 *  description: string,
 *  dueDate: Date,
 *  priority: string
 * }} todoInfo
 * @param {boolean?} hideControllers - If true, returns todo card without edit/delete controllers
 * @returns {HTMLDivElement}
 */
export default function TodoCard(todoInfo, hideControllers) {
  // Prepare todo due date
  let overdue = false;
  let dueDateText = 'Due ';
  if (isDate(todoInfo.dueDate)) {
    if (isPast(todoInfo.dueDate, new Date())) {
      overdue = true;
      dueDateText = '' + formatDistanceToNow(todoInfo.dueDate) + ' Overdue!';
    } else if (isToday(todoInfo.dueDate)) {
      dueDateText += 'today at ' + formatDate(todoInfo.dueDate, 'hh:mm a');
    } else if (isTomorrow(todoInfo.dueDate)) {
      dueDateText += 'tomorrow at ' + formatDate(todoInfo.dueDate, 'hh:mm a');
    } else {
      dueDateText += formatDistanceToNow(todoInfo.dueDate);
    }
  } else {
    dueDateText += todoInfo.dueDate;
  }

  // Create card elements
  const todoCard = createElement('div', 'todo-card');
  const title = createElement('div', 'title', todoInfo.title);
  const dueDate = createElement(
    'div',
    'due-date' + (overdue ? ' overdue' : ''),
    dueDateText,
  );
  const description = createElement(
    'div',
    'description',
    todoInfo.description ? todoInfo.description : '...',
  );
  const priority = createElement(
    'div',
    'priority ' + todoInfo.priority,
    capitalize(todoInfo.priority) + ' priority',
  );
  // Check whether to hide controllers
  if (!hideControllers) {
    const editButton = Button({
      className: 'edit',
      type: 'button',
      textContent: 'Edit',
    });
    const deleteButton = Button({
      className: 'delete',
      type: 'button',
      textContent: 'Delete',
    });

    editButton.addEventListener('click', () => {
      TodoListEvents.emit(TodoListEvents.EDIT_TODO, todoInfo.id);
    });
    deleteButton.addEventListener('click', () => {
      TodoListEvents.emit(TodoListEvents.DELETE, todoInfo.id);
    });

    // Append card elements
    todoCard.append(
      title,
      dueDate,
      description,
      priority,
      editButton,
      deleteButton,
    );
  } else {
    // Append card elements
    todoCard.append(title, dueDate, description, priority);
  }

  return todoCard;
}

export { TodoCard };
