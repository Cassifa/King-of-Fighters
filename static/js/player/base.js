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

        this.ctx=this.root.game_map.ctx;
        this.pressed_keys=this.root.game_map.controller.pressed_keys;

        this.animations= new Map();
        this.frame_current_cnt=0;
        this.status=3;
        //0：idle 1：向前 2：向后 3：跳跃 
        //4：攻击 5：被打 6：死亡
    }
    start(){

    }

    update_move(){
        if(this.status===3)this.vy+=this.gravity;
        this.x+=this.vx*this.timedelta/1000;
        this.y+=this.vy*this.timedelta/1000;
        if(this.y>450){
            this.y=450;
            this.vy=0;
            this.status=0;
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
        let players=this.root.Players;
        if(players[0]&&players[1]){
            let me=this,you=players[1-this.id];
            if(me.x<you.x)me.direction=1;
            else me.direction=-1;
        }
    }
    update(){
        this.update_control();
        this.update_move();
        this.update_direction();

        this.render();
    }

    render(){
        // this.ctx.fillStyle=this.color;
        // this.ctx.fillRect(this.x,this.y,this.width,this.height);

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
        if(status==4){
            if(this.frame_current_cnt==obj.frame_rate*(obj.frame_cnt-1)){
                this.status=0;
                this.frame_current_cnt=0;
            }
        }
        this.frame_current_cnt++;
    }

}