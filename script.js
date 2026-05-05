let profiles = [];

function readStorage(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    return false;
  }
  return true;
}

function readSavedIds() {
  try {
    const savedIds = JSON.parse(readStorage("atlasvowSaved", "[]"));
    return Array.isArray(savedIds) ? savedIds : [];
  } catch (error) {
    return [];
  }
}

const state = {
  mode: "featured",
  saved: new Set(readSavedIds()),
};

const profileGrid = document.querySelector("#profileGrid");
const resultCount = document.querySelector("#resultCount");
const ageRange = document.querySelector("#ageRange");
const ageValue = document.querySelector("#ageValue");
const dialog = document.querySelector("#profileDialog");
const dialogContent = document.querySelector("#dialogContent");
const selectedMember = document.querySelector("#selectedMember");
const formMessage = document.querySelector("#formMessage");
const themeSelect = document.querySelector("#themeSelect");
const defaultTheme = "pink";
const availableThemes = new Set(["default", "pink", "ocean"]);
const supabaseConfig = {
  url: "https://hgglkxizcwazqenqmfrm.supabase.co",
  publishableKey: "sb_publishable_dEZ6qglLvXD_BvMQ09aTQw_oaOi5ZU1",
};
const memberPhotoBucket = "member-photos";
const memberSelectFields = [
  "id",
  "slug",
  "display_name",
  "legal_name",
  "age",
  "gender",
  "country",
  "state_region",
  "city",
  "education",
  "occupation",
  "height_cm",
  "weight_lb",
  "marital_status",
  "children_count",
  "housing",
  "faith",
  "smoking",
  "drinking",
  "languages",
  "intent",
  "relocation",
  "tags",
  "match_score",
  "is_verified",
  "is_new",
  "quote",
  "about",
  "primary_photo_path",
  "photo_paths",
  "created_at",
].join(",");

const controls = {
  home: document.querySelector("#homeFilter"),
  country: document.querySelector("#countryFilter"),
  language: document.querySelector("#languageFilter"),
  intent: document.querySelector("#intentFilter"),
  verified: document.querySelector("#verifiedFilter"),
  search: document.querySelector("#searchInput"),
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function encodeStoragePath(path) {
  return String(path || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function getMemberPhotoUrl(path) {
  if (!path) return "";
  return `${supabaseConfig.url}/storage/v1/object/public/${memberPhotoBucket}/${encodeStoragePath(path)}`;
}

function getLocationLabel(profile) {
  return [profile.city, profile.stateRegion, profile.country].filter(Boolean).join("，");
}

function getDisplayValue(value, fallback = "未填写") {
  return value === null || value === undefined || value === "" ? fallback : value;
}

function mapMember(member) {
  const photoPaths = normalizeArray(member.photo_paths);
  const primaryPhotoPath = member.primary_photo_path || photoPaths[0] || "";
  const score = Number.isFinite(member.match_score) ? member.match_score : null;

  return {
    id: member.slug || member.id,
    dbId: member.id,
    name: member.legal_name || member.display_name,
    cnName: member.display_name,
    age: Number(member.age),
    country: member.country || "",
    stateRegion: member.state_region || "",
    city: member.city || "",
    home: member.country || "",
    education: member.education || "",
    occupation: member.occupation || "",
    heightCm: member.height_cm,
    weightLb: member.weight_lb,
    maritalStatus: member.marital_status || "",
    childrenCount: member.children_count,
    housing: member.housing || "",
    faith: member.faith || "",
    smoking: member.smoking || "",
    drinking: member.drinking || "",
    languages: normalizeArray(member.languages),
    intent: member.intent || "结婚",
    relocation: member.relocation || "",
    score,
    verified: Boolean(member.is_verified),
    isNew: Boolean(member.is_new),
    image: getMemberPhotoUrl(primaryPhotoPath),
    photoUrls: photoPaths.map(getMemberPhotoUrl).filter(Boolean),
    tags: normalizeArray(member.tags),
    quote: member.quote || "",
    about: member.about || "",
  };
}

async function fetchMembers() {
  const params = new URLSearchParams({
    select: memberSelectFields,
    status: "eq.published",
    order: "created_at.desc",
  });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/members?${params}`, {
    headers: {
      apikey: supabaseConfig.publishableKey,
      Authorization: `Bearer ${supabaseConfig.publishableKey}`,
    },
  });

  if (!response.ok) {
    let message = "Member profiles request failed.";

    try {
      const details = await response.json();
      message = details.message || details.error || message;
    } catch (error) {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(mapMember) : [];
}

function persistSaved() {
  writeStorage("atlasvowSaved", JSON.stringify([...state.saved]));
}

async function createAppointment(payload) {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseConfig.publishableKey,
      Authorization: `Bearer ${supabaseConfig.publishableKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Appointment request failed.";

    try {
      const details = await response.json();
      message = details.message || details.error || message;
    } catch (error) {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }
}

function applyTheme(theme, shouldPersist = true) {
  const nextTheme = availableThemes.has(theme) ? theme : defaultTheme;
  document.documentElement.dataset.theme = nextTheme;
  themeSelect.value = nextTheme;

  if (shouldPersist) {
    writeStorage("atlasvowTheme", nextTheme);
  }
}

function matchesFilters(profile) {
  const searchTerm = controls.search.value.trim().toLowerCase();
  const searchable = [
    profile.name,
    profile.cnName,
    profile.country,
    profile.city,
    profile.stateRegion,
    profile.home,
    profile.education,
    profile.occupation,
    profile.maritalStatus,
    profile.housing,
    profile.faith,
    profile.smoking,
    profile.drinking,
    profile.intent,
    profile.relocation,
    ...profile.languages,
    ...profile.tags,
  ]
    .join(" ")
    .toLowerCase();

  const modeMatch =
    state.mode === "featured" ||
    (state.mode === "new" && profile.isNew) ||
    (state.mode === "verified" && profile.verified);

  return (
    modeMatch &&
    (controls.home.value === "all" || profile.home === controls.home.value) &&
    (controls.country.value === "all" || profile.country === controls.country.value) &&
    (controls.language.value === "all" || profile.languages.includes(controls.language.value)) &&
    (controls.intent.value === "all" || profile.intent === controls.intent.value) &&
    (!controls.verified.checked || profile.verified) &&
    profile.age <= Number(ageRange.value) &&
    (!searchTerm || searchable.includes(searchTerm))
  );
}

function renderProfiles() {
  const filtered = profiles
    .filter(matchesFilters)
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        Number(b.isNew) - Number(a.isNew) ||
        a.age - b.age
    );

  resultCount.textContent = `${filtered.length} 位会员`;

  if (!filtered.length) {
    profileGrid.innerHTML = `
      <div class="empty-state">
        <p>暂无符合条件的会员，调整国家、语言或年龄后可继续查看。</p>
      </div>
    `;
    return;
  }

  profileGrid.innerHTML = filtered.map(createCardMarkup).join("");
  activateIcons();
}

async function loadProfiles() {
  resultCount.textContent = "加载中";
  profileGrid.innerHTML = `
    <div class="empty-state">
      <p>正在加载真实会员资料...</p>
    </div>
  `;

  try {
    profiles = await fetchMembers();
    renderProfiles();
  } catch (error) {
    console.error(error);
    profiles = [];
    resultCount.textContent = "0 位会员";
    profileGrid.innerHTML = `
      <div class="empty-state">
        <p>会员资料暂时无法加载，请稍后再试。</p>
      </div>
    `;
  }
}

function createCardMarkup(profile) {
  const saved = state.saved.has(profile.id);
  const profileId = escapeHtml(profile.id);
  const profileName = escapeHtml(profile.cnName);
  const age = escapeHtml(profile.age);
  const location = escapeHtml(getLocationLabel(profile) || profile.country);
  const intent = escapeHtml(profile.intent);
  const scoreMarkup =
    profile.score === null
      ? ""
      : `<span class="score-pill">${escapeHtml(profile.score)}% 适配</span>`;
  const compatibilityMarkup =
    profile.score === null
      ? ""
      : `
        <div class="compatibility" aria-label="适配度 ${escapeHtml(profile.score)}%">
          <span>文化与规划适配</span>
          <div class="bar"><i style="width: ${escapeHtml(profile.score)}%"></i></div>
        </div>
      `;

  return `
    <article class="profile-card" data-profile="${profileId}">
      <div class="profile-photo">
        <img src="${escapeHtml(profile.image)}" alt="${profileName}的会员照片" loading="lazy" />
        <span class="photo-badge">${profile.verified ? "已核验" : "待复核"}</span>
        ${scoreMarkup}
      </div>
      <div class="profile-body">
        <div class="profile-topline">
          <div>
            <h3>${profileName} · ${age}</h3>
            <p class="profile-meta">${location} · ${intent}</p>
          </div>
          <button class="favorite-button ${saved ? "is-saved" : ""}" type="button" data-save="${profileId}" aria-label="${saved ? "取消收藏" : "收藏"}${profileName}">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="tag-list">
          ${profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
        ${compatibilityMarkup}
        <p class="profile-quote">${escapeHtml(profile.quote)}</p>
        <div class="profile-actions">
          <button type="button" data-open="${profileId}">
            <i data-lucide="user-round"></i>
            资料
          </button>
          <button class="secondary" type="button" data-intro="${profileId}">
            <i data-lucide="message-circle"></i>
            介绍
          </button>
        </div>
      </div>
    </article>
  `;
}

function openProfile(profileId) {
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const location = getLocationLabel(profile) || profile.country;
  const scoreMarkup =
    profile.score === null
      ? ""
      : `<span class="score-pill">${escapeHtml(profile.score)}% 适配</span>`;
  const galleryMarkup =
    profile.photoUrls.length > 1
      ? `
        <div class="dialog-gallery" aria-label="${escapeHtml(profile.cnName)}的更多照片">
          ${profile.photoUrls
            .map(
              (photoUrl, index) => `
                <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(profile.cnName)}照片 ${index + 1}" loading="lazy" />
              `
            )
            .join("")}
        </div>
      `
      : "";

  dialogContent.innerHTML = `
    <div class="dialog-profile">
      <div class="dialog-visual">
        <img src="${escapeHtml(profile.image)}" alt="${escapeHtml(profile.cnName)}的会员照片" />
        ${scoreMarkup}
      </div>
      <div class="dialog-details">
        <div>
          <p class="eyebrow">${escapeHtml(location)}</p>
          <h2 id="dialogName">${escapeHtml(profile.cnName)}</h2>
          <p>${escapeHtml(profile.name)} · ${escapeHtml(profile.age)} 岁 · ${escapeHtml(profile.intent)}</p>
        </div>
        <p>${escapeHtml(profile.about)}</p>
        ${galleryMarkup}
        <div class="fact-grid">
          <div>
            <span>教育</span>
            <strong>${escapeHtml(getDisplayValue(profile.education))}</strong>
          </div>
          <div>
            <span>职业</span>
            <strong>${escapeHtml(getDisplayValue(profile.occupation))}</strong>
          </div>
          <div>
            <span>身高 / 体重</span>
            <strong>${escapeHtml(getDisplayValue(profile.heightCm))}cm / ${escapeHtml(getDisplayValue(profile.weightLb))}lb</strong>
          </div>
          <div>
            <span>婚姻状况</span>
            <strong>${escapeHtml(getDisplayValue(profile.maritalStatus))}</strong>
          </div>
          <div>
            <span>孩子</span>
            <strong>${escapeHtml(getDisplayValue(profile.childrenCount))}</strong>
          </div>
          <div>
            <span>居住</span>
            <strong>${escapeHtml(getDisplayValue(profile.housing))}</strong>
          </div>
          <div>
            <span>信仰</span>
            <strong>${escapeHtml(getDisplayValue(profile.faith))}</strong>
          </div>
          <div>
            <span>烟酒</span>
            <strong>${escapeHtml(getDisplayValue(profile.smoking))} / ${escapeHtml(getDisplayValue(profile.drinking))}</strong>
          </div>
          <div>
            <span>沟通语言</span>
            <strong>${escapeHtml(profile.languages.join(" / ") || "未填写")}</strong>
          </div>
          <div>
            <span>未来居住地</span>
            <strong>${escapeHtml(getDisplayValue(profile.relocation))}</strong>
          </div>
          <div>
            <span>资料状态</span>
            <strong>${profile.verified ? "视频与证件已核验" : "顾问复核中"}</strong>
          </div>
          <div>
            <span>适配标签</span>
            <strong>${escapeHtml(getDisplayValue(profile.tags[0]))}</strong>
          </div>
        </div>
        <div class="tag-list">
          ${profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
        <button class="dialog-action" type="button" data-intro="${escapeHtml(profile.id)}">
          <i data-lucide="calendar-plus"></i>
          预约介绍
        </button>
      </div>
    </div>
  `;

  dialog.showModal();
  activateIcons();
}

function requestIntro(profileId) {
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const location = getLocationLabel(profile) || profile.country;

  selectedMember.value = `${profile.cnName} · ${location}`;
  formMessage.textContent = `${profile.cnName} 已加入预约初谈。`;
  if (dialog.open) {
    dialog.close();
  }
  document.querySelector("#consult").scrollIntoView({ behavior: "smooth", block: "center" });
}

function activateIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.querySelectorAll(".segmented-control button").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".segmented-control button")
      .forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    state.mode = button.dataset.mode;
    renderProfiles();
  });
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

Object.values(controls).forEach((control) => {
  control.addEventListener("input", renderProfiles);
  control.addEventListener("change", renderProfiles);
});

function updateAgeFilter() {
  ageValue.textContent = ageRange.value;
  renderProfiles();
}

ageRange.addEventListener("input", updateAgeFilter);
ageRange.addEventListener("change", updateAgeFilter);

profileGrid.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save]");
  const openButton = event.target.closest("[data-open]");
  const introButton = event.target.closest("[data-intro]");

  if (saveButton) {
    const id = saveButton.dataset.save;
    if (state.saved.has(id)) {
      state.saved.delete(id);
    } else {
      state.saved.add(id);
    }
    persistSaved();
    renderProfiles();
    return;
  }

  if (openButton) {
    openProfile(openButton.dataset.open);
    return;
  }

  if (introButton) {
    requestIntro(introButton.dataset.intro);
  }
});

dialog.addEventListener("click", (event) => {
  const introButton = event.target.closest("[data-intro]");
  if (introButton) {
    requestIntro(introButton.dataset.intro);
  }
});

document.querySelector(".dialog-close").addEventListener("click", () => {
  if (dialog.open) {
    dialog.close();
  }
});

dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  const isInDialog =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!isInDialog) {
    if (dialog.open) {
      dialog.close();
    }
  }
});

document.querySelector("#consult").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const member = String(data.get("member") || "").trim();

  if (!name || !contact) {
    formMessage.textContent = "请填写称呼和联系方式。";
    return;
  }

  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  formMessage.textContent = "正在提交预约...";

  try {
    await createAppointment({
      customer_name: name,
      contact,
      interested_member: member || null,
      source_url: window.location.href,
      user_agent: navigator.userAgent,
      form_payload: {
        interested_member: member || null,
      },
    });

    formMessage.textContent = `${name}，预约信息已记录，顾问将在一个工作日内联系你。`;
    form.reset();
  } catch (error) {
    console.error(error);
    formMessage.textContent = "预约暂时没有提交成功，请稍后再试。";
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
});

window.addEventListener("load", () => {
  activateIcons();
});

applyTheme(document.documentElement.dataset.theme, false);
ageValue.textContent = ageRange.value;
loadProfiles();
