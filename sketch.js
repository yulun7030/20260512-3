let capture;
let faceMesh;
let faces = [];
let handPose; // 手勢模型變數
let hands = []; // 儲存手勢結果
let earringImgs = []; // 儲存 5 款耳環圖片
let currentEarringIndex = 0; // 目前選擇的耳環索引

function preload() {
  // 載入 5 款耳環圖片
  earringImgs[0] = loadImage('pic/acc/acc1_ring.png');
  earringImgs[1] = loadImage('pic/acc/acc2_pearl.png');
  earringImgs[2] = loadImage('pic/acc/acc3_tassel.png');
  earringImgs[3] = loadImage('pic/acc/acc4_jade.png');
  earringImgs[4] = loadImage('pic/acc/acc5_phoenix.png');
  
  // 加入保護機制：檢查 ml5 是否成功從網路載入
  if (typeof ml5 !== 'undefined') {
    faceMesh = ml5.faceMesh();
    handPose = ml5.handPose(); // 初始化手勢模型
  } else {
    console.error("無法載入 ml5.js，請檢查網路連線或 script 標籤。");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 設定攝影機，並在攝影機畫面成功讀取後，才啟動臉部辨識與手勢辨識
  capture = createCapture(VIDEO, function() {
    if (faceMesh) {
      faceMesh.detectStart(capture, gotFaces);
    }
    if (handPose) {
      handPose.detectStart(capture, gotHands);
    }
  });
  capture.hide();
}

function gotFaces(results) {
  faces = results;
}

function gotHands(results) {
  hands = results;
}

// 判斷伸出手指數量的輔助函式
function countFingers(hand) {
  let count = 0;
  let kp = hand.keypoints;
  
  // 食指(8)、中指(12)、無名指(16)、小拇指(20) 的指尖與第二關節(pip)索引
  const fingers = [
    { tip: 8, pip: 6 },
    { tip: 12, pip: 10 },
    { tip: 16, pip: 14 },
    { tip: 20, pip: 18 }
  ];
  
  for (let f of fingers) {
    // 若指尖 y 座標低於第二關節 y 座標 (在畫面上比較高)，視為伸出
    if (kp[f.tip].y < kp[f.pip].y) {
      count++;
    }
  }
  
  // 大拇指(4)：比對指尖到食指根部(5) 的距離，若大於大拇指根部(2)到食指根部的距離，視為伸出
  let thumbTipDist = dist(kp[4].x, kp[4].y, kp[5].x, kp[5].y);
  let thumbBaseDist = dist(kp[2].x, kp[2].y, kp[5].x, kp[5].y);
  if (thumbTipDist > thumbBaseDist * 1.2) { // 加上 1.2 倍容差
    count++;
  }
  
  return count;
}

function draw() {
  background('#e7c6ff');
  
  let imgWidth = width * 0.5;
  let imgHeight = height * 0.5;
  
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  
  // 確保攝影機影像已經成功載入且有寬高後才進行繪製 (加入 loadedmetadata 判斷)
  if (capture && capture.loadedmetadata && capture.width > 0 && capture.height > 0) {
    image(capture, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    
    // 偵測手勢並更新目前選擇的耳環圖片
    if (hands.length > 0) {
      let fingers = countFingers(hands[0]);
      if (fingers >= 1 && fingers <= 5) {
        currentEarringIndex = fingers - 1; // 手指 1~5 根對應陣列 0~4
      }
    }
    
    let currentImg = earringImgs[currentEarringIndex];
    
    // 設定耳環圖片的大小 (自適應縮放)
    let earringW = imgWidth * 0.08; 
    let earringH = earringW; // 假設圖片是正方形，若比例不同可以自行調整
    
    // 定義耳環往外與往上的移動比率
    let moveOutward = earringW * 0.3; // 往外移動寬度的 30%
    let moveUpward = earringH * 0.2;  // 往上移動高度的 20%
    
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      // 特徵點 132 與 361 分別為左右耳垂位置
      let leftEarlobe = face.keypoints[132];
      let rightEarlobe = face.keypoints[361];
      
      if (leftEarlobe) {
        let x = (leftEarlobe.x / capture.width) * imgWidth - imgWidth / 2;
        let y = (leftEarlobe.y / capture.height) * imgHeight - imgHeight / 2;
        // 繪製左耳環 (位於畫面右側)：X 軸往外(右)移動，Y 軸往上移動
        let drawX = (x - earringW / 2) + moveOutward;
        let drawY = y - moveUpward;
        image(currentImg, drawX, drawY, earringW, earringH);
      }
      
      if (rightEarlobe) {
        let x = (rightEarlobe.x / capture.width) * imgWidth - imgWidth / 2;
        let y = (rightEarlobe.y / capture.height) * imgHeight - imgHeight / 2;
        // 繪製右耳環 (位於畫面左側)：X 軸往外(左)移動，Y 軸往上移動
        let drawX = (x - earringW / 2) - moveOutward;
        let drawY = y - moveUpward;
        image(currentImg, drawX, drawY, earringW, earringH);
      }
    }
  } else {
    // 如果找不到攝影機或還在載入中，顯示提示文字
    push();
    scale(-1, 1); // 將 X 軸翻轉回來，讓文字正常顯示
    fill(100);
    textAlign(CENTER, CENTER);
    text("尚未讀取到攝影機畫面，或您的裝置沒有攝影機", 0, 0);
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
