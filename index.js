// ===== STATE MANAGEMENT =====
const state = {
  gridSize: 16,
  mode: 'normal', // 'normal', 'rainbow', 'darken'
  isMouseDown: false,
  currentColor: '#000000',
};

// ===== DOM ELEMENTS =====
const grid = document.getElementById('drawing-grid');
const gridSizeBtn = document.getElementById('grid-size-btn');
const clearBtn = document.getElementById('clear-btn');
const rainbowBtn = document.getElementById('rainbow-btn');
const darkenBtn = document.getElementById('darken-btn');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  createGrid();
  setupEventListeners();
});

// ===== GRID FUNCTIONS =====
function createGrid() {
  // Clear existing grid
  grid.innerHTML = '';

  // Set CSS grid template
  grid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;

  // Create grid squares
  for (let i = 0; i < state.gridSize * state.gridSize; i++) {
    const square = document.createElement('div');
    square.classList.add('grid-square');
    square.dataset.darkness = '0'; // Initialize darkness level
    square.dataset.originalColor = '#ffffff'; // Initialize original color

    // Add event listeners
    square.addEventListener('mousedown', handleSquareInteraction);
    square.addEventListener('mouseover', handleSquareInteraction);
    square.addEventListener('touchmove', handleTouchInteraction, {
      passive: false,
    });

    grid.appendChild(square);
  }
}

// ===== EVENT HANDLERS =====
function setupEventListeners() {
  // Track mouse state for dragging
  document.addEventListener('mousedown', () => (state.isMouseDown = true));
  document.addEventListener('mouseup', () => (state.isMouseDown = false));

  // Control buttons
  gridSizeBtn.addEventListener('click', handleGridSizeChange);
  clearBtn.addEventListener('click', handleClearGrid);
  rainbowBtn.addEventListener('click', () => setMode('rainbow'));
  darkenBtn.addEventListener('click', () => setMode('darken'));
}

function handleSquareInteraction(e) {
  // Only color on mouse down or drag
  if (e.type === 'mouseover' && !state.isMouseDown) return;

  const square = e.target;

  switch (state.mode) {
    case 'normal':
      square.style.backgroundColor = state.currentColor;
      square.dataset.originalColor = state.currentColor;
      square.dataset.darkness = '0';
      break;

    case 'rainbow':
      const randomColor = getRandomColor();
      square.style.backgroundColor = randomColor;
      square.dataset.originalColor = randomColor;
      square.dataset.darkness = '0';
      break;

    case 'darken':
      darkenSquare(square);
      break;
  }
}

function handleTouchInteraction(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);

  if (element && element.classList.contains('grid-square')) {
    handleSquareInteraction({ target: element, type: 'mousedown' });
  }
}

// ===== BUTTON FUNCTIONS =====
function handleGridSizeChange() {
  const newSize = prompt('Enter new grid size (1-100):', state.gridSize);
  const parsedSize = parseInt(newSize);

  if (parsedSize >= 1 && parsedSize <= 100) {
    state.gridSize = parsedSize;
    createGrid();
  } else if (newSize !== null) {
    alert('Please enter a number between 1 and 100');
  }
}

function handleClearGrid() {
  const squares = document.querySelectorAll('.grid-square');
  squares.forEach((square) => {
    square.style.backgroundColor = '#ffffff';
    square.dataset.originalColor = '#ffffff';
    square.dataset.darkness = '0';
  });
}

// ===== MODE FUNCTIONS =====
function setMode(newMode) {
  state.mode = newMode;

  // Update active button styles
  [rainbowBtn, darkenBtn].forEach((btn) => {
    btn.style.transform = '';
    btn.style.boxShadow = '';
  });

  const activeBtn = newMode === 'rainbow' ? rainbowBtn : darkenBtn;
  activeBtn.style.transform = 'translateY(-2px)';
  activeBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
}

// ===== COLOR FUNCTIONS =====
function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function darkenSquare(square) {
  let darkness = parseInt(square.dataset.darkness);

  // Only darken up to 10 levels (fully black)
  if (darkness < 10) {
    darkness++;
    square.dataset.darkness = darkness;

    // Get the original color (either from dataset or current state)
    const originalColor =
      square.dataset.originalColor ||
      (state.mode === 'rainbow' ? getRandomColor() : state.currentColor);

    // Convert to HSL for darkening
    const hsl = hexToHSL(originalColor);

    // Reduce lightness progressively (more aggressive darkening)
    const newLightness = Math.max(0, hsl.l - darkness * 10);
    square.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${newLightness}%)`;

    // Store the original color if not already set
    if (!square.dataset.originalColor) {
      square.dataset.originalColor = originalColor;
    }
  }
}

function hexToHSL(hex) {
  // Handle HSL colors (from rainbow mode)
  if (hex.startsWith('hsl')) {
    const values = hex.match(/(\d+)/g);
    return {
      h: parseInt(values[0]),
      s: parseInt(values[1]),
      l: parseInt(values[2]),
    };
  }

  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[2], 16) / 255;
    b = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }

  // Then convert RGB to HSL
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
