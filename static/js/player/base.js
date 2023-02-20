import { AcGameObject } from "../ac_game_object/base.js";
export class Player extends AcGameObject{
    constructor(root,info){
        super();

        this.root=root;
        this.id=info.id;
        this.x=info.x;
        this.y=info.y;
        this.height=info.height;
        this.width=info.width;
        this.color=info.color;

        this.direction=1;

        this.vx=0;
        this.vy=0;

        this.speedx=400;
        this.speedy=1000;
        this.gravity=50;

        this.hp=100;
        this.power=20;
        this.$hpred=this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
        this.$hp=this.$hpred.find(`div`);//绿色在内

        this.ctx=this.root.game_map.ctx;
        this.pressed_keys=this.root.game_map.controller.pressed_keys;

        this.animations= new Map();
        this.frame_current_cnt=0;
        this.status=3;
        //0：idle 1：向前 2：向后 3：跳跃 
        //4：攻击 5：被打 6：死亡
    }
    start(){}

    update_move(){
        this.vy+=this.gravity;
        this.x+=this.vx*this.timedelta/1000;
        this.y+=this.vy*this.timedelta/1000;

        let a=this,b=this.root.Players[1-this.id];
        let r1={
            x1:a.x,
            x2:a.y,
            x2:a.x+a.width,
            y2:a.y+a.height,
        }
        let r2={
            x1:b.x,
            x2:b.y,
            x2:b.x+b.width,
            y2:b.y+b.height,
        }
        if(b.status!=6&&this.is_collision(r1,r2)){
            this.x-=0.5*this.vx*this.timedelta/1000;
            b.x+=0.2*this.vx*this.timedelta/1000;
        }
        if(this.y>450){
            this.y=450;
            this.vy=0;
            if(this.status===3)this.status=0;
        }
        if(this.x<0){this.x=0;}
        if(this.x+this.width>this.root.game_map.$canvas.width()){
            this.x=this.root.game_map.$canvas.width()-this.width;
        }
    }

    update_control(){
        let w,a,d,space;
        if(this.id===0){
            w= this.pressed_keys.has('w');
            a= this.pressed_keys.has('a');
            d= this.pressed_keys.has('d');
            space= this.pressed_keys.has(' ');
        }else{
            w= this.pressed_keys.has('ArrowUp');
            a= this.pressed_keys.has('ArrowLeft');
            d= this.pressed_keys.has('ArrowRight');
            space= this.pressed_keys.has('Enter');
        }
        if(this.status==0||this.status===1||this.status===2){
            if(space){
                this.status=4;
                this.vx=0; 
                this.frame_current_cnt=0;
            }
            else if(w){
                if(d){
                    this.vx=this.speedx;
                }else if(a){
                    this.vx=-this.speedx;
                }else{
                    this.vx=0;
                }
                this.vy=-this.speedy;
                this.status=3;
            }
            else if(d){
                this.vx=this.speedx;
                this.status=1;
            }
            else if(a){
                this.vx=-this.speedx;
                this.status=1;
            }
            else {
                this.vx=0;
                this.status=0;
            }
        }
    }

    update_direction(){
        if(this.status===6)return;
        let players=this.root.Players;
        if(players[0]&&players[1]){
            let me=this,you=players[1-this.id];
            if(me.x<you.x)me.direction=1;
            else me.direction=-1;
        }
    }

    is_attack(){
        this.status=5;
        this.frame_current_cnt=0;
        this.hp=Math.max(0,this.hp-this.power);

        this.$hp.animate({
            width:this.$hp.parent().width()*(this.hp/100)
        },300);
        this.$hpred.animate({
            width:this.$hp.parent().width()*(this.hp/100)
        },500);

        if(this.hp===0){
            this.status=6;
            this.frame_current_cnt=0;
        }
    }

    is_collision(r1,r2){
        if(Math.max(r1.x1,r2.x1)>Math.min(r1.x2,r2.x2))return false;
        if(Math.max(r1.y1,r2.y1)>Math.min(r1.y2,r2.y2))return false;
        return true;
    }

    update_attack(){
        if(this.status===4&&this.frame_current_cnt===18){
            let me=this,you=this.root.Players[1-this.id];
            let r1;
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
                    x2:this.x+this.width-120-100+10,
                    y2:this.y+40+30,
                }
            }
            let r2={
                x1:you.x,
                y1:you.y,
                x2:you.x+you.width,
                y2:you.y+you.ctx.height,
            }
            if(you.status!=6&&this.is_collision(r1,r2)){
                you.is_attack();
            }
        }
    }

    update(){
        this.update_attack();
        this.update_control();
        this.update_move();
        this.update_direction();

        this.render();
    }

    render(){
        //辅助视图
        // this.ctx.fillStyle=this.color;
        // this.ctx.fillRect(this.x,this.y,this.width,this.height);

        // if(this.direction>0){
        //     this.ctx.fillStyle='green';
        //     this.ctx.fillRect(this.x+120,this.y+40,100,30);

        // }else{
        //     this.ctx.fillStyle='green';
        //     this.ctx.fillRect(this.x+this.width-120-100,this.y+40,100,30);
        // }

        if(this.status===1&&this.direction*this.vx<0){
            this.status=2;
        }
        let status=this.status;
        let obj=this.animations.get(status);
        if(obj&&obj.loaded){
            if(this.direction>0){
                let k=parseInt(this.frame_current_cnt/obj.frame_rate)%obj.frame_cnt;
                let image=obj.gif.frames[k].image;
                this.ctx.drawImage(image,this.x,this.y+obj.offset_y,obj.scale*image.width,obj.scale*image.height);
            }else{
                this.ctx.save();
                this.ctx.scale(-1,1);
                this.ctx.translate(-this.root.game_map.$canvas.width(),0);

                let k=parseInt(this.frame_current_cnt/obj.frame_rate)%obj.frame_cnt;
                let image=obj.gif.frames[k].image;
                this.ctx.drawImage(image,this.root.game_map.$canvas.width()-this.x-this.width,this.y+obj.offset_y,obj.scale*image.width,obj.scale*image.height);

                this.ctx.restore();
            }
        }
        if(status==4||status==5||status==6){
            if(this.frame_current_cnt==obj.frame_rate*(obj.frame_cnt-1)){
                if(status===6){
                    this.frame_current_cnt--;
                }else{
                    this.status=0;
                    this.frame_current_cnt=0;
                }
            }
        }
        
        this.frame_current_cnt++;
    }

}