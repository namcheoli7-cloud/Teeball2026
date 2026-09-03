// 2026 경기학교스포츠클럽축제(티볼) 전체 시간표
// matchId 규칙: "{day}-{court}-{time}" (day/court/time 조합은 대회 전체에서 유일함)
// level: "elementary" | "middle" | "skip"(여고부 - 별도 사이트 제작 안 함)
// gender: "m" | "f"
// stage: "group"(예선리그) | 그 외(결선토너먼트 - stageLabel 참고)
// group 단계는 team1/team2가 팀 id로 확정되어 있고, 결선 단계는 조 순위로 결정되므로
// team1/team2를 null로 두고 slotLabel(예: "1조1위")로 표기함. 실제 진출팀은 대회 중 심판이 score.html에서 직접 선택 입력.

const SCHEDULE = [
  // ===================== DAY 1 (9/5 토) — 남초 / 여중 / 여고 =====================
  // --- A구장 ---
  { id: "1-A-0900", day: 1, court: "A", time: "09:00", level: "elementary", gender: "m", stage: "group", groupId: 1, team1: 1, team2: 2 },
  { id: "1-A-1000", day: 1, court: "A", time: "10:00", level: "elementary", gender: "m", stage: "group", groupId: 6, team1: 16, team2: 17 },
  { id: "1-A-1100", day: 1, court: "A", time: "11:00", level: "elementary", gender: "m", stage: "group", groupId: 1, team1: 2, team2: 3 },
  { id: "1-A-1200", day: 1, court: "A", time: "12:00", level: "elementary", gender: "m", stage: "group", groupId: 6, team1: 17, team2: 18 },
  { id: "1-A-1300", day: 1, court: "A", time: "13:00", level: "elementary", gender: "m", stage: "group", groupId: 1, team1: 3, team2: 1 },
  { id: "1-A-1400", day: 1, court: "A", time: "14:00", level: "elementary", gender: "m", stage: "group", groupId: 6, team1: 18, team2: 16 },
  { id: "1-A-1500", day: 1, court: "A", time: "15:00", level: "elementary", gender: "m", stage: "final1", stageLabel: "결선 1경기", slotLabel: "1조1위 : 2조1위" },
  { id: "1-A-1600", day: 1, court: "A", time: "16:00", level: "elementary", gender: "m", stage: "semi1", stageLabel: "4강 1경기", slotLabel: "결선1경기 승 : 결선2경기 승" },
  { id: "1-A-1700", day: 1, court: "A", time: "17:00", level: "elementary", gender: "m", stage: "final", stageLabel: "결승", slotLabel: "4강1경기 승 : 4강2경기 승" },

  // --- B구장 ---
  { id: "1-B-0900", day: 1, court: "B", time: "09:00", level: "elementary", gender: "m", stage: "group", groupId: 2, team1: 4, team2: 5 },
  { id: "1-B-1000", day: 1, court: "B", time: "10:00", level: "elementary", gender: "m", stage: "group", groupId: 7, team1: 19, team2: 20 },
  { id: "1-B-1100", day: 1, court: "B", time: "11:00", level: "elementary", gender: "m", stage: "group", groupId: 2, team1: 5, team2: 6 },
  { id: "1-B-1200", day: 1, court: "B", time: "12:00", level: "elementary", gender: "m", stage: "group", groupId: 7, team1: 21, team2: 22 },
  { id: "1-B-1300", day: 1, court: "B", time: "13:00", level: "elementary", gender: "m", stage: "group", groupId: 2, team1: 6, team2: 4 },
  { id: "1-B-1400", day: 1, court: "B", time: "14:00", level: "elementary", gender: "m", stage: "group", groupId: 7, team1: 20, team2: 21 },
  { id: "1-B-1500", day: 1, court: "B", time: "15:00", level: "elementary", gender: "m", stage: "final2", stageLabel: "결선 2경기", slotLabel: "3조1위 : 4조1위" },
  { id: "1-B-1600", day: 1, court: "B", time: "16:00", level: "elementary", gender: "m", stage: "semi2", stageLabel: "4강 2경기", slotLabel: "결선3경기 승 : 7조1위" },

  // --- C구장 ---
  { id: "1-C-0900", day: 1, court: "C", time: "09:00", level: "elementary", gender: "m", stage: "group", groupId: 3, team1: 7, team2: 8 },
  { id: "1-C-1000", day: 1, court: "C", time: "10:00", level: "middle", gender: "f", stage: "group", groupId: 1, team1: 1, team2: 2 },
  { id: "1-C-1100", day: 1, court: "C", time: "11:00", level: "elementary", gender: "m", stage: "group", groupId: 3, team1: 8, team2: 9 },
  { id: "1-C-1200", day: 1, court: "C", time: "12:00", level: "middle", gender: "f", stage: "group", groupId: 1, team1: 2, team2: 3 },
  { id: "1-C-1300", day: 1, court: "C", time: "13:00", level: "elementary", gender: "m", stage: "group", groupId: 3, team1: 9, team2: 7 },
  { id: "1-C-1400", day: 1, court: "C", time: "14:00", level: "elementary", gender: "m", stage: "group", groupId: 7, team1: 22, team2: 19 },
  { id: "1-C-1500", day: 1, court: "C", time: "15:00", level: "elementary", gender: "m", stage: "final3", stageLabel: "결선 3경기", slotLabel: "5조1위 : 6조1위" },

  // --- D구장 ---
  { id: "1-D-0900", day: 1, court: "D", time: "09:00", level: "elementary", gender: "m", stage: "group", groupId: 4, team1: 10, team2: 11 },
  { id: "1-D-1000", day: 1, court: "D", time: "10:00", level: "middle", gender: "f", stage: "group", groupId: 2, team1: 4, team2: 5 },
  { id: "1-D-1100", day: 1, court: "D", time: "11:00", level: "elementary", gender: "m", stage: "group", groupId: 4, team1: 11, team2: 12 },
  { id: "1-D-1200", day: 1, court: "D", time: "12:00", level: "middle", gender: "f", stage: "group", groupId: 2, team1: 5, team2: 6 },
  { id: "1-D-1300", day: 1, court: "D", time: "13:00", level: "elementary", gender: "m", stage: "group", groupId: 4, team1: 12, team2: 10 },
  { id: "1-D-1400", day: 1, court: "D", time: "14:00", level: "middle", gender: "f", stage: "group", groupId: 1, team1: 3, team2: 1 },
  { id: "1-D-1500", day: 1, court: "D", time: "15:00", level: "skip", gender: "f", stage: "semi1", stageLabel: "여고 4강 1경기", slotLabel: "수원농생명과학고 : 안양문화고" },
  { id: "1-D-1600", day: 1, court: "D", time: "16:00", level: "skip", gender: "f", stage: "semi2", stageLabel: "여고 4강 2경기", slotLabel: "안산동산고 : 초월고" },
  { id: "1-D-1700", day: 1, court: "D", time: "17:00", level: "skip", gender: "f", stage: "final", stageLabel: "여고 결승", slotLabel: "4강1경기 승 : 4강2경기 승" },

  // --- E구장 ---
  { id: "1-E-0900", day: 1, court: "E", time: "09:00", level: "elementary", gender: "m", stage: "group", groupId: 5, team1: 13, team2: 14 },
  { id: "1-E-1000", day: 1, court: "E", time: "10:00", level: "middle", gender: "f", stage: "group", groupId: 3, team1: 7, team2: 8 },
  { id: "1-E-1100", day: 1, court: "E", time: "11:00", level: "elementary", gender: "m", stage: "group", groupId: 5, team1: 14, team2: 15 },
  { id: "1-E-1200", day: 1, court: "E", time: "12:00", level: "middle", gender: "f", stage: "group", groupId: 3, team1: 8, team2: 9 },
  { id: "1-E-1300", day: 1, court: "E", time: "13:00", level: "elementary", gender: "m", stage: "group", groupId: 5, team1: 15, team2: 13 },
  { id: "1-E-1400", day: 1, court: "E", time: "14:00", level: "middle", gender: "f", stage: "group", groupId: 2, team1: 6, team2: 4 },
  { id: "1-E-1500", day: 1, court: "E", time: "15:00", level: "middle", gender: "f", stage: "group", groupId: 3, team1: 9, team2: 7 },
  { id: "1-E-1600", day: 1, court: "E", time: "16:00", level: "middle", gender: "f", stage: "finalqual", stageLabel: "결승 진출전", slotLabel: "1조1위 : 2조1위" },
  { id: "1-E-1700", day: 1, court: "E", time: "17:00", level: "middle", gender: "f", stage: "final", stageLabel: "결승", slotLabel: "결승진출전 승 : 3조1위" },

  // ===================== DAY 2 (9/6 일) — 여초 / 남중 =====================
  // --- A구장 ---
  { id: "2-A-0900", day: 2, court: "A", time: "09:00", level: "middle", gender: "m", stage: "group", groupId: 1, team1: 1, team2: 2 },
  { id: "2-A-1000", day: 2, court: "A", time: "10:00", level: "middle", gender: "m", stage: "group", groupId: 4, team1: 10, team2: 11 },
  { id: "2-A-1100", day: 2, court: "A", time: "11:00", level: "middle", gender: "m", stage: "group", groupId: 1, team1: 2, team2: 3 },
  { id: "2-A-1200", day: 2, court: "A", time: "12:00", level: "middle", gender: "m", stage: "group", groupId: 4, team1: 11, team2: 12 },
  { id: "2-A-1300", day: 2, court: "A", time: "13:00", level: "middle", gender: "m", stage: "group", groupId: 1, team1: 3, team2: 1 },
  { id: "2-A-1400", day: 2, court: "A", time: "14:00", level: "middle", gender: "m", stage: "group", groupId: 4, team1: 12, team2: 10 },
  { id: "2-A-1500", day: 2, court: "A", time: "15:00", level: "middle", gender: "m", stage: "semiqual", stageLabel: "4강 진출전", slotLabel: "3조1위 : 4조1위" },
  { id: "2-A-1600", day: 2, court: "A", time: "16:00", level: "middle", gender: "m", stage: "semi1", stageLabel: "4강 1경기", slotLabel: "1조1위 : 2조1위" },
  { id: "2-A-1700", day: 2, court: "A", time: "17:00", level: "middle", gender: "m", stage: "final", stageLabel: "결승", slotLabel: "4강1경기 승 : 4강2경기 승" },

  // --- B구장 ---
  { id: "2-B-0900", day: 2, court: "B", time: "09:00", level: "middle", gender: "m", stage: "group", groupId: 2, team1: 4, team2: 5 },
  { id: "2-B-1000", day: 2, court: "B", time: "10:00", level: "middle", gender: "m", stage: "group", groupId: 5, team1: 13, team2: 14 },
  { id: "2-B-1100", day: 2, court: "B", time: "11:00", level: "middle", gender: "m", stage: "group", groupId: 2, team1: 5, team2: 6 },
  { id: "2-B-1200", day: 2, court: "B", time: "12:00", level: "middle", gender: "m", stage: "group", groupId: 5, team1: 14, team2: 15 },
  { id: "2-B-1300", day: 2, court: "B", time: "13:00", level: "middle", gender: "m", stage: "group", groupId: 2, team1: 6, team2: 4 },
  { id: "2-B-1400", day: 2, court: "B", time: "14:00", level: "middle", gender: "m", stage: "group", groupId: 5, team1: 15, team2: 13 },
  { id: "2-B-1600", day: 2, court: "B", time: "16:00", level: "middle", gender: "m", stage: "semi2", stageLabel: "4강 2경기", slotLabel: "4강진출전 승 : 5조1위" },

  // --- C구장 ---
  { id: "2-C-0900", day: 2, court: "C", time: "09:00", level: "middle", gender: "m", stage: "group", groupId: 3, team1: 7, team2: 8 },
  { id: "2-C-1100", day: 2, court: "C", time: "11:00", level: "middle", gender: "m", stage: "group", groupId: 3, team1: 8, team2: 9 },
  { id: "2-C-1300", day: 2, court: "C", time: "13:00", level: "middle", gender: "m", stage: "group", groupId: 3, team1: 9, team2: 7 },
  { id: "2-C-1400", day: 2, court: "C", time: "14:00", level: "elementary", gender: "f", stage: "group", groupId: 4, team1: 13, team2: 10 },

  // --- D구장 ---
  { id: "2-D-0900", day: 2, court: "D", time: "09:00", level: "elementary", gender: "f", stage: "group", groupId: 1, team1: 1, team2: 2 },
  { id: "2-D-1000", day: 2, court: "D", time: "10:00", level: "elementary", gender: "f", stage: "group", groupId: 3, team1: 7, team2: 8 },
  { id: "2-D-1100", day: 2, court: "D", time: "11:00", level: "elementary", gender: "f", stage: "group", groupId: 1, team1: 2, team2: 3 },
  { id: "2-D-1200", day: 2, court: "D", time: "12:00", level: "elementary", gender: "f", stage: "group", groupId: 3, team1: 8, team2: 9 },
  { id: "2-D-1300", day: 2, court: "D", time: "13:00", level: "elementary", gender: "f", stage: "group", groupId: 1, team1: 3, team2: 1 },
  { id: "2-D-1400", day: 2, court: "D", time: "14:00", level: "elementary", gender: "f", stage: "group", groupId: 3, team1: 9, team2: 7 },
  { id: "2-D-1600", day: 2, court: "D", time: "16:00", level: "elementary", gender: "f", stage: "semi1", stageLabel: "4강 1경기", slotLabel: "1조1위 : 2조1위" },
  { id: "2-D-1700", day: 2, court: "D", time: "17:00", level: "elementary", gender: "f", stage: "final", stageLabel: "결승", slotLabel: "4강1경기 승 : 4강2경기 승" },

  // --- E구장 ---
  { id: "2-E-0900", day: 2, court: "E", time: "09:00", level: "elementary", gender: "f", stage: "group", groupId: 2, team1: 4, team2: 5 },
  { id: "2-E-1000", day: 2, court: "E", time: "10:00", level: "elementary", gender: "f", stage: "group", groupId: 4, team1: 10, team2: 11 },
  { id: "2-E-1100", day: 2, court: "E", time: "11:00", level: "elementary", gender: "f", stage: "group", groupId: 2, team1: 5, team2: 6 },
  { id: "2-E-1200", day: 2, court: "E", time: "12:00", level: "elementary", gender: "f", stage: "group", groupId: 4, team1: 12, team2: 13 },
  { id: "2-E-1300", day: 2, court: "E", time: "13:00", level: "elementary", gender: "f", stage: "group", groupId: 2, team1: 6, team2: 4 },
  { id: "2-E-1400", day: 2, court: "E", time: "14:00", level: "elementary", gender: "f", stage: "group", groupId: 4, team1: 11, team2: 12 },
  { id: "2-E-1600", day: 2, court: "E", time: "16:00", level: "elementary", gender: "f", stage: "semi2", stageLabel: "4강 2경기", slotLabel: "3조1위 : 4조1위" },
];

// 편의 함수: 특정 레벨/성별 경기만 필터
function getMatches(level, gender) {
  return SCHEDULE.filter((m) => m.level === level && m.gender === gender);
}
