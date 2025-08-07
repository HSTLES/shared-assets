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
    // 4. THEME MANAGER (delegated to theme-manager.js)
    // =============================================================================
    
    // Theme management is handled by the dedicated theme-manager.js file
    // which provides window.toggleTheme() function and automatic initialization

    // =============================================================================
    // 5. FORM HELPERS (for HTMX integration)
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
                    submitBtn.disabled = true;
                    utils.addClass(submitBtn, 'loading');
                });

                utils.on(form, 'htmx:afterRequest', () => {
                    submitBtn.disabled = false;
                    utils.removeClass(submitBtn, 'loading');
                });
            }
        }
    }

    // =============================================================================
    // 6. MAIN INITIALIZATION
    // =============================================================================
    
    class HSTLES {
        static init() {
            // Initialize all components
            this.initDropdowns();
            this.initTooltips();
            this.initTheme();
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
            // Theme management is delegated to theme-manager.js
            // which automatically initializes and provides window.toggleTheme()
            console.log('Theme management handled by theme-manager.js');
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
    // 7. GLOBAL EXPOSURE & AUTO-INIT
    // =============================================================================
    
    // Expose to global scope for compatibility
    window.HSTLES = HSTLES;
    window.HSTLESUtils = utils;

    // Auto-initialize when DOM is ready
    utils.ready(() => {
        HSTLES.init();
    });

})();
