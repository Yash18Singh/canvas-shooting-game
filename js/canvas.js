

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const startGameBtn = document.getElementById('startGameBtn')
const scoreEl = document.getElementById('scoreEl')
const modalEl = document.getElementById('modalEl')
const bigScoreEl = document.getElementById('bigScoreEl')

canvas.width = window.innerWidth 
canvas.height = window.innerHeight

//POSITION OF PLAYER
const playerX = canvas.width/2
const playerY = canvas.height/2

//SOUNDS
let shoot = new Audio('https://assets.mixkit.co/active_storage/sfx/1670/1670-preview.mp3')
let gameOver = new Audio('https://assets.mixkit.co/active_storage/sfx/233/233-preview.mp3')
let gameMusic = new Audio('https://sounds.pond5.com/16-bit-retro-video-game-music-203765732_nw_prev.m4a')
let explosion = new Audio('https://assets.mixkit.co/active_storage/sfx/3110/3110-preview.mp3')


//CLASSES

//MAKING PLAYER
class Player {
  constructor(x, y, radius, color){
    this.x = x 
    this.y = y 
    this.radius = radius  
    this.color = color 
  }

  draw(){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false)
    c.fillStyle = this.color
    c.strokeStyle = this.color
    c.fill()
    c.stroke()
  }
}


//MAKING PROJECTILE OR SHOOT
class Projectile{
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius 
    this.color = color 
    this.velocity = velocity
  }

  draw(){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false)
    c.fillStyle = this.color
    c.strokeStyle = this.color
    c.fill()
    c.stroke()
  }

  update(){
    this.draw()
    this.x += this.velocity.x  
    this.y += this.velocity.y 
  }
}

//ENEMY
class Enemy{
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius 
    this.color = color 
    this.velocity = velocity
  }

  draw(){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false)
    c.fillStyle = this.color
    c.strokeStyle = this.color
    c.fill()
    c.stroke()
  }

  update(){
    this.draw()
    this.x += this.velocity.x  
    this.y += this.velocity.y 
  }
}



//PARTICLES
const friction = 0.99
class Particle{
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius 
    this.color = color 
    this.velocity = velocity
    this.alpha = 1
  }

  draw(){
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false)
    c.fillStyle = this.color
    c.strokeStyle = this.color
    c.fill()
    c.stroke()
    c.restore()
  }

  update(){
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x += this.velocity.x  
    this.y += this.velocity.y 
    this.alpha -= 0.01
  }
}



let enemies 
let projectiles 
let particles 
let player 
let score

//FUNCTIONS
function init(){
   enemies = []
   projectiles = []
   particles = []
   player = new Player(playerX,playerY,15,'white')
   score = 0
   scoreEl.innerHTML = score 
   bigScoreEl.innerHTML = score
   gameMusic.currentTime = 0;
   gameMusic.play()
   gameMusic.volume = 0.4
}

setInterval(()=>{
  gameMusic.pause();
  gameMusic.currentTime = 0;
  gameMusic.play()
  gameMusic.volume = 0.4
},90000)


//spawning enemies
function spawnEnemies(){
  let enemy_speed = 1;
  let enemy_time = 3000;

  setInterval(()=>{
    enemy_speed += 0.2
    enemy_time -= 100

    if(enemy_time <= 500){
      enemy_time = 500
    }
  },9000)

  setInterval(()=>{
    const radius = (Math.random() * 25) + 10
    let x;
    let y;

    if(Math.random() < 0.5){
       x = Math.random() < 0.5 ? 0 - (radius + 100) : canvas.width + (radius + 100)
       y = Math.random() * canvas.height 
    } else{
      x = Math.random() * canvas.height 
      y = Math.random() < 0.5 ? 0 - (radius + 100) : canvas.width + (radius + 100)
    }

    var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    const color = randomColor

    const angle = Math.atan2(playerY - y, playerX - x)

    const velocity = {
      x:Math.cos(angle) * enemy_speed,
      y:Math.sin(angle) * enemy_speed
    }

    enemies.push(new Enemy(x,y,radius,color,velocity))
  },enemy_time)
}


//shooting
window.addEventListener('click', (event)=>{
  shoot.play()

  const angle = Math.atan2(event.clientY - playerY, event.clientX - playerX)
  const velocity = {
    x:Math.cos(angle) * 8,
    y:Math.sin(angle) * 8
  }

  projectiles.push(new Projectile(playerX, playerY, 5, 'white', {x:velocity.x, y:velocity.y}))

  setTimeout(() => {
    shoot.pause();
    shoot.currentTime = 0;
  }, 100); 
})



//ANIMATING
let animationId;

function animate(){
  animationId = requestAnimationFrame(animate)
  //c.clearRect(0,0,canvas.width,canvas.height)

  c.fillStyle = 'rgba(0,0,0,0.1)'
  c.fillRect(0,0,canvas.width, canvas.height)

  player.draw()

  //particles animation
  particles.map((particle,index)=>{
    if(particle.alpha <= 0){
      particles.splice(index,1)
    } else{
      particle.update()
    }
    
  })


  //generating projectiles
  projectiles.map((projectile, index)=>{
    projectile.update()

    //remove from edges of the screen
    if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width
      || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height
      ){
      setTimeout(()=>{
        projectiles.splice(index,1)
      },0)
    }
  })



  enemies.map((enemy, index)=>{
    enemy.update()

    //enemy touching the player
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    //end game
    if(dist - enemy.radius - player.radius < 1){
      gameOver.play()
      cancelAnimationFrame(animationId)
      gameMusic.pause()
      modalEl.style.display = 'flex'
      bigScoreEl.innerHTML = score
    }

    projectiles.map((projectile, projectileIndex)=>{
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      //shooting enemy
      if(dist - enemy.radius - projectile.radius < 1){
        
        
        //particles
        for(let i=0; i<enemy.radius*2; i++){
          particles.push(new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color, {x:(Math.random() - 0.5) * (Math.random() * 4), y:(Math.random() - 0.5) * (Math.random() * 4)}))
        }

        //making enemy small
        if(enemy.radius - 10 > 10){
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })

          score += 100
          scoreEl.innerHTML = score

          setTimeout(()=>{
            projectiles.splice(projectileIndex,1)
          },0)
        } 
        
        //removing enemy
        else{
          score += 200
          scoreEl.innerHTML = score

          explosion.play()
          setTimeout(() => {
            explosion.pause();
            explosion.currentTime = 0;
          }, 1000); 

          setTimeout(()=>{
            enemies.splice(index,1)
            projectiles.splice(projectileIndex,1)
          },0)
        }
      }
    })

    
  })
}


//start game
startGameBtn.addEventListener('click', ()=>{
  init()
  modalEl.style.display = 'none'
  animate()
  spawnEnemies()
})