# HSTLES Shared Assets

This repository contains shared frontend assets used across all HSTLES applications.

## 📁 Structure

```
shared-assets/
├── css/
│   ├── hstles-framework.css      # Main CSS framework (renamed from styles.css)
│   ├── loading-spinner.css       # Loading spinner animations
│   └── vendors/                  # Vendor CSS files
├── js/
│   ├── hstles-minimal.js         # Minimal UI components (lightweight replacement)
│   ├── hstles-essential.js       # Essential components bundle
│   ├── theme-manager.js          # Theme switching functionality
│   ├── htmx-loading.js          # HTMX loading state management
│   ├── jquery.min.js            # jQuery library
│   └── jquery.scrolly.min.js    # Custom scrolling library
├── media/
│   ├── brand/
│   │   ├── logos/               # SVG logos
│   │   └── favicons/            # Favicon files
│   ├── backgrounds/             # Background images
│   └── illustrations/           # UI illustrations
├── vendors/                     # Third-party vendor files
└── README.md
```

## 🔗 Usage

### Via jsDelivr CDN (Recommended)

```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/css/hstles-framework.css" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/css/loading-spinner.css" rel="stylesheet"/>

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/js/theme-manager.js"></script>
<script src="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/js/htmx-loading.js"></script>
<script src="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/js/hstles-minimal.js"></script>
<script src="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/js/jquery.min.js"></script>

<!-- Vendor Files -->
<link href="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/vendors/keenicons/styles.bundle.css" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@latest/vendors/apexcharts/apexcharts.css" rel="stylesheet"/>
```

### Via GitHub Pages

```html
<!-- Replace yourusername with HSTLES -->
<link href="https://hstles.github.io/shared-assets/css/hstles-framework.css" rel="stylesheet"/>
<script src="https://hstles.github.io/shared-assets/js/theme-manager.js"></script>
```

## 🚀 Applications Using These Assets

- **login.hstles.com** - Authentication service
- **account.hstles.com** - User account management
- **notify.hstles.com** - Notification service
- **identity.hstles.com** - Identity management

## 📝 Version Control

Use specific version tags for production environments:

```html
<!-- Pin to specific version -->
<link href="https://cdn.jsdelivr.net/gh/HSTLES/shared-assets@v1.0.0/css/hstles-framework.css" rel="stylesheet"/>
```

## 🔄 Updates

When updating shared assets:

1. Make changes to this repository
2. Create a new version tag
3. Update references in consuming applications
4. Test across all services

## 📞 Support

For issues with shared assets, please open an issue in this repository or contact the HSTLES development team.
