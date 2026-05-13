项目规则：

- 本项目是运行在 8082 端口的 Hermit-Claw Web App。
- 前端使用 React + TypeScript + Vite。
- 本地 CSV 是直接数据源：`schedules.csv` 和 `arrows.csv`。
- Supabase 只作为后台同步目标；前端不得直连 Supabase 作为直接数据源。
- `user_start.sh` 负责启动前拉取远端数据、后台启动服务和定时任务。
- 修改后至少运行 `npm run build`；涉及交互时运行 Playwright E2E。
