# Images Folder

This folder contains images for the portfolio website.

## How to Add Your Profile Picture:

1. **Add your profile image** to this folder (e.g., `profile.jpg`, `profile.png`)
2. **Recommended size**: 400x400px or larger (square aspect ratio)
3. **Supported formats**: JPG, PNG, WebP

## To Update the Profile Picture:

Open `about.html` and replace the placeholder section with:

```html
<!-- Replace this section: -->
<div class="profile-placeholder">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
</div>

<!-- With this: -->
<img src="images/profile.jpg" alt="Jesus Justin B. Mercado" class="profile-img">
```

## Folder Structure:
```
images/
├── profile.jpg          (Your profile picture)
├── projects/            (Project screenshots - optional)
└── README.md            (This file)
```
