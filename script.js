let profiles = [];
let dialogSwipeState = null;
let dialogPullCloseState = null;
let suppressDialogVisualClick = false;

const state = {
  mode: "featured",
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
const maxAppointmentMembers = 3;
const compactDialogMedia = "(max-width: 840px), (max-height: 760px) and (max-width: 1180px)";
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
  gender: document.querySelector("#genderFilter"),
  language: document.querySelector("#languageFilter"),
  intent: document.querySelector("#intentFilter"),
  verified: document.querySelector("#verifiedFilter"),
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

const profileTagRules = {
  maxCount: 6,
  maxTagUnits: 10,
  maxTotalUnits: 44,
};

function getTagCharUnits(char) {
  if (/\s/.test(char)) return 0;
  return /[^\u0000-\u00ff]/.test(char) ? 2 : 1;
}

function getTagDisplayUnits(value) {
  return [...String(value || "")].reduce((total, char) => total + getTagCharUnits(char), 0);
}

function trimTagToDisplay(value) {
  const text = String(value || "").trim();
  if (getTagDisplayUnits(text) <= profileTagRules.maxTagUnits) return text;

  let output = "";
  let units = getTagCharUnits("…");
  for (const char of text) {
    const nextUnits = getTagCharUnits(char);
    if (units + nextUnits > profileTagRules.maxTagUnits) break;
    output += char;
    units += nextUnits;
  }
  return `${output.trim()}…`;
}

function normalizeProfileTags(values) {
  const tags = uniqueValues(uniqueValues(values).map(trimTagToDisplay));
  const selected = [];
  let usedUnits = 0;

  for (const tag of tags) {
    const tagUnits = getTagDisplayUnits(tag);
    if (selected.length >= profileTagRules.maxCount) break;
    if (usedUnits + tagUnits > profileTagRules.maxTotalUnits) continue;
    selected.push(tag);
    usedUnits += tagUnits;
  }

  return selected;
}

function buildAutoTags(profile) {
  return normalizeProfileTags([
    profile.education,
    profile.occupation,
    profile.faith,
    profile.smoking,
    formatChildren(profile.childrenCount),
    profile.housing,
  ]);
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeLeadingProfileName(profile, value) {
  let text = String(value || "").trim();
  const names = uniqueValues([profile.cnName, profile.name]);

  for (const name of names) {
    const pattern = new RegExp(`^${escapeRegExp(name)}\\s*[，,。:：-]?\\s*`);
    text = text.replace(pattern, "").trim();
  }

  return text;
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
  const location = [profile.country, profile.stateRegion, profile.city].filter(Boolean).join("");
  const intro = sentenceFromParts([
    location ? `现居${location}` : "",
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
    gender: member.gender || "",
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
    tags: normalizeProfileTags(normalizeArray(member.tags)),
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

function getAppointmentErrorMessage(error) {
  const message = error?.message || String(error || "未知错误");

  if (/row-level security|violates row-level security/i.test(message)) {
    return "预约提交被数据库权限策略拦截。请重新执行 admin/supabase-setup.sql 后再试。";
  }
  if (/permission denied for sequence/i.test(message)) {
    return "预约编号权限未开放。请重新执行 admin/supabase-setup.sql，里面已补充 anon 的 sequence 权限。";
  }
  if (/permission denied for table appointments/i.test(message)) {
    return "appointments 表还没有开放公开预约写入权限。请重新执行 admin/supabase-setup.sql。";
  }
  if (/interested_member_ids|form_payload|source_url|user_agent|column/i.test(message)) {
    return `预约表字段还没更新：${message}。请重新执行 admin/supabase-setup.sql。`;
  }
  if (/not-null|null value/i.test(message)) {
    return `预约表有必填字段未兼容：${message}。请重新执行 admin/supabase-setup.sql。`;
  }
  if (/failed to fetch|network/i.test(message)) {
    return "网络请求失败，请确认当前页面可以访问 Supabase。";
  }

  return `预约提交失败：${message}`;
}

function matchesFilters(profile) {
  const modeMatch =
    state.mode === "featured" ||
    (state.mode === "new" && profile.isNew) ||
    (state.mode === "verified" && profile.verified);

  return (
    modeMatch &&
    (controls.home.value === "all" || profile.home === controls.home.value) &&
    (controls.country.value === "all" || profile.country === controls.country.value) &&
    profile.gender === controls.gender.value &&
    (controls.language.value === "all" || profile.languages.includes(controls.language.value)) &&
    (controls.intent.value === "all" || profile.intent === controls.intent.value) &&
    (!controls.verified.checked || profile.verified) &&
    profile.age <= Number(ageRange.value)
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
  const profileId = escapeHtml(profile.id);
  const profileName = escapeHtml(profile.cnName);
  const age = escapeHtml(profile.age);
  const location = escapeHtml(getLocationLabel(profile) || profile.country);
  const intent = escapeHtml(profile.intent);
  const tagsMarkup = profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
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
            <h3><span class="profile-name">${profileName}</span><span class="profile-age">${age}</span></h3>
            <p class="profile-meta"><span>${location}</span><span>${intent}</span></p>
          </div>
        </div>
        <div class="tag-list">
          ${tagsMarkup}
        </div>
        ${compatibilityMarkup}
        <p class="profile-quote">${escapeHtml(profile.quote)}</p>
        <div class="profile-actions">
          <button class="profile-action-primary" type="button" data-open="${profileId}">
            <i data-lucide="user-round"></i>
            <span>资料</span>
          </button>
          <button class="profile-action-secondary" type="button" data-intro="${profileId}">
            <i data-lucide="message-circle"></i>
            <span>介绍</span>
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
  const profileAbout = removeLeadingProfileName(profile, profile.about);
  const statusLabel = profile.verified ? "已核验" : "顾问复核中";
  const photoCountLabel = photos.length ? `1 / ${photos.length}` : "暂无照片";
  const dialogTagsMarkup = profile.tags.length
    ? `
        <div class="dialog-tags" aria-label="会员标签">
          ${profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
      `
    : "";
  const scoreMarkup =
    profile.score === null
      ? ""
      : `<span class="score-pill">${escapeHtml(profile.score)}% 适配</span>`;
  const carouselMarkup =
    photos.length > 1
      ? `
        <div class="dialog-photo-nav" aria-label="照片切换">
          <button class="dialog-photo-step" type="button" data-photo-step="-1" aria-label="上一张照片">
            <i data-lucide="chevron-left"></i>
          </button>
          <button class="dialog-photo-step" type="button" data-photo-step="1" aria-label="下一张照片">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>
        <button class="dialog-gallery-toggle" type="button" data-gallery-toggle aria-expanded="false" aria-controls="dialogCarousel">
          <i data-lucide="images"></i>
          <span>查看照片</span>
        </button>
        <div class="dialog-carousel" id="dialogCarousel" aria-label="${escapeHtml(profile.cnName)}照片轮播">
          <div class="dialog-carousel-track">
            ${photos
              .map(
                (photoUrl, index) => `
                  <button
                    class="dialog-thumb ${index === 0 ? "is-active" : ""}"
                    type="button"
                    data-photo="${escapeHtml(photoUrl)}"
                    data-photo-alt="${escapeHtml(profile.cnName)}照片 ${index + 1}"
                    data-photo-index="${index + 1}"
                    aria-label="查看第 ${index + 1} 张照片"
                  >
                    <img src="${escapeHtml(photoUrl)}" alt="" loading="lazy" />
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      `
      : "";
  const photoMarkup = activePhoto
    ? `
        <img class="dialog-photo-backdrop-img" src="${escapeHtml(activePhoto)}" alt="" aria-hidden="true" />
        <img
          class="dialog-photo-main-img"
          id="dialogMainPhoto"
          src="${escapeHtml(activePhoto)}"
          alt="${escapeHtml(activePhotoAlt)}"
        />
      `
    : `<div class="dialog-photo-empty">暂无会员照片</div>`;

  dialogContent.innerHTML = `
    <div class="dialog-profile">
      <div class="dialog-visual ${photos.length > 1 ? "has-carousel" : ""}">
        <div class="dialog-photo-stage">
          ${photoMarkup}
          <div class="dialog-photo-meta">
            <strong id="dialogPhotoCount">${escapeHtml(photoCountLabel)}</strong>
          </div>
          ${scoreMarkup}
        </div>
        ${carouselMarkup}
      </div>
      <div class="dialog-details">
        <div class="dialog-hero">
          <p class="dialog-place">
            <i data-lucide="map-pin"></i>
            <span>${escapeHtml(location)}</span>
          </p>
          <h2 id="dialogName">${escapeHtml(profile.cnName)}</h2>
          <div class="dialog-summary" aria-label="会员概览">
            <span>${escapeHtml(profile.age)} 岁</span>
            <span>${escapeHtml(profile.intent)}</span>
            <span>${escapeHtml(statusLabel)}</span>
          </div>
          ${dialogTagsMarkup}
        </div>
        <p class="dialog-about">${escapeHtml(profileAbout)}</p>
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

function setDialogPhoto(button) {
  const mainPhoto = dialog.querySelector("#dialogMainPhoto");
  if (!mainPhoto) return;

  const nextPhoto = button.dataset.photo || "";
  const backdropPhoto = dialog.querySelector(".dialog-photo-backdrop-img");

  mainPhoto.src = nextPhoto;
  mainPhoto.alt = button.dataset.photoAlt || mainPhoto.alt;
  if (backdropPhoto) {
    backdropPhoto.src = nextPhoto;
  }
  const photoCount = dialog.querySelector("#dialogPhotoCount");
  if (photoCount && button.dataset.photoIndex) {
    photoCount.textContent = `${button.dataset.photoIndex} / ${dialog.querySelectorAll(".dialog-thumb").length}`;
  }
  dialog
    .querySelectorAll(".dialog-thumb")
    .forEach((item) => item.classList.toggle("is-active", item === button));
  if (button.closest(".dialog-visual")?.classList.contains("is-gallery-open")) {
    button.scrollIntoView({ block: "nearest", inline: "center" });
  }
}

function switchDialogPhoto(button) {
  setDialogPhoto(button);
}

function navigateDialogPhoto(step) {
  const thumbs = [...dialog.querySelectorAll(".dialog-thumb")];
  if (thumbs.length < 2) return;

  const activeIndex = Math.max(0, thumbs.findIndex((item) => item.classList.contains("is-active")));
  const nextIndex = (activeIndex + step + thumbs.length) % thumbs.length;
  setDialogPhoto(thumbs[nextIndex]);
}

function toggleDialogGallery() {
  const visual = dialog.querySelector(".dialog-visual");
  const toggle = dialog.querySelector("[data-gallery-toggle]");
  if (!visual || !toggle) return;

  const isOpen = visual.classList.toggle("is-gallery-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.querySelector("span").textContent = isOpen ? "收起照片" : "查看照片";
}

function closeDialogGallery() {
  const visual = dialog.querySelector(".dialog-visual");
  const toggle = dialog.querySelector("[data-gallery-toggle]");
  if (!visual || !toggle || !visual.classList.contains("is-gallery-open")) return;

  visual.classList.remove("is-gallery-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.querySelector("span").textContent = "查看照片";
}

function startDialogPhotoSwipe(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (event.target.closest("button, .dialog-carousel")) return;
  const stage = event.target.closest(".dialog-photo-stage");
  if (!stage || dialog.querySelectorAll(".dialog-thumb").length < 2) return;

  dialogSwipeState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
  };
  if (!window.matchMedia(compactDialogMedia).matches) {
    stage.setPointerCapture?.(event.pointerId);
  }
}

function endDialogPhotoSwipe(event) {
  if (!dialogSwipeState || dialogSwipeState.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - dialogSwipeState.startX;
  const deltaY = event.clientY - dialogSwipeState.startY;
  const isSwipe = Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

  if (isSwipe) {
    navigateDialogPhoto(deltaX < 0 ? 1 : -1);
    suppressDialogVisualClick = true;
    window.setTimeout(() => {
      suppressDialogVisualClick = false;
    }, 250);
  }

  dialogSwipeState = null;
}

function cancelDialogPhotoSwipe() {
  dialogSwipeState = null;
}

function isCompactDialog() {
  return window.matchMedia(compactDialogMedia).matches;
}

function startDialogPullClose(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (!dialog.open || !isCompactDialog()) return;
  if (event.target.closest("button, input, select, textarea, .dialog-carousel")) return;
  if (!event.target.closest(".dialog-profile")) return;
  if (dialog.scrollTop > 2) return;

  dialogPullCloseState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
  };
}

function endDialogPullClose(event) {
  if (!dialogPullCloseState || dialogPullCloseState.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - dialogPullCloseState.startX;
  const deltaY = event.clientY - dialogPullCloseState.startY;
  const isPullDown = deltaY > 110 && deltaY > Math.abs(deltaX) * 1.35;

  dialogPullCloseState = null;

  if (isPullDown && dialog.open && isCompactDialog() && dialog.scrollTop <= 8) {
    dialog.close();
  }
}

function cancelDialogPullClose() {
  dialogPullCloseState = null;
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
      (member, index) => `
        <span class="selected-member-row">
          <span class="selected-member-index">${index + 1}</span>
          <span class="selected-member-info">
            <strong>${escapeHtml(member.name)}</strong>
            <small>${escapeHtml(member.location || "地区未填写")}</small>
          </span>
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

function getLocalizedValidationMessage(field) {
  if (field.required && !String(field.value || "").trim()) {
    return field.dataset.requiredMessage || "请填写此字段。";
  }

  if (field.validity.typeMismatch) {
    return "请填写有效的联系方式。";
  }

  return "";
}

function getFieldErrorElement(field) {
  if (!field.form || !field.name) return null;
  return field.form.querySelector(`[data-error-for="${field.name}"]`);
}

function setFieldError(field, message) {
  field.setCustomValidity("");
  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }

  const error = getFieldErrorElement(field);
  if (error) {
    error.textContent = message;
    error.classList.toggle("is-visible", Boolean(message));
  }
}

function validateLocalizedField(field) {
  const message = getLocalizedValidationMessage(field);
  setFieldError(field, message);

  return !message;
}

function setupLocalizedValidation(form) {
  form.noValidate = true;
  const fields = [...form.querySelectorAll("input, textarea, select")];

  fields.forEach((field) => {
    field.addEventListener("invalid", (event) => {
      event.preventDefault();
      setFieldError(field, getLocalizedValidationMessage(field));
    });

    field.addEventListener("input", () => {
      setFieldError(field, "");
    });

    field.addEventListener("blur", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateLocalizedField(field);
      }
    });
  });
}

function reportLocalizedFormValidity(form) {
  const fields = [...form.querySelectorAll("input, textarea, select")];
  const invalidField = fields.find((field) => !validateLocalizedField(field));

  if (!invalidField) {
    formMessage.textContent = "";
    return true;
  }

  formMessage.textContent = "请先完善标红的信息。";
  invalidField.focus({ preventScroll: false });
  return false;
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
  const openButton = event.target.closest("[data-open]");
  const introButton = event.target.closest("[data-intro]");

  if (openButton) {
    openProfile(openButton.dataset.open);
    return;
  }

  if (introButton) {
    requestIntro(introButton.dataset.intro);
  }
});

dialog.addEventListener("click", (event) => {
  if (suppressDialogVisualClick && event.target.closest(".dialog-visual")) {
    suppressDialogVisualClick = false;
    return;
  }

  const galleryToggle = event.target.closest("[data-gallery-toggle]");
  if (galleryToggle) {
    toggleDialogGallery();
    return;
  }

  const photoStep = event.target.closest("[data-photo-step]");
  if (photoStep) {
    navigateDialogPhoto(Number(photoStep.dataset.photoStep));
    return;
  }

  const photoButton = event.target.closest("[data-photo]");
  if (photoButton) {
    switchDialogPhoto(photoButton);
    return;
  }

  if (event.target.closest(".dialog-visual")) {
    closeDialogGallery();
  }

  const introButton = event.target.closest("[data-intro]");
  if (introButton) {
    requestIntro(introButton.dataset.intro);
  }
});

dialog.addEventListener("pointerdown", startDialogPhotoSwipe);
dialog.addEventListener("pointerup", endDialogPhotoSwipe);
dialog.addEventListener("pointercancel", cancelDialogPhotoSwipe);
dialog.addEventListener("pointerdown", startDialogPullClose);
dialog.addEventListener("pointerup", endDialogPullClose);
dialog.addEventListener("pointercancel", cancelDialogPullClose);

function allowsDialogScroll(target) {
  if (!(target instanceof Element)) return false;
  if (window.matchMedia(compactDialogMedia).matches) {
    return Boolean(target.closest(".dialog-profile"));
  }

  return Boolean(target.closest(".dialog-details, .dialog-carousel"));
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
  cancelDialogPhotoSwipe();
  cancelDialogPullClose();
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

setupLocalizedValidation(document.querySelector("#consult"));

document.querySelector("#consult").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!reportLocalizedFormValidity(form)) return;

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
  const interestedMemberText = selectedMemberText || "未选择会员";

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
      interested_member: interestedMemberText,
      interested_member_ids: selectedMemberIds,
      source_url: window.location.href,
      user_agent: navigator.userAgent,
      form_payload: {
        selected_members: selectedMembers,
        interested_member: interestedMemberText,
      },
    });

    formMessage.textContent = `${name}，预约信息已记录，顾问将在一个工作日内联系你。`;
    form.reset();
    state.selectedMembers = [];
    renderSelectedMembers();
  } catch (error) {
    console.error(error);
    formMessage.textContent = getAppointmentErrorMessage(error);
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
});

window.addEventListener("load", () => {
  activateIcons();
});

ageValue.textContent = ageRange.value;
renderSelectedMembers();
loadProfiles();
