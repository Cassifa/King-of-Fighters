import {AcGameObject} from '/static/js/game_object/base.js';
import { Controller } from '../controller/base.js';

export class GameMap extends AcGameObject{
    constructor(root){
        super();

        this.root=root;
        this.$canvas=$('<canvas width="1280" height="720" tabindex=0></canvas>');
        this.ctx=this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas);
        this.$canvas.focus();

        this.controller=new Controller(this.$canvas);

        this.root.$kof.append($(`
        <div class="kof-head">
            <div class="kof-head-hp-0">
                <div>
                    <div>
                    </div>
                </div>
            </div>

            <div class="kof-head-timer">60</div>

            <div class="kof-head-hp-1">
                <div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
        `));
        this.time=60000;
        this.$timer=$(`.kof-head-timer`);
    }
    start(){

    }
    update(){
        this.time-=this.timedelta;
        let [a,b]=this.root.Players;
        if(a.status===6||b.status===6)this.time+=this.timedelta;
        if(this.time<0){
            this.time=0;
            if(a.status!=6&&b.status!=6){
                a.status=b.status=6;
                a.frame_current_cnt=b.frame_current_cnt=0;
                a.vx=b.vx=0;
            }
        }
        this.$timer.text(parseInt(this.time/1000));

        this.render();
    }
    render(){
        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        // this.ctx.fillStyle='black';
        // this.ctx.fillRect(0,0,this.$canvas.width(),this.$canvas.height());
    }
}