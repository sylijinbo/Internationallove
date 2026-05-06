const supabaseConfig = {
  url: "https://hgglkxizcwazqenqmfrm.supabase.co",
  publishableKey: "sb_publishable_dEZ6qglLvXD_BvMQ09aTQw_oaOi5ZU1",
};

if (!window.supabase?.createClient) {
  const loginMessage = document.querySelector("#loginMessage");
  if (loginMessage) {
    loginMessage.textContent = "后台脚本没有加载完整，请确认网络可以访问 cdn.jsdelivr.net。";
    loginMessage.classList.add("is-error");
  }
  throw new Error("Supabase browser library failed to load.");
}

const memberPhotoBucket = "member-photos";
const maxPhotoSize = 10 * 1024 * 1024;
const draftStorageKey = "atlasvowAdminMemberDraft:v1";
const quoteHistoryStorageKey = "atlasvowAdminQuoteHistory:v1";
const photoDraftDbName = "atlasvowAdminMemberPhotoDrafts";
const photoDraftStoreName = "photos";
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
  "status",
  "created_at",
].join(",");

const client = window.supabase.createClient(
  supabaseConfig.url,
  supabaseConfig.publishableKey
);

const state = {
  session: null,
  members: [],
  editingId: null,
  existingPhotos: [],
  localPhotos: [],
  removedExistingPaths: [],
  primaryKey: "",
  restoredDraftNotice: "",
};

const els = {
  loginView: document.querySelector("#loginView"),
  adminView: document.querySelector("#adminView"),
  loginForm: document.querySelector("#loginForm"),
  loginMessage: document.querySelector("#loginMessage"),
  adminMessage: document.querySelector("#adminMessage"),
  logoutButton: document.querySelector("#logoutButton"),
  sessionEmail: document.querySelector("#sessionEmail"),
  newMemberButton: document.querySelector("#newMemberButton"),
  memberForm: document.querySelector("#memberForm"),
  formTitle: document.querySelector("#formTitle"),
  downMemberButton: document.querySelector("#downMemberButton"),
  formMessage: document.querySelector("#formMessage"),
  smartInput: document.querySelector("#smartInput"),
  parseButton: document.querySelector("#parseButton"),
  clearSmartButton: document.querySelector("#clearSmartButton"),
  missingFields: document.querySelector("#missingFields"),
  parseNotes: document.querySelector("#parseNotes"),
  memberList: document.querySelector("#memberList"),
  memberCount: document.querySelector("#memberCount"),
  memberSearch: document.querySelector("#memberSearch"),
  statusFilter: document.querySelector("#statusFilter"),
  folderInput: document.querySelector("#folderInput"),
  photoInput: document.querySelector("#photoInput"),
  photoGrid: document.querySelector("#photoGrid"),
  primaryPreview: document.querySelector("#primaryPreview"),
};

const fieldLabels = {
  display_name: "姓名",
  age: "年龄",
  gender: "性别",
  country: "国家/地区",
  intent: "关系目标",
  about: "简介",
};

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

const usStateNames = new Set([
  "阿拉巴马州",
  "阿拉斯加州",
  "亚利桑那州",
  "阿肯色州",
  "加利福尼亚州",
  "科罗拉多州",
  "康涅狄格州",
  "特拉华州",
  "佛罗里达州",
  "佐治亚州",
  "夏威夷州",
  "爱达荷州",
  "伊利诺伊州",
  "印第安纳州",
  "艾奥瓦州",
  "堪萨斯州",
  "肯塔基州",
  "路易斯安那州",
  "缅因州",
  "马里兰州",
  "马萨诸塞州",
  "密歇根州",
  "明尼苏达州",
  "密西西比州",
  "密苏里州",
  "蒙大拿州",
  "内布拉斯加州",
  "内华达州",
  "新罕布什尔州",
  "新泽西州",
  "新墨西哥州",
  "纽约州",
  "北卡罗来纳州",
  "北达科他州",
  "俄亥俄州",
  "俄克拉荷马州",
  "俄勒冈州",
  "宾夕法尼亚州",
  "罗得岛州",
  "南卡罗来纳州",
  "南达科他州",
  "田纳西州",
  "得克萨斯州",
  "德克萨斯州",
  "犹他州",
  "佛蒙特州",
  "弗吉尼亚州",
  "华盛顿州",
  "西弗吉尼亚州",
  "威斯康星州",
  "怀俄明州",
  "Tennessee",
  "TN",
]);

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

function activateIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getField(name) {
  return els.memberForm.elements[name];
}

function getValue(name) {
  const field = getField(name);
  if (!field) return "";
  return typeof field.value === "string" ? field.value.trim() : field.value;
}

function setField(name, value) {
  const field = getField(name);
  if (!field || value === undefined || value === null) return;
  const nextValue = name === "gender" ? normalizeGender(value) : value;

  if (field.type === "checkbox") {
    field.checked = Boolean(nextValue);
    return;
  }

  field.value = Array.isArray(nextValue) ? nextValue.join(", ") : String(nextValue);
}

function numberOrNull(value) {
  const number = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) && String(value ?? "").trim() !== "" ? number : null;
}

function normalizeGender(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const compact = text.replace(/\s+/g, "").toLowerCase();
  if (["female", "woman", "women", "f", "女", "女性", "女士"].includes(compact)) {
    return "female";
  }
  if (["male", "man", "men", "m", "男", "男性", "男士"].includes(compact)) {
    return "male";
  }
  if (/女|female|woman/i.test(text)) return "female";
  if (/男|male|man/i.test(text)) return "male";

  return "";
}

function splitList(value) {
  return String(value || "")
    .split(/[,，、;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
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

function buildAutoTagsFromForm() {
  return uniqueValues([
    getValue("education"),
    getValue("occupation"),
    getValue("faith"),
    getValue("smoking"),
    getValue("housing"),
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
  const count = numberOrNull(value);
  if (count === null) return "";
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

function readQuoteHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(quoteHistoryStorageKey) || "[]");
    return Array.isArray(history) ? history.map(normalizeQuote).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function rememberGeneratedQuote(quote) {
  const normalizedQuote = normalizeQuote(quote);
  if (!normalizedQuote) return;

  const history = uniqueValues([normalizedQuote, ...readQuoteHistory()]).slice(0, autoQuoteTemplates.length);
  try {
    localStorage.setItem(quoteHistoryStorageKey, JSON.stringify(history));
  } catch (error) {
    return;
  }
}

function getExistingMemberQuotes() {
  return state.members
    .filter((member) => member.id !== state.editingId)
    .map((member) => normalizeQuote(member.quote))
    .filter(Boolean);
}

function getRandomQuote() {
  const existingQuotes = new Set(getExistingMemberQuotes());
  const recentQuotes = new Set(readQuoteHistory());
  const unusedTemplates = autoQuoteTemplates.filter((quote) => {
    const normalizedQuote = normalizeQuote(quote);
    return !existingQuotes.has(normalizedQuote) && !recentQuotes.has(normalizedQuote);
  });
  const notSavedTemplates = autoQuoteTemplates.filter((quote) => !existingQuotes.has(normalizeQuote(quote)));
  const pool = unusedTemplates.length ? unusedTemplates : notSavedTemplates.length ? notSavedTemplates : autoQuoteTemplates;
  const quote = pool[Math.floor(Math.random() * pool.length)];
  rememberGeneratedQuote(quote);
  return quote;
}

function buildAutoDescriptionFromForm() {
  const displayName = getValue("display_name") || getValue("legal_name") || "该会员";
  const location = [getValue("country"), getValue("state_region"), getValue("city")]
    .filter(Boolean)
    .join("");
  const height = numberOrNull(getValue("height_cm"));
  const weight = numberOrNull(getValue("weight_lb"));

  const intro = sentenceFromParts([
    location ? `${displayName} 现居${location}` : displayName,
    formatEducation(getValue("education")),
    formatOccupation(getValue("occupation")),
  ]);
  const profile = sentenceFromParts([
    height ? `身高 ${height}cm` : "",
    weight ? `体重 ${weight}lb` : "",
    getValue("marital_status"),
    formatChildren(getValue("children_count")),
    getValue("housing") ? `居住在${getValue("housing")}` : "",
  ]);
  const lifestyle = sentenceFromParts([
    getValue("faith") ? `信仰${getValue("faith")}` : "",
    getValue("smoking"),
    formatDrinking(getValue("drinking")),
  ]);

  return [intro, profile, lifestyle].filter(Boolean).join("");
}

function fillGeneratedProfileText() {
  const description = buildAutoDescriptionFromForm();
  if (description && !getValue("about")) {
    setField("about", description);
  }
  if (!getValue("quote")) {
    setField("quote", getRandomQuote());
  }
  if (!getValue("tags")) {
    const tags = buildAutoTagsFromForm();
    if (tags.length) {
      setField("tags", tags);
    }
  }
}

function getLocationLabel(member) {
  return [member.city, member.state_region, member.country].filter(Boolean).join("，");
}

function getPhotoUrl(path) {
  if (!path) return "";
  return client.storage.from(memberPhotoBucket).getPublicUrl(path).data.publicUrl;
}

function encodeStoragePath(path) {
  return String(path || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (error) {
    return null;
  }
}

function makeExistingKey(path) {
  return `existing:${path}`;
}

function makeLocalKey() {
  return `local:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function getAllPhotos() {
  return [...state.existingPhotos, ...state.localPhotos];
}

function getPrimaryPhoto() {
  return getAllPhotos().find((photo) => photo.key === state.primaryKey) || null;
}

function setStatus(message, target = els.formMessage) {
  target.textContent = message;
  target.classList.remove("is-error", "is-success");
}

function setError(message, target = els.formMessage) {
  target.textContent = message;
  target.classList.add("is-error");
  target.classList.remove("is-success");
}

function setSuccess(message, target = els.formMessage) {
  target.textContent = message;
  target.classList.add("is-success");
  target.classList.remove("is-error");
}

function setVisible(element, isVisible) {
  element.hidden = !isVisible;
  element.classList.toggle("is-hidden", !isVisible);
}

function readDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(draftStorageKey) || "null");
    return draft && typeof draft === "object" ? draft : null;
  } catch (error) {
    return null;
  }
}

function openPhotoDraftDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("当前浏览器不支持本地图片暂存。"));
      return;
    }

    const request = window.indexedDB.open(photoDraftDbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(photoDraftStoreName)) {
        db.createObjectStore(photoDraftStoreName, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("图片暂存数据库打开失败。"));
  });
}

function withPhotoDraftStore(mode, run) {
  return openPhotoDraftDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(photoDraftStoreName, mode);
        const store = transaction.objectStore(photoDraftStoreName);
        let result;

        try {
          result = run(store);
        } catch (error) {
          transaction.abort();
          db.close();
          reject(error);
          return;
        }

        transaction.oncomplete = () => {
          db.close();
          resolve(result);
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error || new Error("图片暂存失败。"));
        };
        transaction.onabort = () => {
          db.close();
          reject(transaction.error || new Error("图片暂存已取消。"));
        };
      })
  );
}

function cacheDraftPhoto(photo) {
  if (!photo?.file) return Promise.resolve();

  return withPhotoDraftStore("readwrite", (store) => {
    store.put({
      key: photo.key,
      name: photo.name,
      file: photo.file,
      fileName: photo.file.name,
      type: photo.file.type,
      size: photo.file.size,
      lastModified: photo.file.lastModified,
      savedAt: new Date().toISOString(),
    });
  });
}

function getCachedDraftPhotos(keys) {
  const uniqueKeys = uniqueValues(keys);
  if (!uniqueKeys.length) return Promise.resolve(new Map());

  return withPhotoDraftStore("readonly", (store) => {
    const records = new Map();
    uniqueKeys.forEach((key) => {
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result) {
          records.set(key, request.result);
        }
      };
    });
    return records;
  });
}

function removeCachedDraftPhoto(key) {
  if (!key) return Promise.resolve();
  return withPhotoDraftStore("readwrite", (store) => store.delete(key));
}

function clearCachedDraftPhotos() {
  return withPhotoDraftStore("readwrite", (store) => store.clear());
}

function getLocalPhotoDrafts() {
  return state.localPhotos.map((photo) => ({
    key: photo.key,
    name: photo.name,
    fileName: photo.file?.name || photo.name,
    type: photo.file?.type || "",
    size: photo.file?.size || 0,
    lastModified: photo.file?.lastModified || null,
  }));
}

function getDraftLocalPhotoRefs(draft) {
  if (Array.isArray(draft.localPhotos)) {
    return draft.localPhotos.filter((photo) => photo?.key);
  }

  return [];
}

async function restoreLocalPhotosFromDraft(draft) {
  const localPhotoRefs = getDraftLocalPhotoRefs(draft);
  if (!localPhotoRefs.length) return [];

  try {
    const cachedRecords = await getCachedDraftPhotos(localPhotoRefs.map((photo) => photo.key));
    return localPhotoRefs
      .map((photo) => {
        const record = cachedRecords.get(photo.key);
        const file = record?.file;
        if (!file) return null;

        return {
          key: photo.key,
          source: "local",
          file,
          url: URL.createObjectURL(file),
          name: photo.name || record.name || file.name,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("Local photo draft restore failed", error);
    return [];
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(draftStorageKey);
  } catch (error) {
    return false;
  }
  clearCachedDraftPhotos().catch((error) => {
    console.warn("Photo draft cleanup failed", error);
  });
  return true;
}

function getDraftFields() {
  return Array.from(els.memberForm.elements).filter((field) => field.name);
}

function collectFormValues() {
  return getDraftFields().reduce((values, field) => {
    values[field.name] = field.type === "checkbox" ? field.checked : field.value;
    return values;
  }, {});
}

function hasDraftContent(values) {
  return Object.entries(values).some(([name, value]) => {
    if (name === "status" && value === "published") return false;
    if (typeof value === "boolean") return value;
    return String(value || "").trim() !== "";
  });
}

function saveDraft() {
  const values = collectFormValues();
  const existingPhotoPaths = state.existingPhotos.map((photo) => photo.path);
  const localPhotos = getLocalPhotoDrafts();
  const localPhotoNames = localPhotos.map((photo) => photo.name);
  const shouldSave =
    hasDraftContent(values) ||
    els.smartInput.value.trim() ||
    existingPhotoPaths.length ||
    localPhotos.length ||
    state.editingId;

  if (!shouldSave) {
    clearDraft();
    return;
  }

  const draft = {
    savedAt: new Date().toISOString(),
    editingId: state.editingId,
    values,
    smartInput: els.smartInput.value,
    existingPhotoPaths,
    removedExistingPaths: state.removedExistingPaths,
    primaryKey: state.primaryKey,
    localPhotos,
    localPhotoNames,
  };

  try {
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  } catch (error) {
    setError("浏览器暂存空间不足，当前内容没有成功暂存。", els.adminMessage);
  }
}

async function restoreDraft() {
  const draft = readDraft();
  if (!draft) return false;

  revokeLocalPhotoUrls();
  state.editingId = draft.editingId || null;
  state.removedExistingPaths = Array.isArray(draft.removedExistingPaths)
    ? draft.removedExistingPaths
    : [];
  state.existingPhotos = Array.isArray(draft.existingPhotoPaths)
    ? draft.existingPhotoPaths.filter(Boolean).map((path) => ({
        key: makeExistingKey(path),
        source: "existing",
        path,
        url: getPhotoUrl(path),
        name: path.split("/").pop() || "照片",
      }))
    : [];
  state.localPhotos = await restoreLocalPhotosFromDraft(draft);
  state.primaryKey = getAllPhotos().some((photo) => photo.key === draft.primaryKey)
    ? draft.primaryKey
    : getAllPhotos()[0]?.key || "";

  els.memberForm.reset();
  Object.entries(draft.values || {}).forEach(([name, value]) => setField(name, value));
  els.smartInput.value = draft.smartInput || "";
  els.formTitle.textContent = state.editingId ? "继续编辑未保存会员" : "继续填写未保存会员";
  els.downMemberButton.hidden = !state.editingId;
  els.parseNotes.innerHTML = "";
  renderPhotos();
  updateMissingFields();
  renderMemberList();

  const localPhotoRefs = getDraftLocalPhotoRefs(draft);
  const legacyLocalPhotoCount =
    !localPhotoRefs.length && Array.isArray(draft.localPhotoNames) ? draft.localPhotoNames.length : 0;
  const expectedLocalPhotoCount = localPhotoRefs.length || legacyLocalPhotoCount;
  if (expectedLocalPhotoCount && state.localPhotos.length === expectedLocalPhotoCount) {
    state.restoredDraftNotice = `已恢复上次未保存的草稿，包括 ${state.localPhotos.length} 张本地图片。`;
  } else if (expectedLocalPhotoCount && state.localPhotos.length) {
    state.restoredDraftNotice = `已恢复文字草稿和 ${state.localPhotos.length}/${expectedLocalPhotoCount} 张本地图片；其余图片需要重新选择。`;
  } else if (expectedLocalPhotoCount) {
    state.restoredDraftNotice = `已恢复文字草稿；${expectedLocalPhotoCount} 张本地图片需要重新选择。`;
  } else {
    state.restoredDraftNotice = "已恢复上次未保存的草稿。";
  }
  setSuccess(state.restoredDraftNotice, els.adminMessage);
  return true;
}

function getFriendlyErrorMessage(error) {
  const message = error?.message || String(error || "未知错误");
  if (/row-level security policy/i.test(message)) {
    return `权限策略阻止了这次操作：${message}。请重新执行 admin/supabase-setup.sql；如果仍失败，再执行 admin/storage-diagnostics.sql 检查策略。`;
  }
  if (/permission denied for table members/i.test(message)) {
    return "members 表还没有给后台登录用户写入权限。请在 Supabase SQL Editor 重新执行 admin/supabase-setup.sql。";
  }
  if (/members_gender_check|check constraint.*gender/i.test(message)) {
    return "members.gender 的数据库约束还没更新。请在 Supabase SQL Editor 重新执行 admin/supabase-setup.sql，然后刷新后台重试。";
  }
  if (/gender|interested_member_ids|column/i.test(message)) {
    return `数据库字段还没准备好：${message}。请先在 Supabase SQL Editor 执行 admin/supabase-setup.sql。`;
  }
  if (/invalid login credentials/i.test(message)) {
    return "邮箱或密码不正确。";
  }
  if (/email not confirmed/i.test(message)) {
    return "邮箱还没有确认，请先打开确认邮件。";
  }
  if (/failed to fetch|network/i.test(message)) {
    return "网络请求失败，请确认当前页面可以访问 Supabase。";
  }
  return message;
}

async function init() {
  try {
    activateIcons();
    const { data, error } = await client.auth.getSession();
    if (error) {
      setError(`会话读取失败：${getFriendlyErrorMessage(error)}`, els.loginMessage);
      return;
    }
    await applySession(data.session);

    client.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });
  } catch (error) {
    setError(`后台初始化失败：${getFriendlyErrorMessage(error)}`, els.loginMessage);
  }
}

async function applySession(session) {
  state.session = session;
  const isSignedIn = Boolean(session);
  setVisible(els.loginView, !isSignedIn);
  setVisible(els.adminView, isSignedIn);
  els.logoutButton.hidden = !isSignedIn;
  els.sessionEmail.textContent = session?.user?.email || "";

  if (isSignedIn) {
    setSuccess("登录成功，正在加载会员资料...", els.adminMessage);
    if (!(await restoreDraft())) {
      resetEditor();
    }
    loadMembers();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const submitButton = event.currentTarget.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  setStatus("正在登录...", els.loginMessage);

  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setError(`登录失败：${getFriendlyErrorMessage(error)}`, els.loginMessage);
      return;
    }

    setSuccess("登录成功，正在进入后台...", els.loginMessage);
    await applySession(data.session);
  } catch (error) {
    setError(`登录失败：${getFriendlyErrorMessage(error)}`, els.loginMessage);
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
}

async function loadMembers() {
  setStatus("正在加载会员...", els.adminMessage);
  const { data, error } = await client
    .from("members")
    .select(memberSelectFields)
    .order("created_at", { ascending: false });

  if (error) {
    setError(`会员加载失败：${getFriendlyErrorMessage(error)}`, els.adminMessage);
    return;
  }

  state.members = Array.isArray(data) ? data : [];
  renderMemberList();
  setSuccess(
    state.restoredDraftNotice
      ? `${state.restoredDraftNotice} 已加载 ${state.members.length} 位会员。`
      : `已加载 ${state.members.length} 位会员。`,
    els.adminMessage
  );
}

function renderMemberList() {
  const search = els.memberSearch.value.trim().toLowerCase();
  const status = els.statusFilter.value;
  const filtered = state.members.filter((member) => {
    const normalizedStatus = member.status === "published" ? "published" : "draft";
    const searchable = [
      member.display_name,
      member.legal_name,
      member.country,
      member.state_region,
      member.city,
      member.occupation,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (status === "all" || normalizedStatus === status) &&
      (!search || searchable.includes(search))
    );
  });

  els.memberCount.textContent = filtered.length;

  if (!filtered.length) {
    els.memberList.innerHTML = `<div class="notice-box subtle">暂无符合条件的会员。</div>`;
    return;
  }

  els.memberList.innerHTML = filtered
    .map((member) => {
      const photo = member.primary_photo_path || (member.photo_paths || [])[0] || "";
      const statusLabel = member.status === "published" ? "已发布" : "已下架";
      const statusClass = member.status === "published" ? "" : " is-draft";
      const activeClass = member.id === state.editingId ? " is-active" : "";
      const imageMarkup = photo
        ? `<img src="${escapeHtml(getPhotoUrl(photo))}" alt="${escapeHtml(member.display_name || "会员")}头像" />`
        : `<span class="photo-placeholder">AV</span>`;

      return `
        <button class="member-row${activeClass}" type="button" data-edit="${escapeHtml(member.id)}">
          ${imageMarkup}
          <span>
            <strong>${escapeHtml(member.display_name || "未命名会员")}</strong>
            <small>${escapeHtml(getLocationLabel(member) || "未填写地区")}</small>
          </span>
          <span class="status-pill${statusClass}">${statusLabel}</span>
        </button>
      `;
    })
    .join("");
}

function resetEditor(options = {}) {
  if (options.clearDraft) {
    clearDraft();
  }

  revokeLocalPhotoUrls();
  state.editingId = null;
  state.existingPhotos = [];
  state.localPhotos = [];
  state.removedExistingPaths = [];
  state.primaryKey = "";
  state.restoredDraftNotice = "";
  els.memberForm.reset();
  els.smartInput.value = "";
  els.folderInput.value = "";
  els.photoInput.value = "";
  setField("status", "published");
  els.formTitle.textContent = "新增会员";
  els.downMemberButton.hidden = true;
  els.parseNotes.innerHTML = "";
  renderPhotos();
  updateMissingFields();
  setStatus("");
  renderMemberList();
}

function editMember(memberId) {
  const member = state.members.find((item) => item.id === memberId);
  if (!member) return;

  revokeLocalPhotoUrls();
  state.editingId = member.id;
  state.localPhotos = [];
  state.removedExistingPaths = [];
  state.existingPhotos = (member.photo_paths || []).filter(Boolean).map((path) => ({
    key: makeExistingKey(path),
    source: "existing",
    path,
    url: getPhotoUrl(path),
    name: path.split("/").pop() || "照片",
  }));
  const primaryPath = member.primary_photo_path || state.existingPhotos[0]?.path || "";
  state.primaryKey = primaryPath ? makeExistingKey(primaryPath) : "";

  Object.entries({
    id: member.id,
    display_name: member.display_name,
    legal_name: member.legal_name,
    slug: member.slug,
    status: member.status === "published" ? "published" : "draft",
    age: member.age,
    gender: normalizeGender(member.gender),
    country: member.country,
    state_region: member.state_region,
    city: member.city,
    intent: member.intent,
    match_score: member.match_score,
    relocation: member.relocation,
    education: member.education,
    occupation: member.occupation,
    height_cm: member.height_cm,
    weight_lb: member.weight_lb,
    marital_status: member.marital_status,
    children_count: member.children_count,
    housing: member.housing,
    faith: member.faith,
    smoking: member.smoking,
    drinking: member.drinking,
    languages: member.languages || [],
    tags: member.tags || [],
    quote: member.quote,
    about: member.about,
    is_verified: member.is_verified,
    is_new: member.is_new,
  }).forEach(([name, value]) => setField(name, value));

  els.smartInput.value = "";
  els.parseNotes.innerHTML = "";
  els.formTitle.textContent = `编辑 ${member.display_name || "会员"}`;
  els.downMemberButton.hidden = false;
  renderPhotos();
  updateMissingFields();
  setStatus("已载入会员资料。");
  renderMemberList();
  saveDraft();
}

function isAcceptedImage(file) {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

async function addLocalFiles(fileList) {
  const files = Array.from(fileList || []);
  const accepted = [];
  const skipped = [];

  if (!files.length) return;

  files.forEach((file) => {
    if (!isAcceptedImage(file)) {
      skipped.push(`${file.name} 格式不支持`);
      return;
    }

    if (file.size > maxPhotoSize) {
      skipped.push(`${file.name} 超过 10MB`);
      return;
    }

    accepted.push({
      key: makeLocalKey(),
      source: "local",
      file,
      url: URL.createObjectURL(file),
      name: file.webkitRelativePath || file.name,
    });
  });

  if (!accepted.length) {
    updateMissingFields();
    saveDraft();
    setStatus(skipped.length ? `未加入图片：${skipped.join("；")}` : "没有选择图片。");
    return;
  }

  state.localPhotos.push(...accepted);
  if (!state.primaryKey && accepted[0]) {
    state.primaryKey = accepted[0].key;
  }

  const cacheResults = await Promise.allSettled(accepted.map((photo) => cacheDraftPhoto(photo)));
  const failedCacheCount = cacheResults.filter((result) => result.status === "rejected").length;
  renderPhotos();
  updateMissingFields();
  saveDraft();
  const statusParts = [`已加入 ${accepted.length} 张图片`];
  if (skipped.length) {
    statusParts.push(`跳过：${skipped.join("；")}`);
  }
  if (failedCacheCount) {
    statusParts.push(`其中 ${failedCacheCount} 张没有成功暂存，离开页面后可能需要重新选择`);
  }
  setStatus(`${statusParts.join("；")}。`);
}

function revokeLocalPhotoUrls() {
  state.localPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
}

function removePhoto(photoKey) {
  const localPhoto = state.localPhotos.find((photo) => photo.key === photoKey);
  const existingPhoto = state.existingPhotos.find((photo) => photo.key === photoKey);
  if (localPhoto) {
    URL.revokeObjectURL(localPhoto.url);
    removeCachedDraftPhoto(localPhoto.key).catch((error) => {
      console.warn("Photo draft delete failed", error);
    });
  }
  if (existingPhoto) {
    state.removedExistingPaths.push(existingPhoto.path);
  }

  state.localPhotos = state.localPhotos.filter((photo) => photo.key !== photoKey);
  state.existingPhotos = state.existingPhotos.filter((photo) => photo.key !== photoKey);

  if (state.primaryKey === photoKey) {
    state.primaryKey = getAllPhotos()[0]?.key || "";
  }

  renderPhotos();
  updateMissingFields();
  saveDraft();
}

function renderPhotos() {
  const photos = getAllPhotos();

  if (!photos.length) {
    els.photoGrid.innerHTML = `<div class="notice-box subtle">还没有选择图片。</div>`;
    updatePrimaryPreview();
    return;
  }

  els.photoGrid.innerHTML = photos
    .map(
      (photo) => `
        <div class="photo-item${photo.key === state.primaryKey ? " is-primary" : ""}">
          <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.name)}" />
          <div class="photo-buttons">
            <button type="button" data-primary-photo="${escapeHtml(photo.key)}">
              ${photo.key === state.primaryKey ? "当前主图" : "设为主图"}
            </button>
            <button type="button" data-remove-photo="${escapeHtml(photo.key)}" aria-label="移除图片">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `
    )
    .join("");
  updatePrimaryPreview();
  activateIcons();
}

function updatePrimaryPreview() {
  const primary = getPrimaryPhoto();
  const displayName = getValue("display_name") || "会员名";
  const age = getValue("age") || "年龄";
  const location = [getValue("city"), getValue("state_region"), getValue("country")]
    .filter(Boolean)
    .join("，");
  const intent = getValue("intent") || "关系目标";
  const imageMarkup = primary
    ? `<img src="${escapeHtml(primary.url)}" alt="${escapeHtml(displayName)}主页头像预览" />`
    : `<div class="preview-photo-empty">请选择主图</div>`;

  els.primaryPreview.innerHTML = `
    ${imageMarkup}
    <div class="preview-card-body">
      <span>${escapeHtml(displayName)} · ${escapeHtml(age)}</span>
      <small>${escapeHtml([location || "地区", intent].join(" · "))}</small>
    </div>
  `;
}

function updateMissingFields() {
  const missing = getMissingFields();
  els.missingFields.innerHTML = missing.length
    ? missing.map((item) => `<span>${escapeHtml(item)}</span>`).join("")
    : `<span>前台必需字段已完整</span>`;
}

function getMissingFields() {
  const missing = [];
  Object.entries(fieldLabels).forEach(([field, label]) => {
    if (!getValue(field)) {
      missing.push(label);
    }
  });

  const hasPhotos = getAllPhotos().length > 0;
  if (!hasPhotos) {
    missing.push("至少一张图片");
  }
  if (hasPhotos && !getPrimaryPhoto()) {
    missing.push("主图");
  }

  return missing;
}

function normalizeKey(key) {
  return key.replace(/\s+/g, "").replace(/[：:]/g, "").toLowerCase();
}

function normalizeBoolean(value) {
  return /^(是|已|true|yes|y|1|完成|已核验|核验)$/i.test(String(value).trim());
}

function parseLocation(value) {
  const parts = String(value)
    .replace(/，/g, ",")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const result = {};

  if (parts.length >= 3) {
    result.country = normalizeCountry(parts[0]);
    result.state_region = parts[1];
    result.city = parts.slice(2).join("，");
    return result;
  }

  if (parts.length === 2) {
    if (isCountry(parts[0])) {
      result.country = normalizeCountry(parts[0]);
      result.state_region = parts[1];
    } else if (usStateNames.has(parts[0])) {
      result.country = "美国";
      result.state_region = parts[0];
      result.city = parts[1];
    } else {
      result.state_region = parts[0];
      result.city = parts[1];
    }
    return result;
  }

  const location = parts[0] || String(value).trim();
  if (usStateNames.has(location)) {
    result.country = "美国";
    result.state_region = location;
  } else if (isCountry(location)) {
    result.country = normalizeCountry(location);
  } else {
    result.city = location;
  }

  return result;
}

function isCountry(value) {
  return /^(美国|usa|us|united states|中国|china|加拿大|canada|英国|uk|法国|france|德国|germany|澳大利亚|australia|日本|japan)$/i.test(
    value
  );
}

function normalizeCountry(value) {
  if (/^(usa|us|united states)$/i.test(value)) return "美国";
  if (/^china$/i.test(value)) return "中国";
  if (/^canada$/i.test(value)) return "加拿大";
  if (/^(uk|united kingdom)$/i.test(value)) return "英国";
  if (/^france$/i.test(value)) return "法国";
  if (/^germany$/i.test(value)) return "德国";
  if (/^australia$/i.test(value)) return "澳大利亚";
  if (/^japan$/i.test(value)) return "日本";
  return value;
}

function parseSmartText() {
  const text = els.smartInput.value.trim();
  const notes = [];
  let applied = 0;

  if (!text) {
    setStatus("请先粘贴会员资料。");
    return;
  }

  text.split(/\n+/).forEach((line) => {
    const cleaned = line.trim();
    if (!cleaned) return;

    const match = cleaned.match(/^([^:：]+)[:：]\s*(.+)$/);
    if (!match) {
      notes.push(`未识别：${cleaned}`);
      return;
    }

    const key = normalizeKey(match[1]);
    const value = match[2].trim();
    const handled = applyParsedField(key, value);

    if (handled) {
      applied += 1;
    } else {
      notes.push(`${match[1].trim()}：${value}`);
    }
  });

  els.parseNotes.innerHTML = notes.length
    ? notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : `<li>没有待处理内容。</li>`;
  fillGeneratedProfileText();
  updateMissingFields();
  updatePrimaryPreview();
  saveDraft();
  setStatus(`已识别 ${applied} 个字段。`);
}

function applyParsedField(key, value) {
  if (["姓名", "name", "displayname"].includes(key)) {
    setField("display_name", value);
    setField("legal_name", value);
    return true;
  }

  if (["年龄", "age"].includes(key)) {
    setField("age", numberOrNull(value));
    return true;
  }

  if (["性别", "gender"].includes(key)) {
    const gender = normalizeGender(value);
    if (!gender) return false;
    setField("gender", gender);
    return true;
  }

  if (["教育", "学历", "education"].includes(key)) return applySimpleField("education", value);
  if (["职业", "工作", "occupation"].includes(key)) return applySimpleField("occupation", value);
  if (["婚姻状况", "婚姻", "maritalstatus"].includes(key)) return applySimpleField("marital_status", value);
  if (["居住", "住房", "房产", "housing"].includes(key)) return applySimpleField("housing", value);
  if (["信仰", "宗教", "faith"].includes(key)) return applySimpleField("faith", value);
  if (["抽烟", "吸烟", "smoking"].includes(key)) return applySimpleField("smoking", value);
  if (["是否喝酒", "喝酒", "饮酒", "drinking"].includes(key)) return applySimpleField("drinking", value);
  if (["关系目标", "目标", "意向", "intent"].includes(key)) return applySimpleField("intent", value);
  if (["未来居住地", "relocation"].includes(key)) return applySimpleField("relocation", value);
  if (["一句话", "引用语", "quote"].includes(key)) return applySimpleField("quote", value);
  if (["简介", "自我介绍", "介绍", "about"].includes(key)) return applySimpleField("about", value);

  if (["身高", "height", "heightcm"].includes(key)) {
    setField("height_cm", numberOrNull(value));
    return true;
  }

  if (["体重", "weight", "weightlb"].includes(key)) {
    setField("weight_lb", numberOrNull(value));
    return true;
  }

  if (["孩子", "子女", "children", "childrencount"].includes(key)) {
    setField("children_count", numberOrNull(value));
    return true;
  }

  if (["常住地", "所在地", "住址", "地区", "location"].includes(key)) {
    const location = parseLocation(value);
    Object.entries(location).forEach(([field, fieldValue]) => setField(field, fieldValue));
    return true;
  }

  if (["语言", "沟通语言", "languages"].includes(key)) {
    setField("languages", splitList(value));
    return true;
  }

  if (["标签", "tags"].includes(key)) {
    setField("tags", splitList(value));
    return true;
  }

  if (["适配分", "适配度", "matchscore"].includes(key)) {
    setField("match_score", numberOrNull(value));
    return true;
  }

  if (["核验", "已核验", "isverified"].includes(key)) {
    setField("is_verified", normalizeBoolean(value));
    return true;
  }

  if (["新会员", "新上线", "isnew"].includes(key)) {
    setField("is_new", normalizeBoolean(value));
    return true;
  }

  return false;
}

function applySimpleField(field, value) {
  setField(field, value);
  return true;
}

function makeSlug(name) {
  const base = String(name || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${base || "member"}-${Date.now()}`;
}

function sanitizeFileName(name, fallbackExtension = "jpg") {
  const extension = (name.match(/\.([^.]+)$/)?.[1] || fallbackExtension).toLowerCase();
  const base = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${base || "photo"}.${extension}`;
}

function buildStoragePath(slug, photo, index) {
  const extension = photo.file.type === "image/png" ? "png" : photo.file.type === "image/webp" ? "webp" : "jpg";
  return `members/${slug}/${Date.now()}-${index}-${sanitizeFileName(photo.file.name || photo.name, extension)}`;
}

async function parseUploadError(response) {
  try {
    const details = await response.json();
    return details.message || details.error || response.statusText;
  } catch (error) {
    return response.statusText || "图片上传失败";
  }
}

async function uploadPhotoWithSession(path, file, session) {
  const response = await fetch(
    `${supabaseConfig.url}/storage/v1/object/${memberPhotoBucket}/${encodeStoragePath(path)}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseConfig.publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        "Cache-Control": "3600",
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "false",
      },
      body: file,
    }
  );

  if (!response.ok) {
    throw new Error(await parseUploadError(response));
  }
}

async function uploadLocalPhotos(slug) {
  const uploaded = [];
  const keyToPath = new Map();
  const { data } = await client.auth.getSession();

  if (!data.session) {
    throw new Error("登录状态已过期，请刷新后台并重新登录后再上传图片。");
  }
  const tokenPayload = decodeJwtPayload(data.session.access_token);

  for (const [index, photo] of state.localPhotos.entries()) {
    const path = buildStoragePath(slug, photo, index + 1);
    try {
      await uploadPhotoWithSession(path, photo.file, data.session);
    } catch (error) {
      throw new Error(
        `${photo.name} 上传失败：${getFriendlyErrorMessage(error)} 当前登录角色：${tokenPayload?.role || "未知"}。`
      );
    }

    uploaded.push(path);
    keyToPath.set(photo.key, path);
  }

  return { uploaded, keyToPath };
}

function buildMemberPayload(slug, photoPaths, primaryPhotoPath) {
  const displayName = getValue("display_name");
  const description = buildAutoDescriptionFromForm();
  const tags = splitList(getValue("tags"));
  const quote = getValue("quote");
  const about = getValue("about");
  return {
    display_name: displayName,
    legal_name: getValue("legal_name") || displayName,
    slug,
    status: getValue("status") || "published",
    age: numberOrNull(getValue("age")),
    gender: normalizeGender(getValue("gender")) || null,
    country: getValue("country") || null,
    state_region: getValue("state_region") || null,
    city: getValue("city") || null,
    education: getValue("education") || null,
    occupation: getValue("occupation") || null,
    height_cm: numberOrNull(getValue("height_cm")),
    weight_lb: numberOrNull(getValue("weight_lb")),
    marital_status: getValue("marital_status") || null,
    children_count: numberOrNull(getValue("children_count")),
    housing: getValue("housing") || null,
    faith: getValue("faith") || null,
    smoking: getValue("smoking") || null,
    drinking: getValue("drinking") || null,
    languages: splitList(getValue("languages")),
    intent: getValue("intent") || null,
    relocation: getValue("relocation") || null,
    tags: tags.length ? tags : buildAutoTagsFromForm(),
    match_score: numberOrNull(getValue("match_score")),
    is_verified: getField("is_verified").checked,
    is_new: getField("is_new").checked,
    quote: quote || getRandomQuote(),
    about: about || description || null,
    primary_photo_path: primaryPhotoPath,
    photo_paths: photoPaths,
  };
}

async function handleSave(event) {
  event.preventDefault();
  fillGeneratedProfileText();
  const missing = getMissingFields();
  if (missing.length) {
    updateMissingFields();
    setStatus(`请补充：${missing.join("、")}。`);
    return;
  }

  const submitButton = els.memberForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  setStatus("正在保存会员...");

  const slug = getValue("slug") || makeSlug(getValue("display_name"));
  setField("slug", slug);
  let uploadedPaths = [];

  try {
    const { uploaded, keyToPath } = await uploadLocalPhotos(slug);
    uploadedPaths = uploaded;

    const existingPaths = state.existingPhotos.map((photo) => photo.path);
    const photoPaths = [...existingPaths, ...uploadedPaths];
    const primaryPhotoPath = state.primaryKey.startsWith("existing:")
      ? state.primaryKey.replace(/^existing:/, "")
      : keyToPath.get(state.primaryKey) || photoPaths[0];
    const payload = buildMemberPayload(slug, photoPaths, primaryPhotoPath);

    const request = state.editingId
      ? client.from("members").update(payload).eq("id", state.editingId)
      : client.from("members").insert(payload);
    const { error } = await request;

    if (error) {
      throw error;
    }

    if (state.removedExistingPaths.length) {
      await client.storage.from(memberPhotoBucket).remove(state.removedExistingPaths);
      state.removedExistingPaths = [];
    }

    setStatus("会员已保存。");
    await loadMembers();
    const savedMember = state.editingId
      ? state.members.find((member) => member.id === state.editingId)
      : state.members.find((member) => member.slug === slug);

    if (savedMember) {
      editMember(savedMember.id);
    } else {
      resetEditor();
    }
    clearDraft();
  } catch (error) {
    console.error(error);
    if (uploadedPaths.length) {
      await client.storage.from(memberPhotoBucket).remove(uploadedPaths);
    }
    setStatus(`保存失败：${error.message}`);
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
}

async function handleDownMember() {
  if (!state.editingId) return;
  const memberName = getValue("display_name") || "该会员";
  const confirmed = window.confirm(`确认下架 ${memberName}？前台将不再显示。`);
  if (!confirmed) return;

  setStatus("正在下架会员...");
  const { error } = await client.from("members").update({ status: "draft" }).eq("id", state.editingId);

  if (error) {
    setStatus(`下架失败：${error.message}`);
    return;
  }

  setField("status", "draft");
  setStatus("会员已下架。");
  await loadMembers();
  editMember(state.editingId);
  clearDraft();
}

els.loginForm.addEventListener("submit", handleLogin);

els.logoutButton.addEventListener("click", async () => {
  await client.auth.signOut();
});

els.newMemberButton.addEventListener("click", () => {
  resetEditor({ clearDraft: true });
});
els.memberForm.addEventListener("submit", handleSave);
els.downMemberButton.addEventListener("click", handleDownMember);

els.memberList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  if (editButton) {
    editMember(editButton.dataset.edit);
  }
});

els.memberSearch.addEventListener("input", renderMemberList);
els.statusFilter.addEventListener("change", renderMemberList);

els.parseButton.addEventListener("click", parseSmartText);
els.clearSmartButton.addEventListener("click", () => {
  els.smartInput.value = "";
  els.parseNotes.innerHTML = "";
  saveDraft();
  setStatus("智能录入内容已清空。");
});

els.smartInput.addEventListener("input", saveDraft);

els.folderInput.addEventListener("change", async (event) => {
  await addLocalFiles(event.target.files);
  event.target.value = "";
});

els.photoInput.addEventListener("change", async (event) => {
  await addLocalFiles(event.target.files);
  event.target.value = "";
});

els.photoGrid.addEventListener("click", (event) => {
  const primaryButton = event.target.closest("[data-primary-photo]");
  const removeButton = event.target.closest("[data-remove-photo]");

  if (primaryButton) {
    state.primaryKey = primaryButton.dataset.primaryPhoto;
    renderPhotos();
    updateMissingFields();
    saveDraft();
  }

  if (removeButton) {
    removePhoto(removeButton.dataset.removePhoto);
  }
});

els.memberForm.addEventListener("input", () => {
  updateMissingFields();
  updatePrimaryPreview();
  saveDraft();
});

window.addEventListener("beforeunload", saveDraft);

init();
