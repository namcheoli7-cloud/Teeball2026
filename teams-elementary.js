// 2026 경기학교스포츠클럽축제(티볼) - 초등부 팀 명단 / 조편성
// male: 남자초등부 22팀 (7조, 7조는 4팀조)
// female: 여자초등부 13팀 (4조, 4조는 4팀조)

const TEAMS_ELEMENTARY = {
  male: {
    label: "남자초등부",
    teams: [
      { id: 1, name: "중동초", region: "부천" },
      { id: 2, name: "청계초", region: "화성오산" },
      { id: 3, name: "고천초", region: "군포의왕" },
      { id: 4, name: "자유초", region: "파주" },
      { id: 5, name: "회룡초", region: "의정부" },
      { id: 6, name: "정교초", region: "포천" },
      { id: 7, name: "해솔초", region: "안산" },
      { id: 8, name: "한울초", region: "시흥" },
      { id: 9, name: "옥천초", region: "양평" },
      { id: 10, name: "여흥초", region: "여주" },
      { id: 11, name: "오현초", region: "수원" },
      { id: 12, name: "장내초", region: "구리남양주" },
      { id: 13, name: "한류초", region: "고양" },
      { id: 14, name: "모산초", region: "평택" },
      { id: 15, name: "동백초", region: "용인" },
      { id: 16, name: "안현초", region: "광명" },
      { id: 17, name: "유현초", region: "김포" },
      { id: 18, name: "연현초", region: "안양과천" },
      { id: 19, name: "공도초", region: "안성" },
      { id: 20, name: "청아초", region: "광주하남" },
      { id: 21, name: "신둔초", region: "이천" },
      { id: 22, name: "도촌초", region: "성남" },
    ],
    // 그룹별 소속 팀 id, type: 'three'(3팀조, 라운드로빈 3경기) | 'four'(4팀조, 예외규칙 2경기제)
    groups: {
      1: { type: "three", teamIds: [1, 2, 3] },
      2: { type: "three", teamIds: [4, 5, 6] },
      3: { type: "three", teamIds: [7, 8, 9] },
      4: { type: "three", teamIds: [10, 11, 12] },
      5: { type: "three", teamIds: [13, 14, 15] },
      6: { type: "three", teamIds: [16, 17, 18] },
      7: { type: "four", teamIds: [19, 20, 21, 22] },
    },
    // 결선토너먼트 진행 방식(참고용 설명 - 실제 대진은 schedule.js의 stage로 연결됨)
    bracketNote:
      "결선1(1조1위:2조1위) → 4강1(결선1승:결선2승) / 결선2(3조1위:4조1위)+결선3(5조1위:6조1위) → 4강2(결선3승:7조1위) → 결승",
  },

  female: {
    label: "여자초등부",
    teams: [
      { id: 1, name: "정왕초", region: "시흥" },
      { id: 2, name: "연현초", region: "안양과천" },
      { id: 3, name: "해창초", region: "평택" },
      { id: 4, name: "태안초", region: "화성오산" },
      { id: 5, name: "강천초", region: "여주" },
      { id: 6, name: "옥천초", region: "양평" },
      { id: 7, name: "송정초", region: "이천" },
      { id: 8, name: "중앙초", region: "안산" },
      { id: 9, name: "오현초", region: "수원" },
      { id: 10, name: "충현초", region: "광명" },
      { id: 11, name: "태성초", region: "광주하남" },
      { id: 12, name: "공도초", region: "안성" },
      { id: 13, name: "오금초", region: "군포의왕" },
    ],
    groups: {
      1: { type: "three", teamIds: [1, 2, 3] },
      2: { type: "three", teamIds: [4, 5, 6] },
      3: { type: "three", teamIds: [7, 8, 9] },
      4: { type: "four", teamIds: [10, 11, 12, 13] },
    },
    bracketNote: "4강1(1조1위:2조1위) / 4강2(3조1위:4조1위) → 결승",
  },
};
