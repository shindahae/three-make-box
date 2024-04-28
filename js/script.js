
// 기본 세팅
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 사각형의 점들을 저장할 배열
const pointsArray = [];

// 라인의 재료 및 객체 생성
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 20 });
const lineGeometry = new THREE.BufferGeometry();
const line = new THREE.Line(lineGeometry, lineMaterial);

scene.add(line);

// 카메라 위치 설정
camera.position.z = 5;

// 클릭 횟수를 추적하기 위한 변수
let clickCount = 0;

// 마우스 클릭 이벤트 리스너 추가
renderer.domElement.addEventListener('click', onClick, false);

function onClick(event) {

    if (clickCount === 0) {
    	scene.remove(...scene.children.filter(obj => obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry));
    }

    // 마우스 클릭 좌표를 정규화된 디바이스 좌표로 변환
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting을 사용하여 클릭한 3D 좌표를 얻음
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const point = raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

    // 점 배열에 점 추가
    pointsArray.push(point.x, point.y, point.z);
    console.log(pointsArray);

    // 새로운 버퍼 어트리뷰트로 라인 점들을 업데이트
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsArray, 3));

    // 라인 점들을 연결하기 위한 인덱스 업데이트
    const indices = [];
    for (let i = 0; i < pointsArray.length / 3; i++) {
        indices.push(i);
    }
    lineGeometry.setIndex(indices);
    
    // 원의 위치 업데이트 및 표시
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const circleGeometry = new THREE.CircleGeometry(0.1, 32); // 반지름이 0.1인 원을 생성
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.position.set(point.x, point.y, point.z);
    circle.visible = true;

    scene.add(circle);

    // 클릭 횟수 증가
    clickCount++;

    // 4번 클릭 시 첫 번째 점과 마지막 점을 연결하여 사각형 완성
    if (clickCount === 4) {
        pointsArray.push(pointsArray[0], pointsArray[1], pointsArray[2]);
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsArray, 3));
        
        const indices = [];
        for (let i = 0; i < pointsArray.length / 3; i++) {
            indices.push(i);
        }
        lineGeometry.setIndex(indices);

        // 모든 점 초기화
        pointsArray.length = 0;

        // 클릭 횟수 초기화
        clickCount = 0;
    }
}

// 애니메이션 함수
const animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

// 애니메이션 시작
animate();

