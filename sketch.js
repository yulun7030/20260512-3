let capture;
let faceMesh;
let faces = [];

function preload() {
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide();
  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background('#e7c6ff');
  
  let imgWidth = width * 0.5;
  let imgHeight = height * 0.5;
  
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  
  // 確保攝影機影像已經有寬高後才進行繪製
  if (capture.width > 0 && capture.height > 0) {
    image(capture, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    
    fill(255, 255, 0); // 黃色耳環
    noStroke();
    let circleSize = imgWidth * 0.015; // 圓圈大小 (自適應縮放)
    let spacing = circleSize * 1.5;    // 圓圈間距
    
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      // 特徵點 132 與 361 分別為左右耳垂位置
      let leftEarlobe = face.keypoints[132];
      let rightEarlobe = face.keypoints[361];
      
      if (leftEarlobe) {
        let x = (leftEarlobe.x / capture.width) * imgWidth - imgWidth / 2;
        let y = (leftEarlobe.y / capture.height) * imgHeight - imgHeight / 2;
        for (let j = 1; j <= 3; j++) {
          circle(x, y + j * spacing, circleSize);
        }
      }
      
      if (rightEarlobe) {
        let x = (rightEarlobe.x / capture.width) * imgWidth - imgWidth / 2;
        let y = (rightEarlobe.y / capture.height) * imgHeight - imgHeight / 2;
        for (let j = 1; j <= 3; j++) {
          circle(x, y + j * spacing, circleSize);
        }
      }
    }
  } else {
    // 如果找不到攝影機或還在載入中，顯示提示文字
    push();
    scale(-1, 1); // 將 X 軸翻轉回來，讓文字正常顯示
    fill(100);
    textAlign(CENTER, CENTER);
    text("尚未讀取到攝影機畫面", 0, 0);
    pop();
  }
  pop();
  
  // 在畫布上方置中顯示指定文字 (寫在 pop() 之後避免文字被左右翻轉)
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textAlign(CENTER, TOP);
  textSize(32);
  text("414737089林佑倫", width / 2, 40);
  text("作品為影像辨識_耳環臉譜", width / 2, 80);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
