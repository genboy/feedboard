

const html = document.querySelector('html');
html.dataset.theme = 'theme-light';
var colorScheme = '';

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
function isLightThemeSelected() {
  return document.cookie.match(/theme=light/i) != null
}

function toggleDarkLightTheme(){
  if( colorScheme == 'dark' ){
    colorScheme = 'light';
  }else{
    colorScheme = 'dark';
  }
  setColorScheme( colorScheme );
}


if( isDarkThemeSelected() ){
  colorScheme = 'dark';
}else if( isLightThemeSelected() ){
  colorScheme = 'light';
}

if( colorScheme == '' ){

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    colorScheme = event.matches ? "dark" : "light";
  });

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    colorScheme = "dark"; // dark mode
  } else {
    colorScheme = "light";
  } 

}

setColorScheme( colorScheme );
