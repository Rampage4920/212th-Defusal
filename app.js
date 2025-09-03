const PALETTE = ["", "Red","Blue","Yellow","Black","Orange","White","Green","Purple","Pink","Grey","Brown","Left Yellow"];
const norm = s => s.trim().toLowerCase();
const c1 = document.getElementById("c1");
const c2 = document.getElementById("c2");
const leftEl = document.getElementById("left");
const exactEl = document.getElementById("exact");
const results = document.getElementById("results");

let dataset = [];

init();

async function init() {
  for (const sel of [c1, c2]) {
    for (const col of PALETTE) {
      const opt = document.createElement("option");
      opt.value = col;
      opt.textContent = col || "— any —";
      sel.appendChild(opt);
    }
  }
  const res = await fetch("data/joebombs_sequences.json", { cache: "no-store" });
  dataset = await res.json();
  [c1, c2, leftEl, exactEl].forEach(el => el.addEventListener("change", render));
  render();
}

function leftAnchoredMatch(candidate, q, exactLength) {
  const q2 = q.filter(Boolean);
  if (q2.length === 0) return true;
  if (candidate.length < q2.length) return false;
  for (let i = 0; i < q2.length; i++) {
    if (norm(candidate[i]) !== norm(q2[i])) return false;
  }
  return exactLength ? candidate.length === q2.length : true;
}

function containsOrderedSubsequence(candidate, q) {
  const q2 = q.filter(Boolean);
  if (q2.length === 0) return true;
  let j = 0;
  for (let i = 0; i < candidate.length && j < q2.length; i++) {
    if (norm(candidate[i]) === norm(q2[j])) j++;
  }
  return j === q2.length;
}

function render() {
  const q1 = c1.value;
  const q2v = c2.value;
  const la = leftEl.checked;
  const ex = exactEl.checked;
  const query = [q1, q2v].filter(Boolean);
  const filtered = dataset.filter(item => {
    const seq = item.sequence || [];
    return la ? leftAnchoredMatch(seq, query, ex) : containsOrderedSubsequence(seq, query);
  });
  results.innerHTML = "";
  for (const item of filtered) {
    const card = document.createElement("div");
    card.className = "card";
    const body = document.createElement("div");
    const title = document.createElement("div");
    title.innerHTML = `<strong>${item.id}</strong>`;
    const tags = document.createElement("div");
    tags.className = "tags";
    for (const c of item.sequence) {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = c;
      tags.appendChild(span);
    }
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.note || "";
    body.appendChild(title);
    body.appendChild(tags);
    if (item.note) body.appendChild(meta);
    card.appendChild(body);
    results.appendChild(card);
  }
}