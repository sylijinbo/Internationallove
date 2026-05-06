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
  selectedMembers: [],
};

const profileGrid = document.querySelector("#profileGrid");
const resultCount = document.querySelector("#resultCount");
const ageRange = document.querySelector("#ageRange");
const ageValue = document.querySelector("#ageValue");
const dialog = document.querySelector("#profileDialog");
const dialogContent = document.querySelector("#dialogContent");
const selectedMembersList = document.querySelector("#selectedMembersList");
const selectedMemberCount = document.querySelector("#selectedMemberCount");
const formMessage = document.querySelector("#formMessage");
const themeSelect = document.querySelector("#themeSelect");
const defaultTheme = "pink";
const availableThemes = new Set(["default", "pink", "ocean"]);
const maxAppointmentMembers = 3;
const supabaseConfig = {
  url: "https://hgglkxizcwazqenqmfrm.supabase.co",
  publishableKey: "sb_publishable_dEZ6qglLvXD_BvMQ09aTQw_oaOi5ZU1",
};
const memberPhotoBucket = "member-photos";
const autoQuoteTemplates = [
  "希望认识重视家庭与长期关系、愿意认真沟通未来生活安排的伴侣。",
  "期待一段真诚稳定的关系，在彼此尊重中一起规划未来。",
  "重视家庭、沟通和责任感，希望遇见愿意认真经营关系的人。",
  "欣赏温和真诚的相处方式，也愿意为长期承诺投入时间。",
  "希望和价值观相近的人慢慢了解，建立踏实而稳定的生活。",
  "相信好的关系来自坦诚沟通，也期待一起创造温暖的家庭。",
  "愿意从真诚交流开始，和合适的人一起走向稳定未来。",
  "看重责任感和生活态度，希望关系能在理解中自然深入。",
  "期待遇见成熟可靠的人，一起经营简单、踏实、有温度的日子。",
  "珍惜坦诚和陪伴，希望未来的关系既稳定也有彼此支持。",
  "希望与认真对待感情的人相识，共同建立清晰而长久的承诺。",
  "重视信任、尊重和家庭观念，期待遇见方向一致的伴侣。",
  "相信相处舒服很重要，也愿意为稳定关系付出耐心。",
  "期待在互相欣赏和理解中，慢慢建立值得托付的关系。",
  "希望未来生活有共同目标，也有日常里温和踏实的陪伴。",
  "认真看待婚姻与家庭，期待遇见同样真诚坚定的人。",
  "愿意用开放和坦率的沟通，了解一段关系真正的可能。",
  "欣赏善良、成熟、有责任心的人，也期待一起面对未来。",
  "希望遇见能彼此支持的人，把平凡生活过得安稳有爱。",
  "看重长期承诺和家庭责任，期待一段清楚、真诚的关系。",
  "相信好的感情需要信任和行动，也愿意认真经营彼此。",
  "希望与价值观相近的人相识，在稳定关系中共同成长。",
  "期待遇见愿意沟通、愿意承担，也愿意珍惜家庭的人。",
  "重视真实相处，希望关系从了解开始，走向长久陪伴。",
  "希望未来的伴侣真诚可靠，能一起规划生活也分享日常。",
  "期待一段温和坚定的关系，在尊重和责任中慢慢靠近。",
  "相信合适的人会让生活更安定，也更有一起前进的力量。",
  "愿意认真认识对方，期待建立有信任、有承诺的未来。",
  "希望遇见心态成熟的人，一起经营稳定而有爱的家庭。",
  "珍惜真诚、稳定和共同目标，期待与合适的人携手向前。",
];
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

function uniqueValues(values) {
  const seen = new Set();
  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildAutoTags(profile) {
  return uniqueValues([
    profile.education,
    profile.occupation,
    profile.faith,
    profile.smoking,
    profile.housing,
  ]).slice(0, 4);
}

function sentenceFromParts(parts) {
  const text = parts.filter(Boolean).join("，");
  return text ? `${text}。` : "";
}

function formatEducation(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /教育|学历|学位|毕业/.test(text) ? `受过${text}` : `受过${text}教育`;
}

function formatOccupation(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /工作|职业|行业/.test(text) ? `目前从事${text}` : `目前从事${text}工作`;
}

function formatChildren(value) {
  if (value === null || value === undefined || value === "") return "";
  const count = Number(value);
  if (!Number.isFinite(count)) return "";
  return count === 0 ? "没有孩子" : `有${count}个孩子`;
}

function formatDrinking(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /不喝|不饮|戒酒|从不|非饮酒/.test(text) ? text : `饮酒为${text}`;
}

function normalizeQuote(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function hashString(value) {
  return String(value || "").split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);
}

function getStableQuote(profile, usedQuotes) {
  const seed = [profile.dbId, profile.id, profile.name, profile.age].filter(Boolean).join(":");
  const startIndex = hashString(seed) % autoQuoteTemplates.length;

  for (let offset = 0; offset < autoQuoteTemplates.length; offset += 1) {
    const quote = autoQuoteTemplates[(startIndex + offset) % autoQuoteTemplates.length];
    if (!usedQuotes.has(normalizeQuote(quote))) {
      usedQuotes.add(normalizeQuote(quote));
      return quote;
    }
  }

  return autoQuoteTemplates[startIndex];
}

function buildProfileDescription(profile) {
  const displayName = profile.cnName || profile.name || "该会员";
  const location = [profile.country, profile.stateRegion, profile.city].filter(Boolean).join("");
  const intro = sentenceFromParts([
    location ? `${displayName} 现居${location}` : displayName,
    formatEducation(profile.education),
    formatOccupation(profile.occupation),
  ]);
  const profileDetails = sentenceFromParts([
    profile.heightCm ? `身高 ${profile.heightCm}cm` : "",
    profile.weightLb ? `体重 ${profile.weightLb}lb` : "",
    profile.maritalStatus,
    formatChildren(profile.childrenCount),
    profile.housing ? `居住在${profile.housing}` : "",
  ]);
  const lifestyle = sentenceFromParts([
    profile.faith ? `信仰${profile.faith}` : "",
    profile.smoking,
    formatDrinking(profile.drinking),
  ]);

  return [intro, profileDetails, lifestyle].filter(Boolean).join("");
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

function mapMember(member, usedQuotes = new Set()) {
  const photoPaths = normalizeArray(member.photo_paths);
  const primaryPhotoPath = member.primary_photo_path || photoPaths[0] || "";
  const score = Number.isFinite(member.match_score) ? member.match_score : null;

  const profile = {
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
  if (!profile.tags.length) {
    profile.tags = buildAutoTags(profile);
  }
  const generatedDescription = buildProfileDescription(profile);
  if (profile.quote) {
    usedQuotes.add(normalizeQuote(profile.quote));
  } else {
    profile.quote = getStableQuote(profile, usedQuotes);
  }
  if (!profile.about) {
    profile.about = generatedDescription;
  }
  return profile;
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
  if (!Array.isArray(data)) return [];

  const usedQuotes = new Set();
  return data.map((member) => mapMember(member, usedQuotes));
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
  const tagsMarkup = profile.tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
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
          <div class="profile-heading">
            <h3><span>${profileName}</span><span>${age}</span></h3>
            <p class="profile-meta"><span>${location}</span><span>${intent}</span></p>
          </div>
          <button class="favorite-button ${saved ? "is-saved" : ""}" type="button" data-save="${profileId}" aria-label="${saved ? "取消收藏" : "收藏"}${profileName}">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="tag-list">
          ${tagsMarkup}
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
  const photos = [...new Set([profile.image, ...profile.photoUrls].filter(Boolean))];
  const activePhoto = photos[0] || "";
  const activePhotoAlt = `${profile.cnName}的会员照片`;
  const scoreMarkup =
    profile.score === null
      ? ""
      : `<span class="score-pill">${escapeHtml(profile.score)}% 适配</span>`;
  const carouselMarkup =
    photos.length > 1
      ? `
        <div class="dialog-carousel" aria-label="${escapeHtml(profile.cnName)}照片轮播">
          ${photos
            .map(
              (photoUrl, index) => `
                <button
                  class="dialog-thumb ${index === 0 ? "is-active" : ""}"
                  type="button"
                  data-photo="${escapeHtml(photoUrl)}"
                  data-photo-alt="${escapeHtml(profile.cnName)}照片 ${index + 1}"
                  aria-label="查看第 ${index + 1} 张照片"
                >
                  <img src="${escapeHtml(photoUrl)}" alt="" loading="lazy" />
                </button>
              `
            )
            .join("")}
        </div>
      `
      : "";
  const photoMarkup = activePhoto
    ? `<img id="dialogMainPhoto" src="${escapeHtml(activePhoto)}" alt="${escapeHtml(activePhotoAlt)}" />`
    : `<div class="dialog-photo-empty">暂无会员照片</div>`;

  dialogContent.innerHTML = `
    <div class="dialog-profile">
      <div class="dialog-visual">
        <div class="dialog-photo-stage">
          ${photoMarkup}
          ${scoreMarkup}
        </div>
        ${carouselMarkup}
      </div>
      <div class="dialog-details">
        <div>
          <p class="eyebrow">${escapeHtml(location)}</p>
          <h2 id="dialogName">${escapeHtml(profile.cnName)}</h2>
          <p>${escapeHtml(profile.name)} · ${escapeHtml(profile.age)} 岁 · ${escapeHtml(profile.intent)}</p>
        </div>
        <p>${escapeHtml(profile.about)}</p>
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
  document.documentElement.classList.add("dialog-lock");
  document.body.classList.add("dialog-lock");
  activateIcons();
}

function switchDialogPhoto(button) {
  const mainPhoto = dialog.querySelector("#dialogMainPhoto");
  if (!mainPhoto) return;

  mainPhoto.src = button.dataset.photo;
  mainPhoto.alt = button.dataset.photoAlt || mainPhoto.alt;
  dialog
    .querySelectorAll(".dialog-thumb")
    .forEach((item) => item.classList.toggle("is-active", item === button));
}

function getAppointmentMemberLabel(member) {
  return [member.name, member.location].filter(Boolean).join(" · ");
}

function renderSelectedMembers() {
  selectedMemberCount.textContent = `${state.selectedMembers.length}/${maxAppointmentMembers}`;

  if (!state.selectedMembers.length) {
    selectedMembersList.innerHTML = `<p id="selectedMembersEmpty">可从会员卡选择，最多 3 位。</p>`;
    return;
  }

  selectedMembersList.innerHTML = state.selectedMembers
    .map(
      (member) => `
        <span class="selected-member-chip">
          <span>${escapeHtml(getAppointmentMemberLabel(member))}</span>
          <button type="button" data-remove-member="${escapeHtml(member.dbId)}" aria-label="移除${escapeHtml(member.name)}">
            <i data-lucide="x"></i>
          </button>
        </span>
      `
    )
    .join("");
  activateIcons();
}

function removeSelectedMember(memberId) {
  state.selectedMembers = state.selectedMembers.filter((member) => member.dbId !== memberId);
  renderSelectedMembers();
}

function requestIntro(profileId) {
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const location = getLocationLabel(profile) || profile.country;
  const member = {
    dbId: profile.dbId,
    profileId: profile.id,
    name: profile.cnName,
    location,
  };

  if (state.selectedMembers.some((item) => item.dbId === member.dbId)) {
    formMessage.textContent = `${profile.cnName} 已在预约名单中。`;
  } else if (state.selectedMembers.length >= maxAppointmentMembers) {
    formMessage.textContent = `一次预约最多选择 ${maxAppointmentMembers} 位会员。`;
  } else {
    state.selectedMembers.push(member);
    renderSelectedMembers();
    formMessage.textContent = `${profile.cnName} 已加入预约初谈。`;
  }

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
  const photoButton = event.target.closest("[data-photo]");
  if (photoButton) {
    switchDialogPhoto(photoButton);
    return;
  }

  const introButton = event.target.closest("[data-intro]");
  if (introButton) {
    requestIntro(introButton.dataset.intro);
  }
});

function allowsDialogScroll(target) {
  return target instanceof Element && Boolean(target.closest(".dialog-details, .dialog-carousel"));
}

dialog.addEventListener(
  "wheel",
  (event) => {
    if (!allowsDialogScroll(event.target)) {
      event.preventDefault();
    }
  },
  { passive: false }
);

dialog.addEventListener(
  "touchmove",
  (event) => {
    if (!allowsDialogScroll(event.target)) {
      event.preventDefault();
    }
  },
  { passive: false }
);

dialog.addEventListener("close", () => {
  document.documentElement.classList.remove("dialog-lock");
  document.body.classList.remove("dialog-lock");
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

document.querySelector("#consult").addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-member]");
  if (!removeButton) return;
  removeSelectedMember(removeButton.dataset.removeMember);
  formMessage.textContent = "已更新感兴趣会员名单。";
});

document.querySelector("#consult").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const selectedMembers = state.selectedMembers.map((member) => ({
    id: member.dbId,
    display_name: member.name,
    location: member.location,
  }));
  const selectedMemberIds = selectedMembers.map((member) => member.id).filter(Boolean);
  const selectedMemberText = selectedMembers
    .map((member) => [member.display_name, member.location].filter(Boolean).join(" · "))
    .join("；");

  if (!name || !contact) {
    formMessage.textContent = "请填写称呼和联系方式。";
    return;
  }

  if (selectedMemberIds.length > maxAppointmentMembers) {
    formMessage.textContent = `一次预约最多选择 ${maxAppointmentMembers} 位会员。`;
    return;
  }

  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  formMessage.textContent = "正在提交预约...";

  try {
    await createAppointment({
      customer_name: name,
      contact,
      interested_member: selectedMemberText || null,
      interested_member_ids: selectedMemberIds,
      source_url: window.location.href,
      user_agent: navigator.userAgent,
      form_payload: {
        selected_members: selectedMembers,
        interested_member: selectedMemberText || null,
      },
    });

    formMessage.textContent = `${name}，预约信息已记录，顾问将在一个工作日内联系你。`;
    form.reset();
    state.selectedMembers = [];
    renderSelectedMembers();
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
renderSelectedMembers();
loadProfiles();
