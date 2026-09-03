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

function updateStickyOffsets() {
  const header = document.querySelector(".site-header");
  const viewTabs = document.querySelector(".view-tabs");
  const dayTabs = document.getElementById("dayTabs");
  if (!header || !viewTabs) return;

  const headerH = header.offsetHeight;
  viewTabs.style.top = headerH + "px";

  const viewTabsH = viewTabs.offsetHeight;
  let dayTabsH = 0;
  if (dayTabs) {
    dayTabs.style.top = headerH + viewTabsH + "px";
    dayTabsH = dayTabs.offsetHeight;
  }

  const theadTop = headerH + viewTabsH + dayTabsH;
  document.querySelectorAll("table.schedule thead th").forEach((th) => {
    th.style.top = theadTop + "px";
  });
}
window.addEventListener("resize", updateStickyOffsets);

function initApp(LEVEL_CONFIG) {
  document.documentElement.style.setProperty("--accent", LEVEL_CONFIG.accent);
  document.getElementById("levelTitle").textContent = "2026 경기 티볼 도대회 · " + LEVEL_CONFIG.label;

  const state = { gender: "m", view: "schedule", day: null };
  let scoresByMatchId = {};

  // 첫 로드시: 이 레벨에 성별별로 매치가 있는 요일을 찾아 기본 day 지정
  function defaultDayFor(gender) {
    const m = SCHEDULE.find((x) => x.level === LEVEL_CONFIG.key && x.gender === gender);
    return m ? m.day : 1;
  }
  state.day = defaultDayFor(state.gender);

  function levelHasGender(gender) {
    return SCHEDULE.some((x) => x.level === LEVEL_CONFIG.key && x.gender === gender);
  }

  // ---------- Firebase 실시간 스코어 구독 ----------
  if (typeof db !== "undefined") {
    db.ref(SCORES_PATH).on("value", (snap) => {
      scoresByMatchId = snap.val() || {};
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
        html += `<td class="match" data-match="${m.id}">${matchCellHtml(m)}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table></div>";
    wrap.innerHTML = html;
  }

  function matchCellHtml(m) {
    let stageTag = "";
    let body = "";
    if (m.stage === "group") {
      body = `${teamName(m.team1)} : ${teamName(m.team2)}`;
    } else {
      stageTag = `<span class="match-stage">${m.stageLabel}</span>`;
      body = m.slotLabel || "";
    }
    let scoreLine = "";
    const sc = scoresByMatchId[m.id];
    if (sc && sc.status && sc.status !== "pending") {
      const statusTxt = sc.status === "progress" ? " (진행중)" : "";
      scoreLine = `<span class="match-score">${sc.score1 ?? "-"} : ${sc.score2 ?? "-"}${statusTxt}</span>`;
    }
    const note = m.note ? `<span class="match-note">${m.note}</span>` : "";
    return `${stageTag}<span class="match-teams">${body}</span>${note}${scoreLine}`;
  }

  // ---------- 예선 순위표 ----------
  function renderStandings() {
    const td = currentTeamsData();
    const genderMatches = matchesForGender();
    const all = calcAllStandings(td.groups, genderMatches, scoresByMatchId, td.teams);

    let html = "";
    Object.keys(td.groups)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((gid) => {
        const group = td.groups[gid];
        const rows = all[gid];
        html += `<div class="group-block"><h3>${gid}조</h3>`;
        if (group.type === "four") {
          html += `<div class="group-note">4팀조 · 2경기제 · 동률 시 승점→최소실점→최다득점 순</div>`;
        } else {
          html += `<div class="group-note">동률 시 승률계산법[(득점÷이닝)-(실점÷이닝)] 순</div>`;
        }
        html += `<table class="standings"><thead><tr><th>순위</th><th style="text-align:left">팀</th><th>승</th><th>무</th><th>패</th><th>득실</th><th>승점</th></tr></thead><tbody>`;
        rows.forEach((r) => {
          html += `<tr class="rank-${r.rank}"><td>${r.rank}</td><td class="name">${r.name}</td><td>${r.win}</td><td>${r.draw}</td><td>${r.loss}</td><td>${r.runsFor}:${r.runsAgainst}</td><td>${r.points}</td></tr>`;
        });
        html += "</tbody></table></div>";
      });
    document.getElementById("standingsWrap").innerHTML = html;
  }

  // ---------- 토너먼트 브래킷 ----------
  function renderBracket() {
    const td = currentTeamsData();
    const genderMatches = matchesForGender().filter((m) => m.stage !== "group");
    genderMatches.sort((a, b) => (a.day - b.day) || a.time.localeCompare(b.time));

    let html = "";
    genderMatches.forEach((m) => {
      const sc = scoresByMatchId[m.id];
      let scoreHtml = "";
      if (sc && sc.status && sc.status !== "pending") {
        const statusTxt = sc.status === "progress" ? " (진행중)" : "";
        scoreHtml = `<span class="score">${sc.score1 ?? "-"} : ${sc.score2 ?? "-"}${statusTxt}</span>`;
      }
      html += `<div class="bracket-stage"><span class="stage-label">${m.stageLabel}</span>
        <div class="bracket-card">${m.slotLabel}${scoreHtml}<span class="meta">${m.court}구장 · ${m.time}</span></div></div>`;
    });
    document.getElementById("bracketWrap").innerHTML = html || '<div class="empty-state">토너먼트 경기 정보가 없습니다.</div>';
  }

  function renderAll() {
    if (state.view === "schedule") renderSchedule();
    if (state.view === "standings") renderStandings();
    if (state.view === "bracket") renderBracket();
    requestAnimationFrame(updateStickyOffsets);
  }

  renderAll();
}
