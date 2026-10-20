---
title: "C语言基础"
pubDate: 2023-06-06
type: note
draft: false
category: "计算机语言"
tags:
  - "C·C++"
description: "从指针内容开始，不包括前面的基础概念"
---

# C++(从指针开始)

## 一、指针

1.使用指针作为函数参数
主函数定义a，b，通过swap交换两值

```c++
void swap(int *p,int *q){
int t;
t=*p;
*p=*q;
*q=t;
return;
}
int main(){
int a=1，b=2；
swap(&a,&b);
}
```

2.使用const修饰指针
**常量指针**：const int *a    指向的内容不可变，不能用解引用修改地址中的值，一般用于函数形参，表示不希望在函数内部修改地址中的值。
**指针常量（引用）**：int* const a   指向的对象不可变，定义的同时必须初始化
**常指针常量（常引用）**：const int * const a 指向内容和对象都不可变

3.函数指针

```c++
int (*fun)(int a,int b)；
int fun1(int a,int b);
fun=fun1;     //对函数指针赋值
fun(a,b);和fun1(a,b);效果一样
```

4.动态创建一维数组(静态就是普通创建)
创建：int *p=new int[4];  //动态创建长度4的int数组，并用指针p指向它
释放：delete []p

## 二、字符串
