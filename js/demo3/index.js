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

const DIRECTIONS = ['pos-north', 'pos-south', 'pos-west', 'pos-east'];

// Selecting DOM elements
const gridElement = document.querySelector('.grid');
const gridItems = Array.from(gridElement.querySelectorAll('.grid__item')); // Convert NodeList to Array
const gridImages = gridElement.querySelectorAll('.grid__img');
const fullscreenElement = document.querySelector('.fullscreen');

// Flag to track fullscreen mode
let isFullscreen = false;

// Animation defaults
const animationDefaults = { duration: 0.6, ease: 'expo' };

// Function to flip the clicked image and animate its movement
const flipImage = (gridItem, gridImage) => {
  gsap.set(gridItem, { zIndex: 99 });
  const state = Flip.getState(gridImage);
  if (isFullscreen) {
    gridItem.appendChild(gridImage);
  } else {
    fullscreenElement.appendChild(gridImage);
  }

  Flip.from(state, {
    ...animationDefaults,
    scale: true,
    prune: true,
    onComplete: () => {
      if (isFullscreen) {
        gsap.set(gridItem, { zIndex: 'auto' });
      }
      isFullscreen = !isFullscreen;
    }
  });
};

// Function to determine the direction class from data attribute
const determineDirectionClassFromData = (gridItem) => {
  const direction = gridItem.dataset.directionItems;
  switch (direction) {
    case 'north':
      return POSITION_CLASSES.NORTH;
    case 'south':
      return POSITION_CLASSES.SOUTH;
    case 'west':
      return POSITION_CLASSES.WEST;
    case 'east':
      return POSITION_CLASSES.EAST;
    default:
      // If no valid direction is specified, use a random direction
      return determineRandomDirectionClass();
  }
};

// Function to determine a random direction class
const determineRandomDirectionClass = () => {
  const randomIndex = Math.floor(Math.random() * DIRECTIONS.length);
  return DIRECTIONS[randomIndex];
};

// Function to move other items based on their position relative to the clicked item
const moveOtherItems = (gridItem, directionClass) => {
  // For the remaining images
  const otherGridItems = gridItems.filter(item => item !== gridItem);
  const state = Flip.getState(otherGridItems);

  otherGridItems.forEach(item => {
    if (directionClass) {
      item.classList.toggle(directionClass, !isFullscreen);
      //gsap.set(item, {scale: isFullscreen ? 1 : 0.8});
    }
  });

  Flip.from(state, {
    ...animationDefaults,
    scale: true,
    prune: true,
    /*
    stagger: {
      each: 0.01,
      from: 'random'
    }
    */
  });
};

// Click event handler for the grid images
const toggleImage = (ev) => {
  const gridImage = ev.target;
  const gridItem = gridItems[gridImage.dataset.index];
  flipImage(gridItem, gridImage);
  const directionClass = determineDirectionClassFromData(gridItem);
  moveOtherItems(gridItem, directionClass);
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
