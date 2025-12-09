// script.js
import { db } from "./firebase.js";

// ===============================
// Firestore importまとめ
// ===============================
import { 
  collection, addDoc, getDocs, 
  doc, setDoc, getDoc, onSnapshot, Timestamp, query, orderBy, limit, where, increment
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ===============================
// メッセージ機能 基盤コード１
// ===============================
const messagesRef = collection(db, "messages");
console.log("messagesコレクション参照を作成しました");


// --- データ構造の説明 ---
// 各メッセージは以下のフィールドを持ちます:
// type: "declaration" or "encourage"  // メッセージ種別
// fromUserId: "user1" or "user2"      // 送信者
// toUserId: "user1" or "user2"        // 受信者
// text: string                        // 本文
// timestamp: Firestore Timestamp      // 送信時刻




$(document).ready(function() {

const $ = window.$;

$(function() {
  // 初期表示：home
  $(".tab_content").removeClass("active");
  $("#home").addClass("active");

  $(".tab_btn").removeClass("active");
  $(".tab_btn[data-target='home']").addClass("active");

  // タブ切替（クラス付け替えのみ）
  $(".tab_btn").on("click", function() {
    const target = $(this).data("target");
    console.log("clicked target:", target);

    const $tab = $("#" + target);

    if ($tab.length === 0) {
      console.error("Tab not found:", target);
      return;
    }

    $(".tab_content").removeClass("active");
    $tab.addClass("active");
    

    $(".tab_btn").removeClass("active");
    $(this).addClass("active");
  });
});



  // --- User1の操作 ---
  $("#user1StartBtn").click(async function() {
    await setDoc(doc(db, "users", "user1"), {
      status: "running",
      startTime: new Date()
    },{merge:true});
    // console.log("User1: Start!");
  });

  $("#user1PauseBtn").click(async function() {
    await setDoc(doc(db, "users", "user1"), {
      status: "paused"
    }, { merge: true });
    // console.log("User1: Pause!");
  });

  $("#user1StopBtn").click(async function() {
    await setDoc(doc(db, "users", "user1"), {
      status: "stopped",
      endTime: new Date()
    }, { merge: true });
    // console.log("User1: Stop!");
  });

  // --- User2側でUser1を監視 ---
  const user1Ref = doc(db, "users", "user1");
  let user1RemoteTimer = null; // 相手側カウンター用
  onSnapshot(user1Ref, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("User2側でUser1の状態を検知:", data);

      // 状態に応じてUIを更新
      if (data.status === "running"&& data.startTime) {
            // 既存タイマーを必ず止めてから新しく開始
      clearInterval(user1RemoteTimer);
      user1RemoteTimer = setInterval(() => {
        let now = dayjs();
        let totalSeconds = now.diff(dayjs(data.startTime.toDate()), "second");

        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;

        let displayText = (hours > 0)
          ? `${hours}時間${minutes}分${seconds}秒`
          : `${minutes}分${seconds}秒`;

        $("#user1StudyTimeDisplay").text(displayText);
      }, 1000);

     //画像ランダム表示開始 　　　　
        if (!user1ImageIntervalId) {
        showRandomImage("user1");
        user1ImageIntervalId = setInterval(() => showRandomImage("user1"), 60000);
       }
      } else if (data.status === "paused") {
        clearInterval(user1RemoteTimer);
        user1RemoteTimer = null;
        $("#user1StudyTimeDisplay").text("休憩中");

      } else if (data.status === "stopped") {
         clearInterval(user1RemoteTimer); 
         user1RemoteTimer = null;


      if (user1ImageIntervalId) {
        clearInterval(user1ImageIntervalId);
        user1ImageIntervalId = null;
      }
      // Firestoreに保存した合計時間を表示
       if (data.totalSeconds !== undefined) {
         let hours = Math.floor(data.totalSeconds / 3600);
         let minutes = Math.floor((data.totalSeconds % 3600) / 60);
         let seconds = data.totalSeconds % 60;

         let displayText = (hours > 0)
           ? `${hours}時間${minutes}分${seconds}秒`
           : `${minutes}分${seconds}秒`;

        $("#user1StudyTimeDisplay").text("学習時間: " + displayText);
      } else {
        $("#user1StudyTimeDisplay").text("User1終了");
      }
    }
   } 
  });
// --- User1側でUser2を監視 ---
const user2Ref = doc(db, "users", "user2");
let user2RemoteTimer = null; // 相手側カウンター用

onSnapshot(user2Ref, (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log("User1側でUser2の状態を検知:", data);

    if (data.status === "running" && data.startTime) {
      // 既存タイマーを必ず止めてから新しく開始
      clearInterval(user2RemoteTimer);
      user2RemoteTimer = setInterval(() => {
        let now = dayjs();
        let totalSeconds = now.diff(dayjs(data.startTime.toDate()), "second");

        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;

        let displayText = (hours > 0)
          ? `${hours}時間${minutes}分${seconds}秒`
          : `${minutes}分${seconds}秒`;

        $("#user2StudyTimeDisplay").text(displayText);
      }, 1000);

      // 画像ランダム表示開始
      if (!user2ImageIntervalId) {
        showRandomImage("user2");
        user2ImageIntervalId = setInterval(() => showRandomImage("user2"), 60000);
      }

    } else if (data.status === "paused") {
      clearInterval(user2RemoteTimer);
      user2RemoteTimer = null;
      $("#user2StudyTimeDisplay").text("休憩中");

    } else if (data.status === "stopped") {
      clearInterval(user2RemoteTimer);
      user2RemoteTimer = null;

      if (user2ImageIntervalId) {
        clearInterval(user2ImageIntervalId);
        user2ImageIntervalId = null;
      }

      if (data.totalSeconds !== undefined) {
        let hours = Math.floor(data.totalSeconds / 3600);
        let minutes = Math.floor((data.totalSeconds % 3600) / 60);
        let seconds = data.totalSeconds % 60;

        let displayText = (hours > 0)
          ? `${hours}時間${minutes}分${seconds}秒`
          : `${minutes}分${seconds}秒`;

        $("#user2StudyTimeDisplay").text("学習時間: " + displayText);
      } else {
        $("#user2StudyTimeDisplay").text("User2終了");
      }
    }
  }
});
  // ===============================
  // 画像配列（30枚を列挙）
  // ===============================
  const images = [
    "img/photo01.jpg", "img/photo02.jpg", "img/photo03.jpg","img/photo04.jpg", "img/photo05.jpg", "img/photo06.jpg",
    "img/photo07.jpg", "img/photo08.jpg", "img/photo09.jpg","img/photo10.jpg", "img/photo11.jpg", "img/photo12.jpg",
    "img/photo13.jpg", "img/photo14.jpg", "img/photo15.jpg","img/photo16.jpg", "img/photo17.jpg", "img/photo18.jpg",
    "img/photo19.jpg", "img/photo20.jpg", "img/photo21.jpg"
    // ... 合計21枚
  ];

  // ===============================
  // ランダム画像表示関数
  // ===============================
  function showRandomImage(userId) {
    const randomIndex = Math.floor(Math.random() * images.length);
    const imgPath = images[randomIndex];
    const $area = $("#" + userId + "StudyImageArea");

    // 自然な切り替え：fadeOut → src変更 → fadeIn
    $area.fadeOut(500, function() {
      $area.html(`<img src="${imgPath}" alt="${userId} image" style="max-width:200px;">`);
      $area.fadeIn(500);
    });
  }

  // ===============================
  // 制御用変数（1分タイマー）
  // ===============================
  let user1ImageIntervalId = null;
  let user2ImageIntervalId = null;






// ここにユーザー1/ユーザー2のタイマー処理をそのまま書く
// （既存のjQuery＋day.jsコードは変更不要）
  // -------------------------------
  // ユーザー1用
  // -------------------------------
  let user1StartTime = null;
  let user1Timer = null;
  let user1AccumulatedSeconds = 0; // 秒単位で累積

  // スタート（開始＋再開）
  $("#user1StartBtn").click(function() {
    if (!user1StartTime) {
      user1StartTime = dayjs();
      console.log("ユーザー1開始/再開: " + user1StartTime.format("HH:mm:ss"));

      // カウンター開始
      user1Timer = setInterval(function() {
        let now = dayjs();
        let totalSeconds = user1AccumulatedSeconds + now.diff(user1StartTime, "second");

        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;

        let displayText = (hours > 0)
          ? `${hours}時間${minutes}分${seconds}秒`
          : `${minutes}分${seconds}秒`;

        $("#user1StudyTimeDisplay").text(displayText);
      }, 1000);
    }

    // 画像ランダム表示
    if (!user1ImageIntervalId) {
    showRandomImage("user1");
    user1ImageIntervalId = setInterval(() => showRandomImage("user1"), 60000);
    }

  });

  // ポーズ
  $("#user1PauseBtn").click(function() {
    if (user1StartTime) {
      let now = dayjs();
      user1AccumulatedSeconds += now.diff(user1StartTime, "second");
      console.log("ユーザー1ポーズ: 累積 " + user1AccumulatedSeconds + "秒");
      clearInterval(user1Timer);
      user1StartTime = null; // ポーズ状態にする
    }
  });

// ===============================
// ユーザー1 Stop処理（累積保存付き）
// ===============================
$("#user1StopBtn").click(async function() {
  if (user1StartTime || user1AccumulatedSeconds > 0) {
    let endTime = dayjs();
    let totalSeconds = user1AccumulatedSeconds;
    if (user1StartTime) {
      totalSeconds += endTime.diff(user1StartTime, "second");
    }

    clearInterval(user1Timer);
    user1StartTime = null;
    user1AccumulatedSeconds = 0;

    // --- 今日の箱に入れる ---
    const todayDate = dayjs().format("YYYY-MM-DD");
    if (!window.user1TodayBox) {
      window.user1TodayBox = { date: todayDate, seconds: 0 };
    }

    if (window.user1TodayBox.date === todayDate) {
      // 同じ日 → 加算
      window.user1TodayBox.seconds += totalSeconds;
    } else {
      // 違う日 → 昨日の確定データを保存
      await setDoc(doc(db, "dailyTotals", "user1_" + window.user1TodayBox.date), {
        userId: "user1",
        date: window.user1TodayBox.date,
        totalSeconds: window.user1TodayBox.seconds
      });
      // 今日の箱を初期化
      window.user1TodayBox = { date: todayDate, seconds: totalSeconds };
    }

    // --- usersコレクションに累積を保存（incrementで安全加算） ---
    const user1Ref = doc(db, "users", "user1");
    await setDoc(user1Ref, {
      status: "stopped",
      endTime: endTime.toDate(),
      totalSeconds: totalSeconds,
      cumulativeSeconds: increment(totalSeconds)
    }, { merge: true });

    // --- sessionsコレクションに履歴保存 ---
    await addDoc(collection(db, "sessions"), {
      userId: "user1",
      totalSeconds: totalSeconds,
      startTime: Timestamp.fromDate(endTime.subtract(totalSeconds, "second").toDate()),
      endTime: Timestamp.fromDate(endTime.toDate()),
      createdAt: Timestamp.fromDate(new Date())
    });

    console.log("Stop処理完了: 今日の合計秒数=", window.user1TodayBox.seconds);
  }
 
  if (user1ImageIntervalId) {
    clearInterval(user1ImageIntervalId);
    user1ImageIntervalId = null;
  }


});
   
// ===============================
// ダッシュボード表示処理（累積はusersから）
// ===============================
async function renderDashboard() {
  console.log("=== ダッシュボード描画開始 ===");

  // --- User1累積 ---
  const user1Ref = doc(db, "users", "user1");
  const user1Snap = await getDoc(user1Ref);
  if (user1Snap.exists()) {
    const data = user1Snap.data();

    // 累積時間 + 累積ポイント
    if (data.cumulativeSeconds !== undefined) {
      const hours = Math.floor(data.cumulativeSeconds / 3600);
      const minutes = Math.floor((data.cumulativeSeconds % 3600) / 60);
      const seconds = data.cumulativeSeconds % 60;
      const displayText = (hours > 0)
        ? `${hours}時間${minutes}分${seconds}秒`
        : `${minutes}分${seconds}秒`;
      $("#totalUser1Time").text(displayText);

      const points = Math.floor(data.cumulativeSeconds / 3600);
      $("#totalUser1Points").text(points + " pt");
    }

    // 今日の学習時間（sessionsから集計）← 必ずこの if の内側に置く
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();
    const sessionsRef = collection(db, "sessions");
    const todayQuery = query(
      sessionsRef,
      where("userId", "==", "user1"),
      where("endTime", ">=", Timestamp.fromDate(todayStart)),
      where("endTime", "<=", Timestamp.fromDate(todayEnd)),
      orderBy("endTime", "desc")
    );
    const todaySnap = await getDocs(todayQuery);
    let todaySeconds = 0;
    todaySnap.forEach(doc => {
      todaySeconds += doc.data().totalSeconds;
    });
    const tHours = Math.floor(todaySeconds / 3600);
    const tMinutes = Math.floor((todaySeconds % 3600) / 60);
    const tSeconds = todaySeconds % 60;
    const todayDisplay = (tHours > 0)
      ? `${tHours}時間${tMinutes}分${tSeconds}秒`
      : `${tMinutes}分${tSeconds}秒`;
    $("#todayUser1Time").text(todayDisplay);

    // 最後の学習から
    if (data.endTime) {
      const elapsedMinutes = dayjs().diff(dayjs(data.endTime.toDate()), "minute");
      $("#lastUser1Elapsed").text(elapsedMinutes + "分前");
    }
  }
 
  // --- User2累積 ---
  const user2Ref = doc(db, "users", "user2");
  const user2Snap = await getDoc(user2Ref);
  if (user2Snap.exists()) {
    const data = user2Snap.data();

    if (data.cumulativeSeconds !== undefined) {
      const hours = Math.floor(data.cumulativeSeconds / 3600);
      const minutes = Math.floor((data.cumulativeSeconds % 3600) / 60);
      const seconds = data.cumulativeSeconds % 60;
      const displayText = (hours > 0)
        ? `${hours}時間${minutes}分${seconds}秒`
        : `${minutes}分${seconds}秒`;
      $("#totalUser2Time").text(displayText);

      const points = Math.floor(data.cumulativeSeconds / 3600);
      $("#totalUser2Points").text(points + " pt");
    }

    // 今日の学習時間
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();
    const sessionsRef = collection(db, "sessions");
    const todayQuery = query(
      sessionsRef,
      where("userId", "==", "user2"),
      where("endTime", ">=", Timestamp.fromDate(todayStart)),
      where("endTime", "<=", Timestamp.fromDate(todayEnd)),
      orderBy("endTime", "desc")
    );
    const todaySnap = await getDocs(todayQuery);
    let todaySeconds = 0;
    todaySnap.forEach(doc => {
      todaySeconds += doc.data().totalSeconds;
    });
    const tHours = Math.floor(todaySeconds / 3600);
    const tMinutes = Math.floor((todaySeconds % 3600) / 60);
    const tSeconds = todaySeconds % 60;
    const todayDisplay = (tHours > 0)
      ? `${tHours}時間${tMinutes}分${tSeconds}秒`
      : `${tMinutes}分${tSeconds}秒`;
    $("#todayUser2Time").text(todayDisplay);
   if (data.endTime) {
      const elapsedMinutes = dayjs().diff(dayjs(data.endTime.toDate()), "minute");
      $("#lastUser2Elapsed").text(elapsedMinutes + "分前");
    }
  }

  console.log("=== ダッシュボード描画完了 ===");

}






// ===============================
// 初回ロード＋リアルタイム更新
// ===============================
const sessionsRef = collection(db, "sessions");
const recentSessionsQuery = query(sessionsRef, orderBy("createdAt", "desc"), limit(10));

(async function() {
  console.log("Firestoreからsessions最新10件取得開始...");
  const querySnapshot = await getDocs(recentSessionsQuery);
  console.log("初回取得: 件数", querySnapshot.size);
  renderDashboard();

  // リアルタイム更新（最新10件のみ監視）
  onSnapshot(recentSessionsQuery, (querySnapshot) => {
    console.log("sessions最新10件更新検知。件数:", querySnapshot.size);
    renderDashboard();
  });
})();
// ===============================
// ユーザー1 宣言ボタン処理
// ===============================
$("#user1DeclareBtn").click(async function () {
  const text = $("#user1CommentInput").val();
  if (text.trim() !== "") {
    await addDoc(messagesRef, {
      type: "declaration",
      fromUserId: "user1",
      toUserId: "all", // 全員に見える
      text: text,
      timestamp: Timestamp.now()
    });
    console.log("User1宣言を送信:", text);
    $("#user1CommentInput").val("");
  } else {
    console.log("User1宣言: 空のテキストは送信されません");
  }
});

// ===============================
// ユーザー1 応援ボタン処理
// ===============================
$("#user1EncourageBtn").click(async function () {
  const text = $("#user1CommentInput").val();
  if (text.trim() !== "") {
    await addDoc(messagesRef, {
      type: "encourage",
      fromUserId: "user1",
      toUserId: "all", // 全員に見える
      text: text,
      timestamp: Timestamp.now()
    });
    console.log("User1応援を送信:", text);
    $("#user1CommentInput").val("");
  } else {
    console.log("User1応援: 空のテキストは送信されません");
  }
});




// -------------------------------
// ユーザー2用
// -------------------------------
let user2StartTime = null;
let user2Timer = null;
let user2AccumulatedSeconds = 0; // 秒単位で累積

// スタート（開始＋再開）
$("#user2StartBtn").click(async function() {
  if (!user2StartTime && !user2Timer) {
    user2StartTime = dayjs();
    console.log("ユーザー2開始/再開: " + user2StartTime.format("HH:mm:ss"));

    // カウンター開始
    user2Timer = setInterval(function() {
      let now = dayjs();
      let totalSeconds = user2AccumulatedSeconds + now.diff(user2StartTime, "second");

      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = totalSeconds % 60;

      let displayText = (hours > 0)
        ? `${hours}時間${minutes}分${seconds}秒`
        : `${minutes}分${seconds}秒`;

      $("#user2StudyTimeDisplay").text(displayText);
    }, 1000);
  }
  // Firestoreに状態を保存（これが抜けていた）
  const user2Ref = doc(db, "users", "user2");
  await setDoc(user2Ref, {
    status: "running",
    startTime: new Date()
  }, { merge: true });

  // 画像ランダム表示開始
  if (!user2ImageIntervalId) {
    showRandomImage("user2");
    user2ImageIntervalId = setInterval(() => showRandomImage("user2"), 60000);
  }


});

// ポーズ
$("#user2PauseBtn").click(async function() {
  if (user2Timer) {
    let now = dayjs();
    user2AccumulatedSeconds += now.diff(user2StartTime, "second");
    console.log("ユーザー2ポーズ: 累積 " + user2AccumulatedSeconds + "秒");
    clearInterval(user2Timer);
    user2Timer = null;
    user2StartTime = null; // ポーズ状態にする

        // Firestoreに paused を反映
    const user2Ref = doc(db, "users", "user2");
    await setDoc(user2Ref, {
      status: "paused",
      accumulatedSeconds: user2AccumulatedSeconds
    }, { merge: true });

    // 画像の1分タイマーも止める（必要なら）
    if (user2ImageIntervalId) {
      clearInterval(user2ImageIntervalId);
      user2ImageIntervalId = null;
    }

  }
});

// ストップ
$("#user2StopBtn").click(async function() {
  if (user2StartTime || user2AccumulatedSeconds > 0) {
    let endTime = dayjs();
    let totalSeconds = user2AccumulatedSeconds;
    if (user2StartTime) {
      totalSeconds += endTime.diff(user2StartTime, "second");
    }

    clearInterval(user2Timer);
    user2Timer = null;
    user2StartTime = null;
    user2AccumulatedSeconds = 0;

        // --- 今日の箱に入れる ---
    const todayDate = dayjs().format("YYYY-MM-DD");
    if (!window.user2TodayBox) {
      window.user2TodayBox = { date: todayDate, seconds: 0 };
    }

    if (window.user2TodayBox.date === todayDate) {
      // 同じ日 → 加算
      window.user2TodayBox.seconds += totalSeconds;
    } else {
      // 違う日 → 昨日の確定データを保存
      await setDoc(doc(db, "dailyTotals", "user2_" + window.user2TodayBox.date), {
        userId: "user2",
        date: window.user2TodayBox.date,
        totalSeconds: window.user2TodayBox.seconds
      });
      // 今日の箱を初期化
      window.user2TodayBox = { date: todayDate, seconds: totalSeconds };
    }
    // --- usersコレクションに累積を保存（incrementで安全加算） ---
    const user2Ref = doc(db, "users", "user2");
    await setDoc(user2Ref, {
      status: "stopped",
      endTime: endTime.toDate(),
      totalSeconds: totalSeconds,
      cumulativeSeconds: increment(totalSeconds)
    }, { merge: true });

    // --- sessionsコレクションに履歴保存 ---
    await addDoc(collection(db, "sessions"), {
      userId: "user2",
      totalSeconds: totalSeconds,
      startTime: Timestamp.fromDate(endTime.subtract(totalSeconds, "second").toDate()),
      endTime: Timestamp.fromDate(endTime.toDate()),
      createdAt: Timestamp.fromDate(new Date())
    });

    console.log("User2 Stop処理完了: 今日の合計秒数=", window.user2TodayBox.seconds);
  }

  if (user2ImageIntervalId) {
    clearInterval(user2ImageIntervalId);
    user2ImageIntervalId = null;
  }

});
// ===============================
// ユーザー2 宣言ボタン処理
// ===============================
$("#user2DeclareBtn").click(async function () {
  const text = $("#user2CommentInput").val();
  if (text.trim() !== "") {
    await addDoc(messagesRef, {
      type: "declaration",
      fromUserId: "user2",
      toUserId: "all",
      text: text,
      timestamp: Timestamp.now()
    });
    console.log("User2宣言を送信:", text);
    $("#user2CommentInput").val("");
  } else {
    console.log("User2宣言: 空のテキストは送信されません");
  }
});

// ===============================
// ユーザー2 応援ボタン処理
// ===============================
$("#user2EncourageBtn").click(async function () {
  const text = $("#user2CommentInput").val();
  if (text.trim() !== "") {
    await addDoc(messagesRef, {
      type: "encourage",
      fromUserId: "user2",
      toUserId: "all",
      text: text,
      timestamp: Timestamp.now()
    });
    console.log("User2応援を送信:", text);
    $("#user2CommentInput").val("");
  } else {
    console.log("User2応援: 空のテキストは送信されません");
  }
});

// ===============================
// メッセージ監視処理（最新10件）
// ===============================
const recentMessagesQuery = query(messagesRef,orderBy("timestamp","desc"), limit(10));

onSnapshot(recentMessagesQuery,(snapshot)=>{
  // 表示領域をクリア
  $("#user1CommentDisplay").empty();
  $("#user1EncourageMessage").empty();
  $("#user2CommentDisplay").empty();
  $("#user2EncourageMessage").empty();
 


  let user1DeclareCount = 0;
  let user2DeclareCount = 0;
  let user1EncourageCount = 0;
  let user2EncourageCount = 0;


 snapshot.forEach((doc) => {
   const data = doc.data();
   const name = (data.fromUserId === "user1")
   ?($("#user1Name").val()||"Asako")
   :($("#user2Name").val()||"Arata");
   const text = data.text;
   const timeStr = dayjs(data.timestamp.toDate()).format("HH:mm:ss");
   const dateTimeStr = dayjs(data.timestamp.toDate()).format("YYYY/MM/DD HH:mm:ss");

   if (data.type === "declaration"){
    // ホーム画面に表示
    if (data.fromUserId ==="user1" && user1DeclareCount < 1){
      $("#user1CommentDisplay").prepend(`<div>${text}(${timeStr})</div>`);
      user1DeclareCount++;
    }
    if (data.fromUserId ==="user2" && user2DeclareCount < 1){
      $("#user2CommentDisplay").prepend(`<div>${text}(${timeStr})</div>`);
      user2DeclareCount++;
    }

   }
  if (data.type=="encourage"){
    // ホーム画面に表示（新しいものを上に）
    if (data.fromUserId === "user1" && user2EncourageCount < 3){
      $("#user2EncourageMessage").prepend(`<div>${text}(${timeStr})</div>`);  
      user2EncourageCount++;
    }
    if (data.fromUserId === "user2" && user1EncourageCount < 3) {
        $("#user1EncourageMessage").prepend(`<div>${text} (${timeStr})</div>`);
        user1EncourageCount++;
      }
  }
 });
});
// ===============================
// 宣言履歴専用監視処理（最新10件）
// ===============================
const declareMessagesQuery = query(
  messagesRef,
  where("type","==", "declaration"),
  orderBy("timestamp", "desc"),

  limit(10)
);

onSnapshot(declareMessagesQuery, (snapshot)=> {
  console.log("宣言履歴 snapshot 発火:", snapshot.size);


   if (snapshot.size === 0) {
    console.log("宣言履歴 snapshot 空 → 表示は維持");
    return; // 空なら何もせず表示を残す
  }

 $("#declareHistory").empty();

  snapshot.forEach((doc)=>{
    const data = doc.data();
    console.log("宣言履歴 doc:", data); // ← 追加

  // ユーザーIDを表示名に変換
  const name = (data.fromUserId === "user1")
    ? "Asako"
    : "Arata";
    const text = data.text;
    const dateTimeStr = dayjs(data.timestamp.toDate()).format("YYYY/MM/DD HH:mm:ss");
        // ダッシュボード履歴 → 宣言のみ最新10件
    $("#declareHistory").append(`<div>${name}:${text} (${dateTimeStr})</div>`);

  });
}) ;



});
// これが全体閉じてる括弧
