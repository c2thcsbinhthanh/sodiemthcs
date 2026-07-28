import { qs, clear } from '../utils/dom.js';
import { renderNavTabs } from './components/navTabs.js';

export class Router {
  constructor({ outletSelector, navSelector, navSelectorMobile, views, onNavigate }) {
    this.outlet = qs(outletSelector);
    this.navContainer = navSelector ? qs(navSelector) : null;
    this.navContainerMobile = navSelectorMobile ? qs(navSelectorMobile) : null;
    this.views = views;
    this.onNavigate = onNavigate;
    this.activeTab = null;
  }

  async navigate(tabId, params = {}) {
    const view = this.views[tabId];
    if (!view) return;
    this.activeTab = tabId;
    if (this.navContainer) renderNavTabs(this.navContainer, tabId, (id) => this.navigate(id));
    if (this.navContainerMobile) renderNavTabs(this.navContainerMobile, tabId, (id) => this.navigate(id));
    clear(this.outlet);
    this.outlet.classList.remove('view-enter');
    void this.outlet.offsetWidth;
    this.outlet.classList.add('view-enter');
    await view.render(this.outlet, params);
    if (this.onNavigate) this.onNavigate(tabId, params);
    this.outlet.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async refresh() {
    if (this.activeTab) await this.navigate(this.activeTab);
  }
}
