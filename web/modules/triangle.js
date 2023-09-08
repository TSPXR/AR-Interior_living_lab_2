class TriangleController {
    constructor(triangleSize) {
        /**
         * TriangleController 생성자
         * @param {number} triangleSize - 삼각형 크기
         */
        this.triangleSize = triangleSize;
        this.triangleHeight = triangleSize * Math.sqrt(3) / 2;
        this.group = new THREE.Group();;

        this.gridSize = 1000;
        this.triangles = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
        this.currentX = Math.floor(this.gridSize / 2); // 초기값 = gridSize가 100일 때 50
        this.currentY = Math.floor(this.gridSize / 2); // 초기값 = gridSize가 100일 때 50

        this.init();
    }

    /**
     * 중앙 정삼각형 배치
    */
    init() {
        this.triangles[this.currentY][this.currentX] = this.createTriangle();
        this.group.add(this.triangles[this.currentY][this.currentX]);
    }

    /**
     * 사용자의 입력에 따라 삼각형의 위치를 변경함
     * @param {Object} arPointer - 사용자의 입력
     */
    touchEvent(arPointer) {
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
    
    /**
     * 정삼각형을 생성 함수
     * @returns {Object} 생성된 삼각형 객체
     */
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
        const triangleTexture = textureLoader.load('./assets/img/yellow.png')

        const material = new THREE.MeshPhongMaterial({ map: triangleTexture })
        material.shininess = 100
        material.specular = new THREE.Color(0x1188ff)
        
        let triangle = new THREE.Mesh(geometry, material);
        return triangle;
    }

    /**
     * 현재 선택된 정삼각형을 강조 효과를 추가하는 함수
     */
    highlightCurrentTriangle() {
        const currentTriangle = this.triangles[this.currentY][this.currentX];
        if (currentTriangle) {
            currentTriangle.material.emissive.set(0xFFFFFF); // 적절한 값으로 조정
        }

    }

    /**
     * 현재 선택된 정삼각형의 강조 효과를 제거하는 함수
     */
    unhighlightCurrentTriangle() {
        const currentTriangle = this.triangles[this.currentY][this.currentX];
        if (currentTriangle) {
            currentTriangle.material.emissive.set(0x000000);
        }
    }
    
    /**
     * 삼각형을 수직 방향으로 배치한다.
     * @param {string} direction - 'top' 또는 'bottom' 방향.
     */
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
                newTriangle.position.y += this.triangleSize
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
            this.completeAnimation()
            this.addAnimation(currentTriangle, newTriangle);
            this.triangles[newY][newX] = newTriangle;
            this.group.add(this.triangles[newY][newX]);
        }

        this.unhighlightCurrentTriangle();
        this.currentX = newX;
        this.currentY = newY;
        this.highlightCurrentTriangle();
                
    }

    /**
     * 삼각형을 수평 방향으로 배치한다.
     * @param {string} direction - 'top' 또는 'bottom' 방향.
     */
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
            this.completeAnimation()
            this.addAnimation(currentTriangle, newTriangle);
            this.triangles[newY][newX] = newTriangle;
            this.group.add(this.triangles[newY][newX]);
        }

        this.unhighlightCurrentTriangle();
        this.currentX = newX;
        this.currentY = newY;
        this.highlightCurrentTriangle();
    }


    addAnimation(currentTriangle, newTriangle) {
        // 삼각형의 시작 위치 및 회전 설정
        let startPosition = { x: currentTriangle.position.x, y: currentTriangle.position.y, z: currentTriangle.position.z };
        let endPosition = { x: newTriangle.position.x, y: newTriangle.position.y, z: newTriangle.position.z };
    
        let startRotation = { x: currentTriangle.rotation.x, y: currentTriangle.rotation.y, z: currentTriangle.rotation.z };
        let endRotation = { x: newTriangle.rotation.x, y: newTriangle.rotation.y, z: newTriangle.rotation.z };
    
        // TWEEN 애니메이션 설정
        let tweenPosition = new TWEEN.Tween(startPosition).to(endPosition, 500);  // 5000ms = 5초 동안 애니메이션
        let tweenRotation = new TWEEN.Tween(startRotation).to(endRotation, 500);
    
        tweenPosition.onUpdate(() => {
            console.log(newTriangle.position);
            newTriangle.position.set(startPosition.x, startPosition.y, startPosition.z);
        });
    
        tweenRotation.onUpdate(() => {
            newTriangle.rotation.set(startRotation.x, startRotation.y, startRotation.z);
        });
    
        // 애니메이션 시작
        tweenPosition.start();
        tweenRotation.start();
    }

    completeAnimation() {
        TWEEN.getAll().forEach(tween => {
            let targetObject = tween._object;  // Tween.js에서는 _object 속성을 통해 대상 객체에 접근합니다.
            targetObject.position.set(tween._valuesEnd.x, tween._valuesEnd.y, tween._valuesEnd.z);
            targetObject.rotation.set(tween._valuesEnd.rotationX, tween._valuesEnd.rotationY, tween._valuesEnd.rotationZ);
            tween.stop();
        });
    }
    
}

function animation() {
    console.log('animate!');
    TWEEN.update();
    requestAnimationFrame(animation);
}

animation();

export { TriangleController }