# AtlasVow 环球良缘

一个纯静态的跨国婚恋网站原型，包含会员筛选、会员详情弹窗、预约初谈表单、全站皮肤切换、安全体系和成功故事页面模块。

## 后台

后台文件位于 `admin/`，访问 `admin/index.html` 可登录管理会员资料。首次使用前，请在 Supabase SQL Editor 执行 `admin/supabase-setup.sql`，并在 Supabase Auth 中手动创建管理员账号、关闭公开注册。

如果图片上传或保存会员提示权限/字段错误，请重新执行 `admin/supabase-setup.sql`。如果仍失败，执行 `admin/storage-diagnostics.sql` 检查 bucket、policy 和授权是否真的生效。

如果 Supabase 提醒 `Clients can list all files in this bucket`，执行 `admin/storage-listing-fix.sql` 移除公开列目录权限，图片公开 URL 仍可正常访问。

## 打开方式

直接用浏览器打开 `index.html` 即可运行。

如果希望通过本地服务预览，也可以在当前目录执行：

```bash
python3 -m http.server 8000
```

然后访问 `http://127.0.0.1:8000/`。
