/* Moved to archive/assets-js/main.js on 2025-09-17 */

// Placeholder file left intentionally in Phase 1 to avoid build errors.
// The active source was archived to `archive/assets-js/` on 2025-09-17.

document.addEventListener('DOMContentLoaded', () => {
            const userMenuBtn = document.getElementById('user-menu-btn');
            const userMenuDropdown = document.getElementById('user-menu-dropdown');

            // Function to toggle the menu's visibility
            function toggleMenu() {
                userMenuDropdown.classList.toggle('is-active');
            }

            // Event listener to open/close the menu when the button is clicked
            userMenuBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevents the link from navigating
                e.stopPropagation(); // Prevents the click from bubbling up to the document
                toggleMenu();
            });

            // Event listener to close the menu when clicking anywhere else on the page
            document.addEventListener('click', (e) => {
                if (!userMenuDropdown.contains(e.target) && e.target !== userMenuBtn) {
                    userMenuDropdown.classList.remove('is-active');
                }
            });
        });