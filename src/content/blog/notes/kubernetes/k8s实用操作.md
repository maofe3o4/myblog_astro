---
title: "k8s集群部署以及实用操作"
pubDate: 2024-07-29
type: note
draft: false
category: "运维"
tags:
  - "k8s"
description: "用阿里云服务器来搭建一个k8s集群，包括dashboard、pod、deployment、service、ingress、存储等方面的内容。"
---


# 配置k8s集群

## 基础环境

在这之前保证每台服务器都安装有docker

~~~shell
#各个机器设置自己的域名
hostnamectl set-hostname xxxx
vi /etc/hosts

# 将 SELinux 设置为 permissive 模式（相当于将其禁用）
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

#关闭swap
swapoff -a  
sed -ri 's/.*swap.*/#&/' /etc/fstab

#允许 iptables 检查桥接流量
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system
~~~

## 安装kubelet、kubeadm、kubectl

~~~shell
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
   http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
exclude=kubelet kubeadm kubectl
EOF

sudo yum install -y kubelet-1.20.9 kubeadm-1.20.9 kubectl-1.20.9 --disableexcludes=kubernetes

sudo systemctl enable --now kubelet
#kubelet 现在每隔几秒就会重启，因为它陷入了一个等待 kubeadm 指令的死循环
~~~

## 下载所需镜像

这里在当前目录下通过sh文件来批量安装镜像

~~~shell
sudo tee ./images.sh <<-'EOF'
#!/bin/bash
images=(
kube-apiserver:v1.20.9
kube-proxy:v1.20.9
kube-controller-manager:v1.20.9
kube-scheduler:v1.20.9
coredns:1.7.0
etcd:3.4.13-0
pause:3.2
)
for imageName in ${images[@]} ; do
docker pull registry.cn-hangzhou.aliyuncs.com/lfy_k8s_images/$imageName
done
EOF
   
chmod +x ./images.sh && ./images.sh
~~~

以上操作每台服务器都要进行
接下来只需要在主节点上操作

## 初始化主节点

### 初始化

~~~shell
#主节点初始化
kubeadm init \
--apiserver-advertise-address=172.19.39.156 \
--control-plane-endpoint=centos7-156 \
--image-repository registry.cn-hangzhou.aliyuncs.com/lfy_k8s_images \
--kubernetes-version v1.20.9 \
--service-cidr=10.96.0.0/16 \
--pod-network-cidr=192.168.0.0/16

#更改你自己的master主节点的ip(第一项)和主机名(第二项)，之前在/etc/hosts文件中有配置过
~~~

说明：

| 命令                           |                        |
| ------------------------------ | ---------------------- |
| kubeadm init                   | 主节点初始化           |
| --apiserver-advertise-address= | 主服务器的(私有)IP     |
| --control-plane-endpoint=      | 控制结点的域名/IP      |
| --image-repository             | 镜像仓库               |
| --kubernetes-version           | k8s版本                |
| --service-cidr=                | 集群中结点的虚拟IP范围 |
| --pod-network-cidr=            | pod的IP范围            |

### 初始化信息

在初始化完成后，保留系统的初始化信息,这里面有口令，如果忘记保存了就重新在master主机上生成
kubeadm token create --print-join-command

~~~shell
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of control-plane nodes by copying certificate authorities
and service account keys on each node and then running the following as root:

  kubeadm join centos7-156:6443 --token 6jxsq5.81s2v6tnq2yv934k \
    --discovery-token-ca-cert-hash sha256:605505eea7c3d7f85adc7b1703921009006db845d018b97b33f33407996ebe8f \
    --control-plane 

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join centos7-156:6443 --token 6jxsq5.81s2v6tnq2yv934k \
    --discovery-token-ca-cert-hash sha256:605505eea7c3d7f85adc7b1703921009006db845d018b97b33f33407996ebe8f
~~~

根据初始化信息继续操作

~~~shell
# 管理用户的配置文件
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 如果你是root用户，添加环境变量
export KUBECONFIG=/etc/kubernetes/admin.conf

# 给集群配置pod网络
curl https://docs.projectcalico.org/v3.20/manifests/calico.yaml -O
kubectl apply -f calico.yaml

# 将一个结点作为管理节点添加到集群(在副结点命令行执行)
kubeadm join [主结点服务器名]:6443 --token 6jxsq5.81s2v6tnq2yv934k \
    --discovery-token-ca-cert-hash sha256:605505eea7c3d7f85adc7b1703921009006db845d018b97b33f33407996ebe8f \
    --control-plane
    
# 将一个结点作为副节点添加到集群(在副结点命令行执行)
kubeadm join [主结点服务器名]:6443 --token 6jxsq5.81s2v6tnq2yv934k \
    --discovery-token-ca-cert-hash sha256:605505eea7c3d7f85adc7b1703921009006db845d018b97b33f33407996ebe8f

# 查看集群所有节点或pods
kubectl get nodes    //全部状态ready
kubectl get pods -A

# 主机重新生成令牌(如果有出现结点加不进去的情况)
kubeadm token create --print-join-command

# 副结点加入失败后
rm -rf /etc/kubenetes/*
kubeadm reset
再用主机生成的令牌加入
~~~

## 部署dashborad

### 下载dashborad并创建用户

~~~shell
# 从后面网址下yaml文件并应用(如果执行失败，自己去下这个文件)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.3.1/aio/deploy/recommended.yaml

# 设置访问端口，将type: ClusterIP 改为 type: NodePort
kubectl edit svc kubernetes-dashboard -n kubernetes-dashboard
# 找到端口，并打开该端口的防火墙(云服务器需设置安全组)
kubectl get svc -A |grep kubernetes-dashboard

# 创建访问账号，准备一个yaml文件； vi dash.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
# 制作好上面的文件然后执行下面的命令
kubectl apply -f dash.yaml
# 获取访问令牌并复制
kubectl -n kubernetes-dashboard get secret $(kubectl -n kubernetes-dashboard get sa/admin-user -o jsonpath="{.secrets[0].name}") -o go-template="{{.data.token | base64decode}}"
~~~

~~~txt
eyJhbGciOiJSUzI1NiIsImtpZCI6IlJraHBhdHJBV0x1bWVUanVtc3l3WGdTMVo0cVVhOF9PYmVyN2JMWXc5bTQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLTRienE5Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJiY2UzMTA3MC05ZDA3LTQ4OTctYTIzOC0wYjIxZWEzNDdiMzgiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZXJuZXRlcy1kYXNoYm9hcmQ6YWRtaW4tdXNlciJ9.KD7RbvNBTvcWWZkHQmRQfCcUesoo9H4vZebyu-DnXT70ZPVkKNBkq0SxFtdqk0fjuzb9_xUhYtqLatZT2jixMUnN29GHAptbG6fxQvHcQCerrAz8POMkBylZevY_C1QwY-JUiSGTwy42pEkNNHE-cA7iZWE3jU9-Rnb9YCefKI1OsO7Mutopz-T4P7OoCPVjdzvnGqXSBZTK4qqaKR9_2t58iIIuWUFe8Z8uIdEZhauyHMFqAVdiMlTRXI7GeIHwsxwDwhBSHEFutjWf5ugqZRfj6ug4OyzpiLuy8ijs6-YYQamvtgsejGfYJXirmBCYawTvrQI2Iwx-Qw4CshbDTQ
~~~

### 浏览器访问

https://任意一台集群中的公网IP:端口
此处端口kubectl get svc -A |grep kubernetes-dashboard查看

## 使用token登录

~~~shell
#查看用户
kubectl get sa
#查看default用户的信息
kubectl describe sa default
#获取上面用户对应的token值
kubectl describe secret default-token-[自己的token行] | awk '$1=="token:"{print $2}'
~~~

# 常用命令

## 命名空间

| 命令                         |                        |
| ---------------------------- | ---------------------- |
| kubectl create ns hello      | 创建                   |
| kubectl delete ns hello      | 删除                   |
| kubectl get pods -n 命令空间 | 查指定命名空间里的pods |

## pod操作

<img src="D:\admin_file\自学笔记\myblog_hexo\source\_posts\kubernetes\k8s工作负载.png" alt="k8s" style="zoom:150%;" />

| 工作负载    |                                           |
| ----------- | ----------------------------------------- |
| deployment  | 无状态应用，微服务，提供多副本功能        |
| statefulset | 有状态应用，redis，提供稳定存储和网络功能 |
| DaemonSet   | 守护星应用，日志收集，每个机器都运行      |
| Job/CronJob | 定时任务，垃圾清理                        |

### 使用run和deployment命令创建

~~~shell
kubectl run mynginx --image=nginx
或
kubectl create deployment mynginx --image=nginx
# 查看default名称空间的Pod
kubectl get pod 
# 描述
kubectl describe pod|deploy Pod名|部署名
# 修改yaml文件
kubectl edit deployment|pod pod名|部署名
# 删除
kubectl delete pod Pod名字
# 查看Pod的运行日志
kubectl logs Pod名字

# 每个Pod - k8s都会分配一个ip
kubectl get pod -owide
# 使用Pod的ip+pod里面运行容器的端口
curl 192.168.169.136

# 集群中的任意一个机器以及任意的应用都能通过Pod分配的ip来访问这个Pod
~~~

两个不同命令的区别：

- deployment控制Pod，使Pod拥有多副本，自愈，扩缩容等能力

#### deployment扩缩容

~~~shell
# 修改复制数，指定部署名
kubectl scale -n 命名空间 --replicas=复制数 deployment/my-dep
~~~

### 使用yaml文件创建

~~~yaml
# 创建pod
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: myapp
  name: myapp
spec:
  containers:
  - image: nginx
    name: nginx
  - image: tomcat:8.5.68
    name: tomcat
~~~

~~~yaml
# 创建deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: my-dep
  name: my-dep
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-dep
  template:
    metadata:
      labels:
        app: my-dep
    spec:
      containers:
      - image: nginx
        name: nginx
~~~

### 查看pod实时状态

kubectl get pods -w          Ctrl+C退出

watch -n 3 kubectl get pods | grep pod名          3秒刷新一次

## 版本控制

~~~shell
# 设置部署pod内容器的版本并记录
kubectl set image deployment/deploy名 nginx=nginx:1.16.1 --record
# 检查特定Deployment的Rollout状态
kubectl rollout status deployment/deploy名

#历史记录
kubectl rollout history deployment/deploy名
#查看某个历史详情
kubectl rollout history deployment/deploy名p --revision=2
#回滚(回到上次)
kubectl rollout undo deployment/deploy名
#回滚(回到指定版本)
kubectl rollout undo deployment/deploy名 --to-revision=2
~~~

## 服务service

将一组 [Pods](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/) 公开为网络服务的抽象方法。

kubectl get svc

~~~shell
#暴露Deploy，把deploy里的my-dep服务的8000端口暴露，并和内部pod的80端口对应上
#在加上--NodePort选项之后可以通过 公网ip:生成的端口 访问
#如果不加默认--type=ClusterIP，只能集群内部访问
kubectl expose deployment my-dep --port=8000 --target-port=80
或者
kubectl expose deployment my-dep --port=8000 --target-port=80 --type=NodePort

#使用标签检索Pod
kubectl get pod -l app=my-dep

# 等效yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: my-dep
  name: my-dep
spec:
  selector:
    app: my-dep
  ports:
  - port: 8000
    protocol: TCP
    targetPort: 80
~~~

## ingress统一网关接口

<img src="D:\admin_file\自学笔记\myblog_hexo\source\_posts\kubernetes\ingress.png" alt="ingress" style="zoom:150%;" />

~~~shell
# 安装
wget https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.47.0/deploy/static/provider/baremetal/deploy.yaml

#修改镜像
vi deploy.yaml
#将image的值改为如下值：
registry.cn-hangzhou.aliyuncs.com/lfy_k8s_images/ingress-nginx-controller:v0.46.0
# 应用该文件
kubectl apply -f deploy.yaml
# 检查安装的结果
kubectl get pod,svc -n ingress-nginx

# 最后别忘记把svc暴露的端口要放行
~~~

# 存储抽象

## 通过指令挂载

~~~shell
# 所有节点
yum install -y nfs-utils

# 主节点
echo "/nfs/data/ *(insecure,rw,sync,no_root_squash)" > /etc/exports
mkdir -p /nfs/data
systemctl enable rpcbind --now
systemctl enable nfs-server --now
#配置生效
exportfs -r

# 从节点
showmount -e 主节点IP    # 查看主节点挂载目录
#执行以下命令挂载 nfs 服务器上的共享目录到本机路径 /root/nfsmount
mkdir -p /nfs/data
mount -t nfs 主结点IP:/nfs/data /nfs/data
# 写入一个测试文件
echo "hello nfs server" > /nfs/data/test.txt

#解绑
unmount -lf /nfs/data/
~~~

## 通过yaml挂载

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx-pv-demo
  name: nginx-pv-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx-pv-demo
  template:
    metadata:
      labels:
        app: nginx-pv-demo
    spec:
      containers:
      - image: nginx
        name: nginx
        volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
      volumes:
        - name: html
          nfs:
            server: 主节点IP
            path: /nfs/data/nginx-pv
~~~

# PV&PVC

PV：持久卷，将应用需要持久化的数据**保存**到指定位置
PVC：持久卷申明，**申明**需要使用的持久卷规格

pv是提前设置好静态空间，放在那里等人来用
pvc就是发出申请，我要用一个大小多大的pv

<img src="D:\admin_file\自学笔记\myblog_hexo\source\_posts\kubernetes\PV&PVC.png" alt="PV&PVC" style="zoom:150%;" />

### 静态供应(创建pv)

~~~shell
#nfs主节点
mkdir -p /nfs/data/01
mkdir -p /nfs/data/02
mkdir -p /nfs/data/03
~~~

~~~yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv01-10m
spec:
  capacity:
    storage: 10M
  accessModes:
    - ReadWriteMany
  storageClassName: nfs
  nfs:
    path: /nfs/data/01
    server: 172.31.0.4
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv02-1gi
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteMany
  storageClassName: nfs
  nfs:
    path: /nfs/data/02
    server: 172.31.0.4
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv03-3gi
spec:
  capacity:
    storage: 3Gi
  accessModes:
    - ReadWriteMany
  storageClassName: nfs
  nfs:
    path: /nfs/data/03
    server: 172.31.0.4
~~~

### pvc创建和绑定

~~~yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: nginx-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 200Mi
  storageClassName: nfs
~~~

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx-deploy-pvc
  name: nginx-deploy-pvc
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx-deploy-pvc
  template:
    metadata:
      labels:
        app: nginx-deploy-pvc
    spec:
      containers:
      - image: nginx
        name: nginx
        volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
      volumes:
        - name: html
          persistentVolumeClaim:
            claimName: nginx-pvc
~~~

# configmap应用的配置文件

查看有哪些配置文件：kubectl get cm

## redis实例

~~~shell
# 创建配置，redis保存到k8s的etcd；
kubectl create cm redis-conf --from-file=redis.conf
~~~

等价yaml
~~~yaml
apiVersion: v1
data:    #data是所有真正的数据，key：默认是文件名   value：配置文件的内容
  redis.conf: |
    appendonly yes
kind: ConfigMap
metadata:
  name: redis-conf
  namespace: default
~~~

创建redis的pod同时将该配置对应

~~~yaml
apiVersion: v1
kind: Pod
metadata:
  name: redis
spec:
  containers:
  - name: redis
    image: redis
    command:
      - redis-server
      - "/redis-master/redis.conf"  #指的是redis容器内部的位置
    ports:
    - containerPort: 6379
    volumeMounts:
    - mountPath: /data
      name: data
    - mountPath: /redis-master
      name: config
  volumes:
    - name: data
      emptyDir: {}
    - name: config
      configMap:
        name: redis-conf
        items:
        - key: redis.conf
          path: redis.conf
~~~

# secret敏感信息

Secret 对象类型用来保存敏感信息，例如密码、OAuth 令牌和 SSH 密钥。 将这些信息放在 secret 中比放在 [Pod](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/) 的定义或者 [容器镜像](https://kubernetes.io/zh/docs/reference/glossary/?all=true#term-image) 中来说更加安全和灵活。

~~~shell
kubectl create secret docker-registry leifengyang-docker \
--docker-username=leifengyang \
--docker-password=Lfy123456 \
--docker-email=534096094@qq.com

##命令格式
kubectl create secret docker-registry regcred \
  --docker-server=<你的镜像仓库服务器> \
  --docker-username=<你的用户名> \
  --docker-password=<你的密码> \
  --docker-email=<你的邮箱地址>
~~~

