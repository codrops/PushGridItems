// Importing utility function for preloading images
import { preloadImages } from '../utils.js';

// Registering Flip plugin
gsap.registerPlugin(Flip);

// Constants for class names
const POSITION_CLASSES = {
  NORTH: 'pos-north',
  SOUTH: 'pos-south',
  WEST: 'pos-west',
  EAST: 'pos-east',
};

// Selecting DOM elements
const gridElement = document.querySelector('.grid');
const gridItems = Array.from(gridElement.querySelectorAll('.grid__item')); // Convert NodeList to Array
const gridImages = gridElement.querySelectorAll('.grid__img');
const fullscreenElement = document.querySelector('.fullscreen');

// Flag to track fullscreen mode
let isFullscreen = false;

// Animation defaults
const animationDefaults = { duration: 1, ease: 'expo.inOut' };

// Function to flip the clicked image and animate its movement
const flipImage = (gridItem, gridImage) => {
  gsap.set(gridItem, { zIndex: 99 });
  const state = Flip.getState(gridImage, { props: 'borderRadius' });
  if (isFullscreen) {
    gridItem.appendChild(gridImage);
  } else {
    fullscreenElement.appendChild(gridImage);
  }

  Flip.from(state, {
    ...animationDefaults,
    absolute: true,
    prune: true,
    onComplete: () => {
      if (isFullscreen) {
        gsap.set(gridItem, { zIndex: 'auto' });
      }
      isFullscreen = !isFullscreen;
    }
  });
};

// Function to determine the position class based on the item and clicked item positions
const determinePositionClass = (itemRect, clickedRect) => {
  if (itemRect.bottom < clickedRect.top) {
    return POSITION_CLASSES.NORTH;
  } else if (itemRect.top > clickedRect.bottom) {
    return POSITION_CLASSES.SOUTH;
  } else if (itemRect.right < clickedRect.left) {
    return POSITION_CLASSES.WEST;
  } else if (itemRect.left > clickedRect.right) {
    return POSITION_CLASSES.EAST;
  }
  return '';
};

// Function to move other items based on their position relative to the clicked item
const moveOtherItems = (gridItem, gridImage) => {
  const clickedRect = gridItem.getBoundingClientRect();

  // For the remaining images
  const otherGridItems = gridItems.filter(item => item !== gridItem);
  const state = Flip.getState(otherGridItems);

  otherGridItems.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const classname = determinePositionClass(itemRect, clickedRect);
    if (classname) {
      item.classList.toggle(classname, !isFullscreen);
      gsap.set(item, {
        rotation: isFullscreen ? 0 : gsap.utils.random(-50,50)
      });
    }
  });

  Flip.from(state, {
    ...animationDefaults,
    scale: true,
    prune: true
  });
};

// Click event handler for the grid images
const toggleImage = (ev) => {
  const gridImage = ev.target;
  const gridItem = gridItems[gridImage.dataset.index];
  flipImage(gridItem, gridImage);
  moveOtherItems(gridItem, gridImage);
};

// Function to initialize event listeners for grid images
const initEvents = () => {
  gridImages.forEach((gridImage, position) => {
    // Save the index of the image
    gridImage.dataset.index = position;
    // Add click event listener to the image
    gridImage.addEventListener('click', toggleImage);
  });
};

// Preloading images and initializing setup when complete
preloadImages('.grid__img').then(() => {
  // Remove the loading class from the body
  document.body.classList.remove('loading');
  // Initialize event listeners
  initEvents();
});
