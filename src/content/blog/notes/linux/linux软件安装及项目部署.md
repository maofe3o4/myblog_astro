---
title: "在linux上安装常用环境和网络配置(vm)"
pubDate: 2023-01-01
type: note
draft: false
category: "运维"
tags:
  - "linux"
description: "虚拟机上linux网络配置，centos7安装一些常用环境"
---


# 网络配置(dhcp改静态)

nat模式-设置本机vm8的ipv4和网关-修改ifcfg-ens33 -重启-网络图标不见看下面

网络图标消失不见的解决方案
停止网络配置管理器：systemctl stop NetworkManager.service
删除文件： rm /var/lib/NetworkManager/NetworkManager.state
开启网络配置管理器： systemctl start NetworkManager.service

vi /etc/sysconfig/network-scripts/ifcfg-ens33

TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
BOOTPROTO="static"
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens33"
UUID="5afdee8c-694c-4b47-b78a-9f07ea444acd"
DEVICE="ens33"
ONBOOT="yes"
IPADDR=192.168.181.3
NETMASK=255.255.255.0
GATEWAY=192.168.181.2
DNS1=8.8.8.8
DNS2=114.114.114.114

windows需要在网络适配器里面改ipv4配置

# 防火墙设置

打开对应端口

1. 防火墙打开3306端口号
    firewall-cmd --zone=public --add-port=3306/tcp --permanent
    下面3行是参数说明
    \#–zone                        #作用域
    \#–add-port=80/tcp   #添加端口,格式为:端口/通讯协议
    \#–permanent             #永久生效,没有此参数重启后失效
2. 重启防火墙
    firewall-cmd --reload#重启firewall
3. 查看是否已经开放3306端口
    firewall-cmd --list-ports #查看已经开放的端口

如果你想再关闭firewall-cmd --zone=public --remove-port=3306/tcp --permanent
然后再重启防火墙

# 安装方式

软件一般安装在根目录下的/usr/local/
| 安装方式         | 特点                                 |
| ---------------- | ------------------------------------ |
| 二进制发布包安装 | 已经编译过只需解压修改配置           |
| rpm              | 按照包管理规范进行打包，有库依赖问题 |
| yum              | 本质上还是rpm，需联网，无库依赖问题  |
| 源码编译安装     | 将源码工程自行打包发布               |

# 没有vim

apt-get update

apt-get install vim -y

# 安装JDK

## 步骤

下载链接https://www.oracle.com/technetwork/java/javase/downloads/index.html

1.在/usr/local目录下创建自定义soft目录
2.使用FinalShell自带的上传工具将jdk的二进制发布包上传到Linux
3.切换到soft目录
4.解压安装包 tar -zxvf jdk-8u171-linux-x64.tar.gz
5.配置环境变量：使用vim修改/etc/profile文件
JAVA_HOME=/usr/local/soft/jdk1.8.0_171
JRE_HOME=${JAVA_HOME}/jre
CLASSPATH=.:$JAVA_HOME/lib
PATH=$JAVA_HOME/bin:$PATH
export JAVA_HOME JRE_HOME CLASSPATH PATH
6.重新加载profile文件 source /etc/profile
7.检查安装是否成功，java -version

## alternatives管理

如果交给了alternatives来管理java可以不用设置环境变量

通过alternatives --install [软链接] [链接名] [执行文件路径] [优先级]
例如将自己安装的java交给alternatives管理：
alternatives --install  /usr/bin/java   java     ../jdk/bin/java 3
其实就是将安装的java执行文件路径生成软链接放到/usr/bin目录下

切换java版本:alternatives --config java

# 安装tomcat

压缩包直接解压
[配置文件](https://www.cnblogs.com/wjt-super/p/8018642.html)

# 安装mysql8.0

tar.gz方式下载路径：https://downloads.mysql.com/archives/community/

1、ps -ajx |grep mariadb # 先检查是否有mariadb存在
如果存在先停止systemctl stop mariadb.service或者kill -9 进程id
2、检查系统安装包rpm -qa | grep mariadb和rpm -qa | grep mysql
如果存在就删除rpm -e --nodeps 包名或者yum remove mariadb/mysql
3.创建mysql 用户组和用户
groupadd mysql
useradd -r -g mysql mysql
4.解压
5.配置文件 /etc/my.cnf
[mysql]
default-character-set=utf8mb4

[mysqld]
port=3306
#server-id=3306
user=mysql8.0
socket=/tmp/mysql.sock
basedir=/opt/mysql8.0
datadir=/opt/mysql8.0/data
#字符集，大小写，自动提交事务
character-set-server=utf8mb4
#lower_case_table_names=1
autocommit=1

#创表默认引擎
default-storage-engine=INNODB
lower_case_table_names=1
max_allowed_packet=16M

#sql模式
sql_mode=ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

[mysqld_safe]
log-error=/opt/mysql8.0/data/mysql.log
pid-file=/opt/mysql8.0/data/mysql.pid

5、设置权限：chown -R mysql:mysql /opt/ mysql8.0
						   chmod -R 755 /opt/ mysql8.0

6、创建data目录:mkdir /opt/mysql8.0/data

7.初始化并记住初始密码
./bin/mysqld --initialize --user=mysql8.0 --datadir=/opt/mysql8.0/data --basedir=/opt/mysql8.0 --lower_case_table_names=1

8.启动
./support-files/mysql.server start

9.复制启动脚本文件到init.d下  
cp support-files/mysql.server /etc/init.d/mysqld
chmod a+x /etc/init.d/mysqld  设置所有人可以执行权限

10.启动，停止，重启
service mysqld start
#service mysqld stop
#service mysqld restart

11.添加软链接
ln -s /opt/mysql8.0/bin/mysql  /usr/bin

10.登录并改密码，配置远程登陆
mysql -uroot -p
输密码
alter user 'root'@'localhost' identified by '123456'; 修改密码
flush privileges; 刷新权限

配置远程登陆权限(8.0之前直接给root@%赋权就行，
8.0之后需要先新建一个root@%的用户)
create user 'root'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON * . *  TO 'root'@'%' IDENTIFIED BY '111111' WITH GRANT OPTION; 远程用户用root加密码111111连接

11.连不上打开3306防火墙
防火墙打开3306端口号
firewall-cmd --zone=public --add-port=3306/tcp --permanent
下面3行是参数说明
\#–zone              #作用域
\#–add-port=80/tcp#添加端口,格式为:端口/通讯协议
\#–permanent         #永久生效,没有此参数重启后失效

 重启防火墙
firewall-cmd --reload#重启firewall

查看是否已经开放3306端口
firewall-cmd --list-ports #查看已经开放的端口

12.mysql开机自启
cp /usr/local/mysql/mysql/support-files/mysql.server /etc/rc.d/init.d/mysqld
chmod +x /etc/init.d/mysqld
添加为服务: chkconfig --add mysqld
查看服务列表:  chkconfig --list
看到3、4、5状态为开或者为 on 则表示成功。如果是 关或者 off 则执行一下：chkconfig --level 345 mysqld on
重启计算机:reboot

# 安装redis

linux上安装,首先拿到压缩包，方法任意,这里使用在线下载
wget http://download.redis.io/releases/redis-4.0.9.tar.gz

1.解压然后进到解压的文件里面
2.执行make来编译
3.他会生成src文件夹，进到里面执行redis-server就运行了

# 安装docker

1.卸载之前的docker

yum remove docker \
	                  docker-client \
	                  docker-client-latest \
	                  docker-common \ 
		              docker-latest \ 
	         	     docker-latest-logrotate \ 
	                  docker-logrotate \
	                  docker-selinux \ 
	                  docker-engine-selinux \ 
	                  docker-engine \ 
	                  docker-ce

2.建立仓库

yum install -y yum-utils     //安装docker所需要的工具包

yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo       //建立docker仓库，映射仓库地址

3.安装docker引擎

yum install docker -ce dockerce-cli containerd.io

4.启动docker

systemctl start docker

5.测试安装是否成功

docker pull hello-world

docker run hello-world

## 其他操作

docker镜像加速器配置(建立仓库时可提前选择镜像)

```json
//更改配置文件/etc/docker/daemon.json，如果没有daemon则新建
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
}
//重启docker
systemctl daemon-reload
systemctl restart docker
```

守护进程重启：systemctl daemon-reload 

重启Docker服务：systemctl restart docker / service docker restart 

关闭Docker服务：docker service docker stop / docker systemctl stop docker

删除docker：yum remove docker-ce
rm -rf /var/lib/docker
