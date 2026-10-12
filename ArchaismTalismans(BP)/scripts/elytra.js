import { Vector } from "./Vector3";

export class ElytraModel {	
    constructor(velocity, player){
        this.glideTime = 0;
        this.damageTaken = 0;

        this.velX = velocity.x;
        this.velY = velocity.y;
        this.velZ = velocity.z;
        this.player = player;
        this.velocity = velocity;
    }

    tick(isCreative, yaw, pitch){
        if (!isCreative && (this.glideTime + 1) % 20 == 0){
            this.damageTaken++;
        }

        let yawcos = Math.cos(-yaw - Math.PI);
		let yawsin = Math.sin(-yaw - Math.PI);
		let pitchcos = Math.cos(pitch);
		let pitchsin = Math.sin(pitch);
		
		let lookX = yawsin * -pitchcos;
		let lookY = -pitchsin;
		let lookZ = yawcos * -pitchcos;
		
		let hvel = Math.sqrt((this.velX ** 2) + (this.velZ ** 2));
		let hlook = pitchcos;
		let sqrpitchcos = pitchcos * pitchcos;

		this.velY += -0.08 + sqrpitchcos * 0.06;

        if (this.velY < 0 && hlook > 0){
            let yacc = this.velY * -0.1 * sqrpitchcos;
            this.velY += yacc;
            this.velX += lookX * yacc / hlook;
            this.velZ += lookZ * yacc / hlook;
        }

        if (pitch < 0){
            let yacc = hvel * -pitchsin * 0.04;
            this.velY += yacc * 3.2;
            this.velX -= lookX * yacc / hlook;
            this.velZ -= lookZ * yacc / hlook;
        }

        if (hlook > 0){
            this.velX += (lookX / hlook * hvel - this.velX) * 0.1;
            this.velZ += (lookZ / hlook * hvel - this.velZ) * 0.1;
        }
		
		this.velX *= 0.9900000095367432;
		this.velY *= 0.9800000190734863;
		this.velZ *= 0.9900000095367432;
		
		this.glideTime++;
    }

    move(pitch){
        let vec3d = this.player.getViewDirection();
        vec3d = Vector.divide(vec3d, Math.abs(vec3d.y)+0.001);
        let f = pitch * 0.017453292;
        let d6 = Math.sqrt((vec3d.x**2) + (vec3d.z**2));
        let d8 = Math.sqrt((this.velocity.x**2) + (this.velocity.z**2))
        let f4 = Math.cos(f);
        f4 = f4 * f4;
        
        this.velocity.y += -0.08 + f4 * 0.06;
        if (this.velocity.y < 0.0 && d6 > 0.0) {
            let d2 = this.velocity.y * -0.1 * f4;
            this.velocity.y += d2;
            this.velocity.x += vec3d.x * d2 / d6;
            this.velocity.z += vec3d.z * d2 / d6;
        }
        if (f < 0.0) {
            let d10 = d8 * (-Math.sin(f)) * 0.04;
            this.velocity.y += d10 * 3.2;
            this.velocity.x -= vec3d.x * d10 / d6;
            this.velocity.z -= vec3d.z * d10 / d6;
        }
        if (d6 > 0.0) {
            this.velocity.x += (vec3d.x / d6 * d8 - this.velocity.x) * 0.1;
            this.velocity.z += (vec3d.z / d6 * d8 - this.velocity.z) * 0.1;
        }
        
        this.velocity.x *= 0.9900000095367432;
        this.velocity.y *= 0.9800000190734863;
        this.velocity.z *= 0.9900000095367432;
    }
}