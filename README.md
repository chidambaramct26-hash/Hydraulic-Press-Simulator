# Hydraulic Press Simulator 🔧

A modern, interactive web-based simulator for experimenting with **Pascal's Law** and hydraulic systems. Built with vanilla HTML, CSS, and JavaScript.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Overview

This simulator provides a visual and mathematical demonstration of how force multiplication works in a hydraulic press. Users can interact with input forces and piston areas to see real-time changes in pressure and output force, accompanied by a dynamic SVG visualization.

## ✨ Features

-   **Interactive Controls**: Adjust Input Force ($F_1$), Input Area ($A_1$), and Output Area ($A_2$) via sliders.
-   **Real-time Physics**: Instant calculation of Pressure ($P$) and Output Force ($F_2$).
-   **Visual Simulation**: SVG-based animation of pistons moving in response to pressure.
-   **Crush Mechanic**: Apply enough force to crush objects placed on the output piston!
-   **Realistic Mode**: Toggle fluid damping for a slower, more realistic simulation speed.
-   **Responsive Design**: Modern glassmorphism UI that adapts to desktop and mobile screens.

## 🚀 How to Run

No installation or server is required.

1.  Clone or download this repository.
2.  Open the `index.html` file in any modern web browser (Chrome, Firefox, Edge, Safari).

## 🧮 Physics Behind It

The simulator is based on **Pascal's Law**, which states that a pressure change occurring anywhere in a confined incompressible fluid is transmitted throughout the fluid such that the same change occurs everywhere.

**Formulas Used:**

1.  **Pressure ($P$)**:
    $$P = \frac{F_1}{A_1}$$
    Where $F_1$ is the input force and $A_1$ is the input piston area.

2.  **Output Force ($F_2$)**:
    $$F_2 = P \times A_2$$
    Where $A_2$ is the output piston area.

3.  **Mechanical Advantage ($MA$)**:
    $$MA = \frac{A_2}{A_1}$$

## 🛠️ Technologies

-   **HTML5**: Structure and semantics.
-   **CSS3**: Custom properties (variables), Flexbox/Grid layout, and Glassmorphism effects.
-   **JavaScript (ES6+)**: Core simulation logic, physics calculations, and `requestAnimationFrame` animation loop.

## 🎨 Theme

-   **UI Accent**: Industrial Amber (#f59e0b)
-   **Fluid Color**: Hydraulic Blue (#3b82f6)
-   **Background**: Neutral Dark Zinc

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
