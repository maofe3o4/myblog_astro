---
title: "docker使用操作"
pubDate: 2024-06-06
type: note
draft: false
category: "运维"
tags:
  - "docker"
description: "！！！不涉及docker底层原理，仅包括docker实用操作，比如如何在linux上使用docker、一些常用命令和设置仓库"
---


# 简介

Docker是一个C/S结构的系统，Docker守护进程运行在主机上， 然后通过Socket连接从客户端访问，守护进程从客户端接受命令并管理运行在主机上的容器。 容器，是一个运行时环境，就是我们前面说到的集装箱。

## 组成

### 镜像image：一个特殊的文件系统

**除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。** 镜像不包含任何动态数据，其内容在构建之后也不会被改变。

镜像实际是由多层文件系统联合组成。

**镜像构建时，会一层层构建，前一层是后一层的基础。每一层构建完就不会再发生改变，后一层上的任何改变只发生在自己这一层。**　比如，删除前一层文件的操作，实际不是真的删除前一层的文件，而是仅在当前层标记为该文件已删除。在最终容器运行的时候，虽然不会看到这个文件，但是实际上该文件会一直跟随镜像。因此，在构建镜像的时候，需要额外小心，每一层尽量只包含该层需要添加的东西，任何额外的东西应该在该层构建结束前清理掉。

分层存储的特征还使得镜像的复用、定制变的更为容易。甚至可以用之前构建好的镜像作为基础层，然后进一步添加新的层，以定制自己所需的内容，构建新的镜像。

### 容器container：镜像运行时的实体

**容器可以被创建、启动、停止、删除、暂停等** **。**

　　**容器的实质是进程，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的** **命名空间。**前面讲过镜像使用的是分层存储，容器也是如此。

　　**容器存储层的生存周期和容器一样，容器消亡时，容器存储层也随之消亡。因此，任何保存于容器存储层的信息都会随容器删除而丢失。**

　　按照 Docker 最佳实践的要求，**容器不应该向其存储层内写入任何数据** ，容器存储层要保持无状态化。**所有的文件写入操作，都应该使用数据卷（Volume）、或者绑定宿主目录，**在这些位置的读写会跳过容器存储层，直接对宿主(或网络存储)发生读写，其性能和稳定性更高。数据卷的生存周期独立于容器，容器消亡，数据卷不会消亡。因此， **使用数据卷后，容器可以随意删除、重新** **run** **，数据却不会丢失。**

### 仓库：repository：集中存放镜像文件的地方

 镜像构建完成后，可以很容易的在当前宿主上运行，但是， **如果需要在其它服务器上使用这个镜像，我们就需要一个集中的存储、分发镜像的服务，****Docker Registry****就是这样的服务。**

  一个 Docker Registry中可以包含多个仓库（Repository）；每个仓库可以包含多个标签（Tag）；每个标签对应一个镜像。所以说：[镜像仓库](https://cloud.tencent.com/product/tcr?from_column=20065&from=20065)是Docker用来集中存放镜像文件的地方类似于我们之前常用的代码仓库。

  通常，**一个仓库会包含同一个软件不同版本的镜像**，而标签就常用于对应该软件的各个版本 。我们可以通过<仓库名>:<标签>的格式来指定具体是这个软件哪个版本的镜像。如果不给出标签，将以 latest 作为默认标签.。

# 安装

## 指令

~~~shell
# 移除旧版本docker
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine

# 配置docker yum源
sudo yum install -y yum-utils
sudo yum-config-manager \
--add-repo \
http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装 最新 docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动& 开机启动docker； enable + start 二合一
systemctl enable docker --now
~~~

## 配置自己的镜像加速器

docker镜像加速器配置需登录阿里云https://cr.console.aliyun.com/cn-hangzhou/instances
我这里配置了两项，一个是阿里云个人的镜像服务，一个是中科大的

```shell
//更改配置文件/etc/docker/daemon.json，如果没有daemon则新建
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://f3fprrzr.mirror.aliyuncs.com",
  "https://docker.mirrors.ustc.edu.cn",
  "https://registry.docker-cn.com",
   "https://hub-mirror.c.163.com",
   "https://mirror.baidubce.com",
   "https://ccr.ccs.tencentyun.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

# 卸载

删除docker：yum remove docker-ce
rm -rf /var/lib/docker

# 常用命令

<img src="/images/docker命令.png.webp" alt="docker命令" style="zoom: 200%;" />

| 命令                                           | 选项                                                         | 说明                       |
| ---------------------------------------------- | ------------------------------------------------------------ | -------------------------- |
| docker search                                  |                                                              | 在官方dockerhub搜索镜像    |
| docker build                                   |                                                              | 通过dockerfile创建一个镜像 |
| docker pull                                    |                                                              | 拉取镜像                   |
| docker push                                    |                                                              | 推送镜像到DockerRegistry   |
| docker images                                  |                                                              | 查看本地镜像               |
| docker rmi                                     |                                                              | 删除本地镜像               |
| docker run                                     | -d后台运行<br>-i交互运行<br>-t伪终端<br>-p指定端口映射<br />-P随机端口映射<br />-v容器卷映射 | 创建并运行容器             |
| docker stop                                    |                                                              | 停止指定容器               |
| docker start                                   |                                                              | 启动指定容器               |
| docker restart                                 |                                                              | 重启指定容器               |
| docker rm                                      | -f强制删除                                                   | 强制删除指定容器           |
| docker ps                                      | -a查看所有容器<br />-q只显示容器ID                           | 查看容器基本信息           |
| docker logs                                    | -f标准查看                                                   | 查看容器内运行的日志       |
| docker exec                                    | -it内部命令行                                                | 进入容器                   |
| docker save/export                             | >tar文件                                                     | 保存镜像到本地压缩文件     |
| docker load/import                             | <tar文件                                                     | 加载本地压缩文件到镜像     |
| docker commit 容器ID 仓库名：版本号            | -m新增功能                                                   | 将容器提交到镜像           |
| docker inspect                                 |                                                              | 查看容器详细信息           |
| systemctl enable docker                        |                                                              | 设置docker开机自启         |
| docker update --restart=always [容器名/容器ID] |                                                              | 设置docker容器开机自启     |

# 使用docker拉取镜像运行容器

## mysql

## nginx

1.拉取镜像
docker pull nginx

2.查看镜像
docker images

3.创建并运行nginx容器
docker run -d --name mynginx -p 80:80 nginx

5.查看运行的容器
docker ps

6.通过网页访问nginx
docker的宿主机IP:宿主机对应的端口

## redis

拉，创，进
合成一句
docker run -itd \
-p 6379:6379 \
--name myredis \
-v /home/redis/conf:/etc/redis/ \
-v /home/redis/data:/data \
redis redis-server

docker exec -it 容器名 bash
可以直接执行redis-cli
配置文件在/etc/redis

# 镜像的分层

创建一个镜像需要根据dockerfile文件里面的shell脚本来一层一层的构建，这种层级的文件系统称为UnionFS

1、镜像：轻量级、可执行的独立软件包，包含运行某个软件所需要的所有内容，我们把应用程序和配置依赖打包好形成一个可交付的运行环境（包括代码、运行时环境、环境变量和配置文件等）。

2、UnionFS(联合文件系统):是一种分层，轻量级高性能的文件系统、支持对文件系统的修改作为一次提交来一层层的叠加，同时将不同目录挂载到同一个虚拟文件系统下。联合文件系统是Docker镜像的基础，镜像可以通过分层进行继承，基于基础镜像可以制作各种具体的应用镜像。

3、 Docker镜像加载原理

(1)   docker的镜像实际上由一层一层的文件系统组成，这种层级的文件系统UnionFS。

(2)   bootfs(boot file system)主要包含bootloader和kernel, bootloader主要是引导加载kernel, Linux刚启动时会加载bootfs文件系统，在Docker镜像的最底层是bootfs。这一层与我们典型的Linux/Unix系统是一样的，包含boot加载器和内核。当boot加载完成之后整个内核就都在内存中了，此时内存的使用权已由bootfs转交给内核，此时系统也会卸载bootfs。

# 设置个人或企业版阿里云镜像仓库

https://cr.console.aliyun.com/cn-hangzhou/instances

①  选择实例列表，点击个人版进入“个人实例”

②  创建命名空间

③  创建镜像仓库-->选择刚刚创建的命名空间--->选择本地仓库，创建

④  在成功节目根据第三点“将镜像推送到Registry”

⑤  然后尝试下载上传的镜像

具体命令在阿里云镜像服务里面有
