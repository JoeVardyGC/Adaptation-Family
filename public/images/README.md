# Project Images Directory

Place your static images in this directory to serve them locally without relying on Cloudinary or external CDNs.

## Directory Structure

- `public/images/logo.png` (or `logo.jpg`): The Adaptation Family system logo.
- `public/images/team/`: Team member profile images.
  - e.g., `member1.jpg`, `member2.jpg`, `expert-1.png`, etc.

## How to use them in the app

Any file placed in `public/images/` is directly accessible in your code at `/images/...`:
- Logo: `/images/logo.png`
- Team image: `/images/team/member1.jpg`

In the Admin Dashboard (`Team Settings`), when adding or editing a team member, you can enter the path directly (e.g., `/images/team/member1.jpg`) or upload a file directly through the admin panel.
