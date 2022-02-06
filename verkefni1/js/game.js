function loop(){
    window.game.update();
    requestAnimationFrame(loop);
}


// fékki mikla hjálp frá dha7 með leikja lógíkina en grafíkin er alveg 100p mín
class Mario {
    constructor(gl, vs, fs, obst) {
        this.sprite = new Sprite(gl, "img/SMW_Luiji.png", vs, fs, {width: 16, height:16});

        this.pos = vec2(0,8);
        this.dir_right = false;
        this.jumping = false;
        this.frame = vec2(1, 4);
        this.vel_x = 0;
        this.vel_y = 0;
        this.speed = 1;
        this.obsticles = obst;
        this.goldcoins = [];
        for(let i = -5; i < 5; i++){
            this.goldcoins.push( new Gold (gl, vs, fs, vec2(16*i, -16)));
        }
        
        this.score = 0;

    }

    collide() {

        //mikil hjálp frá daniel
        //finnst það í lagi þar sem þetta er ekki tölvuleikjaforritun heldur tölvugrafík.
        //hann teiknast frá efra vinstra horni.
        let nextX = this.pos[0] + this.vel_x;
        let nextY = this.pos[1] + this.vel_y;
        
        for(let tile of this.obsticles) {

            if (nextY + 15.1 > tile.topY) {
                // left to right
                if ( this.pos[0] + 12.1 < tile.leftX && nextX + 12.1 > tile.leftX) {
                    this.vel_x = 0;
                }

                // right to left
                if ( this.pos[0] + 3.9 > tile.rightX && nextX + 3.9 < tile.rightX) {
                    this.vel_x = 0; 
                }
            }

            if(tile.leftX < nextX + 12.1 && tile.rightX > nextX + 0.1) {
                if(this.pos[1] + 16.1 < tile.topY && nextY + 16.1 > tile.topY) {
                    this.vel_y = 0;
                    this.jumping = false;
                }
            }
        }

        //gold check
        for (let i = this.goldcoins.length - 1 ; i >= 0 ; i--) {
            let piece = this.goldcoins[i];

            if (this.pos[1] - 0.1 < piece.bottomY && this.pos[1] + 12.1 > piece.topY &&
                this.pos[0] + 4.1 > piece.leftX && this.pos[0] + 8.1 < piece.rightX) {
                    this.score++;
                    this.goldcoins.splice(i, 1);
            }
        }

    }

    update() {
        if(!this.jumping && g_keys['D'.charCodeAt()]) {
            if(this.vel_x < 0) {
                this.vel_x *= -1;
            }
            this.vel_x = this.speed; 
            this.dir_right = true;
        } else if (!this.jumping && g_keys['A'.charCodeAt()]) {
            if(this.vel_x > 0) {
                this.vel_x *= -1;
            }
            this.vel_x = -this.speed; 
            this.dir_right = false;
        } else if (!this.jumping) {
            this.vel_x = 0;
        }

        if (!this.jumping && (eat_key('W'.charCodeAt()))) {
            this.jumping = true;
            this.vel_y = -2;
        }

        this.vel_y += 0.09;

        this.collide();

        this.pos[0] += this.vel_x;
        this.pos[1] += this.vel_y;
    }

    render() {

        for (let i = this.score; i > 0 ; i--) {
            this.sprite.render(vec2(i*16,-112), vec2(15, 0));
        }

        this.goldcoins.forEach(
            tile => tile.render()
        );
        this.sprite.render(this.pos, this.frame, this.dir_right);
    }
    
}

class Ground {
    constructor(gl, vs, fs, position, w_in = 16, h_in = 16) {
        this.w = w_in;
        this.h = h_in;
        this.leftX = position[0];
        this.rightX = position[0] + w_in;
        this.topY = position[1];
        this.bottomY = position[1] + h_in;
        this.sprite = new Sprite(gl, "img/mariotileset.png", vs, fs, {width: this.w, height:this.h});
        this.pos = position;
        this.frame = vec2();
    }

    render() {
        this.sprite.render(this.pos, this.frame) 
    }
}

//pæling hvort gold eigi bara að sjá um einn gold hlut
class Gold {
    constructor(gl, vs, fs, position, w_in = 16, h_in = 16) {
        this.w = w_in;
        this.h = h_in;
        this.leftX = position[0];
        this.rightX = position[0] + w_in;
        this.topY = position[1];
        this.bottomY = position[1] + h_in;
        this.sprite = new Sprite(gl, "img/mariotileset.png", vs, fs,{width: 16, height:16});
 
        this.pos = position;
 
        this.frame = vec2(24,1);
    }

    render() {
        this.sprite.render(this.pos, this.frame) 
   }
}

class Game {
    constructor() {
        this.canvasElm = document.createElement("canvas");
        this.canvasElm.width = 1200;
        this.canvasElm.height = 1200;

        this.worldSpaceMatrix = mat3();

        this.gl = this.canvasElm.getContext("webgl2");
        this.gl.clearColor(0.4,0.6,1.0,0.0);

        document.body.appendChild(this.canvasElm);

        let vs = document.getElementById('vs_01').innerHTML;
        let fs = document.getElementById('fs_01').innerHTML;

        //this.bricksprite = new Sprite(this.gl, "img/mariotileset.png", vs, fs,{width: 16, height:16});
        //this.goldsprite = new Sprite(this.gl, "img/mariotileset.png", vs, fs,{width: 16, height:16});
        this.mariosprite = new Sprite(this.gl, "img/SMW_Luiji.png", vs, fs, {width: 16, height:16});
        this.skysprite = new Sprite(this.gl, "img/mariotileset.png", vs, fs, {width: 47, height:32});

        this.goldsprite_pos = vec2(96,0);

        //init grountiles
        this.groundtiles = [];
        for(let i = -5; i < 7; i++){
            this.groundtiles.push( new Ground (this.gl, vs, fs, vec2(16*i, 32)));
        }
        this.groundtiles.push( new Ground( this.gl, vs, fs ,vec2(-16, 16)));
        this.groundtiles.push( new Ground( this.gl, vs, fs ,vec2(48, 16)));
        
        this.mario = new Mario(this.gl, vs, fs, this.groundtiles);

        this.skysprite_pos = vec2(-139, -92);
        
    }

    resize(x, y) {
        this.canvasElm.width = x;
        this.canvasElm.height = y;

        let wRatio = x / (y/240);
        let scale_x = 2/wRatio;
        let scale_y = 2/240;

        // smá hakk má laga, til að sprite verði ekki úr ratio.
        // án þessa hakks þá tegist sprite
        let  temp_worldSpaceMatrix = mat3(
            vec3(1.0, 0.0, 0.0),
            vec3(0.0, -1.0, 0.0),
            vec3(0.0, 0.0, 1.0)
        )

        temp_worldSpaceMatrix = transpose(temp_worldSpaceMatrix);
        temp_worldSpaceMatrix[0] = temp_worldSpaceMatrix[0].map(x => scale_x * x);
        temp_worldSpaceMatrix[1] = temp_worldSpaceMatrix[1].map(y => scale_y * y);

        this.worldSpaceMatrix = transpose(temp_worldSpaceMatrix);
    }



    update() {
        this.gl.viewport(0,0, this.canvasElm.width, this.canvasElm.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        

        this.mario.update();

        //spawn groundtiles //hægt
        this.groundtiles.forEach(
            tile => tile.render()
        )

        //this.goldcoins.forEach(
        //    tile => tile.render()
        //)

        this.skysprite_pos[0] = (this.skysprite_pos[0] + 0.1) % 120;

        //this.goldsprite_pos[1] = (this.goldsprite_pos[1] - 0.02) % 2;
        this.skysprite.render(this.skysprite_pos, vec2(0,11));

        //this.gold.render();
        this.mario.render();
        
        this.gl.flush();
    }
}