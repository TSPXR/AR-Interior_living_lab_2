function getArrowHelper(arrowSize){
    // 화살표의 길이를 정의합니다.
    const arrowLength = arrowSize; // 예시: 1 유닛의 길이

    // X축 (빨간색) 화살표를 생성합니다.
    const arrowHelperX = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0), // 방향
    new THREE.Vector3(0, 0, 0), // 시작점 (마커의 중심)
    arrowLength, 
    0xff0000 // 색상
    );

    // Y축 (초록색) 화살표를 생성합니다.
    const arrowHelperY = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0), 
    new THREE.Vector3(0, 0, 0),
    arrowLength, 
    0x00ff00 
    );

    // Z축 (파란색) 화살표를 생성합니다.
    const arrowHelperZ = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1), 
    new THREE.Vector3(0, 0, 0),
    arrowLength, 
    0x0000ff 
    );
    
    return [arrowHelperX, arrowHelperY, arrowHelperZ]
}

export { getArrowHelper }