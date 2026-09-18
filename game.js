// ============================================================
//  勉強会(2)  傾きで玉を動かす
// ============================================================
//
//  このファイルにコードを書いていく。上から順に進める。
//
//
//  用意されている関数と定数
//
//    tilt.x          端末の左右の傾き  -1 〜 1（右に倒すと +）
//    tilt.y          端末の前後の傾き  -1 〜 1（手前に倒すと +）
//    drawBall(x, y)  指定した座標に玉を描く
//    BOARD_W         盤の幅   300
//    BOARD_H         盤の高さ 400
//
//  座標系は左上が (0, 0)、右下が (BOARD_W, BOARD_H)。
//  y は下向きが正。数学のグラフとは上下が逆なので注意。
//
//
//  実行
//    保存 → ブラウザを再読み込み。端末がなければ矢印キーで傾く。
//    エラーは画面下部に表示される。
//
// ============================================================




// ============================================================
//  STEP 0 - 4 は解説しながら一緒に進める
// ============================================================


// ------------------------------------------------------------
//  STEP 0   このファイルを index.html から読み込む
// ------------------------------------------------------------
//  前回作った index.html の </body> の直前に、次の3行を足す。
//
//      <script src="three.min.js"></script>
//      <script src="engine.js"></script>
//      <script src="game.js"></script>
//
//  script タグは外部の JavaScript ファイルを読み込むタグ。
//  上から順に読み込まれるので、この順番を入れ替えてはいけない。
//  engine.js は three.min.js を使い、game.js は engine.js を使うため。
//
//  確認: 盤が木目の3D表示に変わる。
//        画面の下に「update() が見つかりません」と赤く出れば正常。
//        STEP 2 でその update() を書くと消える。


// ------------------------------------------------------------
//  STEP 1   玉の状態を持つ
// ------------------------------------------------------------
//  位置と速度を1つのオブジェクトにまとめる。
//
//      let ball = { x: 150, y: 200, vx: 0, vy: 0 };

let ball = { x: 20, y: 20, vx: 0, vy: 0 };

//ゴールの状態とクリア状態を定義する
let goal = { x:45, y:330, r:22 };
let cleared = false;

// 最初はゲームが動かないようにし、開始時間の変数を定義
let isPlaying = false;
let startTime = 0;

//演出
const bestEl = document.getElementById("best");

//ベストタイムをブラウザに保存し、次に遊んだときも表示
let bestTime = Number(localStorage.getItem("tiltMazeBestTime")) || null;
if (bestTime) {
    bestEl.textContent = "Best Time: " + bestTime.toFixed(1) + "秒";
}

// 紙吹雪を1枚降らせる
function spawnConfettiPiece() {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.textContent = ["🎉", "⭐", "🎊", "💖", "✨"][Math.floor(Math.random() * 5)];
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDuration = (1.5 + Math.random() * 1.5) + "s";
    document.body.appendChild(piece);
    piece.addEventListener("animationend", function () { piece.remove(); });
}

function celebrate(elapsed) {
    for (let i = 0; i < 30; i++) {
        setTimeout(spawnConfettiPiece, i * 40);
    }
    if (bestTime === null || elapsed < bestTime) {
        bestTime = elapsed;
        localStorage.setItem("tiltMazeBestTime", String(bestTime));
        bestEl.textContent = "ベスト: " + bestTime.toFixed(1) + "秒（更新！）";
        bestEl.classList.add("new-record");
    } else {
        bestEl.textContent = "ベスト: " + bestTime.toFixed(1) + "秒";
    }
}

//壁
let walls = [
    { x: -20, y:120, w:230, h:16 },
    { x: 90, y:250, w:230, h:16 },
    { x: 40, y:190, w:16, h:90 },
    { x: 100, y:120, w:16, h:100 },
    { x: 40, y:10, w:16, h:60 },//最初の壁
    //{ x: 200, y:10, w:16, h:60 },
    { x: 150, y:70, w:16, h:60 },
    { x: 200, y:50, w:100, h:8 },
];

function hitWall() {
  for (let i = 0; i < walls.length; i++) {
    let w = walls[i];
    if (ball.x > w.x && ball.x < w.x + w.w &&
        ball.y > w.y && ball.y < w.y + w.h) {
      return true;
    }
  }
  return false;
}

//ボタンを押してゲームを開始
document.getElementById("startBtn").addEventListener("click", function() {
    if(isPlaying == false && cleared == false) {
        isPlaying = true;
        startTime = Date.now();
    document.getElementById("startBtn").style.display = "none";//スタートしたら非表示
    }else if (cleared == true) {
        //リトライ時の処理
        isPlaying = true;
        cleared = false;
        startTime = Date.now();
        ball.x = 20;
        ball.y = 20;
        ball.vx = 0;
        ball.vy = 0;
        
        document.getElementById("message").textContent = "";
        document.getElementById("startBtn").style.display = "none";
}
});

// ------------------------------------------------------------
//  STEP 2   描画する
// ------------------------------------------------------------
//  update() は engine が毎フレーム（1秒に約60回）呼び出す。
//  この関数の中身が繰り返し実行される。
//
//      function update() {
//        drawBall(ball.x, ball.y);
//      }
//
//  確認: 画面中央に玉が表示される。まだ動かない。

function update() {
    if (isPlaying == true && cleared == false){

    ball.vx = ball.vx + tilt.x * 0.5;
    ball.vy = ball.vy + tilt.y * 0.5;

    //step8 摩擦
    ball.vx = ball.vx * 0.98;
    ball.vy = ball.vy * 0.98;

    //step3
    //ball.x = ball.x + ball.vx;
    //ball.y = ball.y + ball.vy;

    //衝突
    let prevX = ball.x;
    ball.x = ball.x + ball.vx;
    if (hitWall()) {
      ball.x = prevX;
      ball.vx = -ball.vx * 0.5;
    }
    let prevY = ball.y;
    ball.y = ball.y + ball.vy;
    if (hitWall()) {
      ball.y = prevY;
      ball.vy = -ball.vy * 0.5;
    }

    //速度制限
    if (ball.vx > 100) {
        ball.vx = 100;
    }
    if (ball.vx < -100) {
            ball.vx = -100;
        }
    if (ball.vy > 100) {
        ball.vy = 100;
    }
    if (ball.vy < -100) {
            ball.vy = -100;
        }

    if (ball.x < 20) {
        ball.x = 20;
        ball.vx = -ball.vx * 0.5;
    }
    
    //step6 右側の壁
    if (ball.x > BOARD_W -20) {
        ball.x = BOARD_W -20;
        ball.vx = -ball.vx * 0.5;
    }

    //step7 上下の壁
    if (ball.y < 20) {
        ball.y = 20;
        ball.vy = -ball.vy * 0.5;
    }
    if (ball.y > BOARD_H -20) {
        ball.y = BOARD_H -20;
        ball.vy = -ball.vy * 0.5;
    }
}else {
    ball.vx = 0;
    ball.vy = 0;
}

    //ゴール判定
    let dx = ball.x - goal.x;
    let dy = ball.y - goal.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < goal.r && cleared == false) {
        cleared = true;

        //RETRYに変化
        let btn = document.getElementById("startBtn");
        btn.style.display = "inline-block";
        btn.textContent = "RETRY";

        //お祝い演出（紙吹雪＋ベストタイム更新）
        celebrate((Date.now() - startTime) / 1000);
    }

    if (isPlaying === true && cleared == false) {
        let elapsed = (Date.now() - startTime) / 1000;
        document.getElementById("timer").textContent = elapsed.toFixed(1);
    } else if (cleared === true) {
        document.getElementById("message").textContent = "CLEAR!!";
    }

    /*
    if (dist < goal.r) {
        cleared = true;
    }

    if (cleared === false) {
        let elapsed = (Date.now() - startTime) / 1000;
        document.getElementById("timer").textContent = elapsed.toFixed(1);
    } else {
        document.getElementById("message").textContent = "CLEAR!!";
    }
    */

    //壁の描画
    for (let i = 0; i <walls.length; i++){
        drawWall(walls[i].x, walls[i].y, walls[i].w, walls[i].h);
    }

    drawBall(ball.x, ball.y);
    //drawWall(walls[0].x, walls[0].y, walls[0].w, walls[0].h);
    drawGoal(goal.x, goal.y, goal.r);
}


// ------------------------------------------------------------
//  STEP 3   位置を更新する
// ------------------------------------------------------------
//  update() の中、drawBall() より前に1行足す。
//
//      ball.x = ball.x + 2;
//
//  毎フレーム x が2ずつ増えるので、玉は右へ進む。
//
//  確認: 玉が右へ流れ、そのまま画面外へ出ていく。
//        壁がないので当然こうなる。STEP 5 で閉じ込める。





// ------------------------------------------------------------
//  STEP 4   傾きを加速度として扱う
// ------------------------------------------------------------
//  STEP 3 で直接書いた 2 を、速度 vx に置き換える。
//  さらにその前で、傾きを速度に足し込む。
//
//      ball.vx = ball.vx + tilt.x * 0.5;
//      ball.vy = ball.vy + tilt.y * 0.5;
//
//      ball.x = ball.x + ball.vx;
//      ball.y = ball.y + ball.vy;
//
//  傾き（加速度）を速度に足し、速度を位置に足している。
//  高校物理の v = v0 + at, x = x0 + vt を、
//  t = 1フレーム として離散的に繰り返しているだけ。
//
//  だから傾け続けると加速し続ける。一定速度では動かない。
//
//  確認: 傾ける（矢印キー）と玉が動き、離しても止まらない。
//        0.5 は傾きの効き。あとで好きな値にしてよい。





// ============================================================
//
//  ここから先は自力で書く。
//  コメントは仕様であって、コードではない。
//
// ============================================================


// ------------------------------------------------------------
//  STEP 5   左の壁
// ------------------------------------------------------------
//  update() の中、drawBall() より前に書く。
//
//      もし ball.x が 0 より小さければ
//          ball.x を 0 に戻す
//          ball.vx の符号を反転する
//
//
//  「もし〜ならば」は if で書く。形はこう。
//
//      if (条件) {
//        条件が成り立ったときにやること
//      }
//
//  例）速度が 100 を超えていたら 100 で頭打ちにする
//
//      if (ball.vx > 100) {
//        ball.vx = 100;
//      }
//
//  比較は   <  小さい    >  大きい
//  符号の反転は  ball.vx = -ball.vx;
//
//  確認: 左へ転がすと壁で跳ね返る。





// ------------------------------------------------------------
//  STEP 6   右の壁
// ------------------------------------------------------------
//  右端をはみ出したら、押し戻して反射させる。
//  右端の座標は BOARD_W。
//
//  確認: 右でも跳ね返る。





// ------------------------------------------------------------
//  STEP 7   上下の壁
// ------------------------------------------------------------
//  y と vy、BOARD_H を使う。
//
//  確認: 四方で跳ね返り、玉が盤から出られなくなる。





// ============================================================
//
//  ここからは挙動の調整。正解はない。
//
// ============================================================


// ------------------------------------------------------------
//  STEP 8   反発係数と摩擦
// ------------------------------------------------------------
//  現状は速度が保存されるので永久に跳ね返り続ける。
//  4つの壁すべての反射に反発係数を掛ける。
//
//      ball.vx = -ball.vx * 0.5;
//
//  さらに、毎フレーム速度を一定割合で減らして摩擦を入れる。
//  update() の中、位置の更新より前に書く。
//
//      ball.vx = ball.vx * 0.98;
//      ball.vy = ball.vy * 0.98;
//
//  確認: 傾きを戻すと玉が減速して止まる。
//        反発係数を 0.9 / 0.2、摩擦を 0.90 / 1.00 にすると何が起きるか。





// ============================================================
//
//  発展
//
//    ・玉には半径10がある。壁にめり込んで見えるのを直す
//    ・空気抵抗を速度の2乗に比例させる（今は1次）
//    ・センサー値のノイズが気になる場合、
//      tilt に移動平均やローパスフィルタをかけて滑らかにする
//    ・玉を複数にして、玉どうしの衝突を扱う
//    ・壁ごとに反発係数を変える
//
// ============================================================
