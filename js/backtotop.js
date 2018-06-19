/**
 * When the user scrolls down from the top of the document
 * show back to top button.
 */
window.onscroll = () => {

  if (document.URL.endsWith('/')) {
    let btn = document.getElementById("back_to_top");
    btn.style.display = (document.documentElement.scrollTop > 50) ? "block" : "none";
  } else {
    let btn = document.getElementById("back_to_top");
    btn.style.display = (document.documentElement.scrollTop > 50) ? "block" : "none";
    
    let map_container = document.getElementById('map-container');
    // Set the map container on restaurant detail page
    if (document.documentElement.scrollTop > 50) {
      map_container.style.top = '120px';
    }
  
    // Show breadcrumb at the top
    let breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.style.position = 'fixed';
    breadcrumb.style.top = '0';
    breadcrumb.style.width = '100%';
    breadcrumb.style.zIndex = '1000';
    
    // Shift breadcrumb back to its original state
    if (document.documentElement.scrollTop === 0) {
      breadcrumb.style.position = 'relative';
      map_container.style.top = '120px';
    }
  }
};


/**
  * When the user clicks on the button
  * scroll to the top of the document.
  */
backToTop = () => {
  document.documentElement.scrollTop = 0;
  document.querySelectorAll('a')[0].focus();
};