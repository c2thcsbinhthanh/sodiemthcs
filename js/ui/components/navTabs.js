import { el, clear } from '../../utils/dom.js';
import { TABS } from '../../config/app.config.js';

export function renderNavTabs(container, activeTab, onSelect) {
  clear(container);
  TABS.forEach((tab) => {
    const isActive = tab.id === activeTab;
    const button = el(
      'button',
      {
        class: `nav-tab ${isActive ? 'nav-tab--active' : ''}`,
        dataset: { tab: tab.id },
        onClick: () => onSelect(tab.id)
      },
      [el('i', { class: `fa-solid ${tab.icon} nav-tab__icon` }), el('span', { class: 'nav-tab__label' }, tab.label)]
    );
    container.append(button);
  });
}
