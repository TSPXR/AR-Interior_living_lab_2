function getArrowHelper(arrowSize){
    // 화살표의 길이 설정
    const arrowLength = arrowSize; // unit size

    // X축 (빨간색) 화살표를 생성합니다.
    const arrowHelperX = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0), // 방향
    new THREE.Vector3(0, 0, 0), // 시작점 (마커의 중심)
    arrowLength, 
    0xff0000 // 색상
    );

    // Y축 (초록색) 화살표를 생성
    const arrowHelperY = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0), 
    new THREE.Vector3(0, 0, 0),
    arrowLength, 
    0x00ff00 
    );

    // Z축 (파란색) 화살표를 생성
    const arrowHelperZ = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1), 
    new THREE.Vector3(0, 0, 0),
    arrowLength, 
    0x0000ff 
    );
    
    return [arrowHelperX, arrowHelperY, arrowHelperZ]
}

export { getArrowHelper }