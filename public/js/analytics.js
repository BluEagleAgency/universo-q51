// Vercel Web Analytics
// This script loads and initializes Vercel Analytics for tracking page views
(function() {
  // Inject Vercel Analytics script
  var script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cdn.vercel-insights.com/v1/script.js';
  
  // Append to document head
  var firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
})();
