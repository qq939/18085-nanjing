开发 python 脚本必须遵循规则：

- 回答使用中文。
- `.trae/reference/ref.txt` 存放需要参考的 GitHub 地址或接口文档；如需补充参考资料，以追加方式写入。
- Python 文件中的全局参数前置，并用注释说明具体使用位置。
- 灵活使用 agent skill 和 MCP 完成任务。
- 完成所有任务清单，完成前不要退出。
- TDD 模式：任务开始前先写测试脚本，测试必须有超时机制，脚本通过才算完成。
- 若有 Git 仓库，先暂存本地修改，再 `git pull`，再继续。
- 使用 `uv` 创建 Python venv，并从 `requirements.txt` 安装依赖，镜像源为 `https://pypi.tuna.tsinghua.edu.cn/simple/`。
- 每次对话后确保 Python import 不缺失，`requirements.txt` 模块不缺失且不写版本号。
- 如存在 `requirements_{python version}.txt`，其中保存带版本号模块。
- 每次对话后推送到 `origin:main`；git 用户为 `qq939 <939342547@qq.com>`。
- 远端为 `https://github.com/qq939/{projectName}`；若远端仓库不存在，可用 `gh repo create {projectName} --public` 创建。
- 如果推送失败，rebase 后 `push --force-with-lease`。
