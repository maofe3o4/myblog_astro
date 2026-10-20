---
title: "SQL SERVER数据库"
pubDate: 2024-06-01
type: note
draft: false
category: "数据库"
tags:
  - "sql server"
description: "对照之前的mysql做的笔记"
---

<span id="jump1">目录</span>

# 简介

[官方参考文档](https://learn.microsoft.com/zh-cn/sql/t-sql/language-reference?view=sql-server-2016)

MySQL：3306
SQL Server：1433
Oracle：1521
Redis：6379
PostgreSQL：5432
MongoDB：27017
SQL server 2008版本是10.25 、SQL server 2008R2版本是10.50

## 系统数据库
（1）master：SQL SERVER实例的所有**系统级消息**，包括实例范围的元数据（如登录帐号）、端点、链接服务器和系统配置设置。
（2）msdb：供SQL SERVER **代理服务**调度报警和作业以及记录操作员的使用，保存关于调度报警、作业、操作员等信息。（备份还原时）
（3）model：SQL SERVER 实例上创建的所有**数据库的模板**。
（4）tempdb：临时数据库，用于保存临时对象或中间结果集，为数据库的排列等操作提供一个临时工作空间。（每次启动都会重新创建）
（5）Resource：一个只读数据库，包含了SQL SERVER 的所有系统对象。（隐藏的数据库）
数据库对象的全名应该由**服务器名、数据库名、拥有者名和对象名**这四个部分组成，格式如下：
[server].[database].[owner_name].[object_name] 

## 数据库的组成
（1）主要数据文件：扩展名为 .mdf ，每个数据库有且只能有一个。
（2）次要数据文件：扩展名为 .ndf ， 可以没有或有多个。
（3）日志文件 扩展名为 .ldf ，用于存放恢复数据库的所有日志信息。

## 数据的存储分配

（1）数据的存储分配单位是数据页。一页表是一块8KB的连续磁盘空间。
（2）页是存储数据的最小空间分配单位，页的大小决定了数据库表中一行数据的最大大小。

# 创建数据库和用户

[回到目录](#jump1)

数据库文件包括：数据文件(mdf)和日志文件(ldf)

```sql server
use master
go

if exists(select * from sysdatabases where name='sql_wei')    -- 判断数据库是否存在
begin
	drop database sql_wei
end
else
begin
	create database sql_wei
	on primary(
	name='sql_wei',   -- 文件的逻辑名称
	filename='D:\Program Files\Microsoft SQL Server\MSSQL10_50.MSSQLSERVER\data\sql_wei.mdf', --文件的路径
	size=5mb, -- 初始化大小，最小3mb
	maxsize=100mb, -- 最大的大小
	filegrowth=5%  -- 自增率
	)
	log on(
	name='sql_wei_log',
	filename='D:\Program Files\Microsoft SQL Server\MSSQL10_50.MSSQLSERVER\data\sql_wei_log.ldf',
	size=5mb,
	maxsize=100mb,
	filegrowth=5%
)
end
go
```

```sql
-- 1.创建登录⽤户(在master库下⾯执⾏)
USE master
GO
CREATE LOGIN readonlylogin WITH password='abc123...';
-- 2.创建数据库只读⽤户(在某个⽤户数据库下⾯执⾏)
USE TestDB
GO
CREATE USER readonlyuser FROM LOGIN readonlylogin;
-- 3.将⽤户加⼊数据库角色,例如所有者角色db_owner、只读⾓⾊db_datareader等(在某个⽤户数据库下⾯执⾏)
USE TestDB
GO
EXEC sp_addrolemember 'db_datareader', 'readonlyuser';
--EXEC sp_addrolemember 'db_owner', 'readonlyuser';----可以将⽤户关联到多个数据库⾓⾊中
--EXEC sp_droprolemember 'db_owner', 'readonlyuser'----从特定的数据⾓⾊中删除⽤户
-- 4.⽤我们刚刚创建的readonlylogin⽤户进⾏登录，登录时要注意将“选项（英⽂是Options）-->连接属性（Connection Properties）-->连接数据库(Connect to database)”改为我们的⽬标数据库例如TestDB下⾯
```

# tsql语言相关(区别)

[回到目录](#jump1)

## 分页查询top

```sql sever
-- percent将表达式结果转为float(按百分比返回),默认为bigint(行号)
-- with this返回多行相同排名的数据（比如返回两个100分的人）
-- 如果有DISTINCT，则在DISTINCT后面
select top (expression)  [percent]  [with this]
from table_name
order by column_name; 

top 3           top(2.5) percent

-- 利用子查询、窗口函数实现分页查询
select * from (select *,row_number() over(order by 字段) hh) s
where s.hh between beginindex and endindex
-- 或者利用top
select top (@条数) * from 表名 where id not in (selecct top (@页数-1)*@条数) id from 表名)
```
## 向自增列identity插入数据

MySQL一张表只能有一个自增列。auto_increment
插入数据必须**使用null**来表示插入的是自增列。
SQL Server插入数据可以且必须**无视该列**。

## 交并差

mysql中只有union并集
sqlserver中有交intersect、并union、差except

## DDL、DML、DQL

| 功能                                    | sql server                                                   | mysql(*表示同左)                                             |
| --------------------------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| 查看表结构                              | **exec** sp_help 表名;                                       | desc 表名;                                                   |
| 修改表名                                | **exec** sp_rename 旧表名,新表名;<br />exec sp_rename '表.旧列','新列','column'; | alter table 旧表名 rename 新表名;<br />alter table 表 **change** 列 |
| 删除表                                  | if **object_id**('表名') **is** **not** **null** **drop** table 表名; | **drop** table if **exists** 表名;                           |
| 复制表(mysql复制表结构不会复制自增属性) | **select** * **into** 表1 **from** 表2; （复制数据和结构） <br>**select** * **into** 表1 **from** 表2 **where** 1=0;   （复制结构） | **create table** 表1 **as** **select** **from** 表2;（复制数据和结构）<br>**create** **table** 表1 **like** 表2;（复制结构） |
| 修改列(在属性**添加非空**约束)          | alter table 表 **alter column** 列 新属性[not null];         | alter table 表 **modify** 列 类型 [not null];<br>alter table 表 **change** 旧列 新列 新类型 |
| 添加列/删除列                           | alter table 表 **add** 列  属性;<br>alter table 表 **drop** 列 | *                                                            |
| 添加约束(**注意外键默认非空**）         | alter table 表 **add constraint** 约束名 **primary key\|unique\|check (列名)**;<br>**foreign key** (列) **references** 主表(列);<br>**default** '值' **for** 列 | 主键、唯一、外键约束同左(**不写约束名**);<br>非空和默认用修改列属性方法modify |
| 删除约束                                | alter table 表 **drop constraint** 约束名                    | *                                                            |
|                                         |                                                              |                                                              |
| 连接查询                                | 全连接full join                                              | 无                                                           |

# 数据类型

[回到目录](#jump1)

## 整数

bit:bit数据类型代表0,1或NULL,就是表示true,false.占用1byte.   
int:以4个字节来存储正负数.可存储范围为:-2^31至2^31-1.
smallint:以2个字节来存储正负数.存储范围为:-2^15至2^15-1
tinyint: 是最小的整数类型,仅用1字节,范围:0至此2^8-1

## 精确数值

numeric:表示的数字可以达到38位,存储数据时所用的字节数目会随着使用权用位数的多少变化.
decimal:和numeric差不多  

## 浮点数

float:用8个字节来存储数据.最多可为53位.范围为:-1.79E+308至1.79E+308.
real:位数为24,用4个字节,数字范围:-3.04E+38至3.04E+38

## 日期时间

datatime:表示时间范围可以表示从1753/1/1至9999/12/31,时间可以表示到3.33/1000秒.使用8个字节.
smalldatetime:表示时间范围可以表示从1900/1/1至2079/12/31.使用4个字节.

## 字符串

char:长度是设定的,最短为1字节,最长为8000个字节.不足的长度会用空白补上.
varchar:长度也是设定的,最短为1字节,最长为8000个字节,尾部的空白会去掉.
text:长宽也是设定的,最长可以存放2G的数据.

## Unincode字符串

nchar:长度是设定的,最短为1字节,最长为4000个字节.不足的长度会用空白补上.储存一个字符需要2个字节.
nvarchar:长度是设定的,最短为1字节,最长为4000个字节.尾部的空白会去掉.储存一个字符需要2个字节.
ntext:长度是设定的,最短为1字节,最长为2G.尾部的空白会去掉,储存一个字符需要2个字节.

## 货币数据

money:记录金额范围为:-92233720368577.5808至92233720368577.5807.需要8 个字节.
smallmoney:记录金额范围为:-214748.3648至214748.36487.需要4个字节.

## 标记

timestamp:该数据类型在每一个表中是唯一的!当表中的一个记录更改时,该记录的timestamp字段会自动更新.
uniqueidentifier:用于识别数据库里面许多个表的唯一一个记录.

## 二进制码字符串

binary:固定长度的二进制码字符串字段,最短为1,最长为8000.

image:为可变长度的二进制码字符串,最长2G.

varbinary:与binary差异为数据尾部是00时,varbinary会将其去掉

# 运算符计算区别

[回到目录](#jump1)

()>算数>比较>逻辑>拼接>赋值
not>and>or

| 计算类型          | sql server(向数值长度看齐) | mysql(随意,都能成功) | oracle(同mysql) |
| ----------------- | -------------------------- | -------------------- | --------------- |
| 整型/整型         | 1/2=0                      | 1/2=0.5              | 1/2=0.5         |
| 整型+整形字符串   | 1+'1'=2                    | *                    | *               |
| 整形长度<字符     | 1+'1.1'   报错             | *                    | *               |
| 整型长度>字符长度 | 1.0+'1'=2.0                | *                    | *               |
|                   |                            | 1+'1a'=2<br>1+'a1'=1 | 报错            |

向上取整ceiling()           向下取整floor()

Oracle不能将字符和数字相加,

# 常用函数

[回到目录](#jump1)

[sql server2016官方教程](https://learn.microsoft.com/zh-cn/sql/t-sql/functions/functions?view=sql-server-2016)

## 时间函数

| 带世纪位    | 格式                        | 符号 |
| ----------- | --------------------------- | ---- |
| 111         | yyyy/mm/dd*                 | /    |
| 103         | dd/mm/yyyy                  | /    |
| 102         | yyyy.mm.dd*                 | .    |
| 104         | dd.mm.yyyy                  | .    |
| 23          | yyyy-mm-dd*                 | -    |
| 105         | dd-mm-yyyy                  | -    |
| 112         | yyyymmdd                    |      |
| 20、120 | yyyy-mm-dd hh:mi:ss24 小时制）* | -    |
| 108         | hh:mi:ss                    | :    |
| 114         | hh:mi:ss:mmm（24 小时制） | :    |

| 日期参数  | 缩写 | 中文           |
| --------- | ---- | -------------- |
| year      | yy   | 年             |
| quarter   | qq   | 季度           |
| month     | mm   | 月             |
| day       | dd   | 日             |
| week      | ww   | 周             |
| hour      | hh   | 时             |
| mintue    | mi*  | 分             |
| secend    | ss   | 秒             |
| dayofyear | dy   | 一年中的第几天 |
| weekday   | dw   | 星期几         |

| 功能                                    | 语法                               | 效果           |
| --------------------------------------- | ---------------------------------- | -------------- |
| 获取当前时间(到秒)                      | getdate()                          |                |
| 增加时间                                | dateadd(yy, 1, '2024.1.2')         | 加1年          |
| 计算时间差                              | datediff(dd,'2024.1.2','2027.3.4') | 算中间有多少天 |
| 取时间字段(datename返回字符串)          | datepart(yy,'2024.1.2')            | 返回2024(数值) |
| 判断是否是日期(可以用来判断闰年)返回1,0 | isdate('2024.2.29')                | 如果1则闰年    |

## 排序函数

| 语法         | 效果                                              |
| ------------ | ------------------------------------------------- |
| rank()       | 跳跃1224                                          |
| dense_rank() | 不跳跃1223                                        |
| row_number() | 行1234...                                         |
| ntile(n)     | 分成n组，第一组内的排名全1，第二组内的排名全2.... |

## 字符串函数

| 功能                         | 语法                                                         | 效果                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ascii码和char之间转换        | ascii()和char()                                              | A-65<br />a-97<br />1-49                                     |
| 字符串搜索                   | patindex('%ab%','accabc')<br>patindex('%\[^ 0-9A-Za-z]%','ass!a')<br />patindex('%' + @a + '%','SadDAS') | 返回结果4<br />查找不是数字大小写字母的第一个位置，返回结果为4<br>使用变量 |
| 连接                         | concat('1','a',null,'b')                                     | 1ab                                                          |
| 自定义字符串格式             | format(123456,'##-##/##)                                     | 12-34/56                                                     |
| 取左边字符                   | left('abc',2)                                                | b                                                            |
| 返回字符数<br />返回字节数   | len(12)<br />datalength(1)                                   | 2<br />4                                                     |
| 大小写互换                   | lower()/upper()                                              |                                                              |
| 去左右空格                   | ltrim()/rtrim()                                              |                                                              |
| 替换字符串(可以用来求空格数) | replace('asdad','sd','bb')<br />replace('asd ag',' ','')     | abbad<br />用替换前的len-替换后的len                         |
| 插入/替换功能                | stuff('abcdef', 2, 2, 'ijk')                                 | 从第2个开始删除2个字符并插入后面的字符，结果为aijkdef        |
| 选择字符段                   | substring('abcd',2,3)                                        | 选择从第2个字符开始的3个字符，结果为bcd                      |
| 转置字符串顺序               | reverse('abc')                                               | cba                                                          |

## 转换函数
| 函数                                       | 效果                                 |
| ------------------------------------------ | ------------------------------------ |
| cast('123' as int)<br />convert(int,'123') | 将字符型123转换成int型123            |
| try_cast()<br />try_convert()              | 尝试转换，失败返回null成功和上面一样 |

## 分析函数(和over配合)

| 函数                                           | 效果                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ |
| LAG(列名,1,0) [ignore nulls  \| respect nulls] | 返回该列上面1行的值，如果是第1行默认为0<br>作用：对于行之间的比较可以不用自连接<br>忽略空,取上面第一个不为空的值;不忽略则取null |
| LEAD(列名,1,0) [ignore nulls\|respect nulls]   | 同上,只不过返回下1行的值                                     |
| percent_rank()                                 | 返回百分比                                                   |
| rank()/dense_rank()/row_number()               | 跳跃，不跳，行                                               |

# 事务

[回到目录](#jump1)

默认为自动提交和显示模式
开启隐式事务：set implicit_transactions on

| 事务模式     | 含义                                                         |
| ------------ | ------------------------------------------------------------ |
| 自动提交事务 | 每条语句都是单独一个事务                                     |
| 显式事务     | 每个事务以 BEGIN TRANSACTION 开始，以 COMMIT 或 ROLLBACK 结束。 |
| 隐式事务     | 前一个事务完成时，新事务隐式启动，但每个事务仍以 COMMIT 或 ROLLBACK 结束。 |
| 批处理事务   | 应用于多个活动结果集 (MARS)，在 MARS 会话中启动显式或隐式事务变为批处理级事务。 当批处理完成时没有提交或回滚的批处理级事务自动由 SQL Server 进行回滚。 |

| 基本语法                 | 含义                     |
| ------------------------ | ------------------------ |
| begin tran [名称\|@名称] | 开启事务                 |
| commit tran              | 提交(提交最近的一条事务) |
| rollback tran            | 回滚(回滚全部事务)       |
| save tran 名称           | 在事务内设置保存点       |

## 报错的处理

~~~mysql
-- 1、使用try...catch
BEGIN TRY
    BEGIN TRANSACTION
    -- 执行一系列操作
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION
    -- 处理错误的逻辑
END CATCH

-- 2、使用SET XACT_ABORT语句来自动回滚事务
-- 开启后，事务内报错将会回滚全部操作(默认off，推荐开启)
SET XACT_ABORT ON

BEGIN TRANSACTION
-- 执行一系列操作
IF @@ERROR <> 0
	BEGIN
    	ROLLBACK TRANSACTION
   	 -- 处理错误的逻辑
	END
ELSE
	BEGIN
    	COMMIT TRANSACTION
	END

-- 3.通过raiseerror来抛出错误

~~~

# 存储过程

[回到目录](#jump1)

一组经过预先编译的sql，来完成特定的事情。当存储过程执行一次后，可以将语句**缓存在内存**中，这样下次执行的时候直接使用缓存中的语句。这样就可以提高存储过程的性能。with recompile取消缓存

优点：

-  减少sql重用率
- 减少网络传输量(在开发架构中只需要向sql发送存储过程即可获取持久化数据)
- 提高安全性(不会暴露sql)

## 常见存储过程
```sql
exec sp_databases; -- 查看数据库
exec sp_tables; -- 查看表 
exec sp_columns student;-- 查看列 
exec sp_helpIndex student;-- 查看索引 
exec sp_helpConstraint student;-- 约束 
exec sp_stored_procedures; 
-- 查看存储过程的sql语句内容
exec sp_helptext 'sp_stored_procedures';
-- 重命名表，列，库
exec sp_rename studentinfo,student
exec sp_rename 'student.列','新列名','column'
exec sp_renamedb myTempDB, myDB;-- 更改数据库名称 
exec sp_defaultdb 'master', 'myDB';-- 更改登录名的默认数据库 
exec sp_helpdb;-- 数据库帮助，查询数据库信息 
exec sp_helpdb master;
```

**判断存储过程是否存在的两种方式：**

if exists(select * from sys.objects where name='存储过程名' )

if (object_id('存储过程名', 'P') is not null)   --P是指定存储过程类型
object_id('对象名','类型')

常用对象类型：
`C` = 检查约束
`D` = 默认值（约束或独立）
`F` = 外键约束
`P` = SQL 存储过程
`PK` = 主键约束
`U` = 表（用户定义的）
`V` = 视图

## 语法

~~~sql
-- 创建         输入参数为默认，out是输出参数，output会返回给调用方
if (object_id('存储过程名', 'P') is not null)
drop procedure '存储过程名'
go

create procedure 存储过程名称(@参数 参数数据类型 out|output) 
[with 存储过程选项]
[for replication]    -- 该存储过程仅用来复制，不能带参数
as
begin
.....
end
go    -- 一定要加go

存储过程选项：encryption(加密，无法在视图中查看)、recompile(执行后不再缓存)、execute as clause
-- 调用
declare
@id int=2,
@name varchar(20)
exec proc_find_stu1 @id ,@name out 
exec 存储过程名 @变量 [参数类型]

-- 删除
drop procedure [if exists] 名称
~~~

## 常用关键词

| 常用语法                                      | 说明                                                         |
| --------------------------------------------- | ------------------------------------------------------------ |
| 赋值                                          | set 只能给一个变量赋值<br>select 可以给多个变量赋值          |
| raiserror('分数传入错误'，错误级别，消息状态) | 消息号默认50000，可自定义消息好<br>错误级别0-10，不会跳到catch<br>11-19，跳到catch<br>20+，sysadmin角色成员用with log指定<br>消息状态1-127，默认1 |
|                                               |                                                              |

~~~SQL
-- if
if(条件)
begin
 ...
end
else
begin
 ...
end

-- while
while(条件)
begin
	...
	break
	continue
	return
end

-- case
case when ... then ...
     when ... then ...
     else ...
end
~~~

## 动态执行(高度自定义)存储过程sql

```sql
-- exec sp_executesql @变量,参数设置,实际参数
set @sqlName='select @i = COUNT(0) from students';
exec sp_executesql @sqlName,N'@i int output',@i output

@sqlName：需要执行的sql

N'@i int output'：参数，相当于定义时候的参数 N开头意思为后⾯的数据类型为NChar或者NVarchar 使⽤N前缀 

@i output：相当于调用，调用之后就能获取到数据
```

一般表名和列名不会作为动态sql的参数传入，使用`QUOTENAME`函数来设置sql语句中的表名和列名，用于确保表名是安全的，防止SQL注入。
例如：'select * from ' + quotename(@tablename)

# 索引

[回到目录](#jump1)

~~~sql
-- 查看表中索引
exec sp_helpindex 表名
-- 创建
create [unique|clustered|noclustered] index 索引名
on 表名(列名 [desc|asc])
-- 添加
alter table 表名 add index(字段)
-- 删除
drop index 索引名 on 表名
alter table 表名 drop index 索引名
~~~

1. 为经常用于查询条件的列创建索引。
2. 对于频繁需要排序的列，可以创建索引以加速排序操作。
3. 为经常需要更新的表创建索引时，考虑索引维护的代价。
4. 对于有大量数据更新的表，避免在频繁更新的列上创建索引。
5. 对于包含多个列的查询条件，创建复合索引，确保索引的列顺序与查询条件匹配。
6. 使用特定的索引类型，如全文索引，适用于文本搜索。

# 其他

分离，备份，恢复
1.右键数据库名->’属性‘->选项->状态->设置单用户single-user
2.右键数据库名->'任务'->'分离'
然后将mdf和ldf文件移到别的地方
3.右键数据库选‘附加’
4.将之前分离的数据库文件路径附加到新数据库引擎

第一范式（1NF): 确保每列的原子性(强调的是列的原子性，即列不能够再分成其他几列)。实际上，第一范式是所有关系型数据库的最基本要求。

第二范式（2NF): 是在第一范式（1NF）的基础上建立起来的，即满足第二范式（2NF）必须先满足第一范式（1NF）
第二范式要求确保表中每列与主键相关，而不能只与主键的某部分相关（主要针对联合主键），主键列与非主键列遵循完全函数依赖关系，也就是完全依赖

第三范式（3NF): 是在第二范式的基础上建立起来的。第三范式指：属性不依赖于其他非主属性
第三范式确保主键列之间没有传递函数依赖关系，也就是消除传递依赖

