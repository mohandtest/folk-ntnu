/**
 * ModelLoader.js - Handles loading and positioning of 3D models
 */

class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.models = {};
        this.mixers = [];
        this.clock = new THREE.Clock();
    }
    
    // Load a model with specified parameters
    loadModel(params) {
        const {
            modelId,          // Unique ID for this model
            modelType,        // Type identifier (chicken, cow, pig, etc.)
            modelPath,        // Path to the GLB file
            position,         // Position vector {x, y, z}
            rotation,         // Rotation in radians around Y axis
            scale = 1,        // Uniform scale factor
            onLoaded = null   // Callback when model is loaded
        } = params;
        
        try {
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelPath,
                (gltf) => {
                    const model = gltf.scene;
                    
                    // Add shadows to all meshes
                    model.traverse((node) => {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    });
                    
                    // Calculate bounding box to properly position the model
                    const bbox = new THREE.Box3().setFromObject(model);
                    
                    // Set position, with y adjustment to place on ground
                    model.position.x = position.x || 0;
                    model.position.z = position.z || 0;
                    model.position.y = Math.abs(bbox.min.y);
                    
                    // Set rotation
                    if (rotation !== undefined) {
                        model.rotation.y = rotation;
                    }
                    
                    // Set scale
                    if (scale !== 1) {
                        model.scale.set(scale, scale, scale);
                    }
                    
                    // Add to scene and store reference
                    this.scene.add(model);
                    this.models[modelId] = model;
                    
                    // Handle animations if present
                    if (gltf.animations && gltf.animations.length) {
                        const mixer = new THREE.AnimationMixer(model);
                        const action = mixer.clipAction(gltf.animations[0]);
                        action.play();
                        
                        this.mixers.push(mixer);
                    }
                    
                    // Call the onLoaded callback if provided
                    if (onLoaded) onLoaded(model);
                    
                    // Hide loading text if all models are loaded
                    this.checkAllModelsLoaded();
                },
                (xhr) => {
                    // Progress indicator
                    console.log(`Loading ${modelType}: ${Math.floor(xhr.loaded / xhr.total * 100)}%`);
                },
                (error) => {
                    console.error(`Error loading ${modelType} model:`, error);
                    
                    // Create a fallback model
                    const fallbackModel = SimpleModelFactory.getModel(modelType);
                    
                    // Position the fallback model
                    fallbackModel.position.set(
                        position.x || 0,
                        position.y || 0,
                        position.z || 0
                    );
                    
                    if (rotation !== undefined) {
                        fallbackModel.rotation.y = rotation;
                    }
                    
                    // Add to scene and store reference
                    this.scene.add(fallbackModel);
                    this.models[modelId] = fallbackModel;
                    
                    // Call the onLoaded callback if provided
                    if (onLoaded) onLoaded(fallbackModel);
                    
                    // Hide loading text if all models are loaded
                    this.checkAllModelsLoaded();
                }
            );
        } catch (e) {
            console.error(`Error initializing ${modelType} loader:`, e);
            
            // Create a fallback model
            const fallbackModel = SimpleModelFactory.getModel(modelType);
            
            // Position the fallback model
            fallbackModel.position.set(
                position.x || 0,
                position.y || 0,
                position.z || 0
            );
            
            if (rotation !== undefined) {
                fallbackModel.rotation.y = rotation;
            }
            
            // Add to scene and store reference
            this.scene.add(fallbackModel);
            this.models[modelId] = fallbackModel;
            
            // Call the onLoaded callback if provided
            if (onLoaded) onLoaded(fallbackModel);
            
            // Hide loading text if all models are loaded
            this.checkAllModelsLoaded();
        }
    }
    
    checkAllModelsLoaded() {
        // If we've loaded all expected models, hide the loading text
        const loadingText = document.querySelector('.loading-text');
        if (loadingText && Object.keys(this.models).length >= 3) { // Expecting at least 3 models
            loadingText.style.display = 'none';
        }
    }
    
    // Get a loaded model by ID
    getModel(modelId) {
        return this.models[modelId];
    }
    
    // Update animations
    update() {
        const delta = this.clock.getDelta();
        this.mixers.forEach(mixer => mixer.update(delta));
    }
}
