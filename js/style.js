

const html = document.querySelector('html');
html.dataset.theme = 'theme-light';

function setColorScheme(settheme) {
    //alert(colorScheme);
    html.dataset.theme = 'theme-'+settheme;

    // Save the theme preference for 10 years.
    var endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 10);
    document.cookie = 'theme='+ settheme +'; Expires=' + endDate + ';'
}

function isDarkThemeSelected() {
  return document.cookie.match(/theme=dark/i) != null
}


var colorScheme = isDarkThemeSelected() ? 'dark' : 'light';

if( colorScheme == '' ){

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    colorScheme = event.matches ? "dark" : "light";
    setColorScheme( colorScheme );
  });

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    colorScheme = "dark"; // dark mode
  } else {
    colorScheme = "light";
  }

}else{

  setColorScheme( colorScheme );

}

setColorScheme( colorScheme );

/*
<button onclick="setColorScheme('light')">Light</button>
<button onclick="setColorScheme('dark')">Dark</button>
*/
