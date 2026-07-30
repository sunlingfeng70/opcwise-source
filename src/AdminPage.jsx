import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "opcwise-admin-token";

function go(route) {
  window.location.hash = `#/${route}`;
  window.scrollTo({ top: 0 });
}

function fetchWithAuth(url, token, method) {
  return fetch(url, {
    method: method || "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1>OPCWISE 管理后台</h1>
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <div className="admin-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}

function FileCell({ value }) {
  if (!value) return <span className="admin-null">-</span>;
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(value);
  if (isImage) {
    return <img className="admin-thumb" src={value} alt="上传文件" />;
  }
  const isVideo = /\.(mp4|mov|avi)$/i.test(value);
  if (isVideo) {
    return <a className="admin-file-link" href={value} target="_blank" rel="noopener noreferrer">视频文件 ↗</a>;
  }
  const isPdf = /\.pdf$/i.test(value);
  if (isPdf) {
    return <a className="admin-file-link" href={value} target="_blank" rel="noopener noreferrer">PDF 文件 ↗</a>;
  }
  return <a className="admin-file-link" href={value} target="_blank" rel="noopener noreferrer">下载文件 ↗</a>;
}

const AIGC_COLUMNS = [
  { key: "id", label: "编号" },
  { key: "created_at", label: "提交时间" },
  { key: "name", label: "姓名" },
  { key: "phone", label: "手机号" },
  { key: "city", label: "城市" },
  { key: "wechat", label: "微信" },
  { key: "identity", label: "身份" },
  { key: "paths", label: "发展路径", render: (v) => v?.join(", ") },
  { key: "stage", label: "阶段" },
  { key: "directions", label: "AIGC方向", render: (v) => v?.join(", ") },
  { key: "intro", label: "介绍" },
  { key: "file_name", label: "上传文件", render: (v) => <FileCell value={v} /> },
  { key: "material_links", label: "材料链接" },
];

const ENTERPRISE_COLUMNS = [
  { key: "id", label: "编号" },
  { key: "created_at", label: "提交时间" },
  { key: "organization", label: "企业名称" },
  { key: "phone", label: "手机号" },
  { key: "industry", label: "行业" },
  { key: "city", label: "城市" },
  { key: "contact", label: "联系人" },
  { key: "wechat", label: "微信" },
  { key: "needs", label: "需求方向", render: (v) => v?.join(", ") },
  { key: "description", label: "需求描述" },
  { key: "cooperation", label: "合作意向" },
  { key: "file_name", label: "上传文件", render: (v) => <FileCell value={v} /> },
  { key: "material_link", label: "材料链接" },
];

const SHORT_FILM_COLUMNS = [
  { key: "id", label: "编号" },
  { key: "created_at", label: "提交时间" },
  { key: "name", label: "姓名" },
  { key: "phone", label: "手机号" },
  { key: "wechat", label: "微信" },
  { key: "work_title", label: "作品名称" },
  { key: "intro", label: "作品简介" },
  { key: "file_name", label: "上传文件", render: (v) => <FileCell value={v} /> },
  { key: "file_link", label: "作品链接", render: (v) => v ? <a className="admin-file-link" href={v} target="_blank" rel="noopener noreferrer">查看链接 ↗</a> : <span className="admin-null">-</span> },
];

function DetailModal({ submission, columns, onClose, onDelete }) {
  if (!submission) return null;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="admin-detail-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="admin-detail-header">
          <h2>作品详情</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-detail-body">
          {columns.map((col) => (
            <div className="admin-detail-field" key={col.key}>
              <label>{col.label}</label>
              <div className="admin-detail-value">
                {col.render ? col.render(submission[col.key]) : (submission[col.key] ?? "-")}
              </div>
            </div>
          ))}
          {submission.file_name && /\.(mp4|mov|avi)$/i.test(submission.file_name) && (
            <div className="admin-detail-field">
              <label>视频预览</label>
              <video className="admin-video-preview" controls src={submission.file_name}>
                您的浏览器不支持视频播放
              </video>
            </div>
          )}
        </div>
        <div className="admin-detail-footer">
          <button className="button admin-delete-btn" onClick={() => { onDelete(submission); onClose(); }}>删除</button>
          <button className="button" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button className="admin-delete-btn" onClick={(e) => { e.stopPropagation(); onClick(); }}>
      删除
    </button>
  );
}

function DataTable({ columns, rows, search, onSearchChange, onRefresh, onRowClick, onDelete }) {
  const cols = onDelete ? [...columns, { key: "_action", label: "操作" }] : columns;
  return (
    <div className="admin-table-wrap">
      <div className="admin-table-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="搜索手机号..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="admin-count">{rows.length} 条记录</span>
        <button className="admin-refresh" onClick={onRefresh} title="刷新数据">
          ↻
        </button>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {cols.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="admin-empty">
                  暂无数据
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="admin-row" onClick={() => onRowClick?.(row)}>
                  {cols.map((col) => (
                    <td key={col.key}>
                      {col.key === "_action"
                        ? <DeleteBtn onClick={() => onDelete(row)} />
                        : col.render ? col.render(row[col.key]) : row[col.key] ?? "-"
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [tab, setTab] = useState("aigc");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const columns = tab === "aigc" ? AIGC_COLUMNS : tab === "short_film" ? SHORT_FILM_COLUMNS : ENTERPRISE_COLUMNS;

  const handleDelete = useCallback(async (row) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/admin/submissions/${row.id}`, token, "DELETE");
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setDetail((prev) => (prev?.id === row.id ? null : prev));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const apiType = tab === "short_film" ? "short_film" : tab;
      const params = new URLSearchParams({ type: apiType });
      if (search) params.set("phone", search);
      const res = await fetchWithAuth(`/api/admin/submissions?${params}`, token);
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        return;
      }
      const data = await res.json();
      setRows(data.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, tab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleLogin(tokenValue) {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    setToken(tokenValue);
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setRows([]);
  }

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="admin-back" onClick={() => go("home")}>
            ← 返回首页
          </button>
          <h1>管理后台</h1>
        </div>
        <button className="admin-logout" onClick={handleLogout}>
          退出登录
        </button>
      </header>

      <nav className="admin-tabs">
        <button
          className={tab === "aigc" ? "admin-tab active" : "admin-tab"}
          onClick={() => setTab("aigc")}
        >
          AIGC 报名表
        </button>
        <button
          className={tab === "enterprise" ? "admin-tab active" : "admin-tab"}
          onClick={() => setTab("enterprise")}
        >
          企业需求表
        </button>
        <button
          className={tab === "short_film" ? "admin-tab active" : "admin-tab"}
          onClick={() => setTab("short_film")}
        >
          一分钟短片
        </button>
      </nav>

      {loading ? (
        <div className="admin-loading">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          search={search}
          onSearchChange={setSearch}
          onRefresh={fetchData}
          onRowClick={setDetail}
          onDelete={handleDelete}
        />
      )}
      {detail && (
        <DetailModal
          submission={detail}
          columns={columns}
          onClose={() => setDetail(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
