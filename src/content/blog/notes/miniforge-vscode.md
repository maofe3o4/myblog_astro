---
title: "miniforge3+vscode"
pubDate: 2026-10-18
type: note
draft: false
category: "conda"
tags:
  - "conda"
  - "miniforge"
description: "miniforge4+vscode,配置conda,mamba,使用vscode"
---

# 安装miniforge3

miniforge3+自带conda+mamba

Windows：运行 Miniforge3-Windows-x86_64.exe，建议勾选 Add to PATH、Register as default Python

powershell执行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
conda init

创python环境miniforge3/envs/你的环境/
mamba create -n 环境名 python=3.12

conda activate 环境名  # 这一步在vscode里会自己执行
mamba install numpy pandas  # 安装三方包

## vscode使用mamba环境

按 Ctrl+Shift+P / Cmd+Shift+P → Python: Select Interpreter
建.vcode/setting.json
{
    "python-envs.defaultEnvManager": "ms-python.python:conda",
    "python-envs.defaultPackageManager": "ms-python.python:conda"
}
