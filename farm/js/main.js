/**
 * Main.js - Main entry point that ties everything together
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the farm scene
    const farmScene = new FarmScene();
    
    // Initialize the model loader
    const modelLoader = new ModelLoader(farmScene.scene);
    
    // Initialize camera controls (passing empty models object to start)
    const controls = new CameraControls(farmScene.camera, {});
    
    // Define the animals to load
    const animals = [
        {
            modelId: 'chicken',
            modelType: 'chicken',
            modelPath: 'models/chicken.glb',
            position: { x: 0, y: 0, z: 0 },
            rotation: 0
        },
        {
            modelId: 'cow',
            modelType: 'cow',
            modelPath: 'models/cow.glb',
            position: { x: 2.5, y: 0, z: 1.5 },
            rotation: -Math.PI / 4 // Face slightly toward center
        },
        {
            modelId: 'pig',
            modelType: 'pig',
            modelPath: 'models/pig.glb',
            position: { x: -2.5, y: 0, z: 1.5 },
            rotation: Math.PI / 4 // Face slightly toward center
        }
    ];
    
    // Load all the animals
    animals.forEach(animal => modelLoader.loadModel(animal));
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update model animations
        modelLoader.update();
        
        // Update camera controls with the current models
        controls.update(modelLoader.models);
        
        // Render the scene
        farmScene.renderer.render(farmScene.scene, farmScene.camera);
    }
    
    // Start the animation loop
    animate();
});
