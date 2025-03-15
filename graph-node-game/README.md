# Graph Node Game

## Overview
The Graph Node Game is an interactive web-based game where players navigate through a randomly generated graph. The objective is to find the shortest path from the source node to the target node while minimizing the total cost of the edges traversed.

## Features
- Randomly generated graph with nodes and edges
- Each edge has an associated cost displayed on the connection
- Draggable nodes for better visualization
- Target node is always the furthest node from the source
- Optional timer that can be paused/resumed
- Players can build a path by selecting connected nodes
- Visual feedback on selected path and costs
- Simple and clean user interface

## Project Structure
```
graph-node-game
├── index.html        # Main HTML document for the game
├── css
│   └── styles.css    # Styles for the game
├── js
│   ├── game.js       # Main game logic
│   ├── graph.js      # Graph structure and functions
│   └── ui.js         # User interface management
├── assets
│   └── favicon.svg    # Favicon for the game
└── README.md         # Documentation for the project
```

## Getting Started
To run the game locally, follow these steps:

1. Clone the repository or download the project files.
2. Open `index.html` in a web browser.
3. The game will load, and the timer will start automatically.
4. Follow the on-screen instructions to connect nodes and find the best path.

## Technologies Used
- HTML
- CSS
- JavaScript

## License
This project is open-source and available for modification and distribution. Enjoy playing and feel free to contribute!