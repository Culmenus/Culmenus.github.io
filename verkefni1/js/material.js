class Material {
    constructor(gl, vs, fs) {
        this.gl = gl;

        let vsShader = this.getShader(vs, gl.VERTEX_SHADER);
        let fsShader = this.getShader(fs, gl.FRAGMENT_SHADER);

        if (vsShader && fsShader) {
            this.program = gl.createProgram();
            gl.attachShader(this.program, vsShader);
            gl.attachShader(this.program, fsShader);
			gl.linkProgram(this.program);
			
			if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)){
				console.error("Cannot load shader \n"+gl.getProgramInfoLog(this.program));
				return null;
			}
			
			gl.detachShader(this.program, vsShader);
			gl.detachShader(this.program, fsShader);
			gl.deleteShader(vsShader);
			gl.deleteShader(fsShader);
			
			gl.useProgram(null);
        }
    }

    getShader(script, type){
		let gl = this.gl;
		var output = gl.createShader(type);
		gl.shaderSource(output, script);
		gl.compileShader(output);
		
		if(!gl.getShaderParameter(output, gl.COMPILE_STATUS)){
			console.error("Shader error: \n:" + gl.getShaderInfoLog(output));
			return null;
		}
		
		return output;
	}
}


class Sprite {
    constructor(gl, img_url, vs, fs, opts={}) {
        this.gl = gl;
        this.isLoaded = false;
        this.material = new Material(gl, vs, fs);

        this.tex_coords = [];
        this.geo_coords = [];

    

        this.size_x = 16;
        if("width" in opts){
			this.size_x = opts.width * 1;
		}

        this.size_y = 16;
		if("height" in opts){
			this.size_y = opts.height * 1;
		}

        //this.geo_size_x = 16;
        //if("geo_width" in opts){
		//	this.geo_size_x = opts.geo_width * 1;
		//}
//
        //this.geo_size_y = 16;
		//if("geo_height" in opts){
		//	this.geo_size_y = opts.geo_height * 1;
		//}

        this.image = new Image();
        this.image.src = img_url;
        this.image.sprite = this;


        //breyta i es6 promise
        this.image.onload = function() {
            this.sprite.setup();
        }
    }

    static createRecArray(x=0, y=0, w=1, h=1){
        let out = [
            vec2(x, y),
            vec2(x+w,y),
            vec2(x, y+h),
            vec2(x, y+h),
            vec2(x+w, y),
            vec2(x+w, y+h),
        ];
        
        return out;
    }

    static createRevRecArray(x=0, y=0, w=1, h=1){
        let out = [
            vec2(x+w,y),
            vec2(x, y),
            vec2(x+w, y+h),
            vec2(x+w, y+h),
            vec2(x, y),
            vec2(x, y+h),
        ];
        
        return out;
    }

    setup() {
        let gl = this.gl;

        gl.useProgram(this.material.program);
        this.gl_tex = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        gl.bindTexture(gl.TEXTURE_2D, null);

        //this.uv_x = this.size_x / (this.image.width / 16);
        //this.uv_y = this.size_y / (this.image.height / 16);

        this.uv_x = this.size_x / this.image.width;
        this.uv_y = this.size_y / this.image.height;

        let tex_rec_array = Sprite.createRecArray(0,0, this.uv_x, this.uv_y);
        let rev_tex_rec_array = Sprite.createRevRecArray(0,0, this.uv_x, this.uv_y);
        let geo_rec_array = Sprite.createRecArray(0,0, this.size_x, this.size_y)

        this.tex_coords = tex_rec_array;
        this.geo_coords = geo_rec_array;

        this.tex_buff = gl.createBuffer();
        this.rev_tex_buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(tex_rec_array), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.rev_tex_buff);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(rev_tex_rec_array), gl.STATIC_DRAW);
        
        
        this.geo_buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(geo_rec_array), gl.STATIC_DRAW);
        
        this.aPositionLoc = gl.getAttribLocation(this.material.program, "a_position");
		this.aTexcoordLoc = gl.getAttribLocation(this.material.program, "a_texCoord");
		this.uImageLoc = gl.getUniformLocation(this.material.program, "u_image");

        this.uMarioDir = gl.getUniformLocation(this.material.program, "u_mario_dir");

        this.uFrameLoc = gl.getUniformLocation(this.material.program, "u_frame");
        this.uWorldLoc = gl.getUniformLocation(this.material.program, "u_world");
        this.uObjectLoc = gl.getUniformLocation(this.material.program, "u_object");

        gl.useProgram(null);
        this.isLoaded = true;
    }

    render(pos, frames, right = false) {
		if(this.isLoaded){
			let gl = this.gl;


            let frame_x = Math.floor(frames[0]) * this.uv_x;
            let frame_y = Math.floor(frames[1]) * this.uv_y;

            let dirMat = mat2();

            
            
			gl.useProgram(this.material.program);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
			gl.uniform1i(this.uImageLoc, 0);
			
            if (right) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.rev_tex_buff);
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
            }

			gl.enableVertexAttribArray(this.aTexcoordLoc);
			gl.vertexAttribPointer(this.aTexcoordLoc,2,gl.FLOAT,false,0,0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
			gl.enableVertexAttribArray(this.aPositionLoc);
			gl.vertexAttribPointer(this.aPositionLoc,2,gl.FLOAT,false,0,0);

            gl.uniform2f(this.uFrameLoc, frame_x, frame_y);
            
            gl.uniformMatrix3fv(this.uWorldLoc, false, flatten(window.game.worldSpaceMatrix));
            gl.uniform2fv(this.uObjectLoc, flatten(pos));

            gl.uniformMatrix4fv(this.uMarioDir, false, flatten(dirMat));
            

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
			
			gl.useProgram(null);
		}
	}
}