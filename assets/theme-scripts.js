document.addEventListener('shopify:section:load', () => {
  const themeScripts = document.querySelectorAll('[data-theme-script]');
  themeScripts.forEach((themeScript) => {
    const tempScript = document.createElement('script');
    tempScript.src = themeScript.src;
    themeScript.parentNode.replaceChild(tempScript, themeScript);
  });
});
