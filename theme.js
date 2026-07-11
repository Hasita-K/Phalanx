const themeToggleBtn = document.getElementById('theme-toggle');

themeToggleBtn.addEventListener('click', () => {
    // Toggle the dark-theme class on the body element
    document.body.classList.toggle('dark-theme');

    // Update the button text depending on which theme is active
    if (document.body.classList.contains('dark-theme')) {
        themeToggleBtn.textContent = 'Light Mode';
    } else {
        themeToggleBtn.textContent = 'Dark Mode';
    }
});