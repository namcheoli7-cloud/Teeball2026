// 2026 경기학교스포츠클럽축제(티볼) - 중등부 팀 명단 / 조편성
// male: 남자중등부 15팀 (5조, 모두 3팀조)
// female: 여자중등부 9팀 (3조, 모두 3팀조)

const TEAMS_MIDDLE = {
  male: {
    label: "남자중등부",
    teams: [
      { id: 1, name: "동구중", region: "구리남양주" },
      { id: 2, name: "이천사동중", region: "이천" },
      { id: 3, name: "매양중", region: "광주하남" },
      { id: 4, name: "신원중", region: "고양" },
      { id: 5, name: "예당중", region: "화성오산" },
      { id: 6, name: "매탄중", region: "수원" },
      { id: 7, name: "야탑중", region: "성남" },
      { id: 8, name: "배곧해솔중", region: "시흥" },
      { id: 9, name: "의왕부곡중", region: "군포의왕" },
      { id: 10, name: "원곡중", region: "안산" },
      { id: 11, name: "심학중", region: "파주" },
      { id: 12, name: "어정중", region: "용인" },
      { id: 13, name: "한광중", region: "평택" },
      { id: 14, name: "광명북중", region: "광명" },
      { id: 15, name: "과천중", region: "안양과천" },
    ],
    groups: {
      1: { type: "three", teamIds: [1, 2, 3] },
      2: { type: "three", teamIds: [4, 5, 6] },
      3: { type: "three", teamIds: [7, 8, 9] },
      4: { type: "three", teamIds: [10, 11, 12] },
      5: { type: "three", teamIds: [13, 14, 15] },
    },
    bracketNote:
      "4강진출전(3조1위:4조1위) → 4강2(4강진출전승:5조1위) / 4강1(1조1위:2조1위) → 결승",
  },

  female: {
    label: "여자중등부",
    teams: [
      { id: 1, name: "이천사동중", region: "이천" },
      { id: 2, name: "안양중", region: "안양과천" },
      { id: 3, name: "정왕중", region: "시흥" },
      { id: 4, name: "수현중", region: "화성오산" },
      { id: 5, name: "어정중", region: "용인" },
      { id: 6, name: "세교중", region: "평택" },
      { id: 7, name: "신원중", region: "고양" },
      { id: 8, name: "남문중", region: "동두천양주" },
      { id: 9, name: "율전중", region: "수원" },
    ],
    groups: {
      1: { type: "three", teamIds: [1, 2, 3] },
      2: { type: "three", teamIds: [4, 5, 6] },
      3: { type: "three", teamIds: [7, 8, 9] },
    },
    bracketNote: "결승진출전(1조1위:2조1위) → 결승(결승진출전승:3조1위)",
  },
};
