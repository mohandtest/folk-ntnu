/**
 * ModelLoader.js - Handles loading and positioning of 3D models for battles
 */

class BattleModelLoader {
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
            rotation = 0,     // Rotation in radians around Y axis
            scale = 1,        // Uniform scale factor
            onLoaded = null   // Callback when model is loaded
        } = params;
        
        console.log(`Loading ${modelId} (${modelType}) from ${modelPath}`);
        
        try {
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelPath,
                (gltf) => {
                    const model = gltf.scene;
                    
                    // Store modelType in userData for reference
                    model.userData = model.userData || {};
                    model.userData.type = modelType;
                    model.userData.modelType = modelType;
                    
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
                    model.rotation.y = rotation;
                    
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
                        this.mixers[modelId] = mixer;
                        
                        // Store all animations
                        this.models[modelId].animations = {};
                        gltf.animations.forEach(animation => {
                            const action = mixer.clipAction(animation);
                            this.models[modelId].animations[animation.name] = action;
                        });
                        
                        // Play idle animation if available
                        if (this.models[modelId].animations['idle']) {
                            this.models[modelId].animations['idle'].play();
                        }
                    }
                    
                    // Call the onLoaded callback if provided
                    if (onLoaded) onLoaded(model);
                },
                (xhr) => {
                    // Progress indicator
                    const percent = Math.floor(xhr.loaded / xhr.total * 100);
                    document.querySelector('.loading-text').textContent = 
                        `Loading ${modelType}: ${percent}%`;
                    console.log(`Loading ${modelType}: ${percent}%`);
                },
                (error) => {
                    console.error(`Error loading ${modelType} model:`, error);
                    
                    // Create a fallback model
                    const fallbackModel = SimpleModelFactory.getModel(modelType);
                    
                    // Store modelType in userData for reference
                    fallbackModel.userData = fallbackModel.userData || {};
                    fallbackModel.userData.type = modelType;
                    fallbackModel.userData.modelType = modelType;
                    
                    // Position the fallback model
                    fallbackModel.position.set(
                        position.x || 0,
                        position.y || 0,
                        position.z || 0
                    );
                    fallbackModel.rotation.y = rotation;
                    
                    // Add to scene and store reference
                    this.scene.add(fallbackModel);
                    this.models[modelId] = fallbackModel;
                    
                    // Call the onLoaded callback if provided
                    if (onLoaded) onLoaded(fallbackModel);
                }
            );
        } catch (e) {
            console.error(`Error initializing ${modelType} loader:`, e);
            
            // Create a fallback model
            const fallbackModel = SimpleModelFactory.getModel(modelType);
            
            // Store modelType in userData for reference
            fallbackModel.userData = fallbackModel.userData || {};
            fallbackModel.userData.type = modelType;
            fallbackModel.userData.modelType = modelType;
            
            // Position the fallback model
            fallbackModel.position.set(
                position.x || 0,
                position.y || 0,
                position.z || 0
            );
            fallbackModel.rotation.y = rotation;
            
            // Add to scene and store reference
            this.scene.add(fallbackModel);
            this.models[modelId] = fallbackModel;
            
            // Call the onLoaded callback if provided
            if (onLoaded) onLoaded(fallbackModel);
        }
    }
    
    // Get a loaded model by ID
    getModel(modelId) {
        return this.models[modelId];
    }
    
    // Play animation on a specific model
    playAnimation(modelId, animationName, options = {}) {
        const model = this.models[modelId];
        if (!model || !model.animations || !model.animations[animationName]) {
            console.warn(`Animation ${animationName} not found for model ${modelId}`);
            return;
        }
        
        // Stop any current animations if needed
        if (options.stopOthers) {
            Object.values(model.animations).forEach(action => action.stop());
        }
        
        // Configure the animation
        const action = model.animations[animationName];
        if (options.loop !== undefined) action.loop = options.loop ? THREE.LoopRepeat : THREE.LoopOnce;
        if (options.clampWhenFinished !== undefined) action.clampWhenFinished = options.clampWhenFinished;
        
        // Play the animation
        action.reset().play();
        
        return action;
    }
    
    // Update animations
    update() {
        const delta = this.clock.getDelta();
        Object.values(this.mixers).forEach(mixer => {
            if (mixer) mixer.update(delta);
        });
    }
    
    // Attack animation - move forward, then back
    animateAttack(modelId, targetPosition, onComplete) {
        console.log(`Animating attack for ${modelId}`);
        const model = this.models[modelId];
        if (!model) {
            console.error(`Model ${modelId} not found for attack animation`);
            return;
        }
        
        const originalPosition = model.position.clone();
        const direction = new THREE.Vector3()
            .subVectors(new THREE.Vector3(targetPosition.x, model.position.y, targetPosition.z), originalPosition)
            .normalize();
        
        // Move 40% toward target
        const attackPosition = originalPosition.clone().add(direction.multiplyScalar(1.5));
        console.log(`Attack movement from (${originalPosition.x.toFixed(2)}, ${originalPosition.z.toFixed(2)}) to (${attackPosition.x.toFixed(2)}, ${attackPosition.z.toFixed(2)})`);
        
        // Animation duration
        const moveDuration = 0.3;
        const returnDuration = 0.2;
        
        // Play attack animation if available
        if (model.animations && model.animations['attack']) {
            console.log(`Playing attack animation for ${modelId}`);
            this.playAnimation(modelId, 'attack', { stopOthers: true, loop: false });
        }
        
        // Forward movement
        console.log(`Starting forward movement tween for ${modelId}`);
        new TWEEN.Tween(model.position)
            .to({ x: attackPosition.x, z: attackPosition.z }, moveDuration * 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start()
            .onComplete(() => {
                console.log(`Forward movement complete for ${modelId}, starting return movement`);
                // Return to original position
                new TWEEN.Tween(model.position)
                    .to({ x: originalPosition.x, z: originalPosition.z }, returnDuration * 1000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start()
                    .onComplete(() => {
                        console.log(`Return movement complete for ${modelId}`);
                        // Play idle animation if available
                        if (model.animations && model.animations['idle']) {
                            this.playAnimation(modelId, 'idle', { stopOthers: true });
                        }
                        
                        if (onComplete) {
                            console.log(`Calling attack animation completion callback for ${modelId}`);
                            onComplete();
                        }
                    });
            });
    }
    
    // Damage reaction animation
    animateDamage(modelId, onComplete) {
        console.log(`Animating damage for ${modelId}`);
        const model = this.models[modelId];
        if (!model) {
            console.error(`Model ${modelId} not found for damage animation`);
            if (onComplete) onComplete();
            return;
        }
        
        // Play hit animation if available
        if (model.animations && model.animations['hit']) {
            this.playAnimation(modelId, 'hit', { stopOthers: true, loop: false });
        }
        
        // Visual effects for damage
        let flashCount = 0;
        const maxFlashes = 3;
        const flashDuration = 100;
        
        const flashModel = () => {
            // Toggle visibility
            model.visible = !model.visible;
            flashCount++;
            
            if (flashCount < maxFlashes * 2) {
                setTimeout(flashModel, flashDuration);
            } else {
                model.visible = true;
                
                // Play idle animation if available
                if (model.animations && model.animations['idle']) {
                    setTimeout(() => {
                        this.playAnimation(modelId, 'idle', { stopOthers: true });
                        if (onComplete) onComplete();
                    }, 500);
                } else if (onComplete) {
                    onComplete();
                }
            }
        };
        
        // Start flashing
        flashModel();
    }
}

// Polyfill for TWEEN if not available
if (typeof TWEEN === 'undefined') {
    console.warn('TWEEN.js not found, using simple animation polyfill');
    
    window.TWEEN = {
        Easing: {
            Quadratic: {
                Out: function(k) { return k * (2 - k); },
                InOut: function(k) { return k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k; }
            }
        },
        update: function() {
            // Global update function for all active tweens
            const now = Date.now();
            let i = 0;
            while (i < TWEEN._tweens.length) {
                if (TWEEN._tweens[i].update(now)) {
                    i++;
                } else {
                    TWEEN._tweens.splice(i, 1);
                }
            }
            return true;
        },
        _tweens: []
    };
    
    TWEEN.Tween = function(object) {
        const _object = object;
        let _valuesStart = {};
        let _valuesEnd = {}; // Changed from const to let
        let _duration = 1000;
        let _startTime = null;
        let _easingFunction = TWEEN.Easing.Quadratic.Out;
        let _onCompleteCallback = null;
        let _isPlaying = false;
        
        this.to = function(properties, duration) {
            if (duration !== undefined) {
                _duration = duration;
            }
            
            // Copy properties instead of assigning directly
            _valuesEnd = Object.assign({}, properties);
            return this;
        };
        
        this.start = function() {
            // Add this tween to the global list
            TWEEN._tweens.push(this);
            
            _isPlaying = true;
            _startTime = Date.now();
            
            // Store starting values
            _valuesStart = {}; // Reset start values
            for (const property in _valuesEnd) {
                if (_object[property] === undefined) {
                    continue;
                }
                
                _valuesStart[property] = _object[property];
            }
            
            return this;
        };
        
        this.onComplete = function(callback) {
            _onCompleteCallback = callback;
            return this;
        };
        
        this.easing = function(easing) {
            _easingFunction = easing;
            return this;
        };
        
        this.update = function(time) {
            if (!_isPlaying) return true;
            
            // Calculate elapsed time
            const elapsed = (time - _startTime) / _duration;
            
            // Clamp elapsed time
            const t = elapsed > 1 ? 1 : elapsed;
            
            // Apply easing
            const easedT = _easingFunction(t);
            
            // Update object properties
            for (const property in _valuesEnd) {
                if (_valuesStart[property] === undefined) continue;
                
                const start = _valuesStart[property];
                const end = _valuesEnd[property];
                _object[property] = start + (end - start) * easedT;
            }
            
            // Call complete callback if animation is done
            if (t === 1) {
                _isPlaying = false;
                if (_onCompleteCallback) {
                    _onCompleteCallback.call(_object);
                }
                return false;
            }
            
            return true;
        };
        
        return this;
    };
}
