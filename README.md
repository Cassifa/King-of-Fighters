# KING OF FIGHT:单机拳击对抗小游戏

## 概述

​	模拟拳皇游戏，两名玩家在本地进行拳击对抗，限时一分钟内击倒对手即为胜利



## 项目介绍

​	使用HTML JS CSS编写的网页脚本游戏，两名玩家分别在键盘输入 W S A Enter 和 up left right Space以操作左右两名角色进行 跳跃 左移 右移 攻击，一分钟内击倒对方即为胜利，截止一分钟无玩家胜利即全部判为失败。使用canvas渲染游戏动画，角色有碰撞体积及各个状态下动画，两名玩家会实时面对对方，玩家身位重叠时会挤兑对方。玩家状态使用状态机属性 status 存储： 0：站立 1：向前 2：向后 3：跳跃  4：攻击 5：被打 6：死亡



## 效果展示

- 游戏开局

![](https://git.acwing.com/Cassifa/img-folder/-/raw/main/KOF_images/01.png)

- 玩家攻击

![](https://git.acwing.com/Cassifa/img-folder/-/raw/main/KOF_images/03.png)

- 玩家胜利

![](https://git.acwing.com/Cassifa/img-folder/-/raw/main/KOF_images/02.png)

- 平局

![](https://git.acwing.com/Cassifa/img-folder/-/raw/main/KOF_images/04.png)



## 代码逻辑

- 游戏基类

游戏过程中所有需要渲染

```js
let GAME_OBJECTS=[];//存储所有需要渲染的
class AcGameObject{
    constructor(){
        GAME_OBJECTS.push(this);
        this.timedelta=0;
        this.has_call_start=false;
    }
    start(){}//初始化
    update(){}//状态更新
    destory(){//销毁
        for(let i in GAME_OBJECTS){
            if(GAME_OBJECTS[i]==this){
                GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }
}
let last_timestamp;
let AC_GAME_OBJECT_FRAME=(timestamp)=>{
    for(let obj of GAME_OBJECTS){
        if(!obj.has_call_start){
            obj.start();
            obj.has_call_start=true;
        }
        else{
            obj.timedelta=timestamp-last_timestamp;
            obj.update();
        }
    }
    last_timestamp=timestamp;
    requestAnimationFrame(AC_GAME_OBJECT_FRAME);
}
//每60秒渲染一次动画
requestAnimationFrame(AC_GAME_OBJECT_FRAME);

export{
    AcGameObject
}
```

- 监听键盘输入

```js
export class Controller{
    constructor($canvas){
        this.$canvas=$canvas;//绑定canvas，接受所有对于canvas的输入
        this.pressed_keys=new Set();//使用Set存储所有当前输入
        this.start();//开始工作
    }
    start(){
        let outer=this;
        this.$canvas.keydown(function(e){//接受输入，添加当前输入至pressed_keys
            outer.pressed_keys.add(e.key);
        });
        this.$canvas.keyup(function(e){//接受输入，查找并销毁当前输入
            outer.pressed_keys.delete(e.key);
        });
    }
}
```

- 攻击检测

```js
    is_collision(r1,r2){//碰撞检测
        if(Math.max(r1.x1,r2.x1)>Math.min(r1.x2,r2.x2))return false;
        if(Math.max(r1.y1,r2.y1)>Math.min(r1.y2,r2.y2))return false;
        return true;
    }

    update_attack(){//进行攻击
        //玩家状态为攻击且动画播放到第18帧(出拳帧)进行攻击检测
        if(this.status===4&&this.frame_current_cnt===18){
            let me=this,you=this.root.Players[1-this.id];//玩家操作角色与对手角色
            let r1;//拳头范围
            if(this.direction>0){
                r1={
                    x1:this.x+120,
                    y1:this.y+40,
                    x2:this.x+120+100,
                    y2:this.y+40+30,
                }
            }else{
                r1={
                    x1:this.x+this.width-120-100,
                    y1:this.y+40,
                    x2:this.x+this.width-120-100+100,
                    y2:this.y+40+30,
                }
            }
            let r2={//敌人身体范围
                x1:you.x,
                y1:you.y,
                x2:you.x+you.width,
                y2:you.y+you.ctx.height,
            }
            if(you.status!=6&&this.is_collision(r1,r2)){//碰撞检测
                you.is_attack();//对方受击
            }
        }
    }
```



## 技术支持&&快速上手

- 开发工具

- 运行依赖

  VSCode插件：Live Server 

- 项目下载本地后右键"index.html"并选择"open with live Server"即可