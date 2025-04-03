/**
 * Scene.js - Handles scene setup, lighting, ground, and environment
 */

class FarmScene {
    constructor() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Light blue sky background
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.5, 5);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Window resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Initialize scene components
        this.addLights();
        this.addGround();
        this.addFences();
    }
    
    addLights() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }
    
    addGround() {
        // Create the grass ground
        const groundGeometry = new THREE.PlaneGeometry(10, 10, 32, 32);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4CAF50,  // Green color for grass
            roughness: 0.8,
            metalness: 0.1,
            flatShading: false
        });
        
        // Add some vertex displacement to make it look more like grass
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            // Only modify y values (height) and keep edges flat
            if (i > 100 && i < vertices.length - 100) {
                vertices[i + 1] = Math.random() * 0.05; // Small random height
            }
        }
        groundGeometry.attributes.position.needsUpdate = true;
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }
    
    addFences() {
        const fenceGroup = new THREE.Group();
        
        // Fence post geometry and material
        const postGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const railGeometry = new THREE.BoxGeometry(2, 0.05, 0.05);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 1,
            metalness: 0
        });
        
        // Create fence segments on all four sides
        const fenceDistance = 4.8; // Distance from center
        
        // Function to create a fence line
        const createFenceLine = (startX, startZ, endX, endZ) => {
            const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2));
            const segments = Math.ceil(length / 2); // Post every 2 units
            
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = startX + t * (endX - startX);
                const z = startZ + t * (endZ - startZ);
                
                // Add post
                const post = new THREE.Mesh(postGeometry, woodMaterial);
                post.position.set(x, 0.4, z); // Half height above ground
                post.castShadow = true;
                fenceGroup.add(post);
                
                // Add rails between posts (except for the last post)
                if (i < segments) {
                    const nextT = (i + 1) / segments;
                    const nextX = startX + nextT * (endX - startX);
                    const nextZ = startZ + nextT * (endZ - startZ);
                    
                    // Calculate rail position and rotation
                    const railX = (x + nextX) / 2;
                    const railZ = (z + nextZ) / 2;
                    const angle = Math.atan2(nextZ - z, nextX - x);
                    
                    // Top rail
                    const topRail = new THREE.Mesh(railGeometry, woodMaterial);
                    topRail.position.set(railX, 0.6, railZ);
                    topRail.rotation.y = angle;
                    topRail.castShadow = true;
                    fenceGroup.add(topRail);
                    
                    // Bottom rail
                    const bottomRail = new THREE.Mesh(railGeometry, woodMaterial);
                    bottomRail.position.set(railX, 0.2, railZ);
                    bottomRail.rotation.y = angle;
                    bottomRail.castShadow = true;
                    fenceGroup.add(bottomRail);
                }
            }
        };
        
        // Create four sides of the fence
        createFenceLine(-fenceDistance, -fenceDistance, fenceDistance, -fenceDistance); // Front
        createFenceLine(fenceDistance, -fenceDistance, fenceDistance, fenceDistance);   // Right
        createFenceLine(fenceDistance, fenceDistance, -fenceDistance, fenceDistance);   // Back
        createFenceLine(-fenceDistance, fenceDistance, -fenceDistance, -fenceDistance); // Left
        
        this.scene.add(fenceGroup);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
