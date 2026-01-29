/**
 * HYDRAULIC PRESS SIMULATOR
 */

// --- Configuration & Constants ---
const CONFIG = {
    crushThreshold: 5000, // Newtons required to crush
    maxStroke: 200,       // Max pixel movement for simulation scaling
    fluidBaseColor: '#3b82f6',
    fluidHighPressure: '#2563eb', // Shift to brighter blue at high pressure
};

// --- State Management ---
const state = {
    f1: 200,      // Input Force (N)
    a1: 5,        // Input Area (cm2)
    a2: 100,      // Output Area (cm2)

    // Computed
    pressure: 0,  // kPa
    f2: 0,        // Output Force (N)

    // Animation State
    targetInputPos: 0, // 0 to 1 (normalized stroke)
    currentInputPos: 0,

    isCrushed: false,
    realisticMode: false,

    // Pump logic
    isPumping: false,
    pumpInterval: null
};

// --- DOM Elements ---
const ui = {
    sliders: {
        f1: document.getElementById('f1-slider'),
        a1: document.getElementById('a1-slider'),
        a2: document.getElementById('a2-slider'),
    },
    labels: {
        f1: document.getElementById('f1-val'),
        a1: document.getElementById('a1-val'),
        a2: document.getElementById('a2-val'),
    },
    math: {
        f1: document.getElementById('math-f1'),
        ratio: document.getElementById('math-ratio'),
        p: document.getElementById('math-p'),
        f2: document.getElementById('math-f2'),
    },
    gauge: document.getElementById('gauge-display'),
    warning: document.getElementById('warning-msg'),

    // Visuals
    pistonLeft: document.getElementById('piston-left'),
    fluidLeft: document.getElementById('fluid-left'),

    pistonRight: document.getElementById('piston-right'),
    fluidRight: document.getElementById('fluid-right'),

    objectGroup: document.getElementById('crush-object-group'),
    objectRect: document.getElementById('crush-object'),
    cracks: document.getElementById('cracks'),
    crushMsg: document.getElementById('crush-msg'),

    // Cylinders SVG
    cylRightBody: document.getElementById('cyl-right-body'),
    pistonRightHead: document.getElementById('piston-right-head')
};

// --- initialization ---
function init() {
    // Attach Listeners
    ui.sliders.f1.addEventListener('input', handleInput);
    ui.sliders.a1.addEventListener('input', handleInput);
    ui.sliders.a2.addEventListener('input', handleInput);

    document.getElementById('realistic-toggle').addEventListener('change', (e) => {
        state.realisticMode = e.target.checked;
    });

    document.getElementById('btn-reset').addEventListener('click', resetAll);

    const btnPump = document.getElementById('btn-pump');
    btnPump.addEventListener('mousedown', startPump);
    btnPump.addEventListener('mouseup', stopPump);
    btnPump.addEventListener('mouseleave', stopPump);
    // Touch support
    btnPump.addEventListener('touchstart', (e) => { e.preventDefault(); startPump(); });
    btnPump.addEventListener('touchend', stopPump);

    document.getElementById('btn-release').addEventListener('click', () => {
        // Animate F1 back to 0
        const releaseInterval = setInterval(() => {
            if (state.f1 > 0) {
                state.f1 = Math.max(0, state.f1 - 10);
                ui.sliders.f1.value = state.f1;
                handleInput();
            } else {
                clearInterval(releaseInterval);
            }
        }, 20);
    });

    // Initial Calc
    updatePhysics();

    // Start Animation Loop
    requestAnimationFrame(animate);
}

// --- Core Logic ---

function handleInput() {
    // Update state from DOM
    state.f1 = parseFloat(ui.sliders.f1.value);
    state.a1 = parseFloat(ui.sliders.a1.value);
    state.a2 = parseFloat(ui.sliders.a2.value);

    updatePhysics();
}

function updatePhysics() {
    // Pascal's Law: P = F1 / A1
    // Units: N / cm^2 -> to get kPa (kN/m^2), we need conversion.
    // 1 N/cm^2 = 10,000 N/m^2 = 10 kPa.

    const pressure_N_cm2 = state.f1 / state.a1;
    state.pressure = pressure_N_cm2 * 10; // in kPa

    // F2 = P * A2 = (F1/A1) * A2
    const forceOutput = pressure_N_cm2 * state.a2;
    state.f2 = forceOutput;

    updateUI();
}

function updateUI() {
    // Label Updates
    ui.labels.f1.innerText = `${state.f1} N`;
    ui.labels.a1.innerText = `${state.a1} cm²`;
    ui.labels.a2.innerText = `${state.a2} cm²`;

    // Math Panel
    ui.math.f1.innerText = `${state.f1.toFixed(0)} N`;
    const ratio = state.a2 / state.a1;
    ui.math.ratio.innerText = `${ratio.toFixed(2)} x`;
    ui.math.p.innerHTML = `${state.pressure.toFixed(1)} <span class="unit">kPa</span>`;
    ui.math.f2.innerText = `${state.f2.toFixed(0)} N`;

    ui.gauge.innerText = `${state.pressure.toFixed(0)} kPa`;

    // Warning
    if (state.a1 >= state.a2) {
        ui.warning.style.opacity = 1;
    } else {
        ui.warning.style.opacity = 0;
    }

    // Visual Scaling of Cylinder Widths (Simple representation)
    // Left cylinder constant, Right cylinder width scales with A2 approx?
    // For simplicity in SVG, we keep cylinder widths fixed or slightly adjusted?
    // Let's just adjust the target simulation stroke.
}

// --- Pump Handling ---
function startPump() {
    if (state.isPumping) return;
    state.isPumping = true;

    state.pumpInterval = setInterval(() => {
        if (state.f1 < 500) {
            state.f1 = Math.min(500, state.f1 + 5);
            ui.sliders.f1.value = state.f1;
            updatePhysics();
        }
    }, 50); // Fast update
}

function stopPump() {
    state.isPumping = false;
    clearInterval(state.pumpInterval);
}

function resetAll() {
    state.f1 = 200;
    state.a1 = 5;
    state.a2 = 100;
    state.isCrushed = false;

    ui.sliders.f1.value = 200;
    ui.sliders.a1.value = 5;
    ui.sliders.a2.value = 100;

    // Reset object visual
    if (ui.objectRect) ui.objectRect.style.transform = `scaleY(1)`;
    if (ui.cracks) ui.cracks.style.opacity = 0;
    if (ui.crushMsg) ui.crushMsg.classList.remove('visible');

    updatePhysics();
}

// --- Animation Loop ---
function animate() {
    // Determine Target Positions
    // We map Input Force (0-500) to Piston Travel (0-1)
    // But realistically, travel depends on volume moved. 
    // For the demo visual:
    // Input Piston goes DOWN as Force Increases (compressing).
    // Output Piston goes UP.

    const maxInputForce = 500;
    const targetNorm = state.f1 / maxInputForce; // 0.0 to 1.0

    // Smoothly interpolate currentInputPos to targetNorm
    const speed = state.realisticMode ? 0.02 : 0.1;
    const diff = targetNorm - state.currentInputPos;

    if (Math.abs(diff) > 0.001) {
        state.currentInputPos += diff * speed;
    } else {
        state.currentInputPos = targetNorm;
    }

    // --- Render SVG Positions ---

    // Left Piston (Input) - Moves Down
    // range: y=0 (start) to y=100 (compressed)
    const inputTravelPixels = 100;
    const yLeft = state.currentInputPos * inputTravelPixels;

    ui.pistonLeft.setAttribute('transform', `translate(5, ${100 + yLeft})`);
    ui.fluidLeft.setAttribute('y', 100 + yLeft);
    ui.fluidLeft.setAttribute('height', 150 - yLeft);

    // Right Piston (Output) - Moves Up
    // Distance depends on Area Ratio (Vol input = Vol output)
    // A1 * d1 = A2 * d2  => d2 = d1 * (A1/A2)
    // But visually if d2 is too small it looks boring. 
    // We'll clamp visual d2 to look good but somewhat proportional.

    const d1_real_cm = state.currentInputPos * 20; // assume 20cm stroke
    const d2_real_cm = d1_real_cm * (state.a1 / state.a2);

    // For visual simulation, let's map d2 relative to max possible stroke
    // but ensuring it doesn't leave the cylinder.
    // Max right cylinder stroke available ~100px.

    // Let's use a "Visually Exaggerated" ratio for better UX unless in realistic mode?
    // Actually, showing the real tiny movement for massive A2 is educational.
    // Let's stick to true ratio but scaled up pixels.

    // Pixel scale factors
    const scaleFactor = 5; // 1cm = 5px
    const d2_px = d2_real_cm * scaleFactor * (800 / state.a2); // Artificial modifier to ensure movement is visible for demo

    // Let's simple use the inverse ratio logic for the visual normalized stroke
    // If Area2 is huge, movement is small.
    // visualStrokeRight = visualStrokeLeft * (A1/A2) * visualScaler
    const visualScaler = 5.0;
    let yRightMove = yLeft * (state.a1 / state.a2) * visualScaler;

    // Cap movement to top ceiling collision
    // Right piston starts at y=150. Ceiling is at y=-50 relative to group?
    // Actually in SVG:
    // Piston Group Translate: (550, 150).
    // Object Group Translate: (0, 50) inside Piston Group. Object top is at -40.
    // Ceiling is at -50 relative to Piston Group origin? No, Ceiling is global.
    // Let's check coordinates.
    // Right Cylinder Group is at (550, 150).
    // Ceiling is drawn inside Right Cyl Group at y=-50.
    // Initial Piston Group is at y=150 (relative to nothing, it is inside right cyl group).
    // actually <g id="piston-right" transform="translate(-95, 150)">
    // So Piston is at 150 local.
    // Ceiling is at -50 local. Dist = 200px initially?
    // Wait, piston head is at y=-20 relative to piston group.
    // So Piston Top is at 150 + (-20) = 130 local y.
    // Ceiling bottom is at -50 + 20 = -30?
    // Gap = 130 - (-30) = 160px.

    // Object is on Piston.
    // Object height 80.

    // So max upward travel is when Object Top hits Ceiling.
    // Piston moves UP (negative Y translation of the group? No, we change transform).

    // Let's animate the `transform` of `piston-right`.
    // Initial Y is 150.
    // New Y = 150 - yRightMove.

    // Collision Detection
    // Gap Calculation:
    // Ceiling bottom y = -50 + height(20) = -30.
    // Piston Platform y(initial) = 150 + (-150 for platform) ?? 
    // Let's look at SVG structure for right piston:
    // <g id="piston-right" ...>
    //   <rect y="-150" height="10" ... /> // Platform
    // Object on platform y=50 relative to piston group? No.
    // <g id="crush-object-group" transform="translate(0, 50)"> ... rect y=0
    // This structure is a bit messy. Let's rely on relative move.

    // Simplified:
    // Piston Start Y = 150.
    // Object Top Edge relative to Piston Center = -150 (platform) - 80 (object)? 
    // Let's align visually.
    // Platform is at y=-150 relative to group origin.
    // Object is at translate(0, 50) relative to group ?? 

    // Let's simplify the visual logic for reliability.
    // Piston & Object move UP by `yRightMove`.
    // Current Abs Y = Initial(150) - move.
    // Collision occurs if move > limit.
    // Let's say Limit is 130px.

    const maxTravel = 130;
    const actualMove = Math.min(yRightMove, maxTravel);

    ui.pistonRight.setAttribute('transform', `translate(-95, ${150 - actualMove})`);
    ui.fluidRight.setAttribute('y', 150 - actualMove);
    ui.fluidRight.setAttribute('height', 100 + actualMove);

    // Check Crush
    // Contact is made when actualMove is near maxTravel
    const contactMade = actualMove > (maxTravel - 5);

    if (contactMade && state.f2 > CONFIG.crushThreshold && !state.isCrushed) {
        crushObject();
    } else if (!contactMade && state.isCrushed) {
        // Reset if pressure released significantly?
        // Usually we keep crushed until reset.
    }

    // If crushed, flatten the object based on force/overdrive
    if (state.isCrushed) {
        // Scale Y down
        if (ui.objectRect) ui.objectRect.style.transform = `scaleY(0.4)`;
        if (ui.cracks) ui.cracks.style.opacity = 1;
        if (ui.crushMsg) ui.crushMsg.classList.add('visible');
    }

    requestAnimationFrame(animate);
}

function crushObject() {
    state.isCrushed = true;
    // logic is handled in render loop for continuous state
}

// Start
document.addEventListener('DOMContentLoaded', init); // Ensure DOM is ready
