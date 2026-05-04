const profiles = [
  {
    id: "maya",
    name: "Maya Chen",
    cnName: "陈曼雅",
    age: 31,
    country: "加拿大",
    city: "温哥华",
    home: "中国",
    languages: ["中文", "英文"],
    intent: "结婚",
    relocation: "上海或温哥华",
    score: 96,
    verified: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    tags: ["家庭观稳定", "双语沟通", "愿意两地探访"],
    quote: "希望和对方把家庭、职业与城市选择都讲清楚，再一起认真推进。",
    about:
      "金融科技产品经理，出生在上海，长期在温哥华生活。偏好坦诚沟通，期待三到六个月内安排线下见面。",
  },
  {
    id: "oliver",
    name: "Oliver Hayes",
    cnName: "奥利弗",
    age: 36,
    country: "英国",
    city: "伦敦",
    home: "英国",
    languages: ["英文", "中文"],
    intent: "结婚",
    relocation: "伦敦或杭州",
    score: 93,
    verified: true,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    tags: ["中文学习中", "喜欢家庭旅行", "稳定职业"],
    quote: "我重视长期承诺，也愿意学习对方家庭里的表达方式。",
    about:
      "建筑顾问，曾在杭州工作两年。希望认识有国际生活经验、愿意共同规划居住城市的伴侣。",
  },
  {
    id: "aiko",
    name: "Aiko Tanaka",
    cnName: "田中爱子",
    age: 29,
    country: "日本",
    city: "东京",
    home: "日本",
    languages: ["日文", "英文", "中文"],
    intent: "稳定交往",
    relocation: "东京或台北",
    score: 89,
    verified: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    tags: ["慢热真诚", "三语沟通", "重视边界"],
    quote: "我喜欢慢慢了解，但希望每一步都是真实而有方向的。",
    about:
      "教育行业项目负责人，常往返东京与台北。期待对方尊重个人边界，同时愿意投入稳定关系。",
  },
  {
    id: "lucas",
    name: "Lucas Moreau",
    cnName: "卢卡斯",
    age: 34,
    country: "法国",
    city: "巴黎",
    home: "法国",
    languages: ["法文", "英文"],
    intent: "结婚",
    relocation: "巴黎或深圳",
    score: 91,
    verified: false,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    tags: ["开放迁居", "热爱烹饪", "家庭关系亲密"],
    quote: "好的关系应该让两个人都保留自我，也愿意一起承担现实安排。",
    about:
      "供应链策略顾问，服务多家亚洲企业。对中国文化熟悉，正在完成视频核验流程。",
  },
  {
    id: "sophia",
    name: "Sophia Miller",
    cnName: "索菲亚",
    age: 33,
    country: "美国",
    city: "旧金山",
    home: "美国",
    languages: ["英文", "中文"],
    intent: "稳定交往",
    relocation: "旧金山或上海",
    score: 88,
    verified: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    tags: ["科技行业", "可远程工作", "喜欢深度对话"],
    quote: "跨国关系不是浪漫滤镜，而是一起处理每个真实细节。",
    about:
      "数据科学家，中文流利。愿意先通过双语视频建立信任，再安排双方城市互访。",
  },
  {
    id: "ethan",
    name: "Ethan Brooks",
    cnName: "伊森",
    age: 38,
    country: "澳大利亚",
    city: "悉尼",
    home: "澳大利亚",
    languages: ["英文"],
    intent: "结婚",
    relocation: "悉尼或广州",
    score: 86,
    verified: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=900&q=80",
    tags: ["成熟稳定", "重视家庭", "愿意学习中文"],
    quote: "我期待一个温暖、直接、可以一起做长期决定的人。",
    about:
      "医疗器械企业负责人，家庭观传统但沟通开放。希望未来两年内进入婚姻阶段。",
  },
  {
    id: "lina",
    name: "Lina Weber",
    cnName: "莉娜",
    age: 35,
    country: "德国",
    city: "柏林",
    home: "德国",
    languages: ["德文", "英文", "中文"],
    intent: "先了解",
    relocation: "柏林或成都",
    score: 84,
    verified: false,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    tags: ["重视平等", "艺术策展", "喜欢城市漫步"],
    quote: "我希望关系从真实的日常开始，而不是只停在远距离想象里。",
    about:
      "策展人与自由撰稿人，曾在成都驻留半年。喜欢有耐心、能表达情绪的人。",
  },
  {
    id: "noah",
    name: "Noah Reed",
    cnName: "诺亚",
    age: 40,
    country: "美国",
    city: "纽约",
    home: "美国",
    languages: ["英文", "中文"],
    intent: "结婚",
    relocation: "纽约或北京",
    score: 90,
    verified: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    tags: ["离异无孩", "认真再婚", "财务透明"],
    quote: "我清楚自己想要什么，也希望对方能诚实谈论过去与未来。",
    about:
      "律师，曾有一段婚姻经历。重视责任感、沟通成熟度与对家庭的持续投入。",
  },
];

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

const controls = {
  home: document.querySelector("#homeFilter"),
  country: document.querySelector("#countryFilter"),
  language: document.querySelector("#languageFilter"),
  intent: document.querySelector("#intentFilter"),
  verified: document.querySelector("#verifiedFilter"),
  search: document.querySelector("#searchInput"),
};

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
    profile.home,
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
    .sort((a, b) => b.score - a.score || Number(b.isNew) - Number(a.isNew));

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

function createCardMarkup(profile) {
  const saved = state.saved.has(profile.id);

  return `
    <article class="profile-card" data-profile="${profile.id}">
      <div class="profile-photo">
        <img src="${profile.image}" alt="${profile.cnName}的会员照片" loading="lazy" />
        <span class="photo-badge">${profile.verified ? "已核验" : "待复核"}</span>
        <span class="score-pill">${profile.score}% 适配</span>
      </div>
      <div class="profile-body">
        <div class="profile-topline">
          <div>
            <h3>${profile.cnName} · ${profile.age}</h3>
            <p class="profile-meta">${profile.city}，${profile.country} · ${profile.intent}</p>
          </div>
          <button class="favorite-button ${saved ? "is-saved" : ""}" type="button" data-save="${profile.id}" aria-label="${saved ? "取消收藏" : "收藏"}${profile.cnName}">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="tag-list">
          ${profile.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
        <div class="compatibility" aria-label="适配度 ${profile.score}%">
          <span>文化与规划适配</span>
          <div class="bar"><i style="width: ${profile.score}%"></i></div>
        </div>
        <p class="profile-quote">${profile.quote}</p>
        <div class="profile-actions">
          <button type="button" data-open="${profile.id}">
            <i data-lucide="user-round"></i>
            资料
          </button>
          <button class="secondary" type="button" data-intro="${profile.id}">
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

  dialogContent.innerHTML = `
    <div class="dialog-profile">
      <div class="dialog-visual">
        <img src="${profile.image}" alt="${profile.cnName}的会员照片" />
        <span class="score-pill">${profile.score}% 适配</span>
      </div>
      <div class="dialog-details">
        <div>
          <p class="eyebrow">${profile.city}, ${profile.country}</p>
          <h2 id="dialogName">${profile.cnName}</h2>
          <p>${profile.name} · ${profile.age} 岁 · ${profile.intent}</p>
        </div>
        <p>${profile.about}</p>
        <div class="fact-grid">
          <div>
            <span>沟通语言</span>
            <strong>${profile.languages.join(" / ")}</strong>
          </div>
          <div>
            <span>未来居住地</span>
            <strong>${profile.relocation}</strong>
          </div>
          <div>
            <span>资料状态</span>
            <strong>${profile.verified ? "视频与证件已核验" : "顾问复核中"}</strong>
          </div>
          <div>
            <span>适配标签</span>
            <strong>${profile.tags[0]}</strong>
          </div>
        </div>
        <div class="tag-list">
          ${profile.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
        <button class="dialog-action" type="button" data-intro="${profile.id}">
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

  selectedMember.value = `${profile.cnName} · ${profile.city}`;
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
renderProfiles();
