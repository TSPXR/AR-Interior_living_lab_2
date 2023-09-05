class TriangleController {
    constructor(triangleSize) {
        this.triangleSize = triangleSize;
        
        this.triangleHeight = triangleSize * Math.sqrt(3) / 2;
        // this.triangles = [];

        // 1. 2차원 배열 초기화
        this.gridSize = 100;
        this.triangles = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
        this.currentX = Math.floor(this.gridSize / 2);
        this.currentY = Math.floor(this.gridSize / 2);
        console.log(this.triangles)
        console.log(this.currentX)
        console.log(this.currentY)

        // 기준 오브젝트
        this.baseObject;

        this.init();
    }
    
    init() {
        // this.triangles.push(this.createTriangle(this.triangleSize));
        // this.triangles[0].rotation.x = Math.PI/2;
        console.log('init triangle module');
        this.baseObject = this.createTriangle(this.triangleSize);
        // this.baseObject.rotation.x = Math.PI/2;
        this.triangles[this.currentY][this.currentX] = this.baseObject;
        
    }

    getCurrentXY() {
        return [this.currentX, this.currentY]
    }

    createTriangle(size) {
        let geometry = new THREE.BufferGeometry();
    
        let vertices = new Float32Array([
            0, size, 0, 
            -size * Math.sin(Math.PI / 3), -size * 0.5, 0,
            size * Math.sin(Math.PI / 3), -size * 0.5, 0
        ]);
    
        let colors = new Float32Array([
            1, 0, 0,  // 빨간색 (상단 꼭지점)
            0, 1, 0,  // 초록색 (왼쪽 하단 꼭짓점)
            0, 1, 0   // 초록색 (오른쪽 하단 꼭짓점)
        ]);
    
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
        // let material = new THREE.MeshBasicMateria1l({ color: 0x00ff00, side: THREE.DoubleSide });
        let material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    
        let triangle = new THREE.Mesh(geometry, material);
        // triangle.rotation.x = Math.PI/2;
        return triangle;
    }

    setTriangleLeftRight(currentTriangle, direction, newX, newY){
        let newTriangle = this.createTriangle(this.triangleSize)
        let zAxis;
        newTriangle.rotation.x = Math.PI/2;
    
        if (currentTriangle.rotation.z == 0){
            newTriangle.rotation.z = Math.PI;
            zAxis = true;
        }
        else{
            newTriangle.rotation.z = 0;
            zAxis = false;
        }
    
        if (direction == 'left'){
            newTriangle.position.x = currentTriangle.position.x - this.triangleHeight;
        }
    
        else{
            newTriangle.position.x = currentTriangle.position.x + this.triangleHeight;
        }
    
        if (zAxis){
            newTriangle.position.z = currentTriangle.position.z + (0.5 * this.triangleSize);
        }
        else{
            newTriangle.position.z = currentTriangle.position.z - (0.5 * this.triangleSize);
        }
        
        this.triangles[newY][newX] = newTriangle
        this.currentX = newX;
        this.currentY = newY;
        
        this.baseObject.add(newTriangle);
        return newTriangle
    }

    setTriangleTopDown(currentTriangle, position, newX, newY){
        let newTriangle = this.createTriangle(this.triangleSize)
        newTriangle.rotation.x = Math.PI/2;
        
        newTriangle.position.x = currentTriangle.position.x;

        if (currentTriangle.rotation.z == 0){
            newTriangle.rotation.z = Math.PI;
            newTriangle.position.z = currentTriangle.position.z - this.triangleSize;
        }
        else{
            newTriangle.rotation.z = 0;
            newTriangle.position.z = currentTriangle.position.z + this.triangleSize;
        }

        if (position == 'top'){
            if (newTriangle.rotation.z == Math.PI){
                this.triangles[newY][newX] = newTriangle
                this.currentX = newX;
                this.currentY = newY;
            }
        }

        else {
            if (newTriangle.rotation.z == 0){
                this.triangles[newY][newX] = newTriangle
                this.currentX = newX;
                this.currentY = newY;
            }
        }
        
        console.log(this.currentX)
        console.log(this.currentY);
        this.baseObject.add(this.triangles[newY][newX]);
        return newTriangle
    }
}

export { TriangleController }