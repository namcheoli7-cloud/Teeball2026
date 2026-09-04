// 공용 렌더링 로직. elementary/app.js, middle/app.js에서 LEVEL_CONFIG를 넘겨 initApp() 호출.
//
// LEVEL_CONFIG 예시:
// {
//   key: "elementary",      // SCHEDULE의 level 값과 일치
//   label: "초등부",
//   accent: "#2e7d46",
//   teamsData: TEAMS_ELEMENTARY,  // { male: {...}, female: {...} }
// }

const COURTS = ["A", "B", "C", "D", "E"];
const GENDER_LABEL = { m: "남자부", f: "여자부" };
const GROUP_PASTELS = ["#e5f3e8", "#e4edf8", "#fdf1e1", "#fbe7ed", "#efe4f7", "#e1f5f1", "#f3d98b", "#e8e8f8"];

function updateStickyOffsets() {
  const header = document.querySelector(".site-header");
  const viewTabs = document.querySelector(".view-tabs");
  const dayTabs = document.getElementById("dayTabs");
  if (!header || !viewTabs) return;

  const headerH = header.offsetHeight;
  viewTabs.style.top = headerH + "px";

  const viewTabsH = viewTabs.offsetHeight;
  if (dayTabs) {
    dayTabs.style.top = headerH + viewTabsH + "px";
  }
}
window.addEventListener("resize", updateStickyOffsets);

function initApp(LEVEL_CONFIG) {
  document.documentElement.style.setProperty("--accent", LEVEL_CONFIG.accent);
  document.getElementById("levelTitle").textContent = "2026 경기 티볼 도대회 · " + LEVEL_CONFIG.label;

  const state = { gender: "m", view: "schedule", day: null };
  let scoresByMatchId = {};
  let rankOverrides = {}; // rankOverrides[gender][groupId] = [teamId, ...]

  // 첫 로드시: 이 레벨에 성별별로 매치가 있는 요일을 찾아 기본 day 지정
  function defaultDayFor(gender) {
    const m = SCHEDULE.find((x) => x.level === LEVEL_CONFIG.key && x.gender === gender);
    return m ? m.day : 1;
  }
  state.day = defaultDayFor(state.gender);

  function levelHasGender(gender) {
    return SCHEDULE.some((x) => x.level === LEVEL_CONFIG.key && x.gender === gender);
  }

  // ---------- Firebase 실시간 스코어 / 운영본부 순위확정 구독 ----------
  if (typeof db !== "undefined") {
    db.ref(SCORES_PATH).on("value", (snap) => {
      scoresByMatchId = snap.val() || {};
      renderAll();
    });
    db.ref(`tiball/rankOverrides/${LEVEL_CONFIG.key}`).on("value", (snap) => {
      rankOverrides = snap.val() || {};
      renderAll();
    });
  }

  // ---------- 상단 성별 토글 ----------
  const genderToggle = document.getElementById("genderToggle");
  genderToggle.innerHTML = "";
  ["m", "f"].forEach((g) => {
    if (!levelHasGender(g)) return;
    const btn = document.createElement("button");
    btn.textContent = GENDER_LABEL[g];
    btn.className = g === state.gender ? "active" : "";
    btn.onclick = () => {
      state.gender = g;
      state.day = defaultDayFor(g);
      syncGenderButtons();
      renderAll();
    };
    btn.dataset.gender = g;
    genderToggle.appendChild(btn);
  });
  function syncGenderButtons() {
    [...genderToggle.children].forEach((b) => b.classList.toggle("active", b.dataset.gender === state.gender));
  }

  // ---------- 뷰 탭 ----------
  document.querySelectorAll(".view-tabs button").forEach((btn) => {
    btn.onclick = () => {
      state.view = btn.dataset.view;
      document.querySelectorAll(".view-tabs button").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + state.view));
      renderAll();
    };
  });

  function currentTeamsData() {
    return LEVEL_CONFIG.teamsData[state.gender === "m" ? "male" : "female"];
  }

  function teamName(id) {
    const td = currentTeamsData();
    const t = td.teams.find((x) => x.id === id);
    return t ? t.name : "?";
  }

  function matchesForGender() {
    return SCHEDULE.filter((m) => m.level === LEVEL_CONFIG.key && m.gender === state.gender);
  }

  // 현재 gender의 조별 순위 계산 결과를 캐싱 (여러 뷰에서 재사용)
  let cachedStandingsAll = null;
  function getStandingsAll() {
    if (cachedStandingsAll) return cachedStandingsAll;
    const td = currentTeamsData();
    const genderMatches = matchesForGender();
    const overridesForGender = rankOverrides[state.gender] || {};
    cachedStandingsAll = calcAllStandings(td.groups, genderMatches, scoresByMatchId, td.teams, overridesForGender);
    return cachedStandingsAll;
  }

  // gid조 1위가 확정됐으면 실제 팀명을, 아직(동률 등)이면 "N조 1위"를 반환
  function resolveSeedLabel(gid) {
    const g = getStandingsAll()[gid];
    if (!g) return { text: gid + "조 1위", sub: "", done: false };
    if (g.isOverride || !g.tied) {
      return { text: g.list[0].name, sub: gid + "조 1위 확정", done: true };
    }
    return { text: gid + "조 1위", sub: "예선 진행중", done: false };
  }

  // 종료된 경기의 승리팀명을 반환 (team1Name/team2Name이 저장돼 있어야 함)
  function resolveMatchWinner(matchId) {
    const sc = scoresByMatchId[matchId];
    if (!sc || sc.status !== "final") return null;
    const n1 = sc.team1Name,
      n2 = sc.team2Name;
    if (!n1 && !n2) return null;
    const s1 = Number(sc.score1) || 0;
    const s2 = Number(sc.score2) || 0;
    if (s1 === s2) return null;
    return s1 > s2 ? n1 : n2;
  }

  // 결선 경기(m)의 두 참가팀명을 feedsFrom을 따라가며 자동으로 해석 (확정 안 됐으면 null)
  function resolveMatchSides(m) {
    if (!m.feedsFrom || m.feedsFrom.length !== 2) return [null, null];
    return m.feedsFrom.map((f) => {
      if (f.indexOf("group:") === 0) {
        const r = resolveSeedLabel(Number(f.split(":")[1]));
        return r.done ? r.text : null;
      }
      const feederMatch = SCHEDULE.find((x) => x.level === LEVEL_CONFIG.key && x.gender === state.gender && x.stage === f);
      return feederMatch ? resolveMatchWinner(feederMatch.id) : null;
    });
  }

  // ---------- 시간표 ----------
  function renderSchedule() {
    const all = matchesForGender();
    const days = [...new Set(all.map((m) => m.day))].sort();

    const dayTabsEl = document.getElementById("dayTabs");
    dayTabsEl.innerHTML = "";
    days.forEach((d) => {
      const b = document.createElement("button");
      b.textContent = "9월 " + (d === 1 ? "5일(토) · 1일차" : "6일(일) · 2일차");
      b.className = d === state.day ? "active" : "";
      b.onclick = () => {
        state.day = d;
        renderSchedule();
      };
      dayTabsEl.appendChild(b);
    });

    const dayMatches = all.filter((m) => m.day === state.day);
    const times = [...new Set(dayMatches.map((m) => m.time))].sort();

    const wrap = document.getElementById("scheduleTable");
    // 실시간 업데이트로 다시 그릴 때 스크롤 위치가 리셋되지 않도록 저장해둠
    const prevScroll = wrap.querySelector(".schedule-scroll");
    const savedScrollLeft = prevScroll ? prevScroll.scrollLeft : 0;
    const savedScrollTop = prevScroll ? prevScroll.scrollTop : 0;

    if (times.length === 0) {
      wrap.innerHTML = '<div class="empty-state">해당 일자에 경기가 없습니다.</div>';
      return;
    }

    let html = '<div class="schedule-scroll"><table class="schedule"><colgroup><col class="time-col">';
    COURTS.forEach(() => (html += '<col class="court-col">'));
    html += '</colgroup><thead><tr><th>시간</th>';
    COURTS.forEach((c) => (html += `<th>${c}구장</th>`));
    html += "</tr></thead><tbody>";

    times.forEach((t) => {
      html += `<tr><td class="time">${t}</td>`;
      COURTS.forEach((c) => {
        const m = dayMatches.find((x) => x.court === c && x.time === t);
        if (!m) {
          html += '<td class="empty"></td>';
          return;
        }
        html += `<td class="match" data-match="${m.id}"${m.stage === "group" ? ` style="background:${GROUP_PASTELS[(m.groupId - 1) % GROUP_PASTELS.length]}"` : ""}>${matchCellHtml(m)}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table></div>";
    wrap.innerHTML = html;

    // 스크롤 위치 복원 (요일이 바뀐 경우가 아니라면 이전 위치 그대로 유지)
    const newScroll = wrap.querySelector(".schedule-scroll");
    if (newScroll && (savedScrollLeft || savedScrollTop)) {
      newScroll.scrollLeft = savedScrollLeft;
      newScroll.scrollTop = savedScrollTop;
    }
  }

  function matchCellHtml(m) {
    const sc = scoresByMatchId[m.id];
    let side1Text = null,
      side2Text = null,
      autoResolved = false;

    if (m.stage === "group") {
      side1Text = teamName(m.team1);
      side2Text = teamName(m.team2);
    } else if (sc && sc.team1Name && sc.team2Name) {
      side1Text = sc.team1Name;
      side2Text = sc.team2Name;
    } else {
      const [r1, r2] = resolveMatchSides(m);
      if (r1 && r2) {
        side1Text = r1;
        side2Text = r2;
        autoResolved = true;
      }
    }

    const stageTag = m.stage !== "group" ? `<span class="match-stage">${m.stageLabel}</span>` : "";

    let win1 = "",
      win2 = "";
    if (sc && sc.status === "final") {
      const s1 = Number(sc.score1) || 0;
      const s2 = Number(sc.score2) || 0;
      if (s1 > s2) win1 = " winner";
      else if (s2 > s1) win2 = " winner";
    }

    let body;
    if (side1Text !== null && side2Text !== null) {
      body = `<span class="match-side${win1}">${side1Text}</span> : <span class="match-side${win2}">${side2Text}</span>`;
    } else {
      body = m.slotLabel || "";
    }

    let scoreLine = "";
    if (sc && sc.status && sc.status !== "pending") {
      const statusTxt = sc.status === "progress" ? " (진행중)" : "";
      scoreLine = `<span class="match-score">${sc.score1 ?? "-"} : ${sc.score2 ?? "-"}${statusTxt}</span>`;
    }
    const autoTag = autoResolved ? `<span class="match-note">(예정 · 예선확정)</span>` : "";
    const note = m.note ? `<span class="match-note">${m.note}</span>` : "";
    return `${stageTag}<span class="match-teams">${body}</span>${autoTag}${note}${scoreLine}`;
  }

  // ---------- 예선 순위표 ----------
  function renderStandings() {
    const td = currentTeamsData();
    const genderMatches = matchesForGender();
    const overridesForGender = rankOverrides[state.gender] || {};
    const all = calcAllStandings(td.groups, genderMatches, scoresByMatchId, td.teams, overridesForGender);

    let html = "";
    Object.keys(td.groups)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((gid) => {
        const group = td.groups[gid];
        const { list: rows, tied, isOverride } = all[gid];
        html += `<div class="group-block"><h3>${gid}조</h3>`;

        if (group.type === "four") {
          html += `<div class="group-note">4팀조 · 2경기제 · 동률 시 최소실점→최다득점 순</div>`;
        } else {
          html += `<div class="group-note">승점으로만 순위를 매깁니다</div>`;
        }
        if (isOverride) {
          html += `<div class="group-note confirmed">✓ 운영본부가 확정한 순위입니다</div>`;
        } else if (tied) {
          html += `<div class="group-note warn">⚠ 승점 동률 — 운영본부 확인 후 순위가 확정됩니다</div>`;
        }

        html += `<table class="standings"><thead><tr><th>순위</th><th style="text-align:left">팀</th><th>승</th><th>무</th><th>패</th><th>득실</th><th>승점</th></tr></thead><tbody>`;
        rows.forEach((r) => {
          html += `<tr class="rank-${r.rank}"><td>${r.rank}</td><td class="name">${r.name}</td><td>${r.win}</td><td>${r.draw}</td><td>${r.loss}</td><td>${r.runsFor}:${r.runsAgainst}</td><td>${r.points}</td></tr>`;
        });
        html += "</tbody></table></div>";
      });
    document.getElementById("standingsWrap").innerHTML = html;
  }

  // ---------- 토너먼트 브래킷 (다이어그램) ----------
  const BRACKET_COL_W = 200;
  const BRACKET_ROW_H = 70;
  const BRACKET_BOX_W = 172;

  function buildBracketLayout() {
    const bracketMatches = matchesForGender().filter((m) => m.stage !== "group");
    const nodes = {};
    const groupIds = new Set();
    bracketMatches.forEach((m) => {
      (m.feedsFrom || []).forEach((f) => {
        if (f.indexOf("group:") === 0) groupIds.add(Number(f.split(":")[1]));
      });
    });
    const sortedGroups = [...groupIds].sort((a, b) => a - b);
    sortedGroups.forEach((gid, i) => {
      nodes["group:" + gid] = { id: "group:" + gid, type: "seed", groupId: gid, col: 0, row: i };
    });

    const remaining = bracketMatches.slice();
    let guard = 0;
    while (remaining.length && guard < 50) {
      guard++;
      const idx = remaining.findIndex((m) => (m.feedsFrom || []).every((f) => nodes[f]));
      if (idx === -1) break;
      const m = remaining.splice(idx, 1)[0];
      const feederNodes = (m.feedsFrom || []).map((f) => nodes[f]);
      const col = feederNodes.length ? 1 + Math.max(...feederNodes.map((n) => n.col)) : 0;
      const row = feederNodes.length ? feederNodes.reduce((s, n) => s + n.row, 0) / feederNodes.length : 0;
      nodes[m.stage] = { id: m.stage, type: "match", match: m, col, row };
    }

    // 후처리: 시드(조1위)가 대회 결선 결과와 짝지어지는 경우(부전승 성격),
    // 시드를 상대 매치와 같은 라운드(열)로 당겨와서 대진선이 자연스럽게 이어지도록 조정
    Object.values(nodes).forEach((n) => {
      if (n.type !== "match") return;
      const feeders = (n.match.feedsFrom || []).map((f) => nodes[f]);
      if (feeders.length !== 2) return;
      const seed = feeders.find((f) => f && f.type === "seed");
      const matchFeeder = feeders.find((f) => f && f.type === "match");
      if (seed && matchFeeder && seed.col < matchFeeder.col) {
        seed.col = matchFeeder.col;
        seed.row = matchFeeder.row + 1;
        n.row = (matchFeeder.row + seed.row) / 2;
      }
    });

    return nodes;
  }

  function renderBracket() {
    const nodes = buildBracketLayout();
    const nodeList = Object.values(nodes);
    if (!nodeList.length) {
      document.getElementById("bracketWrap").innerHTML = '<div class="empty-state">토너먼트 경기 정보가 없습니다.</div>';
      return;
    }

    const maxCol = Math.max(...nodeList.map((n) => n.col));
    const maxRow = Math.max(...nodeList.map((n) => n.row));
    const width = (maxCol + 1) * BRACKET_COL_W + 20;
    const height = (maxRow + 1) * BRACKET_ROW_H + 40;

    function px(n) {
      return { x: n.col * BRACKET_COL_W + 10, y: n.row * BRACKET_ROW_H + 20 };
    }

    // 각 노드가 화면에 표시할 라벨/서브라벨/완료여부 계산
    function nodeDisplay(n) {
      if (n.type === "seed") return resolveSeedLabel(n.groupId);
      const m = n.match;
      const sides = (m.feedsFrom || []).map((f) => {
        if (f.indexOf("group:") === 0) return resolveSeedLabel(Number(f.split(":")[1])).text;
        const feederNode = nodes[f];
        const winner = feederNode ? resolveMatchWinner(feederNode.match.id) : null;
        return winner || (feederNode ? feederNode.match.stageLabel + " 승" : "");
      });
      const sc = scoresByMatchId[m.id];
      let scoreText = "";
      let winnerIdx = -1;
      if (sc && sc.status && sc.status !== "pending") {
        scoreText = `${sc.score1 ?? "-"} : ${sc.score2 ?? "-"}`;
        if (sc.status === "final") {
          const s1 = Number(sc.score1) || 0,
            s2 = Number(sc.score2) || 0;
          if (s1 > s2) winnerIdx = 0;
          else if (s2 > s1) winnerIdx = 1;
        }
      }
      return { sides, scoreText, winnerIdx, stageLabel: m.stageLabel };
    }

    // 연결선(SVG) 생성
    let linesHtml = "";
    nodeList.forEach((n) => {
      if (n.type !== "match") return;
      const to = px(n);
      const toY = to.y + 20; // 박스 세로 중앙 대략치
      (n.match.feedsFrom || []).forEach((f) => {
        const feederNode = nodes[f];
        if (!feederNode) return;
        const from = px(feederNode);
        const fromX = from.x + BRACKET_BOX_W;
        const fromY = from.y + 20;
        const toX = to.x;
        const midX = fromX + (toX - fromX) / 2;
        linesHtml += `<path d="M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}" fill="none" stroke="var(--line)" stroke-width="2"/>`;
      });
    });

    // 노드(박스) HTML 생성
    let boxesHtml = "";
    nodeList.forEach((n) => {
      const pos = px(n);
      if (n.type === "seed") {
        const d = nodeDisplay(n);
        boxesHtml += `<div class="bx-seed ${d.done ? "done" : ""}" style="left:${pos.x}px; top:${pos.y}px; width:${BRACKET_BOX_W}px;">
          <div class="bx-seed-name">${d.text}</div>
          <div class="bx-seed-sub">${d.sub}</div>
        </div>`;
      } else {
        const d = nodeDisplay(n);
        const side0Cls = d.winnerIdx === 0 ? "win" : "";
        const side1Cls = d.winnerIdx === 1 ? "win" : "";
        boxesHtml += `<div class="bx-match" style="left:${pos.x}px; top:${pos.y}px; width:${BRACKET_BOX_W}px;">
          <div class="bx-match-stage">${d.stageLabel}</div>
          <div class="bx-match-side ${side0Cls}">${d.sides[0] || ""}</div>
          <div class="bx-match-side ${side1Cls}">${d.sides[1] || ""}</div>
          ${d.scoreText ? `<div class="bx-match-score">${d.scoreText}</div>` : ""}
        </div>`;
      }
    });

    const html = `
      <div class="bracket-scroll">
        <div class="bracket-canvas" style="width:${width}px; height:${height}px;">
          <svg width="${width}" height="${height}" style="position:absolute; top:0; left:0;">${linesHtml}</svg>
          ${boxesHtml}
        </div>
      </div>
    `;
    document.getElementById("bracketWrap").innerHTML = html;
  }

  function renderAll() {
    cachedStandingsAll = null;
    if (state.view === "schedule") renderSchedule();
    if (state.view === "standings") renderStandings();
    if (state.view === "bracket") renderBracket();
    requestAnimationFrame(updateStickyOffsets);
  }

  // ---------- 구장위치 보기 모달 ----------
  const venueBtn = document.getElementById("venueBtn");
  const venueModal = document.getElementById("venueModal");
  const venueClose = document.getElementById("venueClose");
  if (venueBtn && venueModal) {
    venueBtn.onclick = () => venueModal.classList.add("open");
    if (venueClose) venueClose.onclick = () => venueModal.classList.remove("open");
    venueModal.onclick = (e) => {
      if (e.target === venueModal) venueModal.classList.remove("open");
    };
  }

  renderAll();
}
