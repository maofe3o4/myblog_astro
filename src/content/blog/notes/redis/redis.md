---
title: "redis(未完成)"
pubDate: 2024-08-12
type: note
draft: false
category: "数据库"
tags:
  - "redis"
description: "redis"
cover: ""    # 封面图（留空则按文章 id 从 public/covers 确定性随机取一张）
---


# 安装

见《linux软件安装》

简单说一下就是：

- 压缩包解压
- 进解压文件执行make
- 创建安装目录mkdir 安装路径
- 开始安装make PREFIX=安装路径 install

如果要使用bin/redis-server ./redis.conf启动redis服务 
./bin/redis-server ./redis.conf
容器内直接输入redis-server 

提前配置好redis.conf

- 容器里面在/etc/redis目录
- 直接部署在linux，位置在解压的文件里面，要复制一份到安装路径下
- 修改配置文件bind 127.0.0.1 -::1 修改成0.0.0.0
- 如果是容器内不改这个   daemonize no 改成daemonize yes 

启动登录

- 刚开始没有密码，直接redis-cli
- 后面设了密码和用户名，reis-cli  -a 密码

# 数据类型

参考http://redisdoc.com

- string字符串
- hash哈希
- list列表
- set集合
- zset有序集合

查数据库大小：dbsize

## 键key

| 命令(key全为键名)             | 说明                                   |
| ----------------------------- | -------------------------------------- |
| del key                       | 删除                                   |
| get key                       | 查key值                                |
| move key db                   | 从当前库移到db库                       |
| exists key                    | 判断是否存在                           |
| **存活时间相关**              |                                        |
| expire/expireat key 秒/时间戳 | 设置过期时间/设置过期时间点            |
| persist key                   | 移除过期时间                           |
| ttl key                       | 返回剩余生存时间，-1永不过期，-2已过期 |
| randomkey                     | 从当前库随机返回一个值                 |
| rename key newkey             | 重命名                                 |
| keys pattern                  | 查看所有符合模式的key，通配符*, ? ,[]  |

## 字符串string

可以包含任何数据(因为是用二进制存的)，比如图片或者序列化的对象
最大512M

| 命令                                                      | 说明                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| set/mset/get/mget/del/append/strlen key value [key value] | 设值/设多个值/获取值/获取多个key的值/删除key/字符串追加/获取长度 |
| incrby/decrby/incrfloat/decrfloat key 值                  | 增加/减少/增加浮点数/减少浮点数                              |
| getrange key start end                                    | 返回key中从start到end的字串                                  |
| getbit key offset                                         | key的字符串值，获取偏移量offset位的bit                       |
| setbit key offset value                                   | 同上但是是设置该位的值                                       |
| setrange key offset value                                 | 设置key从偏移量offset开始的值                                |
| setex key 秒 vlaue                                        | 设置key的值同时设置过期时间                                  |
| setnx key value                                           | 在key不存在时设置key的值                                     |

## 列表list

用链表实现

| 命令                              | 说明                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| lpush/rpush key value1 value2 ... | 头插或尾插一个或多个值                                       |
| lrange key start stop             | 查指定范围内的元素，-1表示最后一位                           |
| lpop/rpop/blpop/brpop key         | 移出并获取/若为空会一直等到进来元素 头/尾的元素              |
| lindex key index                  | 通过索引获取(类似数组下标),-1表示最后一位                    |
| lset key index value              | 通过下标设置列表值                                           |
| llen key                          | 获取列表长度                                                 |
| lrem key count value              | 删除列表里的value，并返回实际删除个数，count>0,从左边开始删，count=0删除全部 |
| ltrim key start stop              | 保留从start到stop的元素                                      |
| rpoplpush/brpoplpush key1 key2    | 剪切列表1的最后一个元素到列表2<br />加上b就是若列表为空会等到出现值 |
|                                   |                                                              |
| linsert key before/after 值1 值2  | 在值1前或者后插入值2                                         |

## 集合set

| 命令                               | 说明                     |
| ---------------------------------- | ------------------------ |
| sadd key member1 member2 ...       | 增加成员                 |
| spop key                           | 删除并返回随机一个元素   |
| srem key value                     | 删除                     |
| scard key                          | 获取成员数               |
| smembers key                       | 返回所有成员             |
| sismember key member               | 是否是集合key的成员      |
| smove 集合1 集合2 member           | 将member从集合1移到集合2 |
| sinter/sdiff/sunion 一个或多个集合 | 返回 交/并/差 后面的集合 |

## 哈希hash

## 有序集合zset

# 持久化

## RDB

- 最后一次持久化的数据可能丢失
- 创建子进程fork来执行快照会占用两倍的空间
- redis/data下的dump.rdb文件整个内存压缩过后的快照

开启rdb自动来持久化：redis.conf
配置文件中搜索save
save  < seconds >  < changes >

save和bgsave：保存rdb到内存上，前者只保存，后者是异步保存
lastsave：获取最后一次成功执行快照的时间

## AOF

![![image-20240813172014778]](/images/持久化.png.webp)

Redis会记录上次重写时的AOF大小，默认配置是当AOF文件大小是上次rewrite后大小的一倍且文件大于64M时触发

- 以日志形式来记录每个写操作(读不记录)
- 只追加文件，不改写文件
- 保存在/redis/data/appendonly.aof

开启AOF：redis.conf
配置文件中搜索appendonly
appendonly yes

修复AOF文件

- 备份损坏的文件
- 执行redis-check-aof --fix
- 重启redis

重写AOF(aof有冗余记录)

- 执行bgrewriteaof
- fork一条新进程来重写AOF文件
- 重写触发条件在redis.conf中
- auto-aof-rewrite-percentage 100   //每次达到重写后的一倍就重写
  auto-aof-rewrite-min-size 64mb

## 总结

- 持久化方式，两种同时启动
- RDB用于备份数据库
- AOF用于恢复
