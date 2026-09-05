// 예선리그 순위 계산
//
// 규칙 (2026-09 팀장님 결정 반영)
// - 승(2점) 무(1점) 패(0점)
// - 일반 3팀조: 승점으로만 순위를 매긴다. 승점이 같으면 자동으로 순위를 가르지 않고
//   "동률"로 표시하며, 운영본부가 수동으로 최종 순위를 확정한다. (score.html의 "순위 확정" 탭)
//   ※ 예전에 쓰던 승률계산법[(득점÷이닝)-(실점÷이닝)]은 이닝이 2.6이닝처럼
//     소수로도 나올 수 있어 오류 소지가 크다는 판단 하에 더 이상 사용하지 않는다.
// - 4팀 1조(남초 7조, 여초 4조)는 2경기제이며, 승점이 같으면
//     1) 최소실점 → 2) 최다득점 순으로 자동 결정 (이닝을 쓰지 않는 규칙이라 그대로 유지)
//   이 규칙으로도 동률이면 마찬가지로 운영본부가 수동 확정한다.
// - 운영본부가 rankOverrides에 순서를 저장해두면, 자동 계산 결과와 무관하게
//   그 순서를 최우선으로 사용한다. (모든 조에 대해 안전판으로 사용 가능)
//
// scoresByMatchId: { [matchId]: { score1, score2, status } }
// group: { type: 'three' | 'four', teamIds: [...] }
// groupMatches: 해당 조에 속한 SCHEDULE 항목들 (stage === 'group')
// teams: 팀 id → 팀 객체 lookup용 배열
// overrideOrder: (optional) 운영본부가 확정한 teamId 순서 배열, 예: [3,1,2]

function calcGroupStandings(group, groupMatches, scoresByMatchId, teams, overrideOrder) {
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
    };
  });

  groupMatches.forEach((m) => {
    const sc = scoresByMatchId[m.id];
    if (!sc || sc.status !== "final") return; // 아직 미입력/미종료 경기는 집계 제외

    const s1 = Number(sc.score1) || 0;
    const s2 = Number(sc.score2) || 0;

    const a = stat[m.team1];
    const b = stat[m.team2];
    if (!a || !b) return;

    a.played++;
    b.played++;
    a.runsFor += s1;
    a.runsAgainst += s2;
    b.runsFor += s2;
    b.runsAgainst += s1;

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

  let list = Object.values(stat);
  let tied = false;

  // 예선 완료 여부: 그 조에 배정된 경기가 전부 '경기 종료' 상태여야 완료로 취급
  // (일부 경기만 끝난 상태에서 우연히 점수가 안 겹쳐 보인다고 미리 확정해버리는 것 방지)
  const complete = groupMatches.every((m) => {
    const sc = scoresByMatchId[m.id];
    return sc && sc.status === "final";
  });

  if (overrideOrder && overrideOrder.length) {
    // 운영본부 수동 확정 순서를 최우선으로 사용 (완료 여부와 무관하게 항상 최우선)
    const byId = {};
    list.forEach((t) => (byId[t.teamId] = t));
    const ordered = overrideOrder.map((id) => byId[id]).filter(Boolean);
    // 혹시 override에 빠진 팀이 있으면 뒤에 붙여줌 (데이터 누락 대비)
    list.forEach((t) => {
      if (!overrideOrder.includes(t.teamId)) ordered.push(t);
    });
    list = ordered;
  } else if (group.type === "four") {
    // 4팀조 예외: 승점 → 최소실점 → 최다득점
    list.sort((x, y) => {
      if (y.points !== x.points) return y.points - x.points;
      if (x.runsAgainst !== y.runsAgainst) return x.runsAgainst - y.runsAgainst;
      return y.runsFor - x.runsFor;
    });
    tied = list.some(
      (t, i) =>
        i > 0 &&
        t.points === list[i - 1].points &&
        t.runsAgainst === list[i - 1].runsAgainst &&
        t.runsFor === list[i - 1].runsFor
    );
  } else {
    // 일반 3팀조: 승점으로만 정렬 (동률은 자동으로 가르지 않음)
    list.sort((x, y) => y.points - x.points);
    tied = list.some((t, i) => i > 0 && t.points === list[i - 1].points);
  }

  list.forEach((t, idx) => (t.rank = idx + 1));
  const isOverride = !!(overrideOrder && overrideOrder.length);

  // 1위 "수학적 확정" 감지: 아직 조의 모든 경기가 안 끝났어도,
  // 남은 경기를 다른 팀들이 전부 이겨도 지금 1위(승점 기준)를 못 따라잡으면
  // 나머지 경기 결과와 무관하게 1위로 확정 취급한다.
  // (예: 3팀조에서 2승을 챙긴 팀은 남은 1경기 결과와 상관없이 항상 1위)
  let rank1Clinched = false;
  if (!isOverride && list.length > 0) {
    const leaderPoints = list[0].points;
    rank1Clinched = list.slice(1).every((t) => {
      const remaining = groupMatches.filter((m) => {
        const involved = m.team1 === t.teamId || m.team2 === t.teamId;
        const sc = scoresByMatchId[m.id];
        return involved && !(sc && sc.status === "final");
      }).length;
      const ceiling = t.points + remaining * 2; // 남은 경기를 전부 이겼을 때의 최대 승점
      return leaderPoints > ceiling;
    });
  }

  return { list, tied: isOverride ? false : tied, isOverride, complete, rank1Clinched };
}

// 조 전체(레벨/성별) 순위표 일괄 계산
// overridesForGroups: { [groupId]: [teamId, ...] } (선택)
function calcAllStandings(groups, scheduleForLevelGender, scoresByMatchId, teams, overridesForGroups) {
  const result = {};
  Object.keys(groups).forEach((groupId) => {
    const group = groups[groupId];
    const groupMatches = scheduleForLevelGender.filter(
      (m) => m.stage === "group" && String(m.groupId) === String(groupId)
    );
    const override = overridesForGroups ? overridesForGroups[groupId] : null;
    result[groupId] = calcGroupStandings(group, groupMatches, scoresByMatchId, teams, override);
  });
  return result;
}
