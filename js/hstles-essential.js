/*!
 * HSTLES Essential Components Bundle
 * Minimal JavaScript bundle for HSTLES applications
 * Contains only the essential UI components needed
 */

// Essential DOM utilities
(function() {
    'use strict';
    
    // Minimal KTDom utility for basic DOM operations
    window.KTDom = {
        ready: function(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        },
        
        getElement: function(selector) {
            if (typeof selector === 'string') {
                return document.querySelector(selector);
            }
            return selector;
        },
        
        addClass: function(element, className) {
            if (element && element.classList) {
                element.classList.add(className);
            }
        },
        
        removeClass: function(element, className) {
            if (element && element.classList) {
                element.classList.remove(className);
            }
        },
        
        hasClass: function(element, className) {
            return element && element.classList && element.classList.contains(className);
        }
    };

    // Basic theme management (minimal version)
    window.KTTheme = {
        init: function() {
            // Basic theme initialization if needed
        }
    };

    // Initialize components when DOM is ready
    KTDom.ready(function() {
        // Initialize any essential components here
        console.log('HSTLES Essential Components initialized');
    });

})();
