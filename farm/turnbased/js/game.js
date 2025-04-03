/**
 * Game.js - Main game controller that ties everything together
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize battle scene
    const battleScene = new BattleScene();
    
    // Initialize model loader
    const modelLoader = new BattleModelLoader(battleScene.scene);
    
    // Initialize camera controller
    const cameraController = new BattleCamera(battleScene.camera);
    
    // Initialize battle system
    const battleSystem = new BattleSystem(modelLoader, cameraController);
    
    // Character selection handling
    const characterSelect = document.getElementById('characterSelect');
    const characterOptions = document.querySelectorAll('.character-option');
    
    // Handle character selection with improved tracking
    characterOptions.forEach(option => {
        option.addEventListener('click', () => {
            const playerAnimal = option.getAttribute('data-animal');
            console.log("Character clicked:", playerAnimal);
            
            // Add selected class to track the chosen animal
            characterOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Store the selection in a data attribute on the parent - CRITICAL FOR COW SELECTION
            characterSelect.setAttribute('data-selected', playerAnimal);
            
            // Hide character selection
            characterSelect.style.display = 'none';
            
            // Choose a random enemy (different from player)
            const animals = ['chicken', 'cow', 'pig'];
            const availableEnemies = animals.filter(animal => animal !== playerAnimal);
            const enemyAnimal = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
            
            console.log("Player selected:", playerAnimal, "Enemy will be:", enemyAnimal);
            
            // Load player model with callback to track loading
            modelLoader.loadModel({
                modelId: 'player',
                modelType: playerAnimal,
                modelPath: `models/${playerAnimal}.glb`,
                position: battleScene.playerPosition,
                rotation: Math.PI / 6, // Slightly turned toward center
                onLoaded: (model) => {
                    console.log(`Player model (${playerAnimal}) loaded successfully`);
                    model.userData.animalType = playerAnimal; // Store animal type directly on the model
                    checkModelsAndStartBattle();
                }
            });
            
            // Load enemy model with callback to track loading
            modelLoader.loadModel({
                modelId: 'enemy',
                modelType: enemyAnimal,
                modelPath: `models/${enemyAnimal}.glb`,
                position: battleScene.enemyPosition,
                rotation: -Math.PI / 6, // Slightly turned toward center
                onLoaded: (model) => {
                    console.log(`Enemy model (${enemyAnimal}) loaded successfully`);
                    model.userData.animalType = enemyAnimal; // Store animal type directly on the model
                    checkModelsAndStartBattle();
                }
            });
        });
    });
    
    // Helper function to check if models are loaded and start battle
    function checkModelsAndStartBattle() {
        const playerModel = modelLoader.getModel('player');
        const enemyModel = modelLoader.getModel('enemy');
        
        if (playerModel && enemyModel) {
            console.log("Both models are now loaded, starting battle preparation");
            startBattleWhenReady();
        }
    }
    
    // Check if both models are loaded before starting the battle
    function startBattleWhenReady() {
        if (modelLoader.getModel('player') && modelLoader.getModel('enemy')) {
            // Hide loading text
            document.querySelector('.loading-text').style.display = 'none';
            
            console.log("Both models loaded, preparing battle...");
            
            // Get the selected animal type directly from the data attribute we set on the parent
            const playerAnimalType = characterSelect.getAttribute('data-selected') || 'chicken';
            console.log("Player animal from data attribute:", playerAnimalType);
            
            // Get a valid enemy type (different from player)
            const animals = ['chicken', 'cow', 'pig'];
            const availableEnemies = animals.filter(animal => animal !== playerAnimalType);
            const enemyAnimalType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
            console.log("Using enemy animal type:", enemyAnimalType);
            
            // Start battle with a short delay
            console.log("Starting battle after delay...");
            setTimeout(() => {
                try {
                    // Try starting the battle with explicit animal types
                    console.log("Starting battle NOW with:", playerAnimalType, "vs", enemyAnimalType);
                    battleSystem.startBattle(playerAnimalType, enemyAnimalType);
                } catch (error) {
                    // Log any errors that might occur
                    console.error("Error starting battle:", error);
                    
                    // Fallback to default animals if there was an error
                    console.log("Falling back to default battle");
                    battleSystem.startBattle('chicken', 'pig');
                }
            }, 500);
        } else {
            console.log("Models not yet loaded, waiting...");
            // Try again in a short while if models aren't loaded yet
            setTimeout(startBattleWhenReady, 500);
        }
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update camera
        cameraController.update();
        
        // Update model animations
        modelLoader.update();
        
        // Update battle system
        battleSystem.update();
        
        // Update any tweens
        if (window.TWEEN && TWEEN.update) {
            TWEEN.update();
        } else if (TWEEN._tweens && TWEEN._tweens.length > 0) {
            console.log(`Updating ${TWEEN._tweens.length} active tweens`);
            TWEEN.update();
        }
        
        // Render the scene
        battleScene.renderer.render(battleScene.scene, battleScene.camera);
    }
    
    // Start the animation loop
    animate();
});
