import './index.css';

import createElement from '../../helpers/createElement.js';

/**
 * Creates HTML button element
 * @param {{className: string?, type: string?, textContent: string?}} props
 * @returns {HTMLButtonElement}
 */
export default function Button(props) {
  const className = props.className ? props.className + ' hmk-btn' : ' hmk-btn';
  const button = createElement(
    'button',
    className,
    props.textContent,
    props.type ? ['type', props.type] : ['type', 'button'],
  );

  return button;
}

export { Button };
