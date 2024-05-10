import './index.css';

import { isEqual, isAfter, addHours } from 'date-fns';
import createElement from './helpers/createElement.js';
import TodoListEvents from './helpers/TodoListEvents.js';
import DeleteForm from './components/DeleteForm';
import DropDownMenu from './components/DropDownMenu';
import ProjectForm from './components/ProjectForm';
import ProjectCard from './components/ProjectCard';
import TodoForm from './components/TodoForm';
import TodoCard from './components/TodoCard';
import Button from './components/Button';

const STORAGE_TODOS_KEY = 'todo-info-list';
const STORAGE_PROJECTS_KEY = 'projects';

const generateId = () => {
  return `${Math.random()}${new Date().getTime()}`.slice(2);
};

let projects = getProjectSamples(),
  currentProject = projects[0],
  todos = [],
  todoSamples = false,
  projectFormPresented = false,
  todoFormPresented = false,
  projectsPresented = false,
  projectIndexToEdit = null,
  projectIndexToDelete = null,
  todoToEdit = null,
  todoToDelete = null;

// Header
const header = createElement('header', 'todo-header');
const pageTitle = createElement('h1', 'todo-head', 'Odin Todo List');
const controls = createElement('div', 'todo-controls');
const newTodoButton = Button({
  className: 'new-todo',
  type: 'button',
  textContent: 'New Todo',
});
newTodoButton.addEventListener('click', () => {
  if (!todoFormPresented) {
    showTodoForm();
  } else {
    removeTodoForm();
  }
});
const newProjectButton = Button({
  className: 'new-project',
  type: 'button',
  textContent: 'New Project',
});
newProjectButton.addEventListener('click', () => {
  if (!projectFormPresented) {
    showProjectForm();
  } else {
    removeProjectForm();
  }
});
const showProjectsButton = Button({
  className: 'show-projects',
  type: 'button',
  textContent: 'Projects',
});
showProjectsButton.addEventListener('click', () => {
  if (!projectsPresented) {
    showProjects();
  } else {
    removeProjects();
  }
});
// The following appending order is important for 'refreshProjectsMenu' function
controls.append(
  newTodoButton,
  newProjectButton,
  showProjectsButton,
  createProjectsMenu(),
);
header.append(pageTitle, controls);

// Main
const main = createElement('main');

// Listen to todo list events
TodoListEvents.add(TodoListEvents.CREATE_NEW_TODO, (todoInfo) => {
  // Remove sample todos if it is the first todo
  if (todoSamples) {
    todos.splice(0, todos.length);
    todoSamples = false;
  }
  todoInfo.id = generateId();
  todoInfo.project = currentProject;
  todos.push(todoInfo);
  // Sort the todos based on dueDate
  todos.sort((a, b) => {
    if (isEqual(a.dueDate, b.dueDate)) {
      return 0;
    } else if (isAfter(a.dueDate, b.dueDate)) {
      return 1;
    } else {
      return -1;
    }
  });
  removeTodoForm();
});
TodoListEvents.add(TodoListEvents.EDIT_TODO, (todoId) => {
  showTodoForm(todoId);
});
TodoListEvents.add(TodoListEvents.TODO_EDITED, (todoInfo) => {
  // Use todoToEdit global variable to update the todo with edits, then, reset it.
  if (todoToEdit && todoToEdit.id === todoInfo.id) {
    Object.assign(todoToEdit, todoInfo);
  } else {
    throw Error('Todo edit cannot be confirmed!');
  }
  todoToEdit = null;
  removeTodoForm();
});
TodoListEvents.add(TodoListEvents.DELETE, (todoId) => {
  showDeleteForm(todoId);
});
TodoListEvents.add(TodoListEvents.CONFIRM_DELETE, () => {
  // Use the global variable 'todoToDelete'/'projectIndexToDelete' to delete the todo/project.
  if (Number.isInteger(projectIndexToDelete)) {
    todos = todos.filter(
      (todo) => todo.project !== projects[projectIndexToDelete],
    );
    projects.splice(projectIndexToDelete, 1);
    if (projects.length === 0) {
      projects = getProjectSamples();
    }
    refreshProjectsMenu();
  } else if (todoToDelete) {
    todos.splice(todos.indexOf(todoToDelete), 1);
  } else {
    throw Error('Todo delete cannot be confirmed!');
  }
  removeDeleteForm();
});
TodoListEvents.add(TodoListEvents.CANCEL_DELETE, () => {
  removeDeleteForm();
});
TodoListEvents.add(TodoListEvents.CREATE_NEW_PROJECT, (project) => {
  if (typeof project === 'string' && project.length > 0) {
    projects.push(project);
    refreshProjectsMenu();
  }
  removeProjectForm();
});
TodoListEvents.add(TodoListEvents.PROJECT_CHANGED, (selectedProject) => {
  if (projects.includes(selectedProject)) {
    currentProject = selectedProject;
    if (!todoFormPresented && !projectFormPresented && !projectsPresented) {
      emptyMain();
      showTodos();
    }
  }
});
TodoListEvents.add(TodoListEvents.EDIT_PROJECT, (projectIndex) => {
  showProjectForm(projects[projectIndex]);
});
TodoListEvents.add(TodoListEvents.PROJECT_EDITED, (project) => {
  // Use projectIndexToEdit global variable to update project then reset it.
  if (
    Number.isInteger(projectIndexToEdit) &&
    typeof project === 'string' &&
    project.length > 0
  ) {
    const oldProject = projects[projectIndexToEdit];
    projects.splice(projectIndexToEdit, 1, project);
    todos.map((todo) => {
      if (todo.project === oldProject) {
        todo.project = projects[projectIndexToEdit];
      }
      return todo;
    });
    refreshProjectsMenu();
  } else {
    throw Error('Project edit cannot be confirmed!');
  }
  projectIndexToEdit = null;
  removeProjectForm();
});

// Local storage logic
if (localStorage) {
  // Get stored projects
  let storedProjects = localStorage.getItem(STORAGE_PROJECTS_KEY);
  if (storedProjects) {
    projects = JSON.parse(storedProjects);
    if (projects.length === 0) {
      projects = getProjectSamples();
    }
    currentProject = projects[0];
    refreshProjectsMenu();
  }
  // Get stored todos
  let storedTodoInfoList = localStorage.getItem(STORAGE_TODOS_KEY);
  if (storedTodoInfoList) {
    storedTodoInfoList = JSON.parse(storedTodoInfoList, (key, value) => {
      if (key === 'dueDate') {
        return new Date(value);
      }
      return value;
    });
    if (storedTodoInfoList.length > 0) {
      todos = storedTodoInfoList;
    } else {
      todos = getTodoSamples();
      todoSamples = true;
    }
  } else {
    todos = getTodoSamples();
    todoSamples = true;
  }
  showTodos();
  // Store data
  document.defaultView.addEventListener('beforeunload', () => {
    // Projects
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    }
    // Todos
    if (!todoSamples && todos.length > 0) {
      localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
    } else if (todos.length === 0) {
      if (localStorage.getItem(STORAGE_TODOS_KEY)) {
        localStorage.clear();
      }
    }
  });
} else {
  todos = getTodoSamples();
  todoSamples = true;
  showTodos();
}

// Show result, then, Calculate main's top margin because header is fixed.
document.body.append(header, main);
main.setAttribute(
  'style',
  `margin-top: calc(${header.offsetHeight}px + 1rem);`,
);
// TODO: Set main's margin-top on resizing the viewport (window)

// Manipulate main content
function emptyMain() {
  [...main.children].forEach((node) => main.removeChild(node));
}

function showTodos() {
  todos
    .filter((todoInfo) => todoInfo.project === currentProject)
    .forEach((todoInfo) => main.append(TodoCard(todoInfo)));
}

function createProjectsMenu() {
  return DropDownMenu(
    projects,
    (selectedProject) => {
      TodoListEvents.emit(TodoListEvents.PROJECT_CHANGED, selectedProject);
    },
    'projects-menu',
    'Project: ',
  );
}

function refreshProjectsMenu() {
  controls.replaceChild(createProjectsMenu(), controls.lastElementChild);
  currentProject = projects[0];
}

function showProjects() {
  if (todoFormPresented) removeTodoForm();
  if (projectFormPresented) removeProjectForm();
  emptyMain();
  projects.forEach((project, i) => {
    main.append(ProjectCard({ title: project, index: i }));
  });
  showProjectsButton.textContent = 'Home';
  projectsPresented = true;
}

function removeProjects() {
  emptyMain();
  showTodos();
  showProjectsButton.textContent = 'Projects';
  projectsPresented = false;
}

function showProjectForm(project) {
  if (todoFormPresented) removeTodoForm();
  if (projectsPresented) removeProjects();
  emptyMain();
  if (typeof project === 'string') {
    projectIndexToEdit = projects.indexOf(project);
    if (Number.isInteger(projectIndexToEdit)) {
      main.appendChild(ProjectForm(project));
    } else {
      main.appendChild(ProjectForm());
    }
  } else {
    main.appendChild(ProjectForm());
  }
  newProjectButton.textContent = 'Home';
  projectFormPresented = true;
}

function removeProjectForm() {
  emptyMain();
  showTodos();
  projectFormPresented = false;
  newProjectButton.textContent = 'New Project';
}

function showTodoForm(todoId) {
  if (projectFormPresented) removeProjectForm();
  if (projectsPresented) removeProjects();
  emptyMain();
  // If todoId, so we need to assign the todo that has this id to the global variable todoToEdit
  // then, give it to the form to be edit-todo form instead of create-new-todo form
  if (todoId) {
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].id === todoId) {
        todoToEdit = todos[i];
        main.appendChild(TodoForm(todoToEdit));
        break;
      }
    }
    if (!todoToEdit) {
      main.appendChild(TodoForm());
    }
  } else {
    main.appendChild(TodoForm());
  }
  newTodoButton.textContent = 'Home';
  todoFormPresented = true;
}

function showDeleteForm(id) {
  if (Number.isInteger(id)) {
    if (Number.isInteger(id)) {
      // Assign it to the global variable 'projectIndexToDelete'
      projectIndexToDelete = id;
      // Create new confirm delete todo form
      emptyMain();
      main.append(
        ProjectCard({ title: projects[id], index: id }, true),
        DeleteForm(),
      );
      newProjectButton.textContent = 'Home';
      projectFormPresented = true;
    } else {
      throw Error('Not given a valid project index to delete!');
    }
  } else if (typeof id === 'string') {
    // Find the todo and assign it to the global variable 'todoToDelete'
    if (id) {
      for (let i = 0; i < todos.length; i++) {
        if (todos[i].id === id) {
          todoToDelete = todos[i];
          break;
        }
      }
    }
    if (todoToDelete) {
      // Create new confirm delete todo form
      emptyMain();
      main.append(TodoCard(todoToDelete, true), DeleteForm());
      newTodoButton.textContent = 'Home';
      todoFormPresented = true;
    } else {
      throw Error('Cannot find a todo to delete!');
    }
  } else {
    throw Error('Invalid ID, nothing deleted!');
  }
}

function removeTodoForm() {
  emptyMain();
  showTodos();
  todoFormPresented = false;
  newTodoButton.textContent = 'New Todo';
}

function removeDeleteForm() {
  projectIndexToDelete = null;
  todoToDelete = null;
  emptyMain();
  if (projectsPresented) {
    showProjects();
  } else {
    showTodos();
  }
}

function getProjectSamples() {
  return ['Default 1', 'Default 2'];
}

function getTodoSamples() {
  return [
    {
      id: generateId(),
      project: projects[0],
      title: 'Todo Sample #1',
      description: 'Sed consectetur adipiscing elit, sed do eiusmod.',
      dueDate: addHours(new Date(), 2),
      priority: 'high',
    },
    {
      id: generateId(),
      project: projects[0],
      title: 'Todo Sample #2',
      description:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' +
        ' Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      dueDate: addHours(new Date(), 4),
      priority: 'medium',
    },
    {
      id: generateId(),
      project: projects[0],
      title: 'Todo Sample #3',
      description:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium',
      dueDate: addHours(new Date(), 6),
      priority: 'low',
    },
    {
      id: generateId(),
      project: projects[1],
      title: 'Todo Sample #4',
      description: 'Sed consectetur adipiscing elit, sed do eiusmod.',
      dueDate: addHours(new Date(), 2),
      priority: 'high',
    },
    {
      id: generateId(),
      project: projects[1],
      title: 'Todo Sample #5',
      description:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium',
      dueDate: addHours(new Date(), 4),
      priority: 'low',
    },
  ];
}
