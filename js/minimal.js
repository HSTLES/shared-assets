/*!
 * HSTLES Minimal Components
 * Lightweight vanilla JavaScript replacement for Keenthemes bundle
 * Dependencies: None (vanilla JS only)
 * Size: <10KB vs 474KB original bundle
 *
 * Version: v0.1.3
 * Build-Date: 2025-08-16
 * Tag: v0.1.3
 * Source: https://github.com/HSTLES/shared-assets
 * CDN-Note: If @latest is stale, purge:
 *   - https://purge.jsdelivr.net/gh/HSTLES/shared-assets@latest/js/minimal.js
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
    
    /**
     * HSTLES Theme Manager
     * Handles light/dark/system theme switching with localStorage persistence
     */
    class ThemeManager {
        constructor() {
            this.storageKey = 'theme';
            this.classDark = 'dark';
            this.init();
        }

        // Helpers for storage (silent on errors)
        getStored() {
            try { 
                return localStorage.getItem(this.storageKey); 
            } catch { 
                return null; 
            }
        }

        setStored(val) {
            try { 
                localStorage.setItem(this.storageKey, val); 
            } catch { 
                /* no-op */ 
            }
        }

        // Determine initial "mode" (light|dark|system)
        detectMode() {
            const stored = this.getStored();
            if (stored) return stored;
            const attr = document.documentElement.getAttribute('data-theme-mode');
            if (attr) return attr;
            return 'dark';        // default to dark
        }

        // Apply a mode: add/remove .dark on <html>
        apply(mode) {
            let useDark;
            if (mode === 'system') {
                useDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            } else {
                useDark = (mode === 'dark');
            }
            document.documentElement.classList.toggle(this.classDark, useDark);
        }

        init() {
            // Kick things off
            const currentMode = this.detectMode();
            this.apply(currentMode);

            // If "system", watch for OS changes
            if (currentMode === 'system') {
                window.matchMedia('(prefers-color-scheme: dark)')
                    .addEventListener('change', () => this.apply('system'));
            }
        }

        // For compatibility with existing code
        getTheme() {
            return this.getStored() || this.detectMode();
        }

        setTheme(theme) {
            this.setStored(theme);
            this.apply(theme);
        }

        applyTheme(theme) {
            this.apply(theme);
        }

        toggleTheme(newMode) {
            // if no arg, rotate: light → dark → system → light → …
            const order = ['light', 'dark', 'system'];
            let idx = order.indexOf(this.getStored() || this.detectMode());
            idx = (idx + 1) % order.length;
            const mode = newMode || order[idx];
            this.setStored(mode);
            this.apply(mode);
        }
    }

    // =============================================================================
    // 5. HTMX LOADING MANAGER
    // =============================================================================

    const Loader = {
        _count: 0,
        _el: null,
        _initialized: false,
        _sticky: false,
        _navPending: false,

        ensureElement() {
            if (this._el) return this._el;
            const el = document.createElement('div');
            el.className = 'hstles-loader';
            el.setAttribute('aria-live', 'polite');
            el.setAttribute('aria-busy', 'true');
            el.innerHTML = '<span class="loading-spinner" aria-hidden="true"></span><span class="sr-only">Loading…</span>';
            document.body.appendChild(el);
            this._el = el;
            return el;
        },

        show() {
            this.ensureElement();
            this._count = Math.max(1, this._count + 1);
            document.documentElement.classList.add('hstles-loading');
        },

        hide() {
            // If sticky (during redirect/navigation), defer hiding until pageshow/unload
            if (this._sticky || this._navPending) return;
            this._count = Math.max(0, this._count - 1);
            if (this._count === 0) {
                document.documentElement.classList.remove('hstles-loading');
            }
        },

        stick() {
            this._sticky = true;
            this.show();
        },

        unstick() {
            this._sticky = false;
            // attempt to hide if no pending ops
            if (this._count <= 1) {
                this._count = 1; // will be decremented by hide()
                this.hide();
            }
        },

        // Event helpers (bound-friendly)
        increment() { Loader.show(); },
        decrement() { Loader.hide(); },

        // Promise wrapper for arbitrary async work
        wrapPromise(p) {
            Loader.show();
            return Promise.resolve(p).finally(() => Loader.hide());
        },

        // HTMX integration (optional, auto-wired if htmx is on the page)
        init() {
            if (this._initialized) return;
            this._initialized = true;
            // Wire HTMX lifecycle
            if (window.document && 'addEventListener' in document) {
                utils.on(document.body, 'htmx:beforeRequest', this.handleBeforeRequest.bind(this));
                utils.on(document.body, 'htmx:afterRequest', this.handleAfterRequest.bind(this));
                utils.on(document.body, 'htmx:responseError', this.handleError.bind(this));
                utils.on(document.body, 'htmx:timeout', this.handleTimeout.bind(this));
                utils.on(document.body, 'htmx:beforeSwap', this.handleBeforeSwap.bind(this));
                utils.on(window, 'pageshow', this.handlePageShow.bind(this));

                // Drive the single loader off HTMX lifecycle
                utils.on(document.body, 'htmx:beforeRequest', this.increment);
                utils.on(document.body, 'htmx:afterRequest', this.decrement);
                utils.on(document.body, 'htmx:responseError', this.decrement);
                utils.on(document.body, 'htmx:timeout', this.decrement);
            }
            // Keep loader on during full navigations/redirects
            window.addEventListener('beforeunload', () => {
                this._navPending = true;
                this.stick();
            });
            window.addEventListener('pageshow', () => {
                this._navPending = false;
                this.unstick();
                document.documentElement.classList.remove('hstles-redirecting');
            });
            // Make common auth/login links trigger sticky loader
            document.addEventListener('click', (e) => {
                const a = e.target.closest('a');
                if (!a) return;
                const href = a.getAttribute('href') || '';
                if (/\/auth\//.test(href) || /login/.test(href) || a.hasAttribute('data-loader-sticky')) {
                    this.stick();
                }
            }, true);
        },

        handleBeforeRequest(evt) {
            const target = evt.detail?.elt;
            if (!target) return;
            utils.addClass(target, 'htmx-request');
            // Disable inputs/buttons in scope
            if (target.tagName === 'FORM') {
                target.querySelectorAll('input, button, select, textarea').forEach(i => i.disabled = true);
            }
            if (target.tagName === 'BUTTON') target.disabled = true;
            const parentForm = target.closest('form');
            if (parentForm) parentForm.querySelectorAll('input, button, select, textarea').forEach(i => i.disabled = true);
        },

        handleAfterRequest(evt) {
            const target = evt.detail?.elt;
            const xhr = evt.detail?.xhr;
            const hxRedirect = xhr?.getResponseHeader('HX-Redirect') || xhr?.getResponseHeader('Hx-Redirect');
            const status = Number(xhr?.status || 0);
            const isHttpRedirect = status >= 300 && status < 400;
            if (hxRedirect || isHttpRedirect) {
                document.documentElement.classList.add('hstles-redirecting');
                this.stick();
                return;
            }
            if (target) {
                utils.removeClass(target, 'htmx-request');
                this.enableElements(target);
            }
        },

        handleError(evt) {
            const target = evt.detail?.elt;
            if (target) {
                utils.removeClass(target, 'htmx-request');
                this.enableElements(target);
            }
        },

        handleTimeout(evt) {
            const target = evt.detail?.elt;
            if (target) {
                utils.removeClass(target, 'htmx-request');
                this.enableElements(target);
            }
        },

        handleBeforeSwap(evt) {
            const xhr = evt.detail?.xhr;
            const hxRedirect = xhr?.getResponseHeader('HX-Redirect') || xhr?.getResponseHeader('Hx-Redirect');
            if (hxRedirect) {
                document.documentElement.classList.add('hstles-redirecting');
                this.stick();
            }
        },

        handlePageShow() {
            document.documentElement.classList.remove('hstles-redirecting');
        },

        enableElements(target) {
            if (target.tagName === 'FORM') {
                target.querySelectorAll('input, button, select, textarea').forEach(i => i.disabled = false);
            }
            if (target.tagName === 'BUTTON') target.disabled = false;
            const parentForm = target.closest('form');
            if (parentForm) parentForm.querySelectorAll('input, button, select, textarea').forEach(i => i.disabled = false);
        }
    };

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
            window.toggleTheme = (newMode) => window.themeManager.toggleTheme(newMode);
            
            console.log('Theme management initialized');
        }

        static initHTMX() {
            // Initialize single Loader (includes HTMX wiring)
            Loader.init();
            console.log('Loader initialized');
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
    window.Loader = Loader;

    // Auto-initialize when DOM is ready
    utils.ready(() => {
        HSTLES.init();
    });

})();
