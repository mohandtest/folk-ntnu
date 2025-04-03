/**
 * Models.js - Contains the fallback simple models for animals
 */

// Factory for creating simple animal models
const SimpleModelFactory = {
    // Available simple models
    models: {
        'chicken': createSimpleChicken,
        'cow': createSimpleCow,
        'pig': createSimplePig
    },
    
    // Get a model - if requested model doesn't exist, return chicken as default
    getModel: function(type) {
        if (this.models[type]) {
            return this.models[type]();
        }
        console.warn(`No simple model for "${type}" found, using chicken as fallback`);
        return this.models['chicken']();
    }
};

// Function to create a fallback chicken
function createSimpleChicken() {
    const group = new THREE.Group();
    
    // Body - slightly elongated sphere
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeometry.scale(1, 0.8, 1.2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    group.add(body);
    
    // Head - smaller sphere
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.1, 0.4);
    group.add(head);
    
    // Beak - cone
    const beakGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAA00 });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 1.1, 0.7);
    group.add(beak);
    
    // Legs - cylinders
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAA00 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(0.2, 0.25, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(-0.2, 0.25, 0);
    group.add(rightLeg);
    
    group.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    
    return group;
}

// Function to create a fallback cow
function createSimpleCow() {
    const group = new THREE.Group();
    
    // Body - elongated box
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.7, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.5);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.7, 1.1, 0);
    group.add(head);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    const positions = [
        [-0.4, 0.35, 0.2],  // front left
        [-0.4, 0.35, -0.2], // front right
        [0.4, 0.35, 0.2],   // back left
        [0.4, 0.35, -0.2],  // back right
    ];
    
    positions.forEach(position => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...position);
        group.add(leg);
    });
    
    group.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    
    return group;
}

// Function to create a fallback pig
function createSimplePig() {
    const group = new THREE.Group();
    
    // Body - roundish body
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeometry.scale(1.2, 0.8, 0.9);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC }); // Pink color
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.6, 0.8, 0);
    group.add(head);
    
    // Snout
    const snoutGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.2, 16);
    const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(0.85, 0.8, 0);
    group.add(snout);
    
    // Nostrils
    const nostrilGeometry = new THREE.CircleGeometry(0.04, 8);
    const nostrilMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    leftNostril.position.set(0.95, 0.85, 0.08);
    leftNostril.rotation.y = Math.PI / 2;
    group.add(leftNostril);
    
    const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    rightNostril.position.set(0.95, 0.85, -0.08);
    rightNostril.rotation.y = Math.PI / 2;
    group.add(rightNostril);
    
    // Ears
    const earGeometry = new THREE.CircleGeometry(0.15, 8);
    const earMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFCCCC,
        side: THREE.DoubleSide 
    });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(0.5, 1.05, 0.2);
    leftEar.rotation.y = Math.PI / 4;
    leftEar.rotation.x = -Math.PI / 6;
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.5, 1.05, -0.2);
    rightEar.rotation.y = -Math.PI / 4;
    rightEar.rotation.x = -Math.PI / 6;
    group.add(rightEar);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    
    const positions = [
        [-0.25, 0.25, 0.2],  // back left
        [-0.25, 0.25, -0.2], // back right
        [0.35, 0.25, 0.2],   // front left
        [0.35, 0.25, -0.2],  // front right
    ];
    
    positions.forEach(position => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...position);
        group.add(leg);
    });
    
    // Tail (curly)
    const tailCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.6, 0.7, 0),
        new THREE.Vector3(-0.8, 0.7, 0.1),
        new THREE.Vector3(-0.8, 0.8, -0.1),
        new THREE.Vector3(-0.7, 0.9, 0)
    );
    
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 20, 0.03, 8, false);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    group.add(tail);
    
    group.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    
    return group;
}
