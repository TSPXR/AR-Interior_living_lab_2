class TriangleController {
    constructor(triangleSize) {
        this.triangleSize = triangleSize;
        this.triangleHeight = triangleSize * Math.sqrt(3) / 2;
        console.log('triangleSize', this.triangleSize);
        console.log('triangleHeight', this.triangleHeight);
        this.group = new THREE.Group();;

        this.gridSize = 1000;
        this.triangles = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
        this.currentX = Math.floor(this.gridSize / 2); // 초기값 = gridSize가 100일 때 50
        this.currentY = Math.floor(this.gridSize / 2); // 초기값 = gridSize가 100일 때 50

        this.init();
    }

    init() {
        this.triangles[this.currentY][this.currentX] = this.createTriangle();
        this.group.add(this.triangles[this.currentY][this.currentX]);
    }

    touchEvent(arPointer) {
        console.log('arPointer', arPointer);
        let point = arPointer;

        // 가로방향 배치
        if (Math.abs(point.x) > Math.abs(point.y)) {
            if (point.x > 0) {
                this.horizontalFlip('right');
                
            }
            else{
                this.horizontalFlip('left');
                
            }
        }
        // 세로방향 배치
        else {
            if (point.y > 0) {
                this.verticalFlip('top');
            }
            else {
                this.verticalFlip('bottom');
            }
        }
    }
    
    createTriangle() {
        let geometry = new THREE.BufferGeometry();
    
        let vertices = new Float32Array([
            0, this.triangleSize, 0, 
            -this.triangleSize * Math.sin(Math.PI / 3), -this.triangleSize * 0.5, 0,
            this.triangleSize * Math.sin(Math.PI / 3), -this.triangleSize * 0.5, 0
        ]);
    
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        const textureLoader = new THREE.TextureLoader()
        const triangleTexture = textureLoader.load('./assets/img/logo_1.png')

        const material = new THREE.MeshPhongMaterial({ map: triangleTexture })
        material.shininess = 100
        material.specular = new THREE.Color(0x1188ff)
        
        let triangle = new THREE.Mesh(geometry, material);
        return triangle;
    }

    highlightCurrentTriangle() {
        const currentTriangle = this.triangles[this.currentY][this.currentX];
        if (currentTriangle) {
            currentTriangle.material.transparent = false;
            currentTriangle.material.opacity = 1;
            currentTriangle.material.emissive.set(0x444444); // 적절한 값으로 조정
        }
        console.log(currentTriangle.material.transparent, currentTriangle.material.opacity);

    }

    unhighlightCurrentTriangle() {
        const currentTriangle = this.triangles[this.currentY][this.currentX];
        if (currentTriangle) {
            console.log(currentTriangle);
            currentTriangle.material.transparent = false;
            currentTriangle.material.opacity = 1;
            currentTriangle.material.emissive.set(0x000000); // 에미시브 값을 초기값으로 설정
        }
    }
    

    // 정삼각형 수직방향 이동(세로방향)
    verticalFlip(direction) {
        let newX = this.currentX;
        let newY = this.currentY;
        
        let currentTriangle = this.triangles[newY][newX];
        let newTriangle = this.createTriangle();
        
        /* 공통 적용 값 */
        newTriangle.position.x = currentTriangle.position.x;
        newTriangle.position.z = currentTriangle.position.z;
        newTriangle.rotation.x = 0;
        newTriangle.rotation.y = 0;
        
        /* y축 position 위치 조정 */
        if (direction == 'top') {
            newTriangle.position.y = currentTriangle.position.y + this.triangleSize;
            newY = newY - 1;

            if (currentTriangle.rotation.z == 0) {    
                newTriangle.position.y += this.triangleHeight
            }

        }
        else 
        {
            newY = newY + 1;
            newTriangle.position.y = currentTriangle.position.y - this.triangleSize;
            
            if (currentTriangle.rotation.z == Math.PI) {    
                newTriangle.position.y -= this.triangleSize;
            }
        }

        /* 180도 회전 */
        if (currentTriangle.rotation.z == 0) {
            newTriangle.rotation.z = Math.PI;
        }
        else{
            newTriangle.rotation.z = 0;
        }

        if (this.triangles[newY][newX] == null){
            this.triangles[newY][newX] = newTriangle;
            this.group.add(this.triangles[newY][newX]);
        }

        this.unhighlightCurrentTriangle();
        this.currentX = newX;
        this.currentY = newY;
        this.highlightCurrentTriangle();
                
    }

    // 정삼각형 수평방향 이동(가로방향)
    horizontalFlip(direction) {
        let newX = this.currentX;
        let newY = this.currentY;

        let currentTriangle = this.triangles[newY][newX];
        let newTriangle = this.createTriangle();

        /* 공통 적용 값 */
        newTriangle.position.z = currentTriangle.position.z;
        newTriangle.rotation.x = 0;
        newTriangle.rotation.y = 0;
        

        /* x축 position 위치 조정 */
        if (direction === 'right') {
            newTriangle.position.x = currentTriangle.position.x + this.triangleHeight;
            newX = newX + 1;
        }
        
        // 왼쪽으로 삼각형 배치
        else {
            newTriangle.position.x = currentTriangle.position.x - this.triangleHeight;
            newX = newX - 1;
        }

        /* y축 position 위치 조정 */
        if (currentTriangle.rotation.z == 0) {
            newTriangle.position.y = currentTriangle.position.y + (0.5 * this.triangleSize);
            newTriangle.rotation.z = Math.PI;
        }
        else{
            newTriangle.position.y = currentTriangle.position.y - (0.5 * this.triangleSize);
            newTriangle.rotation.z = 0;
        }

        if (this.triangles[newY][newX] == null){
            this.triangles[newY][newX] = newTriangle;
            this.group.add(this.triangles[newY][newX]);
        }

        this.unhighlightCurrentTriangle();
        this.currentX = newX;
        this.currentY = newY;
        this.highlightCurrentTriangle();
    }
}
export { TriangleController }