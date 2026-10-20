---
title: "SpringAi"
pubDate: 2026-09-27
type: note
draft: true
category: "java"
tags:
  - "java"
  - "agent"
  - "ai"
description: "springboot+springai+springaialibaba"
---

版本关系
SPring Ai Alibaba：1.0.0.2
Spring Ai：1.0.0
SpringBoot：3.4.5

配置关键
所有调用基于OpenAI协议标准或者ApringAIAalibaba官方推荐模型服务灵积(DashScope)整合规则

接入阿里百炼平台的通义模型：<https://balian.console.aliyun.com>
APIkey+模型名+baseurl调用地址

微服务编码流程
建module，改pom，写yml，主启动，业务类

本地大模型部署：ollama，类似docker

| 命令 | 描述 | 示例 |
| --- | --- | --- |
| ollama run < model > | 运行模型（若本地不存在会自动下载） | ollama run llama3.2 |
| ollama pull < model > | 从注册表下载模型但不运行 | ollama pull mistral |
| ollama ls | 列出本地已安装的所有模型 | ollama list |
| ollama ps | 列出当前正在运行的模型 | ollama ps |
| ollama stop < model > | 停止一个正在运行的模型 | ollama stop llama3.2 |
| ollama rm < model > | 删除一个已安装的模型 | ollama rm llava |
| ollama show < model > | 显示模型的详细信息 | ollama show llama3.2 |
| ollama serve | 启动 Ollama 服务 | ollama serve |
| ollama create -f < Modelfile > | 从 Modelfile 创建自定义模型 | ollama create -f Modelfile |
| ollama cp < source > < dest > | 复制一个模型 | ollama cp llama3.2 llama3.2-copy |
| ollama launch | 配置并启动外部集成应用 | ollama launch claude |
