import './index.css';

import createElement from '../../helpers/createElement.js';

/**
 * Creates a drop down menu with given choices and calls 'onSelect' when a choices selected.
 * NOTE: First choice is always the default (initial) selected choice.
 * @param {string[]} choices - List of choices for the drop-down menu.
 * @param {function} onSelect - A function to be called when a choice selected
 * @param {string?} className - Any classes to be added on the drop-down menu
 * @param {string?} selectedPrefix - Text to be added before selected value
 * @param {string?} selectedSuffix - Text to be added after selected value
 * @returns {HTMLDivElement}
 */
export default function DropDownMenu(
  choices,
  onSelect,
  className,
  selectedPrefix,
  selectedSuffix,
) {
  // Validate needed parameters
  if (!choices || !Array.isArray(choices) || choices.length < 1) {
    throw TypeError(
      "'DropDownMenu' expects 'choices', type 'Array' and its length > 0!",
    );
  } else if (!onSelect || !typeof onSelect === 'function') {
    throw TypeError("'DropDownMenu' expects 'onSelect' type 'function'!");
  }

  // Global variables
  let opened = false,
    currentChoiceElement = null;

  // Helper functions
  const getNextChoiceIndex = () => {
    // Return 0, if next index will be the end of the list
    const nextChoiceIndex =
      choices.indexOf(currentChoiceElement.textContent) + 1;
    if (nextChoiceIndex >= choices.length) {
      return 0;
    }
    return nextChoiceIndex;
  };
  const getPreviousChoiceIndex = () => {
    // return last choice index, if previous index will less than 0
    const previousChoiceIndex =
      choices.indexOf(currentChoiceElement.textContent) - 1;
    if (previousChoiceIndex < 0) {
      return choices.length - 1;
    }
    return previousChoiceIndex;
  };
  const addExtraText = (mainText) => {
    if (selectedPrefix) {
      mainText = selectedPrefix + mainText;
    }
    if (selectedSuffix) {
      mainText += selectedSuffix;
    }
    return mainText;
  };

  // Create elements
  const dropDownMenu = createElement(
    'div',
    'hmk-drop-down-menu ' + (className ? className : ''),
    null,
    ['tabindex', '0'],
    ['role', 'listbox'],
  );
  const selectedChoice = createElement(
    'span',
    'hmk-current-choice',
    addExtraText(choices[0]),
  );
  const choicesMenu = createElement('ul', 'hmk-choices-menu hidden', null, [
    'role',
    'presentation',
  ]);
  const choicesElements = [];
  for (let i = 0; i < choices.length; i++) {
    const choice = createElement(
      'li',
      'hmk-choice',
      choices[i],
      ['tabindex', '0'],
      ['role', 'option'],
      ['aria-selected', 'false'],
    );
    if (i === 0) {
      currentChoiceElement = choice;
      choice.setAttribute('aria-selected', 'true');
    }
    choice.addEventListener('click', () => {
      selectedChoice.textContent = addExtraText(choice.textContent);
      onSelect(choice.textContent);
      const siblings = [...choice.parentElement.children];
      siblings.forEach((sibling) => {
        sibling.setAttribute('aria-selected', 'false');
      });
      choice.setAttribute('aria-selected', 'true');
      currentChoiceElement = choice;
      dropDownMenu.focus();
    });
    choicesElements.push(choice);
  }

  // Append elements
  choicesMenu.append(...choicesElements);
  dropDownMenu.append(selectedChoice, choicesMenu);

  // Handle events
  dropDownMenu.addEventListener('click', () => {
    choicesMenu.classList.toggle('hidden');
    dropDownMenu.classList.toggle('open');
    opened = !opened;
  });
  document.addEventListener('click', (event) => {
    if (event.target !== dropDownMenu) {
      choicesMenu.classList.add('hidden');
      dropDownMenu.classList.remove('open');
      opened = false;
    }
  });

  // Keyboard accessibility
  const preventDefaultSomeKeys = (event) => {
    switch (event.key) {
      // Only the keys that we listen to
      case 'Enter':
      case 'Escape':
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        break;
    }
  };
  document.addEventListener('keydown', preventDefaultSomeKeys);
  document.addEventListener('keyup', preventDefaultSomeKeys);
  document.addEventListener('keyup', (event) => {
    // Only continue if the target is our menu or one of its children
    if (
      event.target === dropDownMenu ||
      event.target.parentElement === choicesMenu
    ) {
      if (event.key === 'Enter') {
        event.target.click();
        dropDownMenu.focus();
      }
      if (event.key === 'Escape' && opened) {
        dropDownMenu.click();
        dropDownMenu.focus();
      }
      // If ArrowDown/Up,
      // Move down/up the menu if opened, else change the value.
      if (event.key === 'ArrowDown') {
        if (opened) {
          if (
            event.target === dropDownMenu ||
            event.target === choicesMenu.lastElementChild
          ) {
            choicesMenu.firstElementChild?.focus();
          } else {
            event.target.nextElementSibling?.focus();
          }
        } else {
          currentChoiceElement = choicesElements[getNextChoiceIndex()];
          currentChoiceElement.click();
        }
      } else if (event.key === 'ArrowUp') {
        if (opened) {
          if (
            event.target === dropDownMenu ||
            event.target === choicesMenu.firstElementChild
          ) {
            choicesMenu.lastElementChild?.focus();
          } else {
            event.target.previousElementSibling?.focus();
          }
        } else {
          currentChoiceElement = choicesElements[getPreviousChoiceIndex()];
          currentChoiceElement.click();
        }
      }
    }
  });

  return dropDownMenu;
}

export { DropDownMenu };
