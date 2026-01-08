/*!
 * HSTLES Minimal Components
 * Lightweight vanilla JavaScript replacement for Keenthemes bundle
 * Dependencies: None (vanilla JS only)
 * Size: <10KB vs 474KB original bundle
 *
 * Version: v0.1.8
 * Build-Date: 2025-08-16
 * Tag: v0.1.8
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
        // Configuration for dual-mode loader
        config: {
            btnAttr: 'data-loader',            // values: 'btn' | 'page' | 'none'
            btnClass: 'btn-loader',
            spinnerClass: 'loading-spinner',
            labelClass: 'btn-label',
            disableSelector: 'input, button, select, textarea',
            spinnerTag: 'span',
            insertSpinner: 'append'            // 'append' | 'prepend'
        },
        _count: 0,
        _el: null,
        _initialized: false,
        _sticky: false,
        _navPending: false,
        _lingerTimer: null,
        _redirectPending: false,
        // Track active button per HTMX request target to avoid leaks
        _btnByTarget: new WeakMap(),

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
            // If sticky or navigation/redirect pending, do not hide yet
            if (this._sticky || this._navPending || this._redirectPending) return;
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

        linger(ms = 900) {
            this.stick();
            if (this._lingerTimer) clearTimeout(this._lingerTimer);
            this._lingerTimer = setTimeout(() => this.unstick(), ms);
        },

        // Event helpers (bound-friendly)
        increment(evt) {
            const target = evt && evt.detail && evt.detail.elt;
            if (target) {
                if (Loader.isNoneMode(target)) return;
                if (Loader.shouldUseBtnLoader(target)) return;
            }
            Loader.show();
        },
        decrement(evt) {
            const target = evt && evt.detail && evt.detail.elt;
            if (target) {
                if (Loader.isNoneMode(target)) return;
                if (Loader.shouldUseBtnLoader(target)) return;
            }
            Loader.hide();
        },

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
        // Consolidated pageshow handling into handlePageShow
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
                this._redirectPending = true;
                // ensure class is set even if counts were decremented
                this._count = Math.max(1, this._count);
                document.documentElement.classList.add('hstles-loading');
                this.stick();
            });
            window.addEventListener('unload', () => {
                this._navPending = true;
                this._redirectPending = true;
                this.stick();
            });
            window.addEventListener('pagehide', () => {
                this._navPending = false;
                this._redirectPending = false;
                this._sticky = false;
                this._count = 0;
                document.documentElement.classList.remove('hstles-loading');
                document.documentElement.classList.remove('hstles-redirecting');
            });
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this._sticky = false;
                    this._navPending = false;
                    this._redirectPending = false;
                    this._count = 0;
                    document.documentElement.classList.remove('hstles-loading');
                    document.documentElement.classList.remove('hstles-redirecting');
                    this.resetElements();
                }
            });
            window.addEventListener('popstate', () => {
                this._sticky = false;
                this._navPending = false;
                this._redirectPending = false;
                this._count = 0;
                document.documentElement.classList.remove('hstles-loading');
                document.documentElement.classList.remove('hstles-redirecting');
                this.resetElements();
            });
        },

        handleBeforeRequest(evt) {
            const target = evt.detail?.elt;
            if (!target) return;
            utils.addClass(target, 'htmx-request');
            // Disable inputs/buttons in scope (only if not already disabled)
            if (target.tagName === 'FORM') {
                target.querySelectorAll(this.config.disableSelector).forEach(i => {
                    if (!i.disabled) { i.disabled = true; i.setAttribute('data-disabled-by-loader', 'true'); }
                });
            }
            const parentForm = target.closest('form');
            if (parentForm) {
                parentForm.querySelectorAll(this.config.disableSelector).forEach(i => {
                    if (!i.disabled) { i.disabled = true; i.setAttribute('data-disabled-by-loader', 'true'); }
                });
            }
            // Button-mode: start spinner and map to target
            if (!this.isNoneMode(target) && this.shouldUseBtnLoader(target)) {
                const btn = this.getBtn(target);
                if (btn) {
                    this.buttonStart(btn);
                    this._btnByTarget.set(target, btn);
                }
            }
        },

        handleAfterRequest(evt) {
            const target = evt.detail?.elt;
            const xhr = evt.detail?.xhr;
            const hxRedirect = xhr?.getResponseHeader('HX-Redirect') || xhr?.getResponseHeader('Hx-Redirect') || xhr?.getResponseHeader('HX-Location') || xhr?.getResponseHeader('Hx-Location');
            const status = Number(xhr?.status || 0);
            const isHttpRedirect = status >= 300 && status < 400;
            if ((hxRedirect || isHttpRedirect) && !this.shouldUseBtnLoader(target) && !this.isNoneMode(target)) {
                document.documentElement.classList.add('hstles-redirecting');
                // lock loader on until navigation; avoid flicker by ensuring active state
                this._redirectPending = true;
                this._count = Math.max(1, this._count);
                document.documentElement.classList.add('hstles-loading');
                this.stick();
                // don't early-return; we still want to clean up button state below
            }
            // Linger behavior handled by HX-Redirect / 3xx above; no special-case URLs
            // Stop any active button spinner tied to this request
            this.stopButtonFromEventTarget(target);
            if (target) {
                utils.removeClass(target, 'htmx-request');
                this.enableElements(target);
            }
        },

        handleError(evt) {
            const target = evt.detail?.elt;
            this.stopButtonFromEventTarget(target);
            if (target) {
                utils.removeClass(target, 'htmx-request');
                this.enableElements(target);
            }
        },

        handleTimeout(evt) {
            const target = evt.detail?.elt;
            this.stopButtonFromEventTarget(target);
            if (target) {
                utils.removeClass(target, 'htmx-request');
                this.enableElements(target);
            }
        },

        handleBeforeSwap(evt) {
            const xhr = evt.detail?.xhr;
            const hxRedirect = xhr?.getResponseHeader('HX-Redirect') || xhr?.getResponseHeader('Hx-Redirect');
            if (hxRedirect && !this.shouldUseBtnLoader(evt.detail?.elt) && !this.isNoneMode(evt.detail?.elt)) {
                document.documentElement.classList.add('hstles-redirecting');
                this.stick();
            }
            // If element is being swapped, stop button loader to avoid leaks
            const target = evt.detail?.elt;
            this.stopButtonFromEventTarget(target);
        },

        // Helper: per-URL sessionStorage key
        getPageKey() {
            try {
                return `hstles:bf-reloaded:${location.pathname}${location.search}`;
            } catch {
                return 'hstles:bf-reloaded:default';
            }
        },

        // Helper: detect back/forward navigation or bfcache restore
        isBackForwardNavigation(evt) {
            if (evt && evt.persisted) return true;
            try {
                const entries = performance.getEntriesByType && performance.getEntriesByType('navigation');
                if (entries && entries[0] && entries[0].type === 'back_forward') return true;
            } catch { /* no-op */ }
            try {
                // Deprecated but still used in some browsers
                if (performance.navigation && performance.navigation.type === 2) return true;
            } catch { /* no-op */ }
            return false;
        },

        // Fully reset local loader/UI state without a hard reload
        softResetState() {
            this._sticky = false;
            this._navPending = false;
            this._redirectPending = false;
            this._count = 0;
            if (this._lingerTimer) {
                clearTimeout(this._lingerTimer);
                this._lingerTimer = null;
            }
            document.documentElement.classList.remove('hstles-loading');
            document.documentElement.classList.remove('hstles-redirecting');
            this.resetElements();
            // As an extra safety, re-enable any disabled controls globally
            try {
                document.querySelectorAll('input[disabled], button[disabled], select[disabled], textarea[disabled]')
                    .forEach(el => { el.disabled = false; el.removeAttribute('aria-busy'); el.inert = false; });
            } catch { /* no-op */ }
        },

        handlePageShow(evt) {
            // Always drop redirect state and fully reset UI when page is shown (no hard reload)
            document.documentElement.classList.remove('hstles-redirecting');
            this.forceDOMReset();
        },

        // Run multiple passes to defeat BFCache/paint timing quirks
        forceDOMReset() {
            this.softResetState();
            try { requestAnimationFrame(() => this.softResetState()); } catch { /* no-op */ }
            setTimeout(() => this.softResetState(), 0);
        },

        resetElements() {
            // remove lingering HTMX/loader classes and re-enable inputs/buttons (only those we disabled)
            const toClear = document.querySelectorAll('.htmx-request, .htmx-swapping, .is-loading, [data-loading="true"], [aria-busy="true"]');
            toClear.forEach(el => {
                el.classList.remove('htmx-request', 'htmx-swapping', 'is-loading');
                el.removeAttribute('data-loading');
                el.removeAttribute('aria-busy');
                if (el.tagName === 'FORM') {
                    el.querySelectorAll(this.config.disableSelector).forEach(i => {
                        if (i.hasAttribute('data-disabled-by-loader')) { i.disabled = false; i.removeAttribute('data-disabled-by-loader'); }
                        i.inert = false;
                    });
                }
                if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
                    if (el.hasAttribute('data-disabled-by-loader')) { el.disabled = false; el.removeAttribute('data-disabled-by-loader'); }
                    el.inert = false;
                }
                const form = el.closest && el.closest('form');
                if (form) form.querySelectorAll(this.config.disableSelector).forEach(i => {
                    if (i.hasAttribute('data-disabled-by-loader')) { i.disabled = false; i.removeAttribute('data-disabled-by-loader'); }
                    i.inert = false;
                });
            });
        },

        enableElements(target) {
            if (target.tagName === 'FORM') {
                target.querySelectorAll(this.config.disableSelector).forEach(i => {
                    if (i.hasAttribute('data-disabled-by-loader')) { i.disabled = false; i.removeAttribute('data-disabled-by-loader'); }
                });
            }
            if (target.tagName === 'BUTTON' && target.hasAttribute('data-disabled-by-loader')) {
                target.disabled = false;
                target.removeAttribute('data-disabled-by-loader');
            }
            const parentForm = target.closest('form');
            if (parentForm) parentForm.querySelectorAll(this.config.disableSelector).forEach(i => {
                if (i.hasAttribute('data-disabled-by-loader')) { i.disabled = false; i.removeAttribute('data-disabled-by-loader'); }
            });
        },

        // ---------- Button Loader helpers ----------
        isNoneMode(el) {
            const modeEl = el && (el.closest?.(`[${this.config.btnAttr}]`) || el);
            const val = modeEl?.getAttribute?.(this.config.btnAttr);
            return val === 'none';
        },
        shouldUseBtnLoader(el) {
            if (!el) return false;
            const override = el.closest?.(`[${this.config.btnAttr}]`);
            const overrideVal = override?.getAttribute?.(this.config.btnAttr);
            if (overrideVal === 'none') return false;
            if (overrideVal === 'page') return false;
            if (overrideVal === 'btn') return true;
            return !!el.closest?.(`.${this.config.btnClass}`);
        },
        getBtn(el) {
            if (!el) return null;
            if (el.tagName === 'BUTTON') return el;
            const btn = el.closest?.('button') || el.closest?.('.btn');
            return btn || null;
        },
        ensureBtnSpinner(btn) {
            if (!btn) return null;
            let spin = btn.querySelector?.(`.${this.config.spinnerClass}`);
            if (!spin) {
                spin = document.createElement(this.config.spinnerTag);
                spin.className = this.config.spinnerClass;
                if (this.config.insertSpinner === 'prepend') {
                    btn.prepend(spin);
                } else {
                    btn.appendChild(spin);
                }
            }
            return spin;
        },
        buttonStart(btn) {
            if (!btn) return;
            this.ensureBtnSpinner(btn);
            btn.setAttribute('aria-busy', 'true');
            if (!btn.disabled) { btn.disabled = true; btn.setAttribute('data-disabled-by-loader', 'true'); }
            btn.classList.add('is-loading');
            const label = btn.querySelector?.(`.${this.config.labelClass}`);
            if (label) {
                label.style.visibility = 'hidden';
            } else {
                if (!btn.hasAttribute('data-loader-original-color')) {
                    try { btn.setAttribute('data-loader-original-color', getComputedStyle(btn).color || ''); } catch { /* no-op */ }
                }
                btn.style.color = 'transparent';
            }
        },
        buttonEnd(btn) {
            if (!btn) return;
            btn.removeAttribute('aria-busy');
            if (btn.hasAttribute('data-disabled-by-loader')) {
                btn.disabled = false;
                btn.removeAttribute('data-disabled-by-loader');
            }
            btn.classList.remove('is-loading');
            const label = btn.querySelector?.(`.${this.config.labelClass}`);
            if (label) {
                label.style.visibility = '';
            } else if (btn.style && btn.style.color === 'transparent') {
                const orig = btn.getAttribute('data-loader-original-color') || '';
                btn.style.color = orig;
                btn.removeAttribute('data-loader-original-color');
            }
        },
        stopButtonFromEventTarget(target) {
            if (!target) return;
            const btn = this._btnByTarget.get(target);
            if (btn) {
                this.buttonEnd(btn);
                this._btnByTarget.delete(target);
            }
        },
        wrapButton(btn, promise) {
            this.buttonStart(btn);
            return Promise.resolve(promise).finally(() => this.buttonEnd(btn));
        },
        withOverlay(promise) {
            this.show();
            return Promise.resolve(promise).finally(() => this.hide());
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
