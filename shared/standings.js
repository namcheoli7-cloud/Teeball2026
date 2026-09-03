// 예선리그 순위 계산
//
// 규칙(대표자회의 자료 기준)
// - 승(2점) 무(1점) 패(0점)
// - 승점 동률 시: 승률계산법 = (득점 ÷ 이닝) - (실점 ÷ 이닝)  → 값이 큰 팀이 상위
// - 단, 4팀 1조(남초 7조, 여초 4조)는 2경기제이며, 동률 시
//     1) 승점 → 2) 최소실점 → 3) 최다득점  순으로 결정 (승률계산법 미적용)
//
// scoresByMatchId: { [matchId]: { score1, score2, innings1, innings2, status } }
// group: { type: 'three' | 'four', teamIds: [...] }
// groupMatches: 해당 조에 속한 SCHEDULE 항목들 (stage === 'group')
// teams: 팀 id → 팀 객체 lookup용 배열

function calcGroupStandings(group, groupMatches, scoresByMatchId, teams) {
  const teamMap = {};
  teams.forEach((t) => (teamMap[t.id] = t));

  const stat = {};
  group.teamIds.forEach((id) => {
    stat[id] = {
      teamId: id,
      name: teamMap[id] ? teamMap[id].name : `#${id}`,
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      points: 0,
      runsFor: 0,
      runsAgainst: 0,
      inningsFor: 0,
      inningsAgainst: 0,
    };
  });

  groupMatches.forEach((m) => {
    const sc = scoresByMatchId[m.id];
    if (!sc || sc.status !== "final") return; // 아직 미입력/미종료 경기는 집계 제외

    const s1 = Number(sc.score1) || 0;
    const s2 = Number(sc.score2) || 0;
    const i1 = Number(sc.innings1) || 3;
    const i2 = Number(sc.innings2) || 3;

    const a = stat[m.team1];
    const b = stat[m.team2];
    if (!a || !b) return;

    a.played++;
    b.played++;
    a.runsFor += s1;
    a.runsAgainst += s2;
    a.inningsFor += i1;
    a.inningsAgainst += i2;
    b.runsFor += s2;
    b.runsAgainst += s1;
    b.inningsFor += i2;
    b.inningsAgainst += i1;

    if (s1 > s2) {
      a.win++;
      a.points += 2;
      b.loss++;
    } else if (s1 < s2) {
      b.win++;
      b.points += 2;
      a.loss++;
    } else {
      a.draw++;
      b.draw++;
      a.points += 1;
      b.points += 1;
    }
  });

  const list = Object.values(stat);

  list.forEach((t) => {
    // 승률계산법: (득점합 ÷ 이닝합) - (실점합 ÷ 이닝합)
    t.winRateDiff =
      (t.inningsFor > 0 ? t.runsFor / t.inningsFor : 0) -
      (t.inningsAgainst > 0 ? t.runsAgainst / t.inningsAgainst : 0);
  });

  if (group.type === "four") {
    // 4팀조 예외: 승점 → 최소실점 → 최다득점
    list.sort((x, y) => {
      if (y.points !== x.points) return y.points - x.points;
      if (x.runsAgainst !== y.runsAgainst) return x.runsAgainst - y.runsAgainst; // 최소실점
      return y.runsFor - x.runsFor; // 최다득점
    });
  } else {
    // 일반 3팀조: 승점 → 승률계산법
    list.sort((x, y) => {
      if (y.points !== x.points) return y.points - x.points;
      return y.winRateDiff - x.winRateDiff;
    });
  }

  list.forEach((t, idx) => (t.rank = idx + 1));
  return list;
}

// 조 전체(레벨/성별) 순위표 일괄 계산
function calcAllStandings(groups, scheduleForLevelGender, scoresByMatchId, teams) {
  const result = {};
  Object.keys(groups).forEach((groupId) => {
    const group = groups[groupId];
    const groupMatches = scheduleForLevelGender.filter(
      (m) => m.stage === "group" && String(m.groupId) === String(groupId)
    );
    result[groupId] = calcGroupStandings(group, groupMatches, scoresByMatchId, teams);
  });
  return result;
}
