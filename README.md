# Memory Web Admin

AI Memory System 的全功能 Web 管理端，基于 React + FastAPI，复用现有 memory-mcp-server 模块。

## 快速启动

```bash
cd backend
bash run.sh
# → http://localhost:18090
```

## 开发模式

```bash
# 终端1: 后端
cd backend && python3 main.py

# 终端2: 前端 (HMR)
cd frontend && npm run dev
# → http://localhost:5173 (API 代理到 18090)
```

## 生产构建

```bash
cd frontend && npm run build   # 输出到 backend/static/
cd ../backend && python3 main.py  # 一个端口同时托管 API + SPA
```

## 功能

- **Dashboard** — 统计卡片、类型分布饼图、标签 Top 10 柱状图、最近记忆时间线
- **Memory Browser** — 按类型 Tab 切换、编辑/删除、分页浏览
- **Semantic Search** — 语义搜索 + 相似度分数 + 类型过滤 + top_k 调节
- **Tags** — 标签列表 + 使用计数 + 点击查看关联记忆
- **Import/Export** — JSON 全量导出下载 + 文件导入（自动去重）
- **Settings** — Qdrant 状态监控、Embedding 模型信息、去重阈值在线调整

## 技术栈

- React 18 + TypeScript + Vite + Tailwind CSS + Recharts
- FastAPI + Uvicorn
- Dracula 暗色主题
