const darkModeButton = document.getElementById('theme-dark') as HTMLButtonElement;
const lightModeButton = document.getElementById('theme-light') as HTMLButtonElement;

function updateTheme(theme: 'dark' | 'light') {
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    return;
  }

  document.body.classList.remove('light-theme');
  document.body.classList.add('dark-theme');
}

// Get the user's theme preference from local storage, if it's available
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  updateTheme('dark');
} else if (currentTheme === 'light') {
  updateTheme('light');
} else {
  // If user does not have any preferences, match it to system preferences
  if (window.matchMedia) {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    updateTheme(theme);

    // Set listener to track changes of system preferences
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      const theme = event.matches ? 'dark' : 'light';
      updateTheme(theme);
    });
  } else {
    // If feature is not available, use dark theme as a default
    document.body.classList.toggle('dark-theme');
  }
}

darkModeButton.addEventListener('mousedown', () => {
  updateTheme('dark');
  localStorage.setItem('theme', 'dark');
});

lightModeButton.addEventListener('mousedown', () => {
  updateTheme('light');
  localStorage.setItem('theme', 'light');
});
