// ⚠️ 본인의 Firebase 프로젝트 설정으로 교체하세요.
// Firebase 콘솔 → 프로젝트 설정 → 일반 → "내 앱"에서 확인 가능
// 기존에 쓰시던 프로젝트(예: dodgeball-efbff)에 새 Realtime Database 경로("/tiball")를
// 추가해서 재사용하셔도 되고, 새 프로젝트를 만드셔도 됩니다.

const firebaseConfig = {
  apiKey: "AIzaSyB8_ABUYRet6Qb1jlcjYGPYRSXJ4MCnRc4",
  authDomain: "dodgeball-efbff.firebaseapp.com",
  databaseURL: "https://dodgeball-efbff-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dodgeball-efbff",
  storageBucket: "dodgeball-efbff.firebasestorage.app",
  messagingSenderId: "375748754364",
  appId: "1:375748754364:web:2a49b5137784a68c6f89b9",
};

// 모든 스코어는 /tiball/scores/{matchId} 경로에 저장됩니다.
// matchId가 day-court-time 조합으로 이미 대회 전체에서 유일하기 때문에
// 초등부/중등부 사이트가 같은 DB를 봐도 서로 다른 경기끼리 겹치지 않습니다.
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const SCORES_PATH = "tiball/scores";
