const eventRegistry = {};

const TodoListEvents = {
  CREATE_NEW_TODO: 'create-new-todo',
  EDIT_TODO: 'edit-todo',
  TODO_EDITED: 'todo-edited',
  DELETE: 'delete',
  CANCEL_DELETE: 'cancel-delete',
  CONFIRM_DELETE: 'confirm-delete',
  CREATE_NEW_PROJECT: 'create-new-project',
  PROJECT_CHANGED: 'project-changed',
  EDIT_PROJECT: 'edit-project',
  PROJECT_EDITED: 'project-edited',

  add(eventName, ...callbacks) {
    if (!eventRegistry[eventName]) {
      eventRegistry[eventName] = [];
    }
    callbacks.forEach((callback) => eventRegistry[eventName].push(callback));
  },

  remove(eventName, callbacks) {
    if (eventRegistry[eventName]) {
      eventRegistry[eventName].forEach((handler, i) => {
        if (callbacks.includes(handler)) {
          eventRegistry[eventName].splice(i, 1);
        }
      });
    }
  },

  emit(eventName, data) {
    if (eventRegistry[eventName]) {
      eventRegistry[eventName].forEach((handler) => handler(data));
    }
  },
};

Object.freeze(TodoListEvents);
Object.freeze(TodoListEvents.add);
Object.freeze(TodoListEvents.remove);
Object.freeze(TodoListEvents.emit);

export default TodoListEvents;
export { TodoListEvents };
