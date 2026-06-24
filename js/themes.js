class Theme {
    update(particle, audioBoost, width, height, speedValue) {
        throw new Error("update() must be implemented");
    }
    draw(ctx, particle, width, height) {
        throw new Error("draw() must be implemented");
    }
    drawBackground(ctx, width, height, bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
    }
}

class DefaultTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.x += particle.vx * audioBoost;
        particle.y += particle.vy * audioBoost;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }
    draw(ctx, particle, width, height) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class FireworksTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        const boost = 1 + (audioBoost - 1) * 5;
        if (particle.state === 'ascending') {
            if (particle.y > height - 20 || particle.vy >= 0) {
                particle.y = height + 10;
                particle.x = Math.random() * width;
                particle.vy = -Math.random() * 3 - 2;
                particle.vx = (Math.random() - 0.5) * 1;
                particle.targetY = Math.random() * (height * 0.5);
            }
            particle.x += particle.vx;
            particle.y += particle.vy * speedValue * boost;
            if (particle.y <= particle.targetY) {
                particle.state = 'exploding';
                const fragCount = 20 + Math.floor(Math.random() * 30);
                particle.fragments = [];
                for (let i = 0; i < fragCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 4 + 1;
                    particle.fragments.push({
                        x: particle.x,
                        y: particle.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 1.0,
                        color: particle.color
                    });
                }
            }
        } else {
            particle.fragments.forEach(f => {
                f.x += f.vx;
                f.y += f.vy;
                f.vy += 0.05;
                f.life -= 0.02;
            });
            if (particle.fragments.length === 0 || particle.fragments.every(f => f.life <= 0)) {
                particle.reset();
                particle.state = 'ascending';
                particle.y = height + 10;
                particle.vy = -Math.random() * 3 - 2;
            }
        }
    }
    draw(ctx, particle, width, height) {
        if (particle.state === 'ascending') {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            particle.fragments.forEach(f => {
                ctx.beginPath();
                ctx.fillStyle = f.color;
                ctx.globalAlpha = f.life;
                ctx.arc(f.x, f.y, particle.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    }
    drawBackground(ctx, width, height, bgColor) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, width, height);
    }
}

class TronCityTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.z -= speedValue * 5 * audioBoost;
        if (particle.z <= 0) {
            particle.z = 1000;
            particle.x = (Math.random() - 0.5) * width * 2;
            particle.y = (Math.random() - 0.5) * height * 2;
        }
    }
    draw(ctx, particle, width, height) {
        const scale = 1000 / particle.z;
        const x = particle.x * scale + width / 2;
        const y = particle.y * scale + height / 2;
        const w = particle.size * 10 * scale;
        const h = particle.size * 50 * scale;
        ctx.fillStyle = particle.color;
        ctx.fillRect(x - w/2, y - h, w, h);
        ctx.fillStyle = 'white';
        ctx.fillRect(x - w/2, y - h, w, 2 * scale);
    }
    drawBackground(ctx, width, height, bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, width, height);
    }
}

class TronCircuitTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.z -= speedValue * 5 * audioBoost;
        if (particle.z <= 0) {
            particle.z = 1000;
            particle.x = (Math.random() - 0.5) * width * 2;
            particle.y = (Math.random() - 0.5) * height * 2;
        }
    }
    draw(ctx, particle, width, height) {
        const scale = 1000 / particle.z;
        const x = particle.x * scale + width / 2;
        const y = particle.y * scale + height / 2;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 50 * scale, y);
        ctx.stroke();
    }
    drawBackground(ctx, width, height, bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, width, height);
    }
}

class TronArenaTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.angle += particle.rotationSpeed * 0.1 * audioBoost;
        particle.x += Math.cos(particle.angle) * 0.5 * audioBoost;
        particle.y += Math.sin(particle.angle) * 0.5 * audioBoost;
        if (particle.x < -width) particle.x = width;
        if (particle.x > width) particle.x = -width;
        if (particle.y < -height) particle.y = height;
        if (particle.y > height) particle.y = -height;
    }
    draw(ctx, particle, width, height) {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class WarpTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.z -= speedValue * 5 * audioBoost;
        if (particle.z <= 0) {
            particle.z = 1000;
            particle.x = (Math.random() - 0.5) * width * 2;
            particle.y = (Math.random() - 0.5) * height * 2;
        }
    }
    draw(ctx, particle, width, height) {
        const scale = 1000 / particle.z;
        const x = (particle.x || 0) * scale + width / 2;
        const y = (particle.y || 0) * scale + height / 2;
        ctx.beginPath();
        ctx.arc(x, y, particle.size * scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

class TunnelTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.z -= speedValue * 2 * audioBoost;
        if (particle.z <= 0) particle.z = 1000;
    }
    draw(ctx, particle, width, height) {
        const scale = 1000 / particle.z;
        const size = 100 * scale;
        ctx.lineWidth = 2;
        ctx.strokeStyle = particle.color;
        ctx.beginPath();
        for (let i = 0; i < particle.sides; i++) {
            const angle = (i * 2 * Math.PI) / particle.sides;
            const x = width / 2 + size * Math.cos(angle);
            const y = height / 2 + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
}

class MatrixTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.y += speedValue * 2 * audioBoost * particle.speedMult;
        if (particle.y > height) particle.y = -20;
    }
    draw(ctx, particle, width, height) {
        ctx.fillRect(particle.x, particle.y, 2, 10 * particle.size);
    }
}

class BubblesTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.x += particle.vx * 0.2 * audioBoost;
        particle.y += particle.vy * 0.2 * audioBoost;
        if (particle.x < -100) particle.x = width + 100;
        if (particle.x > width + 100) particle.x = -100;
        if (particle.y < -100) particle.y = height + 100;
        if (particle.y > height + 100) particle.y = -100;
    }
    draw(ctx, particle, width, height) {
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class ConfettiTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.y += speedValue * 0.8 * audioBoost;
        particle.angle += particle.rotationSpeed * audioBoost;
        if (particle.y > height) particle.y = -20;
    }
    draw(ctx, particle, width, height) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.fillRect(-2, -2, 4, 8);
        ctx.restore();
    }
}

class SnowTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.y += speedValue * 0.3 * audioBoost;
        particle.x += Math.sin(Date.now() * 0.001) * 0.5 * audioBoost;
        if (particle.y > height) particle.y = -10;
    }
    draw(ctx, particle, width, height) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class BeachTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.x += particle.vx * 0.1 * audioBoost;
        particle.y += particle.vy * 0.1 * audioBoost;
        const time = Date.now() * 0.001;
        const mainWaveY = height * 0.4 + Math.sin(time * 0.5) * (height * 0.2);
        if (particle.y > mainWaveY + 50) {
            particle.life -= 0.02;
            if (particle.life <= 0) particle.reset();
        } else {
            particle.life = 1.0;
        }
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }
    draw(ctx, particle, width, height) {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    drawBackground(ctx, width, height, bgColor) {
        const sandGrad = ctx.createLinearGradient(0, 0, 0, height);
        sandGrad.addColorStop(0, '#0066cc');
        sandGrad.addColorStop(0.3, '#00aaff');
        sandGrad.addColorStop(0.45, '#4da6ff');
        sandGrad.addColorStop(0.5, '#c2b280');
        sandGrad.addColorStop(0.7, '#f2d2a9');
        sandGrad.addColorStop(1, '#e6be8a');
        ctx.fillStyle = sandGrad;
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() * 0.001;
        for (let i = 0; i < 3; i++) {
            const offset = i * 1.5;
            const waveY = height * 0.4 + Math.sin(time * 0.5 + offset) * (height * 0.15);
            const waveColor = `rgba(0, 119, 190, ${0.4 - (i * 0.1)})`;
            ctx.fillStyle = waveColor;
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(0, waveY);
            for (let x = 0; x <= width; x += 40) {
                const y = waveY + Math.sin(x * 0.005 + time + offset) * 15;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, waveY);
            for (let x = 0; x <= width; x += 40) {
                const y = waveY + Math.sin(x * 0.005 + time + offset) * 15;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
}

class ShapesTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.x += particle.vx * audioBoost;
        particle.y += particle.vy * audioBoost;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }
    draw(ctx, particle, width, height) {
        const side = particle.size * 5;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle + Date.now() * 0.001 * particle.rotationSpeed);
        if (particle.shapeType === 0) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let i = 1; i <= particle.sides; i++) {
                const angle = (i * 2 * Math.PI) / particle.sides;
                ctx.lineTo(side * Math.cos(angle), side * Math.sin(angle));
            }
            ctx.closePath();
            ctx.fill();
        } else if (particle.shapeType === 1) {
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? side : side / 2;
                const angle = (i * Math.PI) / 5;
                ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.fill();
        } else if (particle.shapeType === 2) {
            ctx.beginPath();
            ctx.ellipse(0, 0, side, side / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (particle.shapeType === 3) {
            ctx.beginPath();
            ctx.arc(0, 0, side / 2, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = particle.color;
            ctx.stroke();
        } else if (particle.shapeType === 4) {
            ctx.beginPath();
            ctx.moveTo(0, -side);
            ctx.lineTo(side / 2, 0);
            ctx.lineTo(0, side);
            ctx.lineTo(-side / 2, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

class BirdsTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.angle += particle.rotationSpeed * 0.05 * audioBoost;
        particle.x += Math.sin(particle.angle) * 2 * audioBoost;
        particle.y += Math.cos(particle.angle) * 2 * audioBoost;
        if (particle.x < -width) particle.x = width;
        if (particle.x > width) particle.x = -width;
        if (particle.y < -height) particle.y = height;
        if (particle.y > height) particle.y = -height;
    }
    draw(ctx, particle, width, height) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        const flap = Math.sin(Date.now() * 0.01) * 10;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.quadraticCurveTo(-5, -10 + flap, 0, 0);
        ctx.quadraticCurveTo(5, -10 + flap, 15, 0);
        ctx.stroke();
        ctx.restore();
    }
}

class DeathstarTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.angle += 0.01 * audioBoost;
        if (particle.z < 1) particle.z = 1;
        particle.z += (Math.random() - 0.5) * 0.1 * audioBoost;
    }
    draw(ctx, particle, width, height) {
        const scale = 1000 / particle.z;
        const x = width / 2 + Math.cos(particle.angle) * (100 * scale);
        const y = height / 2 + Math.sin(particle.angle) * (100 * scale);
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 10 * scale, y - 10 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * 20 * scale, y + Math.sin(angle) * 20 * scale);
            ctx.stroke();
        }
    }
}

class TempestTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.z -= speedValue * 4 * audioBoost;
        if (particle.z <= 0) {
            particle.z = 1000;
            particle.angle = Math.random() * Math.PI * 2;
            particle.size = Math.random() * 5 + 2;
        }
    }
    draw(ctx, particle, width, height) {
        const scale = 1000 / particle.z;
        const x = width / 2 + Math.cos(particle.angle) * (50 * scale);
        const y = height / 2 + Math.sin(particle.angle) * (50 * scale);
        const size = particle.size * scale;
        ctx.lineWidth = 3;
        ctx.strokeStyle = particle.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillRect(x - 1, y - 1, 2, 2);
    }
}

class LightsaberTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.x += particle.vx * audioBoost;
        particle.y += particle.vy * audioBoost;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }
    draw(ctx, particle, width, height) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = particle.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + Math.cos(particle.angle) * 300, particle.y + Math.sin(particle.angle) * 300);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class StarsTheme extends Theme {
    update(particle, audioBoost, width, height, speedValue) {
        particle.x += particle.vx * audioBoost;
        particle.y += particle.vy * audioBoost;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }
    draw(ctx, particle, width, height) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

const THEMES = {
    'default': new DefaultTheme(),
    'fireworks': new FireworksTheme(),
    'tronCity': new TronCityTheme(),
    'tronCircuit': new TronCircuitTheme(),
    'tronArena': new TronArenaTheme(),
    'warp': new WarpTheme(),
    'tunnel': new TunnelTheme(),
    'matrix': new MatrixTheme(),
    'bubbles': new BubblesTheme(),
    'confetti': new ConfettiTheme(),
    'snow': new SnowTheme(),
    'beach': new BeachTheme(),
    'shapes': new ShapesTheme(),
    'birds': new BirdsTheme(),
    'deathstar': new DeathstarTheme(),
    'tempest': new TempestTheme(),
    'lightsaber': new LightsaberTheme(),
    'stars': new StarsTheme()
};
