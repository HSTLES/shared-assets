/*!
 * HSTLES Minimal Components
 * Lightweight vanilla JavaScript replacement for Keenthemes bundle
 * Dependencies: None (vanilla JS only)
 * Size: <10KB vs 474KB original bundle
 */

(function() {
    'use strict';

    // =============================================================================
    // 1. UTILITY FUNCTIONS
    // =============================================================================
    
    const utils = {
        // DOM ready handler
        ready(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        },

        // Element selector
        $(selector) {
            return typeof selector === 'string' ? 
                document.querySelector(selector) : selector;
        },

        // Multiple elements selector
        $$(selector) {
            return typeof selector === 'string' ? 
                document.querySelectorAll(selector) : [selector];
        },

        // Class manipulation
        addClass(element, className) {
            element?.classList?.add(className);
        },

        removeClass(element, className) {
            element?.classList?.remove(className);
        },

        toggleClass(element, className) {
            element?.classList?.toggle(className);
        },

        hasClass(element, className) {
            return element?.classList?.contains(className) || false;
        },

        // Event handling
        on(element, event, handler) {
            element?.addEventListener(event, handler);
        },

        off(element, event, handler) {
            element?.removeEventListener(event, handler);
        },

        // Get computed style
        getStyle(element, property) {
            return window.getComputedStyle(element).getPropertyValue(property);
        }
    };

    // =============================================================================
    // 2. DROPDOWN COMPONENT (replacing KTMenu/KTDropdown)
    // =============================================================================
    
    class SimpleDropdown {
        constructor(element) {
            this.element = element;
            this.toggle = element.querySelector('.dropdown-toggle');
            this.menu = element.querySelector('.menu-dropdown');
            this.isOpen = false;
            
            this.init();
        }

        init() {
            if (!this.toggle || !this.menu) return;

            // Handle click to toggle
            utils.on(this.toggle, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });

            // Close on outside click
            utils.on(document, 'click', (e) => {
                if (!this.element.contains(e.target)) {
                    this.close();
                }
            });

            // Close on escape key
            utils.on(document, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            });
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            if (this.isOpen) return;
            
            this.isOpen = true;
            utils.addClass(this.element, 'dropdown-open');
            utils.addClass(this.menu, 'show');
            
            // Close other dropdowns
            utils.$$('.dropdown-open').forEach(dropdown => {
                if (dropdown !== this.element) {
                    const instance = dropdown._dropdownInstance;
                    instance?.close();
                }
            });
        }

        close() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            utils.removeClass(this.element, 'dropdown-open');
            utils.removeClass(this.menu, 'show');
        }
    }

    // =============================================================================
    // 3. TOOLTIP COMPONENT (replacing KTTooltip)
    // =============================================================================
    
    class SimpleTooltip {
        constructor(element) {
            this.element = element;
            this.tooltipId = element.getAttribute('data-tooltip');
            this.trigger = element.getAttribute('data-tooltip-trigger') || 'hover';
            this.tooltip = utils.$(this.tooltipId);
            
            this.init();
        }

        init() {
            if (!this.tooltip) return;

            if (this.trigger === 'hover') {
                utils.on(this.element, 'mouseenter', () => this.show());
                utils.on(this.element, 'mouseleave', () => this.hide());
            } else if (this.trigger === 'click') {
                utils.on(this.element, 'click', () => this.toggle());
            }
        }

        show() {
            utils.addClass(this.tooltip, 'show');
            this.position();
        }

        hide() {
            utils.removeClass(this.tooltip, 'show');
        }

        toggle() {
            utils.hasClass(this.tooltip, 'show') ? this.hide() : this.show();
        }

        position() {
            // Simple positioning - you can enhance this
            const rect = this.element.getBoundingClientRect();
            this.tooltip.style.position = 'absolute';
            this.tooltip.style.top = `${rect.bottom + 5}px`;
            this.tooltip.style.left = `${rect.left}px`;
        }
    }

    // =============================================================================
    // 4. THEME MANAGER
    // =============================================================================
    
    class ThemeManager {
        constructor() {
            this.init();
        }

        init() {
            // Apply saved theme or detect system preference
            this.applyTheme(this.getTheme());
            
            // Listen for system theme changes
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                    if (this.getTheme() === 'system') {
                        this.applyTheme('system');
                    }
                });
            }
        }

        getTheme() {
            return localStorage.getItem('theme') || 'system';
        }

        setTheme(theme) {
            localStorage.setItem('theme', theme);
            this.applyTheme(theme);
        }

        applyTheme(theme) {
            const isDark = theme === 'dark' || 
                          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        toggleTheme() {
            const currentTheme = this.getTheme();
            let newTheme;
            
            switch (currentTheme) {
                case 'light':
                    newTheme = 'dark';
                    break;
                case 'dark':
                    newTheme = 'system';
                    break;
                default:
                    newTheme = 'light';
                    break;
            }
            
            this.setTheme(newTheme);
        }
    }

    // =============================================================================
    // 5. HTMX LOADING MANAGER
    // =============================================================================
    
    class HTMXLoadingManager {
        static init() {
            // Add loading state management for HTMX requests
            utils.on(document.body, 'htmx:beforeRequest', this.handleBeforeRequest);
            utils.on(document.body, 'htmx:afterRequest', this.handleAfterRequest);
            utils.on(document.body, 'htmx:responseError', this.handleError);
            utils.on(document.body, 'htmx:timeout', this.handleTimeout);
        }

        static handleBeforeRequest(evt) {
            const target = evt.detail.elt;
            
            // Add loading class to the element
            utils.addClass(target, 'htmx-request');
            
            // Disable form elements if it's a form
            if (target.tagName === 'FORM') {
                const inputs = target.querySelectorAll('input, button, select, textarea');
                inputs.forEach(input => {
                    input.disabled = true;
                });
            }
            
            // If it's a button, disable it
            if (target.tagName === 'BUTTON') {
                target.disabled = true;
            }
            
            // If it's an element with a form parent, disable the parent form
            const parentForm = target.closest('form');
            if (parentForm) {
                const inputs = parentForm.querySelectorAll('input, button, select, textarea');
                inputs.forEach(input => {
                    input.disabled = true;
                });
            }
        }

        static handleAfterRequest(evt) {
            const target = evt.detail.elt;
            
            // Remove loading class
            utils.removeClass(target, 'htmx-request');
            
            // Re-enable form elements
            HTMXLoadingManager.enableElements(target);
        }

        static handleError(evt) {
            const target = evt.detail.elt;
            utils.removeClass(target, 'htmx-request');
            
            // Re-enable form elements on error
            HTMXLoadingManager.enableElements(target);
        }

        static handleTimeout(evt) {
            const target = evt.detail.elt;
            utils.removeClass(target, 'htmx-request');
            
            // Re-enable form elements on timeout
            HTMXLoadingManager.enableElements(target);
        }

        static enableElements(target) {
            // Re-enable form elements
            if (target.tagName === 'FORM') {
                const inputs = target.querySelectorAll('input, button, select, textarea');
                inputs.forEach(input => {
                    input.disabled = false;
                });
            }
            
            // If it's a button, re-enable it
            if (target.tagName === 'BUTTON') {
                target.disabled = false;
            }
            
            // If it's an element with a form parent, re-enable the parent form
            const parentForm = target.closest('form');
            if (parentForm) {
                const inputs = parentForm.querySelectorAll('input, button, select, textarea');
                inputs.forEach(input => {
                    input.disabled = false;
                });
            }
        }
    }

    // =============================================================================
    // 6. FORM HELPERS (for additional HTMX integration)
    // =============================================================================
    
    class FormHelpers {
        static init() {
            // Enhanced form handling for HTMX
            utils.$$('form[hx-post], form[hx-get]').forEach(form => {
                FormHelpers.enhanceForm(form);
            });
        }

        static enhanceForm(form) {
            // Auto-disable submit button during HTMX requests
            const submitBtn = form.querySelector('button[type="submit"]');
            
            if (submitBtn) {
                utils.on(form, 'htmx:beforeRequest', () => {
                    utils.addClass(submitBtn, 'loading');
                });

                utils.on(form, 'htmx:afterRequest', () => {
                    utils.removeClass(submitBtn, 'loading');
                });
            }
        }
    }

    // =============================================================================
    // 7. MAIN INITIALIZATION
    // =============================================================================
    
    class HSTLES {
        static init() {
            // Initialize all components
            this.initDropdowns();
            this.initTooltips();
            this.initTheme();
            this.initHTMX();
            this.initForms();
            this.initTabs();
            
            console.log('HSTLES Minimal Components initialized');
        }

        static initDropdowns() {
            utils.$$('.menu-item[data-menu-item-toggle="dropdown"]').forEach(element => {
                element._dropdownInstance = new SimpleDropdown(element);
            });

            // Also handle simple dropdown-toggle buttons
            utils.$$('.dropdown-toggle').forEach(toggle => {
                const dropdown = toggle.closest('.dropdown') || toggle.parentElement;
                if (!dropdown._dropdownInstance) {
                    dropdown._dropdownInstance = new SimpleDropdown(dropdown);
                }
            });
        }

        static initTooltips() {
            utils.$$('[data-tooltip]').forEach(element => {
                new SimpleTooltip(element);
            });
        }

        static initTheme() {
            // Initialize theme manager
            window.themeManager = new ThemeManager();
            
            // Make toggleTheme globally available for theme switcher buttons
            window.toggleTheme = () => window.themeManager.toggleTheme();
            
            console.log('Theme management initialized');
        }

        static initHTMX() {
            // Initialize HTMX loading manager
            HTMXLoadingManager.init();
            console.log('HTMX loading manager initialized');
        }

        static initForms() {
            FormHelpers.init();
        }

        static initTabs() {
            const tabs = document.querySelectorAll('[data-tab]');
            const contents = document.querySelectorAll('.settings-content, .tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    
                    // Hide all content
                    contents.forEach(content => content.classList.add('hidden'));
                    
                    // Show selected content and activate tab
                    const targetTab = this.dataset.tab;
                    const targetContent = document.getElementById(targetTab + '-tab');
                    
                    if (targetContent) {
                        targetContent.classList.remove('hidden');
                        this.classList.add('active');
                    }
                });
            });
            
            // Initialize first tab
            if (tabs.length > 0 && contents.length > 0) {
                tabs[0].classList.add('active');
                contents[0].classList.remove('hidden');
            }
        }

        // Expose utilities for global use
        static get utils() {
            return utils;
        }
    }

    // =============================================================================
    // 8. GLOBAL EXPOSURE & AUTO-INIT
    // =============================================================================
    
    // Expose to global scope for compatibility
    window.HSTLES = HSTLES;
    window.HSTLESUtils = utils;

    // Auto-initialize when DOM is ready
    utils.ready(() => {
        HSTLES.init();
    });

})();
