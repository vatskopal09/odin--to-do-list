import './index.css';

import createElement from '../../helpers/createElement.js';
import Button from '../Button';
import TodoListEvents from '../../helpers/TodoListEvents.js';

/**
 *
 * @param {{ title: string, index: number }} projectInfo
 * @param {boolean?} hideControllers - If true, returns card without edit/delete controllers
 * @returns {HTMLDivElement}
 */
export default function ProjectCard(projectInfo, hideControllers) {
  // Create card elements
  const projectCard = createElement('div', 'project-card');
  const title = createElement('div', 'title', projectInfo.title);

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
      TodoListEvents.emit(TodoListEvents.EDIT_PROJECT, projectInfo.index);
    });
    deleteButton.addEventListener('click', () => {
      TodoListEvents.emit(TodoListEvents.DELETE, projectInfo.index);
    });

    // Append card elements
    projectCard.append(title, editButton, deleteButton);
  } else {
    // Append card elements
    projectCard.append(title);
  }

  return projectCard;
}

export { ProjectCard };
