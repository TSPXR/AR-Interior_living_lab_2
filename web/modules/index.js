import { TriangleController } from './triangle.js';

const renderArea = document.querySelector("#camera-render-area");
const saveButton = document.querySelector("#canvas-save-button");
const loadingArea = document.querySelector("#loading");

const userAgent = navigator.userAgent.toLowerCase();

let isIOS, isMobile;

const triangleController = new TriangleController(0.4);
// Three.js Group x축 기준 90도 회전
const additionalRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(90), 0, 0));

function getUserAgent() {
    if (userAgent.match("iphone") || userAgent.match("ipad") || userAgent.match("ipod") || userAgent.match("mac")) {
		isIOS = true;
        isMobile = true;
		if (!userAgent.match("safari") || userAgent.match("naver") || userAgent.match("twitter")) {
			isIOS = false;
		}
	} else {
        isMobile = userAgent.match("Android") || userAgent.match("mobile");
    }
}

function getLogTitle(text) {
    let base = "======================================";
    return (base + `\n${text}\n` +base);
}

const imageTargetPipelineModule = () => {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
        pointer.x = (event.targetTouches[0].pageX / renderArea.clientWidth) * 2 - 1;
        pointer.y = -(event.targetTouches[0].pageY / renderArea.clientHeight) * 2 + 1;
    }

    const initXrScene = ({scene, camera, renderer}) => {
        triangleController.group.rotation.x = Math.PI/2;
        scene.add(triangleController.group);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF);
        scene.add(ambientLight);
        camera.position.set(0, 3, 5);
    }

    /**
     * 마커 인식 시 동작 이벤트
     * @param {string} detail - 마커 ID
     */
    const showTarget = ({detail}) => {
        // 특정 마커 인식 시
        // if (detail.name === "ar_marker_resized") {
        // }

        triangleController.group.position.copy(detail.position);
        triangleController.group.position.y += 0.2;
        triangleController.group.quaternion.copy(detail.rotation);
        triangleController.group.quaternion.multiply(additionalRotation);
        triangleController.group.scale.set(detail.scale, detail.scale, detail.scale);
    }

    /**
     * 마커 인식 실패 시 동작 이벤트
     * @param {string} detail - 마커 ID
     */
    const hideTarget = ({detail}) => {
        if (detail.name === "ar_marker_resized") {
        }
    }

    /**
     * AR 체험을 위한 카메라/렌더링 매핑
     * @param {string} canvas - 렌더링될 Main 캔버스
     */
    const onStart = ({canvas}) => {
        loadingArea.style.backgroundColor = "rgb(0, 0, 0, 0.45)";

        const { scene, camera } = XR8.Threejs.xrScene();

        const renderer = XR8.Threejs.xrScene().renderer;
        
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.8;

        initXrScene({ scene, camera, renderer});

        canvas.addEventListener("touchstart", (event) => {
            onPointerMove(event);
            raycaster.setFromCamera(pointer, camera);
            const intersection = raycaster.intersectObjects(scene.children);
            
            triangleController.touchEvent(pointer);

        })

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault()
        })

        XR8.XrController.updateCameraProjectionMatrix({
            origin: camera.position,
            facing: camera.quaternion,
        })
    }

    setTimeout(() => {
        loadingArea.parentElement.removeChild(loadingArea);
    }, 5000);

    return {
        name: "GalleryBaton",
        onStart,
        listeners: [
            {event: "reality.imagefound", process: showTarget},
            {event: "reality.imageupdated", process: showTarget},
            {event: "reality.imagelost", process: hideTarget},
        ],
    }
}

const onxrloaded = () => {
    XR8.XrController.configure({disableWorldTracking: false});
    XR8.addCameraPipelineModules([
        XR8.GlTextureRenderer.pipelineModule(),
        XR8.Threejs.pipelineModule(),
        XR8.XrController.pipelineModule(),
        XRExtras.AlmostThere.pipelineModule(),
        XRExtras.FullWindowCanvas.pipelineModule(),
        XRExtras.Loading.pipelineModule(),
        XRExtras.RuntimeError.pipelineModule(),

        imageTargetPipelineModule(),
    ]);
    XR8.run({canvas: renderArea});
}

// 카메라 버튼 클릭 시 이미저 저장 및 서버 전송
saveButton.addEventListener('click', async function() {
    const link = document.createElement('a');
    link.download = `${Date.now()}.png`;
    
    link.href = renderArea.toDataURL();
    link.click();
    
    const imageData = renderArea.toDataURL('image/png').replace("image/png", "image/octet-stream");
    const response = await fetch('/save-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData })
    });

    if (response.ok) {
        console.log('Image saved successfully on the server.');
    } else {
        console.error('Error saving image on the server.');
    }
    
});

window.onload = async () => {
    getUserAgent();

    const permObserver = new MutationObserver((mutations) => {
        const permBox = document.querySelector(".prompt-box-8w");
        const permBtnContainer = document.querySelector(".prompt-button-container-8w")
        const permDenyBtn = document.querySelector(".prompt-button-8w");
        const permAllowBtn = document.querySelector(".button-primary-8w");
        if (permBox) {
            permBox.querySelector("p").innerHTML = "<strong>AR 서비스를 이용하실려면<br/>권한 허용이 필요합니다.</strong><br/>계속하시려면 허용 버튼을<br/>눌러주세요";
            permBox.style.fontSize = "18px";
            //permBtnContainer.insertBefore(permAllowBtn, permDenyBtn);
            permDenyBtn.innerHTML = "취소";
            permAllowBtn.innerHTML = "허용";
            permObserver.disconnect();
        }
    });

    permObserver.observe(document.body, {childList: true});

    const load = () => { XRExtras.Loading.showLoading({onxrloaded}) };
    window.XRExtras ? load() : window.addEventListener("xrextrasloaded", load);
}